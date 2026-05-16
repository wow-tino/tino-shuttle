import { queryOptions } from "@tanstack/react-query";

import { subwayKeys } from "#/domain/subway/api/keys";
import { getSubwayHomePreview } from "#/domain/subway/api/services";
import { ms } from "#/shared/utils";

export const SUBWAY_QUERIES = {
  GetSubwayHomePreview: (stationName: string) =>
    queryOptions({
      queryKey: subwayKeys.detail(stationName),
      queryFn: () => getSubwayHomePreview(stationName),
      refetchInterval: ms.seconds(25),
    }),
};
