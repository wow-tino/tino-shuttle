import type {
  GetShuttlePatternsResponse,
  GetShuttleTimetableRulesResponse,
} from "#/domain/shuttle/api/models";
import { api } from "#/shared/api";

export const getShuttlePatterns = async () => {
  return api<GetShuttlePatternsResponse>("/shuttle/patterns");
};

export const getShuttleTimetableRules = async () => {
  return api<GetShuttleTimetableRulesResponse>("/shuttle/time-table-rules");
};
