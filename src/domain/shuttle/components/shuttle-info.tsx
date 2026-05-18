import { useEffect, useState } from "react";

import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import type { GetShuttleTimeProps } from "../api/models";
import { SHUTTLE_QUERIES } from "../api/queries";
import type { UpcomingShuttleScheduleEntry } from "../utils/shuttle-schedule";
import {
  formatDateAsClockHHmm,
  formatDateAsKoreanClock,
  getActiveShuttleWindowPreview,
  getShuttleScheduleEntryPreview,
  parseDepartTimeOnCalendarDay,
} from "../utils/shuttle-schedule";

import refreshIcon from "/icons/refresh.svg";
import { Txt } from "#/shared/components/txt";
import type { ShuttleServiceDay } from "#/shared/types/shuttle";
import { cn } from "#/shared/utils";

interface ShuttleInfoProps {
  departure: string;
  arrival: string;
  weekday: ShuttleServiceDay;
}

function getWindowPrimaryLabel(kind: GetShuttleTimeProps["kind"]): string {
  if (kind === "ADHOC_WINDOW") {
    return "수시운행";
  }
  return "도착 버스 탑승";
}

function getWindowRange(
  entry: GetShuttleTimeProps,
  referenceNow: Date
): { endAt: Date; label: string; startAt: Date } | null {
  if (entry.windowStart === null || entry.windowEnd === null) {
    return null;
  }

  const windowStartAt: Date | null = parseDepartTimeOnCalendarDay(referenceNow, entry.windowStart);
  const windowEndAt: Date | null = parseDepartTimeOnCalendarDay(referenceNow, entry.windowEnd);
  if (windowStartAt === null || windowEndAt === null) {
    return null;
  }

  return {
    endAt: windowEndAt,
    label: `${formatDateAsClockHHmm(windowStartAt)} ~ ${formatDateAsClockHHmm(windowEndAt)}`,
    startAt: windowStartAt,
  };
}

function getWindowRangeLabel(entry: GetShuttleTimeProps, referenceNow: Date): string | null {
  return getWindowRange(entry, referenceNow)?.label ?? null;
}

function getScheduleEntryStartLabel(
  scheduleEntry: UpcomingShuttleScheduleEntry,
  label: "첫차" | "막차"
): string {
  return `${formatDateAsKoreanClock(scheduleEntry.startAt)} ${label}`;
}

function getScheduleEntryRideTimeLabel(scheduleEntry: UpcomingShuttleScheduleEntry): string {
  const clockLabel: string = formatDateAsClockHHmm(scheduleEntry.startAt);
  if (scheduleEntry.entry.isFirstDeparture) {
    return `${clockLabel} 첫차`;
  }
  if (scheduleEntry.entry.isLastDeparture) {
    return `${clockLabel} 막차`;
  }
  return clockLabel;
}

function getFollowingDepartureLabel(
  following: UpcomingShuttleScheduleEntry,
  referenceNow: Date
): string {
  if (following.entry.isFirstDeparture) {
    return getScheduleEntryStartLabel(following, "첫차");
  }
  if (following.entry.isLastDeparture) {
    return following.entry.kind === "FIXED_DEPARTURE"
      ? `${following.remainingLabelKo} 후 막차`
      : getScheduleEntryStartLabel(following, "막차");
  }
  if (following.entry.kind !== "FIXED_DEPARTURE") {
    return (
      getWindowRangeLabel(following.entry, referenceNow) ??
      getWindowPrimaryLabel(following.entry.kind)
    );
  }
  return following.remainingLabelKo;
}

function getFollowingRideTimeLabel(following: UpcomingShuttleScheduleEntry | null): string | null {
  if (following === null) {
    return null;
  }
  return getScheduleEntryRideTimeLabel(following);
}

interface GetShuttleInfoDisplayProps {
  times: GetShuttleTimeProps[];
  referenceNow: Date;
  weekday: ShuttleServiceDay;
}

function getShuttleInfoDisplay({ times, referenceNow, weekday }: GetShuttleInfoDisplayProps) {
  if (weekday === "SUNDAY") {
    return {
      primaryLabel: "일요일은 셔틀이 없어요",
      primarySuffix: null,
      secondaryLabel: "다음 셔틀",
      secondaryValue: null,
    };
  }

  const scheduleEntry = getShuttleScheduleEntryPreview(times, referenceNow);
  const activeWindow = getActiveShuttleWindowPreview(times, referenceNow);
  if (activeWindow.kind === "active") {
    const windowRange = getWindowRange(activeWindow.entry, referenceNow);
    if (activeWindow.entry.isFirstDeparture) {
      return {
        primaryLabel: `${formatDateAsKoreanClock(activeWindow.windowStartAt)} 첫차`,
        primarySuffix: null,
        secondaryLabel: "다음 셔틀",
        secondaryValue:
          scheduleEntry.kind === "upcoming" ? getFollowingRideTimeLabel(scheduleEntry.next) : null,
      };
    }
    if (activeWindow.entry.isLastDeparture) {
      return {
        primaryLabel: `${formatDateAsKoreanClock(activeWindow.windowStartAt)} 막차`,
        primarySuffix: null,
        secondaryLabel: "운행 시간",
        secondaryValue: windowRange?.label ?? activeWindow.windowLabelKo,
      };
    }
    return {
      primaryLabel: getWindowPrimaryLabel(activeWindow.entry.kind),
      primarySuffix: null,
      secondaryLabel: "다음 셔틀",
      secondaryValue:
        scheduleEntry.kind === "upcoming" ? getFollowingRideTimeLabel(scheduleEntry.next) : null,
    };
  }

  if (scheduleEntry.kind === "empty") {
    return {
      primaryLabel: "운행 정보 없음",
      primarySuffix: null,
      secondaryLabel: "다음 셔틀",
      secondaryValue: null,
    };
  }

  if (scheduleEntry.next.entry.isFirstDeparture) {
    return {
      primaryLabel: getScheduleEntryStartLabel(scheduleEntry.next, "첫차"),
      primarySuffix: null,
      secondaryLabel: "다음 셔틀",
      secondaryValue:
        scheduleEntry.next.entry.isLastDeparture || scheduleEntry.following === null
          ? null
          : getFollowingRideTimeLabel(scheduleEntry.following),
    };
  }

  if (scheduleEntry.next.entry.kind !== "FIXED_DEPARTURE") {
    return {
      primaryLabel: getWindowPrimaryLabel(scheduleEntry.next.entry.kind),
      primarySuffix: scheduleEntry.next.entry.isLastDeparture ? "막차" : null,
      secondaryLabel: "다음 셔틀",
      secondaryValue: getFollowingRideTimeLabel(scheduleEntry.following),
    };
  }

  return {
    primaryLabel: scheduleEntry.next.remainingLabelKo,
    primarySuffix: scheduleEntry.next.entry.isLastDeparture ? "후 막차" : "후 탑승",
    secondaryLabel: "다음 셔틀",
    secondaryValue:
      scheduleEntry.next.entry.isLastDeparture || scheduleEntry.following === null
        ? null
        : getFollowingDepartureLabel(scheduleEntry.following, referenceNow),
  };
}

export function ShuttleInfo({ departure, arrival, weekday }: ShuttleInfoProps) {
  const [currentTimeMs, setCurrentTimeMs] = useState(() => Date.now());
  const {
    data: times,
    dataUpdatedAt,
    refetch,
    isFetching,
  } = useQuery(SHUTTLE_QUERIES.GetShuttleTimes({ departure, arrival, weekday }));

  const shuttleInfoDisplay = getShuttleInfoDisplay({
    times: times?.times ?? [],
    referenceNow: new Date(currentTimeMs),
    weekday,
  });

  const updatedAtLabel = formatDateAsClockHHmm(
    dataUpdatedAt > 0 ? new Date(dataUpdatedAt) : new Date(currentTimeMs)
  );

  const onRefetchShuttleTimes = () => {
    refetch();
  };

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTimeMs(Date.now());
    }, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="content-border bg-white px-5 py-6">
      <div className="flex items-center justify-between">
        <Txt typography="headline">셔틀버스</Txt>
        <div className="flex items-center gap-2">
          <p className="text-dark-gray">{updatedAtLabel}</p>
          <button
            aria-label="셔틀 시간 새로고침"
            disabled={isFetching}
            onClick={onRefetchShuttleTimes}
            className={cn(isFetching && "opacity-50")}
          >
            <img src={refreshIcon} alt="refresh" />
          </button>
        </div>
      </div>
      <div className="bg-gray my-3 h-px" />
      <div className="space-y-3">
        <div className="space-y-0.5">
          <Txt typography="caption">가장 빠른 셔틀</Txt>
          <div className="flex items-end gap-2">
            <Txt className="text-tu-blue text-[32px] font-semibold">
              {shuttleInfoDisplay.primaryLabel}
            </Txt>
            {shuttleInfoDisplay.primarySuffix !== null ? (
              <Txt typography="p" className="text-dark-gray">
                {shuttleInfoDisplay.primarySuffix}
              </Txt>
            ) : null}
          </div>
        </div>
        <div className="border-light-gray flex items-center justify-between rounded-md bg-[#f8f8f8] px-3.5 py-2.5">
          <div className="flex items-center gap-1">
            <Txt typography="caption">{shuttleInfoDisplay.secondaryLabel}</Txt>
            {shuttleInfoDisplay.secondaryValue !== null ? (
              <Txt typography="body-bold" className="text-tu-blue">
                {shuttleInfoDisplay.secondaryValue}
              </Txt>
            ) : null}
          </div>
          <Link
            to="/shuttle"
            className="border-tu-blue text-tu-blue text-xxs rounded-full border bg-white px-3 py-1.5 leading-none font-medium"
            aria-label="셔틀 시간표 보기"
          >
            셔틀 시간표
          </Link>
        </div>
      </div>
    </div>
  );
}
