import { createFileRoute } from "@tanstack/react-router";

import ky from "ky";

import type { GetRealtimeStationArrivalResponse } from "#/domain/subway/api/models";
import { SeoulRealtimeStationArrivalApiResponseSchema } from "#/domain/subway/api/models";
import { TtlMemoryCache } from "#/server/ttl-memory-cache";
import { withErrorResponse, withErrorResponseFromUnknown, withSuccessResponse } from "#/shared/api";
import { ms } from "#/shared/utils";

const subwayArrivalCache = new TtlMemoryCache(15_000);

const SEOUL_REALTIME_ARRIVAL_START_INDEX = 1;
const SEOUL_REALTIME_ARRIVAL_END_INDEX = 40;
const SQUARE_BRACKET_PATTERN = /\[([^\]]*)\]/g;
const NTH_PREV_STATION_HEAD_PATTERN = /^(\d+)번째\s*전역/;

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

const subwayApiKey = process.env.SUBWAY_API_KEY ?? "";

export const Route = createFileRoute("/api/subway/preview")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        try {
          const url = new URL(request.url);
          const stationNameRaw = url.searchParams.get("stationName");
          const stationName = (stationNameRaw ?? "").trim();
          if (stationName.length === 0) {
            return withErrorResponse("stationName 쿼리가 필요합니다.", 400);
          }

          const cacheKey = `subway:arrival:preview:${stationName}:v2`;
          const cached = subwayArrivalCache.get<GetRealtimeStationArrivalResponse>(cacheKey);
          if (cached) {
            return withSuccessResponse(cached);
          }

          const seoulUrl: string = buildSeoulRealtimeStationArrivalUrl({
            apiKey: subwayApiKey,
            stationName,
          });

          const raw: unknown = await ky
            .get(seoulUrl, { timeout: ms.seconds(15), retry: { limit: 0 } })
            .json();
          const parsed = SeoulRealtimeStationArrivalApiResponseSchema.safeParse(raw);
          if (!parsed.success) {
            throw new Error("서울시 지하철 도착 API 응답 형식이 예상과 다릅니다.");
          }

          const code: string | undefined = parsed.data.errorMessage?.code;
          if (code && code !== "INFO-000") {
            const msg: string =
              parsed.data.errorMessage?.message ?? "서울시 지하철 도착 API 오류가 발생했습니다.";
            throw new Error(msg);
          }

          const arrivals = (parsed.data.realtimeArrivalList ?? []).map((arrival) => ({
            subwayId: arrival.subwayId ?? "",
            updnLine: arrival.updnLine ?? "",
            trainLineNm: arrival.trainLineNm ?? "",
            bstatnNm: arrival.bstatnNm ?? "",
            arvlMsg2: normalizePreviewArrivalMessage(arrival.arvlMsg2 ?? ""),
            btrainSttus: arrival.btrainSttus ?? "",
          }));
          const payload: GetRealtimeStationArrivalResponse = { stationName, arrivals };
          subwayArrivalCache.set(cacheKey, payload);
          return withSuccessResponse(payload);
        } catch (error: unknown) {
          return withErrorResponseFromUnknown(error);
        }
      },
    },
  },
});
