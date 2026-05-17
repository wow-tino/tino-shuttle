import { createFileRoute } from "@tanstack/react-router";

import ky from "ky";

import type {
  GetSubwayArrivalResponse,
  GetSubwayArrivalTrainRow,
  RealtimeArrivalItem,
} from "#/domain/subway/api/models";
import { SeoulRealtimeStationArrivalApiResponseSchema } from "#/domain/subway/api/models";
import { TtlMemoryCache } from "#/server/ttl-memory-cache";
import { withErrorResponse, withErrorResponseFromUnknown, withSuccessResponse } from "#/shared/api";
import { ms } from "#/shared/utils";

const subwayArrivalCache = new TtlMemoryCache(15_000);

const SEOUL_REALTIME_ARRIVAL_START_INDEX = 1;
const SEOUL_REALTIME_ARRIVAL_END_INDEX = 40;
const SQUARE_BRACKET_PATTERN = /\[([^\]]*)\]/g;
const NTH_PREV_STATION_HEAD_PATTERN = /^(\d+)번째\s*전역/;

const DEFAULT_LIMIT_PER_DIRECTION = 3;
const MAX_LIMIT_PER_DIRECTION = 40;
const MIN_LIMIT_PER_DIRECTION = 1;

const subwayApiKey = process.env.SUBWAY_API_KEY ?? "";

function normalizePreviewArrivalMessage(rawMessage: string): string {
  const trimmed = rawMessage.replace(SQUARE_BRACKET_PATTERN, "$1").trim();
  const nthPrevStationMatch = trimmed.match(NTH_PREV_STATION_HEAD_PATTERN);
  if (nthPrevStationMatch?.[1]) {
    return `${nthPrevStationMatch[1]}번째 전역`;
  }
  return trimmed;
}

function buildSeoulRealtimeStationArrivalUrl(input: { apiKey: string; stationName: string }) {
  const encodedStationName = encodeURIComponent(input.stationName);
  return `http://swopenapi.seoul.go.kr/api/subway/${input.apiKey}/json/realtimeStationArrival/${SEOUL_REALTIME_ARRIVAL_START_INDEX}/${SEOUL_REALTIME_ARRIVAL_END_INDEX}/${encodedStationName}`;
}

function parseLimitPerDirection(raw: string | null): number {
  if (raw === null || raw.trim().length === 0) {
    return DEFAULT_LIMIT_PER_DIRECTION;
  }
  const parsed: number = Number.parseInt(raw, 10);
  if (Number.isNaN(parsed)) {
    return DEFAULT_LIMIT_PER_DIRECTION;
  }
  return Math.min(MAX_LIMIT_PER_DIRECTION, Math.max(MIN_LIMIT_PER_DIRECTION, parsed));
}

function isUphillDirection(updnLine: string): boolean {
  const direction = updnLine.trim();
  return direction === "상행" || direction === "내선";
}

function isDownwardDirection(updnLine: string): boolean {
  const direction = updnLine.trim();
  return direction === "하행" || direction === "외선";
}

function resolveTowardLabel(destinationStationRaw: string): string {
  const trimmed: string = destinationStationRaw.trim();
  if (trimmed.length === 0) {
    return "—";
  }
  return trimmed.endsWith("행") ? trimmed : `${trimmed}행`;
}

function resolveLocationText(arrivalMessageRaw: string): string {
  const trimmed: string = arrivalMessageRaw.trim();
  return trimmed.length > 0 ? trimmed : "도착 정보 없음";
}

function mapRealtimeItemToTrainRow(train: RealtimeArrivalItem): GetSubwayArrivalTrainRow {
  return {
    toward: resolveTowardLabel(train.bstatnNm),
    location: resolveLocationText(train.arvlMsg2),
    subwwayType: train.btrainSttus,
  };
}

/** 서울 API가 주는 순서를 유지하며 상행·내선 / 하행·외선으로 각각 최대 `limitPerDirection`개만 수집합니다. */
function buildUphillDownwardArrays(input: {
  arrivals: RealtimeArrivalItem[];
  limitPerDirection: number;
}) {
  const uphill: GetSubwayArrivalTrainRow[] = [];
  const downward: GetSubwayArrivalTrainRow[] = [];

  for (const train of input.arrivals) {
    if (isUphillDirection(train.updnLine) && uphill.length < input.limitPerDirection) {
      uphill.push(mapRealtimeItemToTrainRow(train));
    } else if (isDownwardDirection(train.updnLine) && downward.length < input.limitPerDirection) {
      downward.push(mapRealtimeItemToTrainRow(train));
    }
  }

  return { uphill, downward };
}

export const Route = createFileRoute("/api/subway/arrival")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        try {
          const requestUrl = new URL(request.url);
          const stationNameRaw = requestUrl.searchParams.get("stationName");
          const station = (stationNameRaw ?? "").trim();
          if (station.length === 0) {
            return withErrorResponse("stationName 쿼리가 필요합니다.", 400);
          }

          const limitRaw = requestUrl.searchParams.get("limitPerDirection");
          const limitPerDirection = parseLimitPerDirection(limitRaw);

          const cacheKey = `subway:arrival:v3:${station}:limit:${String(limitPerDirection)}`;
          const cached = subwayArrivalCache.get<GetSubwayArrivalResponse>(cacheKey);
          if (cached) {
            return withSuccessResponse(cached);
          }

          const seoulUrl = buildSeoulRealtimeStationArrivalUrl({
            apiKey: subwayApiKey,
            stationName: station,
          });

          const raw = await ky
            .get(seoulUrl, { timeout: ms.seconds(15), retry: { limit: 0 } })
            .json();
          const parsed = SeoulRealtimeStationArrivalApiResponseSchema.safeParse(raw);
          if (!parsed.success) {
            throw withErrorResponse("서울시 지하철 도착 API 응답 형식이 예상과 다릅니다.", 500);
          }

          const errorCode = parsed.data.errorMessage?.code;
          if (errorCode !== undefined && errorCode !== "" && errorCode !== "INFO-000") {
            const errorMessage =
              parsed.data.errorMessage?.message ?? "서울시 지하철 도착 API 오류가 발생했습니다.";
            throw withErrorResponse(errorMessage, 500);
          }

          const arrivals = (parsed.data.realtimeArrivalList ?? []).map((arrival) => ({
            subwayId: arrival.subwayId ?? "",
            updnLine: arrival.updnLine ?? "",
            trainLineNm: arrival.trainLineNm ?? "",
            bstatnNm: arrival.bstatnNm ?? "",
            arvlMsg2: normalizePreviewArrivalMessage(arrival.arvlMsg2 ?? ""),
            btrainSttus: arrival.btrainSttus ?? "",
          }));

          const { uphill, downward } = buildUphillDownwardArrays({
            arrivals,
            limitPerDirection,
          });

          const payload: GetSubwayArrivalResponse = {
            station,
            uphill,
            downward,
          };

          subwayArrivalCache.set(cacheKey, payload);
          return withSuccessResponse(payload);
        } catch (error: unknown) {
          return withErrorResponseFromUnknown(error);
        }
      },
    },
  },
});
