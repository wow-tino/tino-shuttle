import type { GetSubwayHomePreviewResponse } from "#/domain/subway/api/models";
import { api } from "#/shared/api";

export const getSubwayHomePreview = async (stationName: string) => {
  return api<GetSubwayHomePreviewResponse>(`subway/preview`, {
    searchParams: { stationName },
  });
};
