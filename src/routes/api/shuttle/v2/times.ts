import { createFileRoute } from "@tanstack/react-router";

import { z } from "zod";

import {
  GetShuttleTimesRequestSchema,
  GetShuttleTimesResponseSchema,
} from "#/domain/shuttle/api/models";
import { getSupabaseServerClient } from "#/server/supabase-server";
import { withErrorResponse, withErrorResponseFromUnknown, withSuccessResponse } from "#/shared/api";

const MAIN_CAMPUS_STOP_ID = 2;
const MAIN_CAMPUS_FALLBACK_NAME_KO = "본캠";

const ShuttleRouteRowSchema = z.object({
  id: z.number(),
  stop_in: z
    .boolean()
    .nullish()
    .transform((value) => value ?? false),
});

const ShuttleScheduleEntryRowSchema = z.object({
  depart_time: z.string().nullable(),
  id: z.number(),
  is_first_departure: z.boolean(),
  is_last_departure: z.boolean(),
  kind: z.enum(["FIXED_DEPARTURE", "ADHOC_WINDOW", "PASSENGER_INFO"]),
  message: z.string().nullable(),
  route_id: z.number(),
  service_day: z.enum(["WEEKDAY", "SATURDAY"]),
  window_end: z.string().nullable(),
  window_start: z.string().nullable(),
});

const ShuttleStopNameRowSchema = z.object({
  name_ko: z.string(),
});

export const Route = createFileRoute("/api/shuttle/v2/times")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const { searchParams } = new URL(request.url);
          const parsedSearchParams = GetShuttleTimesRequestSchema.safeParse({
            departure: searchParams.get("departure"),
            arrival: searchParams.get("arrival"),
            weekday: searchParams.get("weekday"),
          });

          if (!parsedSearchParams.success) {
            return withErrorResponse("잘못된 셔틀 시간표 요청입니다.", 400);
          }

          const { departure, arrival, weekday } = parsedSearchParams.data;

          if (weekday === "SUNDAY") {
            return withSuccessResponse({
              viaStopNameKo: null,
              times: [],
            });
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
          const routeRows = z.array(ShuttleRouteRowSchema).parse(routeData);
          if (routeRows.length === 0) {
            return withSuccessResponse({
              viaStopNameKo: null,
              times: [],
            });
          }

          let viaStopNameKo: string | null = null;

          if (routeRows[0].stop_in) {
            const { data: viaStopData, error: viaStopError } = await supabase
              .from("shuttle_v2_stop")
              .select("name_ko")
              .eq("id", MAIN_CAMPUS_STOP_ID)
              .maybeSingle();

            if (!viaStopError && viaStopData !== null) {
              viaStopNameKo = ShuttleStopNameRowSchema.parse(viaStopData).name_ko;
            } else {
              viaStopNameKo = MAIN_CAMPUS_FALLBACK_NAME_KO;
            }
          }

          const { data: timeData, error: timeError } = await supabase
            .from("shuttle_v2_schedule_entry")
            .select("*")
            .eq("route_id", routeRows[0].id);

          if (timeError) {
            return withErrorResponse("데이터를 가져오는데 실패했습니다.", 500);
          }
          const timeRows = z.array(ShuttleScheduleEntryRowSchema).parse(timeData);
          if (timeRows.length === 0) {
            return withSuccessResponse({
              viaStopNameKo,
              times: [],
            });
          }

          const response = GetShuttleTimesResponseSchema.parse(
            {
              viaStopNameKo,
              times: [...timeRows]
                .sort((leftTime, rightTime) => {
                  const leftSortTime = leftTime.depart_time ?? leftTime.window_start ?? "99:99:99";
                  const rightSortTime =
                    rightTime.depart_time ?? rightTime.window_start ?? "99:99:99";

                  return leftSortTime.localeCompare(rightSortTime);
                })
                .map((time) => ({
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
                })),
            }
          );

          return withSuccessResponse(response);
        } catch (error) {
          return withErrorResponseFromUnknown(error);
        }
      },
    },
  },
});
