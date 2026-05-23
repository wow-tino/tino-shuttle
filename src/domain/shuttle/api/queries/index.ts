import { queryOptions, skipToken } from "@tanstack/react-query";

import type { GetShuttleTimesRequest } from "../models";

import { shuttleKeys } from "#/domain/shuttle/api/keys";
import {
  getShuttlePatterns,
  getShuttleStops,
  getShuttleTimes,
  getShuttleTimetableRules,
} from "#/domain/shuttle/api/services";

export const SHUTTLE_QUERIES = {
  GetShuttlePatterns: () =>
    queryOptions({
      queryKey: shuttleKeys.list(),
      queryFn: getShuttlePatterns,
    }),
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
  GetShuttleTimetableRules: () =>
    queryOptions({
      queryKey: shuttleKeys.timetableRules(),
      queryFn: getShuttleTimetableRules,
    }),
};
