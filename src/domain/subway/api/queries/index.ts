import { queryOptions } from "@tanstack/react-query";

import { subwayKeys } from "#/domain/subway/api/keys";
import { getRealtimeStationArrival } from "#/domain/subway/api/services";
import { ms } from "#/shared/utils";

export const SUBWAY_QUERIES = {
  GetPreviewArrival: (stationName: string) =>
    queryOptions({
      queryKey: subwayKeys.detail(stationName),
      queryFn: () => getRealtimeStationArrival(stationName),
      refetchInterval: ms.seconds(25),
    }),
};
