import type { GetRealtimeStationArrivalResponse } from "#/domain/subway/api/models";
import { api } from "#/shared/api";

export const getRealtimeStationArrival = async (stationName: string) => {
  return api<GetRealtimeStationArrivalResponse>(`subway/preview`, {
    searchParams: { stationName },
  });
};
