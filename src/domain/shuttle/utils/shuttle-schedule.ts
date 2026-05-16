import type { GetShuttleTimeProps } from "#/domain/shuttle/api/models";

export type UpcomingShuttleFixedDeparture = {
  entry: GetShuttleTimeProps;
  departAt: Date;
  remainingMs: number;
  remainingLabelKo: string;
  scheduleLabelKo: string;
};

export type UpcomingShuttleScheduleEntry = {
  entry: GetShuttleTimeProps;
  startAt: Date;
  remainingMs: number;
  remainingLabelKo: string;
};

export type ShuttleFixedDeparturePreview =
  | { kind: "empty" }
  | {
      kind: "upcoming";
      next: UpcomingShuttleFixedDeparture;
      following: UpcomingShuttleFixedDeparture | null;
    };

export type ShuttleWindowPreview =
  | { kind: "empty" }
  | {
      kind: "active";
      entry: GetShuttleTimeProps;
      windowEndAt: Date;
      windowLabelKo: string;
      windowStartAt: Date;
    };

export type ShuttleScheduleEntryPreview =
  | { kind: "empty" }
  | {
      kind: "upcoming";
      next: UpcomingShuttleScheduleEntry;
      following: UpcomingShuttleScheduleEntry | null;
    };

export function parseDepartTimeOnCalendarDay(
  calendarReference: Date,
  departTime: string
): Date | null {
  const trimmed: string = departTime.trim();
  if (trimmed === "") {
    return null;
  }

  if (/^\d{4}-\d{2}-\d{2}T/.test(trimmed) || trimmed.endsWith("Z")) {
    const parsedMs: number = Date.parse(trimmed);
    if (Number.isNaN(parsedMs)) {
      return null;
    }
    return new Date(parsedMs);
  }

  const clockParts: string[] = trimmed.split(":");
  if (clockParts.length >= 2 && clockParts.length <= 3) {
    const hourToken: string = clockParts[0];
    const minuteToken: string = clockParts[1];
    const hoursParsed: number = Number.parseInt(hourToken, 10);
    const minutesParsed: number = Number.parseInt(minuteToken, 10);
    if (
      !Number.isNaN(hoursParsed) &&
      !Number.isNaN(minutesParsed) &&
      hoursParsed >= 0 &&
      hoursParsed <= 23 &&
      minutesParsed >= 0 &&
      minutesParsed <= 59
    ) {
      let rawSeconds = 0;
      if (clockParts.length === 3) {
        rawSeconds = Number.parseInt(clockParts[2], 10);
      }
      const secondsParsed: number = Number.isNaN(rawSeconds) ? 0 : rawSeconds;
      if (secondsParsed < 0 || secondsParsed > 59) {
        return null;
      }
      const d: Date = new Date(calendarReference);
      d.setHours(hoursParsed, minutesParsed, secondsParsed, 0);
      return d;
    }
  }

  const fallbackMs: number = Date.parse(trimmed);
  if (!Number.isNaN(fallbackMs)) {
    return new Date(fallbackMs);
  }

  return null;
}

export function formatRemainingMsKo(remainingMs: number): string {
  const totalSec: number = Math.max(0, Math.floor(remainingMs / 1000));
  const minutes: number = Math.floor(totalSec / 60);
  const seconds: number = totalSec % 60;
  return `${minutes}분 ${seconds}초`;
}

export function formatDateAsClockHHmm(date: Date): string {
  const h: number = date.getHours();
  const m: number = date.getMinutes();
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function formatDateAsKoreanClock(date: Date): string {
  const hours: number = date.getHours();
  const minutes: number = date.getMinutes();
  return `${hours}시 ${String(minutes).padStart(2, "0")}분`;
}

function formatWindowRangeKo(windowStartAt: Date, windowEndAt: Date): string {
  return `${formatDateAsClockHHmm(windowStartAt)} ~ ${formatDateAsClockHHmm(windowEndAt)}`;
}

function buildScheduleLabelKo(entry: GetShuttleTimeProps, departAt: Date): string {
  const clock: string = formatDateAsClockHHmm(departAt);
  if (entry.isFirstDeparture) {
    return `첫차 · ${clock} 출발`;
  }
  if (entry.isLastDeparture) {
    return `막차 · ${clock} 출발`;
  }
  return `${clock} 출발`;
}

function mapRowToUpcoming(
  row: { entry: GetShuttleTimeProps; departAt: Date },
  referenceNow: Date
): UpcomingShuttleFixedDeparture {
  const remainingMs: number = row.departAt.getTime() - referenceNow.getTime();
  return {
    entry: row.entry,
    departAt: row.departAt,
    remainingMs,
    remainingLabelKo: formatRemainingMsKo(remainingMs),
    scheduleLabelKo: buildScheduleLabelKo(row.entry, row.departAt),
  };
}

function getScheduleEntryStartAt(entry: GetShuttleTimeProps, referenceNow: Date): Date | null {
  if (entry.kind === "FIXED_DEPARTURE") {
    if (entry.departTime === null) {
      return null;
    }
    return parseDepartTimeOnCalendarDay(referenceNow, entry.departTime);
  }

  if (entry.windowStart === null) {
    return null;
  }
  return parseDepartTimeOnCalendarDay(referenceNow, entry.windowStart);
}

function mapScheduleEntryToUpcoming(
  row: { entry: GetShuttleTimeProps; startAt: Date },
  referenceNow: Date
): UpcomingShuttleScheduleEntry {
  const remainingMs: number = row.startAt.getTime() - referenceNow.getTime();
  return {
    entry: row.entry,
    remainingMs,
    remainingLabelKo: formatRemainingMsKo(remainingMs),
    startAt: row.startAt,
  };
}

export function getShuttleFixedDeparturePreview(
  times: GetShuttleTimeProps[],
  referenceNow: Date
): ShuttleFixedDeparturePreview {
  const candidates: Array<{ entry: GetShuttleTimeProps; departAt: Date }> = [];

  for (const item of times) {
    if (item.kind !== "FIXED_DEPARTURE" || item.departTime === null) {
      continue;
    }
    const departAt = parseDepartTimeOnCalendarDay(referenceNow, item.departTime);
    if (departAt === null) {
      continue;
    }
    if (departAt.getTime() <= referenceNow.getTime()) {
      continue;
    }
    candidates.push({ entry: item, departAt });
  }

  candidates.sort((a, b) => a.departAt.getTime() - b.departAt.getTime());

  if (candidates.length === 0) {
    return { kind: "empty" };
  }

  const first: { entry: GetShuttleTimeProps; departAt: Date } = candidates[0];

  return {
    kind: "upcoming",
    next: mapRowToUpcoming(first, referenceNow),
    following: candidates.length >= 2 ? mapRowToUpcoming(candidates[1], referenceNow) : null,
  };
}

export function getShuttleScheduleEntryPreview(
  times: GetShuttleTimeProps[],
  referenceNow: Date
): ShuttleScheduleEntryPreview {
  const candidates: Array<{ entry: GetShuttleTimeProps; startAt: Date }> = [];

  for (const item of times) {
    const startAt: Date | null = getScheduleEntryStartAt(item, referenceNow);
    if (startAt === null) {
      continue;
    }
    if (startAt.getTime() <= referenceNow.getTime()) {
      continue;
    }
    candidates.push({ entry: item, startAt });
  }

  candidates.sort((a, b) => a.startAt.getTime() - b.startAt.getTime());

  if (candidates.length === 0) {
    return { kind: "empty" };
  }

  const first: { entry: GetShuttleTimeProps; startAt: Date } = candidates[0];

  return {
    kind: "upcoming",
    next: mapScheduleEntryToUpcoming(first, referenceNow),
    following:
      candidates.length >= 2 ? mapScheduleEntryToUpcoming(candidates[1], referenceNow) : null,
  };
}

export function getActiveShuttleWindowPreview(
  times: GetShuttleTimeProps[],
  referenceNow: Date
): ShuttleWindowPreview {
  const candidates: Array<{
    entry: GetShuttleTimeProps;
    windowEndAt: Date;
    windowStartAt: Date;
  }> = [];

  for (const item of times) {
    if (
      (item.kind !== "ADHOC_WINDOW" && item.kind !== "PASSENGER_INFO") ||
      item.windowStart === null ||
      item.windowEnd === null
    ) {
      continue;
    }

    const windowStartAt: Date | null = parseDepartTimeOnCalendarDay(referenceNow, item.windowStart);
    const windowEndAt: Date | null = parseDepartTimeOnCalendarDay(referenceNow, item.windowEnd);
    if (windowStartAt === null || windowEndAt === null) {
      continue;
    }

    const referenceTime: number = referenceNow.getTime();
    if (windowStartAt.getTime() <= referenceTime && referenceTime <= windowEndAt.getTime()) {
      candidates.push({ entry: item, windowEndAt, windowStartAt });
    }
  }

  candidates.sort((a, b) => a.windowStartAt.getTime() - b.windowStartAt.getTime());

  if (candidates.length === 0) {
    return { kind: "empty" };
  }

  const first: {
    entry: GetShuttleTimeProps;
    windowEndAt: Date;
    windowStartAt: Date;
  } = candidates[0];

  return {
    kind: "active",
    entry: first.entry,
    windowEndAt: first.windowEndAt,
    windowLabelKo: formatWindowRangeKo(first.windowStartAt, first.windowEndAt),
    windowStartAt: first.windowStartAt,
  };
}

export function formatShuttleTimeOnCalendarDay(
  calendarReference: Date,
  value: string | null
): string | null {
  if (value === null || value.trim() === "") {
    return null;
  }
  const parsed: Date | null = parseDepartTimeOnCalendarDay(calendarReference, value);
  if (parsed === null) {
    return value;
  }
  return formatDateAsClockHHmm(parsed);
}
