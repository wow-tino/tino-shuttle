import type {
  GetSubwayArrivalResponse,
  GetSubwayHomePreviewResponse,
} from "#/domain/subway/api/models";
import { api } from "#/shared/api";

export const getSubwayHomePreview = async (stationName: string) => {
  return api<GetSubwayHomePreviewResponse>(`subway/preview`, {
    searchParams: { stationName },
  });
};

export const getSubwayArrival = async (stationName: string) => {
  return api<GetSubwayArrivalResponse>(`subway/arrival`, {
    searchParams: { stationName },
  });
};
