import type { GetShuttleTimesRequest } from "../models";

export const shuttleKeys = {
  all: ["shuttle"] as const,
  list: () => [...shuttleKeys.all, "list"] as const,
  stops: () => [...shuttleKeys.all, "stops"] as const,
  times: (props: GetShuttleTimesRequest) =>
    [...shuttleKeys.all, "times", props.departure, props.arrival, props.weekday] as const,
  detail: (id: string) => [...shuttleKeys.all, "detail", id] as const,
  timetableRules: () => [...shuttleKeys.all, "timetableRules"] as const,
};
