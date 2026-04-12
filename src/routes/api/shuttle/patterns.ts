import { createFileRoute } from "@tanstack/react-router";

import type { GetShuttlePatternsResponse, ShuttlePatternDto } from "#/domain/shuttle/api/models";
import { getSupabaseServerClient } from "#/server/supabase-server";
import { TtlMemoryCache } from "#/server/ttl-memory-cache";
import { withErrorResponseFromUnknown, withSuccessResponse } from "#/shared/api";

const patternsCache = new TtlMemoryCache(120_000);

const PATTERNS_CACHE_KEY = "shuttle:patterns:v1";

function mapPatternRow(row: {
  id: number;
  code: string;
  name_ko: string;
  note: string | null;
  boarding_latitude: number | null;
  boarding_longitude: number | null;
  boarding_evening_latitude: number | null;
  boarding_evening_longitude: number | null;
}): ShuttlePatternDto {
  return {
    id: row.id,
    code: row.code,
    nameKo: row.name_ko,
    note: row.note,
    boardingLatitude: row.boarding_latitude,
    boardingLongitude: row.boarding_longitude,
    boardingEveningLatitude: row.boarding_evening_latitude,
    boardingEveningLongitude: row.boarding_evening_longitude,
  };
}

export const Route = createFileRoute("/api/shuttle/patterns")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const cached = patternsCache.get<GetShuttlePatternsResponse>(PATTERNS_CACHE_KEY);
          if (cached) {
            return withSuccessResponse(cached);
          }

          const supabase = getSupabaseServerClient();
          const { data, error } = await supabase
            .from("shuttle_pattern")
            .select(
              "id, code, name_ko, note, boarding_latitude, boarding_longitude, boarding_evening_latitude, boarding_evening_longitude"
            )
            .order("code", { ascending: true });

          if (error) {
            throw new Error(`shuttle_pattern 조회 실패: ${error.message}`);
          }

          const patterns: ShuttlePatternDto[] = data.map((row) =>
            mapPatternRow(
              row as {
                id: number;
                code: string;
                name_ko: string;
                note: string | null;
                boarding_latitude: number | null;
                boarding_longitude: number | null;
                boarding_evening_latitude: number | null;
                boarding_evening_longitude: number | null;
              }
            )
          );

          const payload: GetShuttlePatternsResponse = { patterns };
          patternsCache.set(PATTERNS_CACHE_KEY, payload);
          return withSuccessResponse(payload);
        } catch (error: unknown) {
          return withErrorResponseFromUnknown(error);
        }
      },
    },
  },
});
