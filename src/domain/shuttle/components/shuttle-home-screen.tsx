import { useEffect, useMemo } from "react";

import { useQueries } from "@tanstack/react-query";

import type { ShuttlePatternDto } from "#/domain/shuttle/api/models";
import { SHUTTLE_QUERIES } from "#/domain/shuttle/api/queries";
import { ShuttleBoardingMap } from "#/domain/shuttle/components/shuttle-boarding-map";
import { ShuttleTimeList } from "#/domain/shuttle/components/shuttle-time-list";
import { useSelectedShuttlePatternStore } from "#/domain/shuttle/hooks/use-selected-shuttle-pattern-store";
import { Card, CardContent, CardHeader, CardTitle } from "#/shared/components/card";
import { Label } from "#/shared/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/shared/components/select";

const DEFAULT_PATTERN_CODE = "main_to_jungwang";
const now = new Date();

function resolveSelectedPattern(
  patterns: ShuttlePatternDto[],
  selectedCode: string | null
): ShuttlePatternDto | null {
  if (patterns.length === 0) {
    return null;
  }
  if (selectedCode) {
    const hit = patterns.find((p) => p.code === selectedCode);
    if (hit) {
      return hit;
    }
  }
  const preferred = patterns.find((p) => p.code === DEFAULT_PATTERN_CODE);
  return preferred ?? patterns[0];
}

export function ShuttleHomeScreen() {
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

  useEffect(() => {
    if (!selectedPatternCode && selectedPattern) {
      setSelectedPatternCode(selectedPattern.code);
    }
  }, [selectedPattern, selectedPatternCode, setSelectedPatternCode]);

  if (isLoading) {
    return (
      <main className="mx-auto flex min-h-[70dvh] max-w-lg flex-col justify-center p-6 pb-8">
        <p className="text-muted-foreground text-center text-sm" aria-live="polite">
          시간표를 불러오는 중…
        </p>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="mx-auto flex min-h-[70dvh] max-w-lg flex-col justify-center p-6 pb-8">
        <p className="text-destructive text-center text-sm" role="alert">
          데이터를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.
        </p>
      </main>
    );
  }

  if (!selectedPattern) {
    return (
      <main className="mx-auto flex min-h-[70dvh] max-w-lg flex-col justify-center p-6 pb-8">
        <p className="text-muted-foreground text-center text-sm">등록된 노선이 없습니다.</p>
      </main>
    );
  }

  return (
    <main className="flex flex-col gap-6 p-6">
      <div className="space-y-2">
        <h1 className="text-foreground text-xl font-semibold tracking-tight">티노 셔틀</h1>
        <p className="text-muted-foreground text-sm">
          탑승 노선을 선택하면 다음 버스 시각을 보여줍니다.
        </p>
      </div>

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

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{selectedPattern.nameKo}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h2 className="text-foreground text-sm font-medium">탑승 위치</h2>
            <ShuttleBoardingMap pattern={selectedPattern} referenceInstant={now} />
          </div>

          <ShuttleTimeList pattern={selectedPattern} rules={rules} />
        </CardContent>
      </Card>
      <p className="mx-auto text-sm text-slate-600">© 2026 tino-shuttle. All rights reserved.</p>
    </main>
  );
}
