import { useSuspenseQuery } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";

import type { GetSubwayTimetableRequest } from "#/domain/subway/api/models";
import { SUBWAY_QUERIES } from "#/domain/subway/api/queries";
import { cn } from "#/shared/utils";

function formatUpdatedTime(timestamp: number): string {
  if (timestamp <= 0) return "--:--";
  return new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(timestamp));
}

function SubwayTimetableRow(input: { toward: string; time: string; lineColor: string }) {
  return (
    <div className="border-border/60 flex items-center border-b py-2.5 last:border-b-0">
      <span className="text-foreground min-w-[72px] text-sm">{input.toward}</span>
      <span className={cn("flex-1 text-sm font-bold", input.lineColor)}>{input.time}</span>
    </div>
  );
}

function SubwayDirectionCard(input: {
  heading: string;
  trains: Array<{ toward: string; time: string }>;
  lineColor: string;
}) {
  return (
    <div className="bg-card rounded-lg border p-4">
      <h3 className="text-foreground mb-2 text-sm font-semibold">{input.heading}</h3>
      {input.trains.length === 0 ? (
        <p className="text-muted-foreground text-sm" role="status">
          열차 정보 없음
        </p>
      ) : (
        <div role="list" aria-label={`${input.heading} 열차 목록`}>
          {input.trains.map((train, index) => (
            <div key={`${train.toward}-${train.time}-${String(index)}`} role="listitem">
              <SubwayTimetableRow
                toward={train.toward}
                time={train.time}
                lineColor={input.lineColor}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function SubwayTimetableSection(input: {
  selectedLine: GetSubwayTimetableRequest;
  uphillLabel: string;
  downwardLabel: string;
  lineColor: string;
}) {
  const { data, refetch, dataUpdatedAt, isFetching } = useSuspenseQuery(
    SUBWAY_QUERIES.GetSubwayTimetable(input.selectedLine)
  );

  const responseData = data.data;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-end gap-2">
        <span className="text-muted-foreground text-xs tabular-nums">
          {formatUpdatedTime(dataUpdatedAt)}
        </span>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          aria-label="새로고침"
          className={cn("text-muted-foreground transition-opacity", isFetching && "opacity-40")}
        >
          <RefreshCw size={14} className={cn(isFetching && "animate-spin")} />
        </button>
      </div>
      <SubwayDirectionCard
        heading={input.uphillLabel}
        trains={responseData.uphill}
        lineColor={input.lineColor}
      />
      <SubwayDirectionCard
        heading={input.downwardLabel}
        trains={responseData.downward}
        lineColor={input.lineColor}
      />
    </div>
  );
}
