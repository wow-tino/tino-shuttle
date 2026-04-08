import { useEffect, useMemo, useState } from "react";

import { useQueries } from "@tanstack/react-query";

import type { ShuttlePatternDto, ShuttleTimetableRuleDto } from "#/domain/shuttle/api/models";
import { SHUTTLE_QUERIES } from "#/domain/shuttle/api/queries";
import { useSelectedShuttlePatternStore } from "#/domain/shuttle/hooks/use-selected-shuttle-pattern-store";
import { formatHm, startOfLocalDay } from "#/domain/shuttle/utils/date-time";
import { computeNextShuttleDepartureAt } from "#/domain/shuttle/utils/next-bus";
import { Label } from "#/shared/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/shared/components/select";

const DEFAULT_PATTERN_CODE = "main_to_jungwang";
const THIRTY_MINUTES_MS = 30 * 60 * 1_000;
const TICK_MS = 10_000;

function resolveSelectedPattern(
  patterns: ShuttlePatternDto[],
  selectedCode: string | null
): ShuttlePatternDto | null {
  if (patterns.length === 0) {
    return null;
  }
  if (selectedCode) {
    const hit: ShuttlePatternDto | undefined = patterns.find((p) => p.code === selectedCode);
    if (hit) {
      return hit;
    }
  }
  const preferred: ShuttlePatternDto | undefined = patterns.find(
    (p) => p.code === DEFAULT_PATTERN_CODE
  );
  return preferred ?? patterns[0];
}

function buildTodayDepartures(input: {
  readonly patternId: number;
  readonly now: Date;
  readonly rules: ShuttleTimetableRuleDto[];
}): Date[] {
  const { patternId, now, rules } = input;
  const todayStart: Date = startOfLocalDay(now);
  const tomorrowStart: Date = new Date(todayStart.getTime() + 24 * 60 * 60 * 1_000);

  const departures: Date[] = [];
  let cursor: Date = new Date(todayStart.getTime());

  for (let i = 0; i < 512; i += 1) {
    const next: Date | null = computeNextShuttleDepartureAt(patternId, cursor, rules);
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

export function TimetableScreen() {
  const [nowTs, setNowTs] = useState(() => Date.now());

  const { selectedPatternCode, setSelectedPatternCode } = useSelectedShuttlePatternStore();

  const [patternsQuery, rulesQuery] = useQueries({
    queries: [SHUTTLE_QUERIES.GetShuttlePatterns(), SHUTTLE_QUERIES.GetShuttleTimetableRules()],
  });

  const patterns = patternsQuery.data?.patterns ?? [];
  const rules = rulesQuery.data?.rules ?? [];

  const selectedPattern = useMemo(
    () => resolveSelectedPattern(patterns, selectedPatternCode),
    [patterns, selectedPatternCode]
  );

  const isLoading = patternsQuery.isPending || rulesQuery.isPending;
  const isError = patternsQuery.isError || rulesQuery.isError;

  const now = useMemo(() => new Date(nowTs), [nowTs]);

  useEffect(() => {
    const intervalId: number = window.setInterval(() => {
      setNowTs(Date.now());
    }, TICK_MS);
    return () => {
      window.clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    if (!selectedPatternCode && selectedPattern) {
      setSelectedPatternCode(selectedPattern.code);
    }
  }, [selectedPattern, selectedPatternCode, setSelectedPatternCode]);

  const departures = useMemo((): Date[] => {
    if (!selectedPattern) {
      return [];
    }
    return buildTodayDepartures({
      patternId: selectedPattern.id,
      now,
      rules,
    });
  }, [now, rules, selectedPattern]);

  return (
    <main className="flex flex-col gap-6 p-6">
      <div className="space-y-2">
        <h1 className="text-foreground text-xl font-semibold tracking-tight">시간표</h1>
        <p className="text-muted-foreground text-sm">
          선택한 노선의 오늘 전체 출발 시각을 보여줍니다.
        </p>
      </div>

      {isLoading && (
        <p className="text-muted-foreground text-center text-sm" aria-live="polite">
          시간표를 불러오는 중…
        </p>
      )}

      {isError && (
        <p className="text-destructive text-center text-sm" role="alert">
          데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
        </p>
      )}

      {!isLoading && !isError && (
        <>
          {selectedPattern && (
            <div className="space-y-2">
              <Label htmlFor="timetable-pattern-select">노선</Label>
              <Select
                value={selectedPattern.code}
                onValueChange={(code: string) => {
                  setSelectedPatternCode(code);
                }}
              >
                <SelectTrigger
                  id="timetable-pattern-select"
                  className="w-full min-w-0"
                  aria-label="시간표 노선 선택"
                >
                  <SelectValue placeholder="노선을 선택하세요" />
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
          )}

          {!selectedPattern && (
            <p className="text-muted-foreground text-sm" role="status">
              등록된 노선이 없습니다.
            </p>
          )}

          {selectedPattern && departures.length === 0 && (
            <p
              className="text-muted-foreground text-sm"
              role="status"
              aria-label="오늘 시간표 없음"
            >
              오늘은 표시할 출발 시각이 없습니다.
            </p>
          )}

          {selectedPattern && departures.length > 0 && (
            <section aria-label="오늘 전체 시간표" className="space-y-3">
              <h2 className="text-foreground text-sm font-medium">{selectedPattern.nameKo}</h2>
              <div
                className="divide-border bg-card rounded-lg border p-3"
                role="grid"
                aria-label="오늘 출발 시각 그리드"
              >
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                  {(() => {
                    const firstDepartureAtMs: number | null = departures[0]
                      ? departures[0].getTime()
                      : null;
                    const shouldActivateNextHighlight: boolean =
                      firstDepartureAtMs !== null &&
                      nowTs >= firstDepartureAtMs - THIRTY_MINUTES_MS;

                    const firstUpcomingIndex: number = shouldActivateNextHighlight
                      ? departures.findIndex((d: Date) => d.getTime() >= nowTs)
                      : -1;

                    return departures.map((departureAt: Date, index: number) => {
                      const isNext: boolean =
                        firstUpcomingIndex !== -1 && index === firstUpcomingIndex;
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
                          {isNext && (
                            <span
                              className="bg-primary text-primary-foreground absolute -top-2 left-1/2 -translate-x-1/2 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                              aria-label="다음 출발"
                            >
                              다음
                            </span>
                          )}
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
              {departures.length >= 512 && (
                <p className="text-muted-foreground text-xs" aria-label="시간표 일부만 표시">
                  시간표가 길어 일부만 표시하고 있습니다.
                </p>
              )}
            </section>
          )}
        </>
      )}
    </main>
  );
}
