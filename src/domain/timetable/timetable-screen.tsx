import { useEffect, useState } from "react";

import { useSuspenseQueries } from "@tanstack/react-query";

import type { ShuttleTimetableRuleDto } from "#/domain/shuttle/api/models";
import { SHUTTLE_QUERIES } from "#/domain/shuttle/api/queries";
import { useSelectedShuttlePatternStore } from "#/domain/shuttle/hooks/use-selected-shuttle-pattern-store";
import { computeNextShuttleDepartureAt } from "#/domain/shuttle/utils/next-bus";
import { Label } from "#/shared/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/shared/components/select";
import { formatHm, ms, resolveSelectedPattern, startOfLocalDay } from "#/shared/utils";

const THIRTY_MINUTES_MS = ms.minutes(30);
const TICK_MS = ms.seconds(10);

function buildTodayDepartures(input: {
  readonly patternId: number;
  readonly now: Date;
  readonly rules: ShuttleTimetableRuleDto[];
}) {
  const { patternId, now, rules } = input;
  const todayStart = startOfLocalDay(now);
  const tomorrowStart = new Date(todayStart.getTime() + 24 * 60 * 60 * 1_000);

  const departures = [];
  let cursor = new Date(todayStart.getTime());

  for (let i = 0; i < 512; i += 1) {
    const next = computeNextShuttleDepartureAt(patternId, cursor, rules);
    if (!next) {
      break;
    }
    if (next.getTime() >= tomorrowStart.getTime()) {
      break;
    }
    departures.push(next);
    cursor = new Date(next.getTime() + 1_000);
  }

  return departures;
}

function getFirstUpcomingDepartureIndex(departures: readonly Date[], nowTs: number): number {
  if (departures.length === 0) {
    return -1;
  }
  const firstDepartureAtMs: number = departures[0].getTime();
  if (nowTs < firstDepartureAtMs - THIRTY_MINUTES_MS) {
    return -1;
  }
  return departures.findIndex((d: Date) => d.getTime() >= nowTs);
}

export function TimetableScreen() {
  const [nowTs, setNowTs] = useState(() => Date.now());

  const { selectedPatternCode, setSelectedPatternCode } = useSelectedShuttlePatternStore();

  const [patternsQuery, rulesQuery] = useSuspenseQueries({
    queries: [SHUTTLE_QUERIES.GetShuttlePatterns(), SHUTTLE_QUERIES.GetShuttleTimetableRules()],
  });

  const patterns = patternsQuery.data.patterns;
  const rules = rulesQuery.data.rules;

  const selectedPattern = resolveSelectedPattern(patterns, selectedPatternCode);
  const now = new Date(nowTs);

  const departures: Date[] =
    patterns.length === 0
      ? []
      : buildTodayDepartures({
          patternId: selectedPattern.id,
          now,
          rules,
        });

  const firstUpcomingDepartureIndex = getFirstUpcomingDepartureIndex(departures, nowTs);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNowTs(Date.now());
    }, TICK_MS);
    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  if (patterns.length === 0) {
    return (
      <main className="flex flex-col gap-6 p-6">
        <div className="space-y-2">
          <h1 className="text-foreground text-xl font-semibold tracking-tight">시간표</h1>
          <p className="text-muted-foreground text-sm" role="status">
            등록된 노선이 없습니다.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex flex-col gap-6 p-6">
      <div className="space-y-2">
        <h1 className="text-foreground text-xl font-semibold tracking-tight">시간표</h1>
        <p className="text-muted-foreground text-sm">
          선택한 노선의 오늘 전체 출발 시각을 보여줍니다.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="timetable-pattern-select">노선</Label>
        <Select value={selectedPattern.code} onValueChange={setSelectedPatternCode}>
          <SelectTrigger
            id="timetable-pattern-select"
            className="w-full min-w-0"
            aria-label="시간표 노선 선택"
          >
            <SelectValue placeholder="노선을 선택하세요">{selectedPattern.nameKo}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {patterns.map((p) => (
              <SelectItem key={p.code} value={p.code}>
                {p.nameKo}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {departures.length === 0 && (
        <p className="text-muted-foreground text-sm" role="status" aria-label="오늘 시간표 없음">
          오늘은 표시할 출발 시각이 없습니다.
        </p>
      )}

      {departures.length > 0 && (
        <section aria-label="오늘 전체 시간표" className="space-y-3">
          <h2 className="text-foreground text-sm font-medium">{selectedPattern.nameKo}</h2>
          <div
            className="divide-border bg-card rounded-lg border p-3"
            role="grid"
            aria-label="오늘 출발 시각 그리드"
          >
            <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
              {departures.map((departureAt: Date, index: number) => {
                const isNext =
                  firstUpcomingDepartureIndex !== -1 && index === firstUpcomingDepartureIndex;
                return (
                  <div
                    key={departureAt.toISOString()}
                    role="gridcell"
                    aria-label={
                      isNext ? `다음 출발 ${formatHm(departureAt)}` : formatHm(departureAt)
                    }
                    className={[
                      "relative flex items-center justify-center rounded-md border px-2 py-3 text-sm font-semibold tabular-nums",
                      isNext
                        ? "border-primary/50 bg-primary/5 text-foreground ring-primary/40 ring-2"
                        : "border-border bg-background text-foreground",
                    ].join(" ")}
                  >
                    {formatHm(departureAt)}
                    {isNext ? (
                      <span
                        className="bg-primary text-primary-foreground absolute -top-2 left-1/2 -translate-x-1/2 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                        aria-label="다음 출발"
                      >
                        다음
                      </span>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
