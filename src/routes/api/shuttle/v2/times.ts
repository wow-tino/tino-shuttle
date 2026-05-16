import { createFileRoute } from "@tanstack/react-router";

import { getSupabaseServerClient } from "#/server/supabase-server";
import { withErrorResponse, withErrorResponseFromUnknown, withSuccessResponse } from "#/shared/api";

export const Route = createFileRoute("/api/shuttle/v2/times")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const { searchParams } = new URL(request.url);
          const departure = searchParams.get("departure");
          const arrival = searchParams.get("arrival");
          const weekday = searchParams.get("weekday");

          if (weekday === "SUNDAY") {
            return withErrorResponse("일요일에는 셔틀이 운행되지 않아요", 404);
          }

          const isWeekday = weekday === "WEEKDAY";

          const supabase = getSupabaseServerClient();
          const { data: routeData, error: routeError } = await supabase
            .from("shuttle_v2_route")
            .select("*")
            .eq("origin_stop_id", departure)
            .eq("dest_stop_id", arrival)
            .eq("is_weekday", isWeekday);

          if (routeError) {
            return withErrorResponse("데이터를 가져오는데 실패했습니다.", 500);
          }
          if (routeData.length === 0) {
            return withSuccessResponse([]);
          }

          const { data: timeData, error: timeError } = await supabase
            .from("shuttle_v2_schedule_entry")
            .select("*")
            .eq("route_id", routeData[0].id);

          if (timeError) {
            return withErrorResponse("데이터를 가져오는데 실패했습니다.", 500);
          }
          if (timeData.length === 0) {
            return withSuccessResponse([]);
          }

          const response = timeData.map((time) => ({
            departTime: time.depart_time,
            id: time.id,
            isFirstDeparture: time.is_first_departure,
            isLastDeparture: time.is_last_departure,
            kind: time.kind,
            message: time.message,
            routeId: time.route_id,
            serviceDay: time.service_day,
            windowEnd: time.window_end,
            windowStart: time.window_start,
          }));

          return withSuccessResponse(response);
        } catch (error) {
          return withErrorResponseFromUnknown(error);
        }
      },
    },
  },
});
