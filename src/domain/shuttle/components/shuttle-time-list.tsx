import { useEffect, useMemo, useState } from "react";

import type { ShuttlePatternDto, ShuttleTimetableRuleDto } from "#/domain/shuttle/api/models";
import {
  buildShuttleBoardViewModel,
  computeLastShuttleDepartureAt,
  computeNextShuttleDepartureAt,
} from "#/domain/shuttle/utils/next-bus";
import { formatHm, startOfLocalDay } from "#/shared/utils";

const SECOND_MS = 1_000;
const THIRTY_MINUTES_MS = 30 * 60 * 1_000;

interface ShuttleTimeListProps {
  readonly pattern: ShuttlePatternDto;
  readonly rules: ShuttleTimetableRuleDto[];
}

function pad2(numberValue: number): string {
  return String(numberValue).padStart(2, "0");
}

function resolveCountdownLabel(nextDepartureAtMs: number | null, nowTs: number): string | null {
  if (nextDepartureAtMs === null) {
    return null;
  }
  const diffMs: number = nextDepartureAtMs - nowTs;
  if (diffMs <= 0) {
    return "곧 출발";
  }

  const totalSecondsRemaining: number = Math.ceil(diffMs / 1_000);
  if (totalSecondsRemaining < 60) {
    return "곧 출발";
  }

  const minutesRemaining: number = Math.floor(totalSecondsRemaining / 60);
  const secondsRemaining: number = totalSecondsRemaining % 60;
  return `${minutesRemaining}:${pad2(secondsRemaining)}`;
}

export function ShuttleTimeList({ pattern, rules }: ShuttleTimeListProps) {
  const [nowTs, setNowTs] = useState(() => Date.now());

  useEffect(() => {
    // 노선 변경 직후 즉시 갱신
    setNowTs(Date.now());
  }, [pattern.id]);

  const now = useMemo(() => new Date(nowTs), [nowTs]);

  const board = useMemo(() => {
    return buildShuttleBoardViewModel({
      patternCode: pattern.code,
      patternNameKo: pattern.nameKo,
      patternId: pattern.id,
      rules,
      now,
    });
  }, [pattern.code, pattern.id, pattern.nameKo, rules, now]);

  const nextDepartureAtMs = useMemo((): number | null => {
    const nextDepartureAt: Date | null = computeNextShuttleDepartureAt(pattern.id, now, rules);
    return nextDepartureAt ? nextDepartureAt.getTime() : null;
  }, [pattern.id, now, rules]);

  const firstDepartureAtMs = useMemo((): number | null => {
    const todayStart: Date = startOfLocalDay(now);
    const firstDepartureAt: Date | null = computeNextShuttleDepartureAt(
      pattern.id,
      todayStart,
      rules
    );
    return firstDepartureAt ? firstDepartureAt.getTime() : null;
  }, [pattern.id, now, rules]);

  const lastDepartureAtMs = useMemo((): number | null => {
    const lastDepartureAt: Date | null = computeLastShuttleDepartureAt(pattern.id, now, rules);
    return lastDepartureAt ? lastDepartureAt.getTime() : null;
  }, [pattern.id, now, rules]);

  const isLastTrip = useMemo((): boolean => {
    return (
      nextDepartureAtMs !== null &&
      lastDepartureAtMs !== null &&
      nextDepartureAtMs === lastDepartureAtMs
    );
  }, [nextDepartureAtMs, lastDepartureAtMs]);

  const countdownLabel = useMemo((): string | null => {
    return resolveCountdownLabel(nextDepartureAtMs, nowTs);
  }, [nextDepartureAtMs, nowTs]);

  const nextNextDepartureLabel = useMemo((): string | null => {
    if (board.status !== "waiting") {
      return null;
    }
    const nextDepartureAt: Date | null = computeNextShuttleDepartureAt(pattern.id, now, rules);
    if (!nextDepartureAt) {
      return null;
    }
    const afterNextDepartureAt: Date = new Date(nextDepartureAt.getTime() + 1_000);
    const nextNextDepartureAt: Date | null = computeNextShuttleDepartureAt(
      pattern.id,
      afterNextDepartureAt,
      rules
    );
    if (!nextNextDepartureAt) {
      return null;
    }
    return formatHm(nextNextDepartureAt);
  }, [board.status, now, pattern.id, rules]);

  const isTodayFirstTrip = useMemo((): boolean => {
    return (
      nextDepartureAtMs !== null &&
      firstDepartureAtMs !== null &&
      nextDepartureAtMs === firstDepartureAtMs &&
      nowTs < firstDepartureAtMs
    );
  }, [firstDepartureAtMs, nextDepartureAtMs, nowTs]);

  const msUntilFirstTrip = useMemo((): number | null => {
    if (!isTodayFirstTrip || firstDepartureAtMs === null) {
      return null;
    }
    return firstDepartureAtMs - nowTs;
  }, [firstDepartureAtMs, isTodayFirstTrip, nowTs]);

  const shouldTick = useMemo((): boolean => {
    if (board.status !== "waiting") {
      return false;
    }
    if (!isTodayFirstTrip) {
      return true;
    }
    return msUntilFirstTrip !== null && msUntilFirstTrip <= THIRTY_MINUTES_MS;
  }, [board.status, isTodayFirstTrip, msUntilFirstTrip]);

  const shouldShowCountdown = useMemo((): boolean => {
    if (!shouldTick) {
      return false;
    }
    return countdownLabel !== null;
  }, [countdownLabel, shouldTick]);

  useEffect(() => {
    if (!shouldTick) {
      return;
    }

    let timeoutId: number | null = null;
    const tick = (): void => {
      const currentNowTs: number = Date.now();
      setNowTs(currentNowTs);

      const msIntoSecond: number = currentNowTs % SECOND_MS;
      const msUntilNextSecond: number = SECOND_MS - msIntoSecond;
      timeoutId = window.setTimeout(tick, msUntilNextSecond + 20);
    };

    timeoutId = window.setTimeout(tick, 0);
    return () => {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [shouldTick]);

  // 시간표 기반 운행 중인 경우
  if (board.status === "waiting" && board.departureTimeLabel !== null) {
    return (
      <div className="space-y-1">
        <p className="text-muted-foreground text-sm">
          {isTodayFirstTrip && msUntilFirstTrip !== null && msUntilFirstTrip > THIRTY_MINUTES_MS
            ? "오늘 첫차"
            : "출발 시각"}
        </p>
        <div className="flex items-baseline gap-2">
          <p className="text-3xl font-semibold tabular-nums">{board.departureTimeLabel}</p>
          {isLastTrip && (
            <span
              className="bg-destructive/10 text-destructive rounded-full px-2 py-0.5 text-xs font-medium"
              aria-label="막차"
            >
              막차
            </span>
          )}
        </div>
        {shouldShowCountdown && (
          <p
            className="text-muted-foreground text-sm tabular-nums"
            aria-live="polite"
            aria-label="출발까지 남은 시간"
          >
            {countdownLabel === "곧 출발" ? "곧 출발" : `약 ${countdownLabel} 후`}
          </p>
        )}

        {nextNextDepartureLabel !== null && (
          <p className="text-muted-foreground text-sm" aria-label="다음 출발 시각">
            다음 차는 <span className="text-foreground font-medium">{nextNextDepartureLabel}</span>
          </p>
        )}
      </div>
    );
  }

  // 수시 운행 구간인 경우
  if (board.status === "in_service_adhoc") {
    return (
      <div className="space-y-1">
        <p className="text-foreground text-base font-medium">수시 운행 구간</p>
        {board.detailNote ? (
          <p className="text-muted-foreground text-sm">{board.detailNote}</p>
        ) : (
          <p className="text-muted-foreground text-sm">정해진 시각 없이 운행 중입니다.</p>
        )}
      </div>
    );
  }

  // 운행이 종료된 경우
  if (board.status === "ended_today") {
    return (
      <div className="space-y-2">
        <p className="text-foreground text-base font-medium">오늘 운행이 종료되었습니다.</p>
        {board.nextDayFirstLabel ? (
          <p className="text-muted-foreground text-sm">
            내일 첫차{" "}
            <span className="text-foreground font-semibold">{board.nextDayFirstLabel}</span>
          </p>
        ) : (
          <p className="text-muted-foreground text-sm">다음 운행 일정을 확인할 수 없습니다.</p>
        )}
      </div>
    );
  }

  return null;
}
