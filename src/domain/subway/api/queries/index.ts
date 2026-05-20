import { queryOptions } from "@tanstack/react-query";

import type { GetSubwayTimetableRequest } from "../models";

import { subwayKeys } from "#/domain/subway/api/keys";
import {
  getSubwayArrival,
  getSubwayHomePreview,
  getSubwayTimetable,
} from "#/domain/subway/api/services";
import { ms } from "#/shared/utils";

export const SUBWAY_QUERIES = {
  GetSubwayHomePreview: (stationName: string) =>
    queryOptions({
      queryKey: subwayKeys.detail(stationName),
      queryFn: () => getSubwayHomePreview(stationName),
      refetchInterval: ms.seconds(25),
    }),
  GetSubwayArrival: (stationName: string) =>
    queryOptions({
      queryKey: subwayKeys.arrival(stationName),
      queryFn: () => getSubwayArrival(stationName),
      refetchInterval: ms.seconds(25),
    }),
  GetSubwayTimetable: (lineName: GetSubwayTimetableRequest) =>
    queryOptions({
      queryKey: subwayKeys.timetable(lineName),
      queryFn: () => getSubwayTimetable(lineName),
      refetchInterval: ms.minutes(1),
    }),
};
