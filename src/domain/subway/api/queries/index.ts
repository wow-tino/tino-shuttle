import { queryOptions } from "@tanstack/react-query";

import { subwayKeys } from "#/domain/subway/api/keys";
import { getRealtimeStationArrival } from "#/domain/subway/api/services";
import { ms } from "#/shared/utils";

export const SUBWAY_QUERIES = {
  GetRealtimeStationArrival: (stationName: string) =>
    queryOptions({
      queryKey: subwayKeys.detail(stationName),
      queryFn: () => getRealtimeStationArrival(stationName),
      staleTime: ms.seconds(15),
      gcTime: ms.minutes(5),
      refetchInterval: ms.seconds(25),
    }),
};
