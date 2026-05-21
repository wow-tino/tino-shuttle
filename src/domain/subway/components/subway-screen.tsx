import { useState } from "react";

import { SubwayRealtimeSection } from "#/domain/subway/components/subway-realtime-section";
import { SubwayTimetableSection } from "#/domain/subway/components/subway-timetable-section";
import { ErrorBoundary } from "#/shared/components/error-boundary";
import { Loading } from "#/shared/components/loading";
import { cn } from "#/shared/utils";

export type SubwaySelectedLine = "4호선" | "수인분당선";
export type SubwaySelectedTab = "realtime" | "timetable";

const LINE_CONFIG = {
  "4호선": {
    color: "text-line-number4",
    other: "수인분당선" as SubwaySelectedLine,
    uphillLabel: "신길온천 방면",
    downwardLabel: "오이도 방면",
  },
  수인분당선: {
    color: "text-line-suin-bundang",
    other: "4호선" as SubwaySelectedLine,
    uphillLabel: "왕십리 방면",
    downwardLabel: "인천 방면",
  },
} as const;

export function SubwayScreen() {
  const [selectedLine, setSelectedLine] = useState<SubwaySelectedLine>("4호선");
  const [selectedTab, setSelectedTab] = useState<SubwaySelectedTab>("timetable");
  const config = LINE_CONFIG[selectedLine];

  return (
    <main className="flex flex-col gap-4 p-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <h1 className="text-foreground text-xl font-semibold tracking-tight">
            정왕역 <span className={config.color}>{selectedLine}</span>
          </h1>
          <p className="text-muted-foreground mt-1 text-xs leading-relaxed">
            서울시 열린데이터 기준으로 갱신되며, 원천 지연에 따라 실제와 차이가 날 수 있습니다.
          </p>
        </div>
        <button
          onClick={() => setSelectedLine(config.other)}
          className={cn(
            "mt-0.5 shrink-0 rounded-full border border-current px-2.5 py-1 text-xs font-medium",
            LINE_CONFIG[config.other].color,
            "bg-current/5"
          )}
          aria-label={`${config.other}으로 노선 변경`}
        >
          {config.other}
        </button>
      </div>

      <div className="flex items-center gap-2">
        <div className="bg-muted flex rounded-lg p-0.5">
          {(["realtime", "timetable"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-all",
                selectedTab === tab
                  ? "bg-card text-foreground shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {tab === "realtime" ? "실시간" : "시간표"}
            </button>
          ))}
        </div>
      </div>

      <ErrorBoundary suspenseFallback={<Loading title="전철 정보를 불러오는 중 이에요..." />}>
        {selectedTab === "realtime" ? (
          <SubwayRealtimeSection
            uphillLabel={config.uphillLabel}
            downwardLabel={config.downwardLabel}
            lineColor={config.color}
          />
        ) : (
          <SubwayTimetableSection
            selectedLine={selectedLine}
            uphillLabel={config.uphillLabel}
            downwardLabel={config.downwardLabel}
            lineColor={config.color}
          />
        )}
      </ErrorBoundary>
    </main>
  );
}
