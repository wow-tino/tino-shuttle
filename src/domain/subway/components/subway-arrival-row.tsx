import type { RealtimeArrivalItem } from "#/domain/subway/api/models";

export function SubwayArrivalRow(input: {
  readonly fallbackDirectionLabel: string;
  readonly arrival: RealtimeArrivalItem | null;
}) {
  const directionLabel: string =
    input.arrival?.updnLine && input.arrival.updnLine.length > 0
      ? input.arrival.updnLine
      : input.fallbackDirectionLabel;

  if (!input.arrival) {
    return (
      <div className="border-border/60 flex flex-col gap-0.5 border-b py-2 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-muted-foreground text-sm font-medium">{directionLabel}</span>
        <p className="text-muted-foreground text-sm" role="status">
          도착 정보 없음
        </p>
      </div>
    );
  }

  const destination: string = input.arrival.bstatnNm ?? "—";
  const message: string = input.arrival.arvlMsg2 ?? "—";
  const trainKind: string | undefined = input.arrival.btrainSttus;
  const lineName: string | undefined = input.arrival.trainLineNm;

  return (
    <div className="border-border/60 flex flex-col gap-0.5 border-b py-2 last:border-b-0 last:border-transparent sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-0.5">
        <span className="text-muted-foreground text-sm font-medium">{directionLabel}</span>
        {lineName ? <span className="text-muted-foreground text-xs">{lineName}</span> : null}
      </div>
      <div className="text-left sm:text-right">
        <p className="text-foreground text-sm font-semibold">{destination}</p>
        <p className="text-muted-foreground text-sm tabular-nums" aria-live="polite">
          {message}
          {trainKind ? ` · ${trainKind}` : ""}
        </p>
      </div>
    </div>
  );
}
