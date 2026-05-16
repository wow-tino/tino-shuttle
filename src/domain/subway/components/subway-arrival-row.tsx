import type { SubwayHomePreviewDirectionArrival } from "#/domain/subway/api/models";

export function SubwayArrivalRow(input: {
  fallbackDirectionLabel: string;
  arrival: SubwayHomePreviewDirectionArrival | null;
}) {
  const directionName = input.arrival?.directionName ?? input.fallbackDirectionLabel;

  if (!input.arrival) {
    return (
      <div className="border-border/60 flex flex-col gap-0.5 border-b py-2 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-muted-foreground text-sm font-medium">{directionName}</span>
        <p className="text-muted-foreground text-sm" role="status">
          도착 정보 없음
        </p>
      </div>
    );
  }

  return (
    <div className="border-border/60 flex flex-col gap-0.5 border-b py-2 last:border-b-0 last:border-transparent sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-0.5">
        <span className="text-muted-foreground text-sm font-medium">{directionName}</span>
        <span className="text-muted-foreground text-xs">{input.arrival.directionLabel}</span>
      </div>
      <div className="text-left sm:text-right">
        <p className="text-muted-foreground text-sm tabular-nums" aria-live="polite">
          {input.arrival.arrivalMainText}
          {input.arrival.arrivalSuffixText ? ` · ${input.arrival.arrivalSuffixText}` : ""}
        </p>
      </div>
    </div>
  );
}
