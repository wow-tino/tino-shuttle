import { z } from "zod";

export const ShuttleServiceDaySchema = z.enum(["WEEKDAY", "SATURDAY", "SUNDAY"]);
export const ShuttleOperatingServiceDaySchema = z.enum(["WEEKDAY", "SATURDAY"]);
export const ShuttleKindSchema = z.enum(["FIXED_DEPARTURE", "ADHOC_WINDOW", "PASSENGER_INFO"]);

export const ShuttleStopPropsSchema = z.object({
  id: z.number(),
  nameKo: z.string(),
});

export type ShuttleStopProps = z.infer<typeof ShuttleStopPropsSchema>;

export const GetShuttleStopsResponseSchema = z.array(ShuttleStopPropsSchema);

export type GetShuttleStopsResponse = z.infer<typeof GetShuttleStopsResponseSchema>;

export const GetShuttleTimesRequestSchema = z.object({
  departure: z.string().min(1),
  arrival: z.string().min(1),
  weekday: ShuttleServiceDaySchema,
});

export type GetShuttleTimesRequest = z.infer<typeof GetShuttleTimesRequestSchema>;

export const GetShuttleTimePropsSchema = z.object({
  departTime: z.string().nullable(),
  id: z.number(),
  isFirstDeparture: z.boolean(),
  isLastDeparture: z.boolean(),
  kind: ShuttleKindSchema,
  message: z.string().nullable(),
  routeId: z.number(),
  serviceDay: ShuttleOperatingServiceDaySchema,
  windowEnd: z.string().nullable(),
  windowStart: z.string().nullable(),
});

export type GetShuttleTimeProps = z.infer<typeof GetShuttleTimePropsSchema>;

export const GetShuttleTimesResponseSchema = z.object({
  viaStopNameKo: z.string().nullable(),
  times: z.array(GetShuttleTimePropsSchema),
});

export type GetShuttleTimesResponse = z.infer<typeof GetShuttleTimesResponseSchema>;
