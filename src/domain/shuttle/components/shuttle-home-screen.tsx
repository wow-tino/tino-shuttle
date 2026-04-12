import { useMemo } from "react";

import { useSuspenseQueries } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import { SHUTTLE_QUERIES } from "#/domain/shuttle/api/queries";
import { ShuttleBoardingMap } from "#/domain/shuttle/components/shuttle-boarding-map";
import { ShuttleTimeList } from "#/domain/shuttle/components/shuttle-time-list";
import { useSelectedShuttlePatternStore } from "#/domain/shuttle/hooks/use-selected-shuttle-pattern-store";
import { SubwayArrivalHomePreview } from "#/domain/subway/components/subway-arrival-home-preview";
import { Button } from "#/shared/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "#/shared/components/card";
import { ErrorBoundary } from "#/shared/components/error-boundary";
import { Label } from "#/shared/components/label";
import { Loading } from "#/shared/components/loading";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/shared/components/select";
import { resolveSelectedPattern } from "#/shared/utils";

const now = new Date();

export function ShuttleHomeScreen() {
  const { selectedPatternCode, setSelectedPatternCode } = useSelectedShuttlePatternStore();

  const [patternsQuery, rulesQuery] = useSuspenseQueries({
    queries: [SHUTTLE_QUERIES.GetShuttlePatterns(), SHUTTLE_QUERIES.GetShuttleTimetableRules()],
  });

  const patterns = patternsQuery.data.patterns;
  const rules = rulesQuery.data.rules;

  const selectedPattern = useMemo(() => {
    if (patterns.length === 0) {
      return null;
    }
    return resolveSelectedPattern(patterns, selectedPatternCode);
  }, [patterns, selectedPatternCode]);

  return (
    <main className="flex flex-col gap-6 p-6">
      <div className="space-y-2">
        <h1 className="text-foreground text-xl font-semibold tracking-tight">티노 셔틀</h1>
        <p className="text-muted-foreground text-sm">
          등/하교 셔틀과 전철 도착을 한 화면에서 확인할 수 있어요.
        </p>
      </div>

      <Card aria-label="셔틀 다음 출발 요약">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">셔틀</CardTitle>
          <p className="text-muted-foreground text-xs leading-relaxed">
            탑승 노선을 선택하면 탑승 위치와 다음 버스 시각을 보여줍니다. 오늘 전체 시간표는 셔틀
            탭에서 확인하세요.
          </p>
        </CardHeader>
        <CardContent className="space-y-0">
          {selectedPattern ? (
            <>
              <div className="space-y-2">
                <Label htmlFor="shuttle-pattern-select">탑승 노선</Label>
                <Select
                  value={selectedPattern.code}
                  onValueChange={(code: string) => {
                    setSelectedPatternCode(code);
                  }}
                >
                  <SelectTrigger
                    id="shuttle-pattern-select"
                    className="w-full min-w-0"
                    aria-label="탑승 노선 선택"
                  >
                    <SelectValue placeholder="노선을 선택하세요">
                      {selectedPattern.nameKo}
                    </SelectValue>
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

              <div
                className="border-border/60 mt-5 space-y-4 border-t pt-5"
                aria-label={`${selectedPattern.nameKo} 노선 탑승 정보`}
              >
                <div className="space-y-2">
                  <h3 className="text-foreground text-sm font-medium">탑승 위치</h3>
                  <ShuttleBoardingMap pattern={selectedPattern} referenceInstant={now} />
                </div>
                <ShuttleTimeList pattern={selectedPattern} rules={rules} />
              </div>

              <div className="mt-4 flex justify-end">
                <Button variant="link" size="sm" asChild>
                  <Link to="/shuttle" aria-label="셔틀 탭에서 전체 시간표 보기">
                    셔틀 전체 보기
                  </Link>
                </Button>
              </div>
            </>
          ) : (
            <p className="text-muted-foreground text-sm" role="status">
              등록된 셔틀 노선이 없습니다.
            </p>
          )}
        </CardContent>
      </Card>

      <ErrorBoundary suspenseFallback={<Loading title="전철 도착 정보를 불러오는 중 이에요..." />}>
        <SubwayArrivalHomePreview />
      </ErrorBoundary>

      <p className="mx-auto text-sm text-slate-600">© 2026 tino-shuttle. All rights reserved.</p>
    </main>
  );
}
