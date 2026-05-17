import type {
  GetSubwayArrivalResponse,
  GetSubwayHomePreviewResponse,
} from "#/domain/subway/api/models";
import { api } from "#/shared/api";
import { apiV2 } from "#/shared/api/instance";

export const getSubwayHomePreview = async (stationName: string) => {
  return api<GetSubwayHomePreviewResponse>(`subway/preview`, {
    searchParams: { stationName },
  });
};

export const getSubwayArrival = async (stationName: string) => {
  return apiV2<GetSubwayArrivalResponse>(`subway/arrival`, {
    searchParams: { stationName },
  }).json();
};
