import { createFileRoute } from "@tanstack/react-router";

import ky from "ky";

import type {
  DataGoKrTrainScheduleApiResponse,
  DataGoKrTrainScheduleItem,
  GetSubwayTimetableTrainRow,
} from "#/domain/subway/api/models";
import { DataGoKrTrainScheduleApiResponseSchema } from "#/domain/subway/api/models";
import { withErrorResponse, withErrorResponseFromUnknown, withSuccessResponse } from "#/shared/api";
import { ms } from "#/shared/utils";

const SUBWAY_TIMETABLE_URL = "http://apis.data.go.kr/B553766/schedule/getTrainSch";
const DEFAULT_LIMIT_PER_DIRECTION = 3;
const DEFAULT_TIMETABLE_ROW_COUNT = 100;
const DATA_GO_KR_SUCCESS_CODE = "00";
const DATA_GO_KR_INFO_SUCCESS_CODE = "INFO-000";
const DATA_GO_KR_NO_DATA_CODE = "03";
const DATA_GO_KR_NO_DATA_ERROR_CODE = "NODATA_ERROR";
const TWO_DIGIT_TIME_PATTERN = /^(\d{1,2}):?(\d{2})(?::?(\d{2}))?$/;
const JEONGWANG_STATION_NAME = "정왕";
const ALLOWED_LINE_NAMES = ["4호선", "수인분당선"] as const;

const subwayTimetableKey = process.env.SUBWAY_TIMETABLE_KEY ?? "";

type SubwayTimetableDirection = "상행" | "하행" | "내선" | "외선";
type SubwayTimetableLineName = (typeof ALLOWED_LINE_NAMES)[number];

function isAllowedLineName(lineName: string): lineName is SubwayTimetableLineName {
  return ALLOWED_LINE_NAMES.some((allowedLineName) => allowedLineName === lineName);
}

function resolveWeekdayName(referenceDate: Date) {
  const day = referenceDate.getDay();
  if (day === 0 || day === 6) {
    return "주말";
  }
  return "평일";
}

function formatLocalDateTime(referenceDate: Date) {
  const year = referenceDate.getFullYear().toString();
  const month = (referenceDate.getMonth() + 1).toString().padStart(2, "0");
  const date = referenceDate.getDate().toString().padStart(2, "0");
  const hours = referenceDate.getHours().toString().padStart(2, "0");
  const minutes = referenceDate.getMinutes().toString().padStart(2, "0");
  const seconds = referenceDate.getSeconds().toString().padStart(2, "0");
  return `${year}-${month}-${date}T${hours}:${minutes}:${seconds}`;
}

function encodePublicDataServiceKey(serviceKey: string) {
  return serviceKey.includes("%") ? serviceKey : encodeURIComponent(serviceKey);
}

function buildSubwayTimetableUrl(input: {
  serviceKey: string;
  direction: SubwayTimetableDirection;
  weekdayName: string;
  lineName: string;
  stationName: string;
  searchDateTime: string;
}) {
  const searchParams = new URLSearchParams({
    dataType: "JSON",
    tmprTmtblYn: "N",
    upbdnbSe: input.direction,
    wkndSe: input.weekdayName,
    lineNm: input.lineName,
    stnNm: input.stationName,
    searchDt: input.searchDateTime,
    pageNo: "1",
    numOfRows: DEFAULT_TIMETABLE_ROW_COUNT.toString(),
  });

  return `${SUBWAY_TIMETABLE_URL}?serviceKey=${encodePublicDataServiceKey(
    input.serviceKey
  )}&${searchParams.toString()}`;
}

function resolveDirectionGroups(lineName: string): {
  uphill: SubwayTimetableDirection[];
  downward: SubwayTimetableDirection[];
} {
  const normalizedLineName = lineName.replaceAll(/\s/g, "");
  if (normalizedLineName === "2호선") {
    return {
      uphill: ["내선"],
      downward: ["외선"],
    };
  }

  return {
    uphill: ["상행"],
    downward: ["하행"],
  };
}

function extractTrainScheduleItems(response: DataGoKrTrainScheduleApiResponse) {
  const items = response.response.body?.items;
  if (items === undefined || items === "") {
    return [];
  }

  const item = items.item;
  if (item === undefined) {
    return [];
  }
  return Array.isArray(item) ? item : [item];
}

function isNoDataResultCode(resultCode: string) {
  return resultCode === DATA_GO_KR_NO_DATA_CODE || resultCode === DATA_GO_KR_NO_DATA_ERROR_CODE;
}

function assertSuccessfulDataGoKrResponse(response: DataGoKrTrainScheduleApiResponse) {
  const resultCode = response.response.header?.resultCode;
  if (
    resultCode === undefined ||
    resultCode === "" ||
    resultCode === DATA_GO_KR_SUCCESS_CODE ||
    resultCode === DATA_GO_KR_INFO_SUCCESS_CODE ||
    isNoDataResultCode(resultCode)
  ) {
    return;
  }

  const resultMessage =
    response.response.header?.resultMsg ?? "전철 시간표 API 오류가 발생했습니다.";
  throw new Error(resultMessage);
}

function parseScheduleTimeOnDate(input: { referenceDate: Date; timeText: string }) {
  const trimmedTimeText = input.timeText.trim();
  const match = trimmedTimeText.match(TWO_DIGIT_TIME_PATTERN);
  if (!match?.[1] || !match[2]) {
    return null;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  const seconds = Number(match.at(3) ?? "0");
  if (!Number.isFinite(hours) || !Number.isFinite(minutes) || !Number.isFinite(seconds)) {
    return null;
  }

  const scheduleDate = new Date(input.referenceDate.getTime());
  scheduleDate.setHours(hours, minutes, seconds, 0);
  return scheduleDate;
}

function resolveScheduleDate(input: {
  referenceDate: Date;
  trainSchedule: DataGoKrTrainScheduleItem;
}) {
  const timeText =
    input.trainSchedule.trainDptreTm ??
    input.trainSchedule.dptreTm ??
    input.trainSchedule.trainArvlTm ??
    input.trainSchedule.arvlTm;
  if (timeText === undefined) {
    return null;
  }
  return parseScheduleTimeOnDate({ referenceDate: input.referenceDate, timeText });
}

function resolveTowardLabel(trainSchedule: DataGoKrTrainScheduleItem) {
  const destinationStationName =
    trainSchedule.arvlStnNm?.trim() ?? trainSchedule.dptreStnNm?.trim() ?? "";
  if (destinationStationName.length === 0) {
    return "—";
  }
  return destinationStationName.endsWith("행")
    ? destinationStationName
    : `${destinationStationName}행`;
}

function formatScheduleTimeText(timeText: string) {
  const trimmedTimeText = timeText.trim();
  const match = trimmedTimeText.match(TWO_DIGIT_TIME_PATTERN);
  if (!match?.[1] || !match[2]) {
    return trimmedTimeText;
  }
  return `${match[1].padStart(2, "0")}:${match[2]}`;
}

function resolveLocationText(trainSchedule: DataGoKrTrainScheduleItem) {
  const departureTime = (trainSchedule.trainDptreTm ?? trainSchedule.dptreTm)?.trim();
  if (departureTime !== undefined && departureTime.length > 0) {
    return `${formatScheduleTimeText(departureTime)} 출발`;
  }

  const arrivalTime = (trainSchedule.trainArvlTm ?? trainSchedule.arvlTm)?.trim();
  if (arrivalTime !== undefined && arrivalTime.length > 0) {
    return `${formatScheduleTimeText(arrivalTime)} 도착`;
  }

  return "시간표 정보 없음";
}

function mapTrainScheduleToTrainRow(trainSchedule: DataGoKrTrainScheduleItem) {
  return {
    toward: resolveTowardLabel(trainSchedule),
    time: resolveLocationText(trainSchedule),
  };
}

async function getTrainSchedulesByDirection(input: {
  direction: SubwayTimetableDirection;
  weekdayName: string;
  lineName: string;
  stationName: string;
  searchDateTime: string;
}) {
  const timetableUrl = buildSubwayTimetableUrl({
    serviceKey: subwayTimetableKey,
    direction: input.direction,
    weekdayName: input.weekdayName,
    lineName: input.lineName,
    stationName: input.stationName,
    searchDateTime: input.searchDateTime,
  });

  const rawResponse: DataGoKrTrainScheduleApiResponse = await ky
    .get(timetableUrl, { timeout: ms.seconds(15), retry: { limit: 0 } })
    .json<DataGoKrTrainScheduleApiResponse>();
  const parsedResponse = DataGoKrTrainScheduleApiResponseSchema.safeParse(rawResponse);
  if (!parsedResponse.success) {
    throw new Error("전철 시간표 API 응답 형식이 예상과 다릅니다.");
  }

  assertSuccessfulDataGoKrResponse(parsedResponse.data);
  const resultCode = parsedResponse.data.response.header?.resultCode;
  if (resultCode !== undefined && isNoDataResultCode(resultCode)) {
    return [];
  }

  return extractTrainScheduleItems(parsedResponse.data);
}

function buildNextTrainRows(input: {
  trainSchedules: DataGoKrTrainScheduleItem[];
  now: Date;
}): GetSubwayTimetableTrainRow[] {
  return input.trainSchedules
    .map((trainSchedule) => ({
      trainSchedule,
      scheduleDate: resolveScheduleDate({
        referenceDate: input.now,
        trainSchedule,
      }),
    }))
    .filter(
      (schedule): schedule is { trainSchedule: DataGoKrTrainScheduleItem; scheduleDate: Date } => {
        return schedule.scheduleDate !== null && schedule.scheduleDate >= input.now;
      }
    )
    .sort((leftSchedule, rightSchedule) => {
      return leftSchedule.scheduleDate.getTime() - rightSchedule.scheduleDate.getTime();
    })
    .slice(0, DEFAULT_LIMIT_PER_DIRECTION)
    .map((schedule) => mapTrainScheduleToTrainRow(schedule.trainSchedule));
}

async function getTrainSchedulesByDirections(input: {
  directions: SubwayTimetableDirection[];
  weekdayName: string;
  lineName: string;
  stationName: string;
  searchDateTime: string;
}): Promise<DataGoKrTrainScheduleItem[]> {
  const trainScheduleGroups = await Promise.all(
    input.directions.map((direction) =>
      getTrainSchedulesByDirection({
        direction,
        weekdayName: input.weekdayName,
        lineName: input.lineName,
        stationName: input.stationName,
        searchDateTime: input.searchDateTime,
      })
    )
  );

  return trainScheduleGroups.flat();
}

export const Route = createFileRoute("/api/subway/timetable")({
  server: {
    handlers: {
      GET: async ({ request }: { request: Request }) => {
        try {
          const requestUrl = new URL(request.url);
          const lineNameRaw = requestUrl.searchParams.get("lineNm");
          const lineName = (lineNameRaw ?? "").trim();

          if (lineName.length === 0) {
            return withErrorResponse("lineNm 쿼리가 필요합니다.", 400);
          }

          if (!isAllowedLineName(lineName)) {
            return withErrorResponse("lineNm은 4호선 또는 수인분당선만 가능합니다.", 400);
          }

          if (subwayTimetableKey.length === 0) {
            return withErrorResponse("SUBWAY_TIMETABLE_KEY 환경변수가 필요합니다.", 500);
          }

          const now = new Date();
          const weekdayName = resolveWeekdayName(now);
          const searchDateTime = formatLocalDateTime(now);

          const directionGroups = resolveDirectionGroups(lineName);
          const [uphillTrainSchedules, downwardTrainSchedules] = await Promise.all([
            getTrainSchedulesByDirections({
              directions: directionGroups.uphill,
              weekdayName,
              lineName,
              stationName: JEONGWANG_STATION_NAME,
              searchDateTime,
            }),
            getTrainSchedulesByDirections({
              directions: directionGroups.downward,
              weekdayName,
              lineName,
              stationName: JEONGWANG_STATION_NAME,
              searchDateTime,
            }),
          ]);
          const payload = {
            station: JEONGWANG_STATION_NAME,
            uphill: buildNextTrainRows({ trainSchedules: uphillTrainSchedules, now }),
            downward: buildNextTrainRows({ trainSchedules: downwardTrainSchedules, now }),
          };

          return withSuccessResponse(payload);
        } catch (error: unknown) {
          return withErrorResponseFromUnknown(error);
        }
      },
    },
  },
});
