import { queryOptions, skipToken } from "@tanstack/react-query";

import type { GetShuttleTimesRequest } from "../models";

import { shuttleKeys } from "#/domain/shuttle/api/keys";
import {
  getShuttlePatterns,
  getShuttleStops,
  getShuttleTimes,
  getShuttleTimetableRules,
} from "#/domain/shuttle/api/services";
import { ms } from "#/shared/utils";

export const SHUTTLE_QUERIES = {
  GetShuttlePatterns: () =>
    queryOptions({
      queryKey: shuttleKeys.list(),
      queryFn: getShuttlePatterns,
      staleTime: ms.minutes(10),
      gcTime: ms.minutes(30),
    }),
  GetShuttleStops: () =>
    queryOptions({
      queryKey: shuttleKeys.stops(),
      queryFn: getShuttleStops,
      staleTime: ms.minutes(10),
      gcTime: ms.minutes(30),
      select: (data) => data.data,
    }),

  GetShuttleTimes: (props: GetShuttleTimesRequest) =>
    queryOptions({
      queryKey: shuttleKeys.times(props),
      queryFn: props.weekday !== "SUNDAY" ? () => getShuttleTimes(props) : skipToken,
      staleTime: ms.minutes(10),
      gcTime: ms.minutes(30),
      select: (data) => data.data,
    }),
  GetShuttleTimetableRules: () =>
    queryOptions({
      queryKey: shuttleKeys.timetableRules(),
      queryFn: getShuttleTimetableRules,
      staleTime: ms.minutes(10),
      gcTime: ms.minutes(30),
    }),
};
