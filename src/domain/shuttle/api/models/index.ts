export type ShuttleServiceDay = "WEEKDAY" | "SATURDAY" | "SUNDAY" | "HOLIDAY";

export type ShuttleTimetableMode = "FIXED" | "FREQUENCY" | "ARRIVAL_LINKED";

export interface ShuttlePatternDto {
  readonly id: number;
  readonly code: string;
  readonly nameKo: string;
  readonly note: string | null;
  readonly boardingLatitude: number | null;
  readonly boardingLongitude: number | null;
  readonly boardingEveningLatitude: number | null;
  readonly boardingEveningLongitude: number | null;
}

export interface ShuttleTimetableRuleDto {
  readonly id: number;
  readonly patternId: number;
  readonly serviceDay: ShuttleServiceDay;
  readonly mode: ShuttleTimetableMode;
  readonly hour: number | null;
  readonly minute: number | null;
  readonly startTime: string | null;
  readonly endTime: string | null;
  readonly headwayMin: number | null;
  readonly linkedPatternId: number | null;
  readonly offsetMin: number;
  readonly note: string | null;
}

export interface GetShuttlePatternsResponse {
  readonly patterns: ShuttlePatternDto[];
}

export interface GetShuttleTimetableRulesResponse {
  readonly rules: ShuttleTimetableRuleDto[];
}
