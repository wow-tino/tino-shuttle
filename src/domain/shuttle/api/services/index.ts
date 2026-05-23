import type {
  GetShuttleStopsResponse,
  GetShuttleTimesRequest,
  GetShuttleTimesResponse,
} from "#/domain/shuttle/api/models";
import type { ApiResponseWithBody } from "#/shared/api";
import { apiV2 } from "#/shared/api/instance";

export const getShuttleStops = async () => {
  return apiV2.get<ApiResponseWithBody<GetShuttleStopsResponse>>("shuttle/v2/stops").json();
};

export const getShuttleTimes = async (props: GetShuttleTimesRequest) => {
  return apiV2
    .get<ApiResponseWithBody<GetShuttleTimesResponse>>("shuttle/v2/times", { searchParams: props })
    .json();
};
