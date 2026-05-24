import { createFileRoute } from "@tanstack/react-router";

import ky from "ky";

import type {
  GetSubwayRealtimeResponse,
  GetSubwayRealtimeTrainRow,
  RealtimeArrivalItem,
} from "#/domain/subway/api/models";
import { SeoulRealtimeStationArrivalApiResponseSchema } from "#/domain/subway/api/models";
import { withErrorResponse, withSuccessResponse } from "#/shared/api";
import { withErrorHandler } from "#/shared/api/with-error-handler";
import { ms } from "#/shared/utils";

const SEOUL_REALTIME_ARRIVAL_START_INDEX = 1;
const SEOUL_REALTIME_ARRIVAL_END_INDEX = 40;
const SQUARE_BRACKET_PATTERN = /\[([^\]]*)\]/g;
const NTH_PREV_STATION_HEAD_PATTERN = /^(\d+)번째\s*전역/;

const DEFAULT_LIMIT_PER_DIRECTION = 3;
const STATION_NAME = "정왕";
const ALLOWED_LINE_NAMES = ["4호선", "수인분당선"] as const;
const LINE_SUBWAY_ID_MAP = {
  "4호선": "1004",
  수인분당선: "1075",
} as const satisfies Record<(typeof ALLOWED_LINE_NAMES)[number], string>;

const subwayApiKey = process.env.SUBWAY_API_KEY ?? "";

type SubwayRealtimeLineName = (typeof ALLOWED_LINE_NAMES)[number];

function isAllowedLineName(lineName: string): lineName is SubwayRealtimeLineName {
  return ALLOWED_LINE_NAMES.some((allowedLineName) => allowedLineName === lineName);
}

function normalizeRealtimeMessage(rawMessage: string): string {
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

function resolveLocationText(realtimeMessageRaw: string): string {
  const trimmed: string = realtimeMessageRaw.trim();
  return trimmed.length > 0 ? trimmed : "도착 정보 없음";
}

function mapRealtimeItemToTrainRow(train: RealtimeArrivalItem): GetSubwayRealtimeTrainRow {
  return {
    toward: resolveTowardLabel(train.bstatnNm),
    location: resolveLocationText(train.arvlMsg2),
    subwwayType: train.btrainSttus,
  };
}

/** 서울 API가 주는 순서를 유지하며 상행·내선 / 하행·외선으로 각각 최대 `limitPerDirection`개만 수집합니다. */
function buildUphillDownwardArrays(input: { arrivals: RealtimeArrivalItem[] }) {
  const uphill: GetSubwayRealtimeTrainRow[] = [];
  const downward: GetSubwayRealtimeTrainRow[] = [];

  for (const train of input.arrivals) {
    if (isUphillDirection(train.updnLine) && uphill.length < DEFAULT_LIMIT_PER_DIRECTION) {
      uphill.push(mapRealtimeItemToTrainRow(train));
    } else if (
      isDownwardDirection(train.updnLine) &&
      downward.length < DEFAULT_LIMIT_PER_DIRECTION
    ) {
      downward.push(mapRealtimeItemToTrainRow(train));
    }
  }

  return { uphill, downward };
}

export const Route = createFileRoute("/api/subway/realtime")({
  server: {
    handlers: {
      GET: withErrorHandler(async ({ request }: { request: Request }) => {
        const requestUrl = new URL(request.url);
        const lineNameRaw = requestUrl.searchParams.get("lineNm");
        const lineName = (lineNameRaw ?? "").trim();

        if (lineName.length === 0) {
          return withErrorResponse("lineNm 쿼리가 필요합니다.", 400);
        }

        if (!isAllowedLineName(lineName)) {
          return withErrorResponse("lineNm은 4호선 또는 수인분당선만 가능합니다.", 400);
        }

        const seoulUrl = buildSeoulRealtimeStationArrivalUrl({
          apiKey: subwayApiKey,
          stationName: STATION_NAME,
        });

        const raw = await ky.get(seoulUrl, { timeout: ms.seconds(15), retry: { limit: 0 } }).json();
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

        const targetSubwayId = LINE_SUBWAY_ID_MAP[lineName];
        const arrivals = (parsed.data.realtimeArrivalList ?? [])
          .filter((arrival) => (arrival.subwayId ?? "") === targetSubwayId)
          .map((arrival) => ({
            subwayId: arrival.subwayId ?? "",
            updnLine: arrival.updnLine ?? "",
            trainLineNm: arrival.trainLineNm ?? "",
            bstatnNm: arrival.bstatnNm ?? "",
            arvlMsg2: normalizeRealtimeMessage(arrival.arvlMsg2 ?? ""),
            btrainSttus: arrival.btrainSttus ?? "",
          }));

        const { uphill, downward } = buildUphillDownwardArrays({ arrivals });

        const payload: GetSubwayRealtimeResponse = {
          station: STATION_NAME,
          uphill,
          downward,
        };

        return withSuccessResponse(payload);
      }),
    },
  },
});
