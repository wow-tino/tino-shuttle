import { queryOptions, skipToken } from "@tanstack/react-query";

import type { GetShuttleTimesRequest } from "../models";

import { shuttleKeys } from "#/domain/shuttle/api/keys";
import { getShuttleStops, getShuttleTimes } from "#/domain/shuttle/api/services";

export const SHUTTLE_QUERIES = {
  GetShuttleStops: () =>
    queryOptions({
      queryKey: shuttleKeys.stops(),
      queryFn: getShuttleStops,
      select: (data) => data.data,
    }),

  GetShuttleTimes: (props: GetShuttleTimesRequest) =>
    queryOptions({
      queryKey: shuttleKeys.times(props),
      queryFn: props.weekday !== "SUNDAY" ? () => getShuttleTimes(props) : skipToken,
      select: (data) => data.data,
    }),
};
