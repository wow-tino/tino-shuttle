import type { GetRealtimeStationArrivalResponse } from "#/domain/subway/api/models";
import { api } from "#/shared/api";

export const getRealtimeStationArrival = async (stationName: string) => {
  const query: string = new URLSearchParams({ stationName }).toString();
  return api<GetRealtimeStationArrivalResponse>(`subway/realtime-station-arrival?${query}`);
};
