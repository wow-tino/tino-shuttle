import { createFileRoute } from "@tanstack/react-router";

import { getSupabaseServerClient } from "#/server/supabase-server";
import { withErrorHandler, withSuccessResponse } from "#/shared/api";

export const Route = createFileRoute("/api/shuttle/v2/stops")({
  server: {
    handlers: {
      GET: withErrorHandler(async () => {
        const supabase = getSupabaseServerClient();
        const { data, error } = await supabase.from("shuttle_v2_stop").select("*");
        if (error) {
          throw new Error(`shuttle_v2_stop 조회 실패: ${error.message}`);
        }

        const response = data.map((stop) => {
          return {
            id: stop.id,
            nameKo: stop.name_ko,
          };
        });
        return withSuccessResponse(response);
      }),
    },
  },
});
