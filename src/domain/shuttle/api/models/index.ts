import { z } from "zod";

export const ShuttleServiceDaySchema = z.enum(["WEEKDAY", "SATURDAY", "SUNDAY"]);
export const ShuttleOperatingServiceDaySchema = z.enum(["WEEKDAY", "SATURDAY"]);
export const ShuttleKindSchema = z.enum(["FIXED_DEPARTURE", "ADHOC_WINDOW", "PASSENGER_INFO"]);
export const ShuttleTimetableModeSchema = z.enum(["FIXED", "FREQUENCY", "ARRIVAL_LINKED"]);

export type ShuttleTimetableMode = z.infer<typeof ShuttleTimetableModeSchema>;

export const ShuttlePatternDtoSchema = z.object({
  id: z.number(),
  code: z.string(),
  nameKo: z.string(),
  note: z.string().nullable(),
  boardingLatitude: z.number().nullable(),
  boardingLongitude: z.number().nullable(),
  boardingEveningLatitude: z.number().nullable(),
  boardingEveningLongitude: z.number().nullable(),
});

export type ShuttlePatternDto = z.infer<typeof ShuttlePatternDtoSchema>;

export const ShuttleTimetableRuleDtoSchema = z.object({
  id: z.number(),
  patternId: z.number(),
  serviceDay: ShuttleServiceDaySchema,
  mode: ShuttleTimetableModeSchema,
  hour: z.number().nullable(),
  minute: z.number().nullable(),
  startTime: z.string().nullable(),
  endTime: z.string().nullable(),
  headwayMin: z.number().nullable(),
  linkedPatternId: z.number().nullable(),
  offsetMin: z.number(),
  note: z.string().nullable(),
});

export type ShuttleTimetableRuleDto = z.infer<typeof ShuttleTimetableRuleDtoSchema>;

export const GetShuttlePatternsResponseSchema = z.object({
  patterns: z.array(ShuttlePatternDtoSchema),
});

export type GetShuttlePatternsResponse = z.infer<typeof GetShuttlePatternsResponseSchema>;

export const GetShuttleTimetableRulesResponseSchema = z.object({
  rules: z.array(ShuttleTimetableRuleDtoSchema),
});

export type GetShuttleTimetableRulesResponse = z.infer<
  typeof GetShuttleTimetableRulesResponseSchema
>;

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
