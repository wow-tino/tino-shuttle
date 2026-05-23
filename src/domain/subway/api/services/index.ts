import type {
  GetSubwayHomePreviewResponse,
  GetSubwayRealtimeResponse,
  GetSubwayTimetableRequest,
  GetSubwayTimetableResponse,
} from "#/domain/subway/api/models";
import type { ApiResponseWithBody } from "#/shared/api";
import { api } from "#/shared/api";
import { apiV2 } from "#/shared/api/instance";

export const getSubwayHomePreview = async (stationName: string) => {
  return api<GetSubwayHomePreviewResponse>(`subway/preview`, {
    searchParams: { stationName },
  });
};

export const getSubwayRealtime = async (lineName: GetSubwayTimetableRequest) => {
  return apiV2
    .get<ApiResponseWithBody<GetSubwayRealtimeResponse>>(`subway/realtime`, {
      searchParams: { lineNm: lineName },
    })
    .json();
};

export const getSubwayTimetable = async (lineName: GetSubwayTimetableRequest) => {
  return apiV2
    .get<ApiResponseWithBody<GetSubwayTimetableResponse>>(`subway/timetable`, {
      searchParams: { lineNm: lineName },
    })
    .json();
};
