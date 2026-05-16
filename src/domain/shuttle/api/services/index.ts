import type {
  GetShuttlePatternsResponse,
  GetShuttleStopsResponse,
  GetShuttleTimesRequest,
  GetShuttleTimesResponse,
  GetShuttleTimetableRulesResponse,
} from "#/domain/shuttle/api/models";
import type { ApiResponseWithBody } from "#/shared/api";
import { api } from "#/shared/api";
import { apiV2 } from "#/shared/api/instance";

export const getShuttlePatterns = async () => {
  return api<GetShuttlePatternsResponse>("shuttle/patterns");
};

export const getShuttleStops = async () => {
  return apiV2.get<ApiResponseWithBody<GetShuttleStopsResponse>>("shuttle/v2/stops").json();
};

export const getShuttleTimes = async (props: GetShuttleTimesRequest) => {
  return apiV2
    .get<ApiResponseWithBody<GetShuttleTimesResponse>>("shuttle/v2/times", { searchParams: props })
    .json();
};

export const getShuttleTimetableRules = async () => {
  return api<GetShuttleTimetableRulesResponse>("shuttle/time-table-rules");
};
