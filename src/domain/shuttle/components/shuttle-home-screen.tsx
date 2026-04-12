import { useMemo } from "react";

import { useSuspenseQueries } from "@tanstack/react-query";

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
import { resolveSelectedPattern } from "#/shared/utils";

const now = new Date();

export function ShuttleHomeScreen() {
  const { selectedPatternCode, setSelectedPatternCode } = useSelectedShuttlePatternStore();

  const [patternsQuery, rulesQuery] = useSuspenseQueries({
    queries: [SHUTTLE_QUERIES.GetShuttlePatterns(), SHUTTLE_QUERIES.GetShuttleTimetableRules()],
  });

  const patterns = patternsQuery.data.patterns;
  const rules = rulesQuery.data.rules;

  const selectedPattern = useMemo(
    () => resolveSelectedPattern(patterns, selectedPatternCode),
    [patterns, selectedPatternCode]
  );

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
