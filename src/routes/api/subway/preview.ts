import { createFileRoute } from "@tanstack/react-router";

import ky from "ky";

import type { RealtimeArrivalItem } from "#/domain/subway/api/models";
import { SeoulRealtimeStationArrivalApiResponseSchema } from "#/domain/subway/api/models";
import { withErrorResponse, withErrorResponseFromUnknown, withSuccessResponse } from "#/shared/api";
import { ms } from "#/shared/utils";

const SHUTTLE_HOME_SUBWAY_LINE_PREVIEW_CONFIGS = [
  {
    subwayId: "1004",
    directions: [
      {
        directionName: "상행",
        fallbackDirectionStationName: "신길온천",
        fallbackDestinationStationName: "불암산",
      },
      {
        directionName: "하행",
        fallbackDirectionStationName: "오이도",
        fallbackDestinationStationName: "오이도",
      },
    ],
  },
  {
    subwayId: "1075",
    directions: [
      {
        directionName: "상행",
        fallbackDirectionStationName: "왕십리",
        fallbackDestinationStationName: "왕십리",
      },
      {
        directionName: "하행",
        fallbackDirectionStationName: "인천",
        fallbackDestinationStationName: "인천",
      },
    ],
  },
];

const SEOUL_REALTIME_ARRIVAL_START_INDEX = 1;
const SEOUL_REALTIME_ARRIVAL_END_INDEX = 40;
const SQUARE_BRACKET_PATTERN = /\[([^\]]*)\]/g;
const NTH_PREV_STATION_HEAD_PATTERN = /^(\d+)번째\s*전역/;
const TRAIN_LINE_NAME_PATTERN = /^(.+?)행\s*-\s*(.+?)방면$/;
const AFTER_ARRIVAL_MESSAGE_PATTERN = /^(.+?)\s*후$/;

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

function findNearestSubwayHomeArrival(input: {
  arrivals: RealtimeArrivalItem[];
  subwayId: string;
  directionName: string;
}): RealtimeArrivalItem | null {
  return (
    input.arrivals.find((arrival) => {
      return arrival.subwayId === input.subwayId && arrival.updnLine === input.directionName;
    }) ?? null
  );
}

function getSubwayHomeDirectionLabel(input: {
  arrival: RealtimeArrivalItem | null;
  fallbackDirectionStationName: string;
  fallbackDestinationStationName: string;
}) {
  const trainLineName = input.arrival ? input.arrival.trainLineNm.trim() : "";
  const trainLineNameMatch = trainLineName.match(TRAIN_LINE_NAME_PATTERN);

  if (trainLineNameMatch?.[1] && trainLineNameMatch[2]) {
    return `${trainLineNameMatch[2]} 방면 (${trainLineNameMatch[1]}행)`;
  }

  const destinationStationName =
    input.arrival?.bstatnNm.trim() ?? input.fallbackDestinationStationName;

  return `${input.fallbackDirectionStationName} 방면 (${destinationStationName}행)`;
}

function getSubwayHomeArrivalDisplayMessage(arrival: RealtimeArrivalItem | null): {
  mainText: string;
  suffixText: string | null;
} {
  const arrivalMessage = arrival ? arrival.arvlMsg2.trim() : "";
  if (arrivalMessage.length === 0) {
    return {
      mainText: "도착 정보 없음",
      suffixText: null,
    };
  }

  const afterArrivalMatch = arrivalMessage.match(AFTER_ARRIVAL_MESSAGE_PATTERN);
  if (afterArrivalMatch?.[1]) {
    return {
      mainText: afterArrivalMatch[1],
      suffixText: "후 도착",
    };
  }

  return {
    mainText: arrivalMessage,
    suffixText: null,
  };
}

function buildSubwayHomePreviewLines(arrivals: RealtimeArrivalItem[]) {
  return SHUTTLE_HOME_SUBWAY_LINE_PREVIEW_CONFIGS.map((lineConfig) => ({
    subwayId: lineConfig.subwayId,
    directions: lineConfig.directions.map((directionConfig) => {
      const nearestArrival = findNearestSubwayHomeArrival({
        arrivals,
        subwayId: lineConfig.subwayId,
        directionName: directionConfig.directionName,
      });
      const arrivalDisplayMessage = getSubwayHomeArrivalDisplayMessage(nearestArrival);

      return {
        directionName: directionConfig.directionName,
        directionLabel: getSubwayHomeDirectionLabel({
          arrival: nearestArrival,
          fallbackDirectionStationName: directionConfig.fallbackDirectionStationName,
          fallbackDestinationStationName: directionConfig.fallbackDestinationStationName,
        }),
        arrivalMainText: arrivalDisplayMessage.mainText,
        arrivalSuffixText: arrivalDisplayMessage.suffixText,
      };
    }),
  }));
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

          const seoulUrl = buildSeoulRealtimeStationArrivalUrl({
            apiKey: subwayApiKey,
            stationName,
          });

          const raw = await ky
            .get(seoulUrl, { timeout: ms.seconds(15), retry: { limit: 0 } })
            .json();
          const parsed = SeoulRealtimeStationArrivalApiResponseSchema.safeParse(raw);
          if (!parsed.success) {
            throw new Error("서울시 지하철 도착 API 응답 형식이 예상과 다릅니다.");
          }

          const code = parsed.data.errorMessage?.code;
          if (code && code !== "INFO-000") {
            const errorMessage =
              parsed.data.errorMessage?.message ?? "서울시 지하철 도착 API 오류가 발생했습니다.";
            throw new Error(errorMessage);
          }

          const arrivals = (parsed.data.realtimeArrivalList ?? []).map((arrival) => ({
            subwayId: arrival.subwayId ?? "",
            updnLine: arrival.updnLine ?? "",
            trainLineNm: arrival.trainLineNm ?? "",
            bstatnNm: arrival.bstatnNm ?? "",
            arvlMsg2: normalizePreviewArrivalMessage(arrival.arvlMsg2 ?? ""),
            btrainSttus: arrival.btrainSttus ?? "",
          }));
          const lines = buildSubwayHomePreviewLines(arrivals);
          const payload = { stationName, arrivals, lines };
          return withSuccessResponse(payload);
        } catch (error: unknown) {
          return withErrorResponseFromUnknown(error);
        }
      },
    },
  },
});
