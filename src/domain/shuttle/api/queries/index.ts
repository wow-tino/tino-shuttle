import { queryOptions } from "@tanstack/react-query";

import { shuttleKeys } from "#/domain/shuttle/api/keys";
import { getShuttlePatterns, getShuttleTimetableRules } from "#/domain/shuttle/api/services";
import { ms } from "#/shared/utils";

export const SHUTTLE_QUERIES = {
  GetShuttlePatterns: () =>
    queryOptions({
      queryKey: shuttleKeys.list(),
      queryFn: getShuttlePatterns,
      staleTime: ms.minutes(10),
      gcTime: ms.minutes(30),
    }),
  GetShuttleTimetableRules: () =>
    queryOptions({
      queryKey: shuttleKeys.timetableRules(),
      queryFn: getShuttleTimetableRules,
      staleTime: ms.minutes(10),
      gcTime: ms.minutes(30),
    }),
};
