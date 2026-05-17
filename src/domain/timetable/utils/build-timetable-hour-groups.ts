import type { GetShuttleTimesResponse } from "#/domain/shuttle/api/models";
import { parsePgTimeOnLocalDay, startOfLocalDay } from "#/shared/utils";

export type TimetableMinuteStatus = "past" | "current" | "future";

export interface TimetableMinuteItem {
  id: number;
  minuteLabel: string;
  status: TimetableMinuteStatus;
  isCurrentHour: boolean;
  isFirstDeparture: boolean;
  isLastDeparture: boolean;
}

export interface TimetableHourGroup {
  hour: number;
  hourLabel: string;
  status: TimetableMinuteStatus;
  minutes: TimetableMinuteItem[];
}

interface TimetableNotice {
  id: number;
  label: string;
  message: string;
}

interface FixedDepartureEntry {
  id: number;
  hour: number;
  minute: number;
  departureAt: Date;
  isFirstDeparture: boolean;
  isLastDeparture: boolean;
}

function formatTwoDigitNumber(numberValue: number) {
  return numberValue.toString().padStart(2, "0");
}

function buildNoticeLabel(windowStart: string | null, windowEnd: string | null) {
  if (windowStart === null || windowEnd === null) {
    return "수시 운행";
  }

  return `${windowStart.slice(0, 5)} - ${windowEnd.slice(0, 5)}`;
}

function getTimetableMinuteStatus(
  departureAt: Date,
  currentDepartureId: number | null,
  departureId: number,
  referenceNow: Date
) {
  if (currentDepartureId === departureId) {
    return "current" as const;
  }

  if (departureAt.getTime() < referenceNow.getTime()) {
    return "past" as const;
  }

  return "future" as const;
}

function getTimetableHourStatus(minutes: TimetableMinuteItem[]) {
  if (minutes.some((minute) => minute.status === "current")) {
    return "current";
  }

  if (minutes.every((minute) => minute.status === "past")) {
    return "past";
  }

  return "future";
}

export function buildTimetableHourGroups(
  shuttleTimes: GetShuttleTimesResponse,
  referenceNow: Date
) {
  const dayStart = startOfLocalDay(referenceNow);
  const fixedDepartures: FixedDepartureEntry[] = [];
  const notices: TimetableNotice[] = [];

  shuttleTimes.forEach((shuttleTime) => {
    const departureAt = parsePgTimeOnLocalDay(dayStart, shuttleTime.departTime);

    if (departureAt !== null) {
      fixedDepartures.push({
        id: shuttleTime.id,
        hour: departureAt.getHours(),
        minute: departureAt.getMinutes(),
        departureAt,
        isFirstDeparture: shuttleTime.isFirstDeparture,
        isLastDeparture: shuttleTime.isLastDeparture,
      });
      return;
    }

    if (shuttleTime.windowStart !== null || shuttleTime.windowEnd !== null || shuttleTime.message) {
      notices.push({
        id: shuttleTime.id,
        label: buildNoticeLabel(shuttleTime.windowStart, shuttleTime.windowEnd),
        message: shuttleTime.message ?? "정해진 시각 없이 운행 중입니다.",
      });
    }
  });

  const sortedFixedDepartures = [...fixedDepartures].sort(
    (leftDeparture, rightDeparture) =>
      leftDeparture.departureAt.getTime() - rightDeparture.departureAt.getTime()
  );
  const nextDeparture = sortedFixedDepartures.find(
    (departure) => departure.departureAt.getTime() >= referenceNow.getTime()
  );
  const hourGroupsByHour = new Map<number, FixedDepartureEntry[]>();

  sortedFixedDepartures.forEach((departure) => {
    const hourDepartures = hourGroupsByHour.get(departure.hour) ?? [];
    hourDepartures.push(departure);
    hourGroupsByHour.set(departure.hour, hourDepartures);
  });

  const hourGroups: TimetableHourGroup[] = Array.from(hourGroupsByHour.entries()).map(
    ([hour, departures]) => {
      const isCurrentHour = nextDeparture?.hour === hour;
      const minutes = departures.map((departure) => ({
        id: departure.id,
        minuteLabel: formatTwoDigitNumber(departure.minute),
        status: getTimetableMinuteStatus(
          departure.departureAt,
          nextDeparture?.id ?? null,
          departure.id,
          referenceNow
        ),
        isCurrentHour,
        isFirstDeparture: departure.isFirstDeparture,
        isLastDeparture: departure.isLastDeparture,
      }));

      return {
        hour,
        hourLabel: `${formatTwoDigitNumber(hour)}시`,
        status: getTimetableHourStatus(minutes),
        minutes,
      };
    }
  );

  return {
    hourGroups,
    notices,
  };
}
