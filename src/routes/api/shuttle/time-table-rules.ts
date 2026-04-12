import { createFileRoute } from "@tanstack/react-router";

import type {
  GetShuttleTimetableRulesResponse,
  ShuttleTimetableRuleDto,
} from "#/domain/shuttle/api/models";
import { getSupabaseServerClient } from "#/server/supabase-server";
import { TtlMemoryCache } from "#/server/ttl-memory-cache";
import { withErrorResponseFromUnknown, withSuccessResponse } from "#/shared/api";

const timetableCache = new TtlMemoryCache(120_000);

const TIMETABLE_CACHE_KEY = "shuttle:timetable:all:v1";

function mapRuleRow(row: {
  id: number;
  pattern_id: number;
  service_day: string;
  mode: string;
  hour: number | null;
  minute: number | null;
  start_time: string | null;
  end_time: string | null;
  headway_min: number | null;
  linked_pattern_id: number | null;
  offset_min: number;
  note: string | null;
}): ShuttleTimetableRuleDto {
  return {
    id: row.id,
    patternId: row.pattern_id,
    serviceDay: row.service_day as ShuttleTimetableRuleDto["serviceDay"],
    mode: row.mode as ShuttleTimetableRuleDto["mode"],
    hour: row.hour,
    minute: row.minute,
    startTime: row.start_time,
    endTime: row.end_time,
    headwayMin: row.headway_min,
    linkedPatternId: row.linked_pattern_id,
    offsetMin: row.offset_min,
    note: row.note,
  };
}

export const Route = createFileRoute("/api/shuttle/time-table-rules")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const cached = timetableCache.get<GetShuttleTimetableRulesResponse>(TIMETABLE_CACHE_KEY);
          if (cached) {
            return withSuccessResponse(cached);
          }

          const supabase = getSupabaseServerClient();
          const { data, error } = await supabase
            .from("shuttle_timetable_rule")
            .select(
              "id, pattern_id, service_day, mode, hour, minute, start_time, end_time, headway_min, linked_pattern_id, offset_min, note"
            );

          if (error) {
            throw new Error(`shuttle_timetable_rule 조회 실패: ${error.message}`);
          }

          const rules: ShuttleTimetableRuleDto[] = data.map((row) =>
            mapRuleRow(
              row as {
                id: number;
                pattern_id: number;
                service_day: string;
                mode: string;
                hour: number | null;
                minute: number | null;
                start_time: string | null;
                end_time: string | null;
                headway_min: number | null;
                linked_pattern_id: number | null;
                offset_min: number;
                note: string | null;
              }
            )
          );

          const payload: GetShuttleTimetableRulesResponse = { rules };
          timetableCache.set(TIMETABLE_CACHE_KEY, payload);
          return withSuccessResponse(payload);
        } catch (error: unknown) {
          return withErrorResponseFromUnknown(error);
        }
      },
    },
  },
});
