import type { RealtimeArrivalItem } from "#/domain/subway/api/models";

/** 방향 그룹 안에서 열차 한 편성(종착·도착 메시지)만 표시합니다. */
export function SubwayArrivalDetailLine(input: { readonly arrival: RealtimeArrivalItem }) {
  const destination = input.arrival.bstatnNm ?? "—";
  const message = input.arrival.arvlMsg2 ?? "—";
  const trainKind = input.arrival.btrainSttus;
  const lineName = input.arrival.trainLineNm;

  return (
    <div className="border-border/60 flex flex-col gap-0.5 border-b py-2 last:border-b-0">
      {lineName ? <span className="text-muted-foreground text-xs">{lineName}</span> : null}
      <p className="text-foreground text-sm font-semibold">{destination}</p>
      <p className="text-muted-foreground text-sm tabular-nums" aria-live="polite">
        {message}
        {trainKind ? ` · ${trainKind}` : ""}
      </p>
    </div>
  );
}
