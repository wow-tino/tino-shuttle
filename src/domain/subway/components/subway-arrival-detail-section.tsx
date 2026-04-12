import { useSuspenseQueries } from "@tanstack/react-query";

import type { RealtimeArrivalItem } from "#/domain/subway/api/models";
import { SUBWAY_QUERIES } from "#/domain/subway/api/queries";
import { SubwayArrivalDetailLine } from "#/domain/subway/components/subway-arrival-detail-line";
import { SUBWAY_ARRIVAL_STATION_NAMES } from "#/domain/subway/constants/stations";
import {
  MAX_ARRIVALS_PER_DIRECTION,
  takeUpDownArrivalsByDirection,
} from "#/domain/subway/utils/pick-nearest-up-down-arrivals";

function SubwayDirectionGroup(input: {
  readonly heading: string;
  readonly arrivals: readonly RealtimeArrivalItem[];
}) {
  return (
    <div className="space-y-1">
      <h4 className="text-muted-foreground text-xs font-semibold">{input.heading}</h4>
      {input.arrivals.length === 0 ? (
        <p className="text-muted-foreground py-1 text-sm" role="status">
          도착 정보 없음
        </p>
      ) : (
        <div role="list" aria-label={`${input.heading} 열차 목록`}>
          {input.arrivals.map((arrival: RealtimeArrivalItem, index: number) => (
            <div
              key={`${arrival.subwayId ?? ""}-${arrival.recptnDt ?? ""}-${String(index)}`}
              role="listitem"
            >
              <SubwayArrivalDetailLine arrival={arrival} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SubwayDetailStationCard(input: {
  readonly stationName: string;
  readonly arrivals: readonly RealtimeArrivalItem[];
}) {
  const { upLines, downLines } = takeUpDownArrivalsByDirection(
    input.arrivals,
    MAX_ARRIVALS_PER_DIRECTION
  );

  return (
    <div
      className="bg-card rounded-lg border p-3"
      aria-label={`${input.stationName}역 실시간 도착 상세`}
    >
      <h3 className="text-foreground mb-3 text-sm font-semibold">{input.stationName}역</h3>
      <div className="space-y-4">
        <SubwayDirectionGroup heading="상행" arrivals={upLines} />
        <SubwayDirectionGroup heading="하행" arrivals={downLines} />
      </div>
    </div>
  );
}

export function SubwayArrivalDetailSection() {
  const queries = useSuspenseQueries({
    queries: SUBWAY_ARRIVAL_STATION_NAMES.map((stationName) =>
      SUBWAY_QUERIES.GetRealtimeStationArrival(stationName)
    ),
  });

  return (
    <section
      className="space-y-3"
      aria-labelledby="subway-detail-heading"
      aria-label="수도권 전철 실시간 도착 상세"
    >
      <p className="text-muted-foreground text-xs leading-relaxed">
        서울시 열린데이터 기준으로 갱신되며, 원천 지연에 따라 실제와 차이가 날 수 있습니다. 방향당
        최대 {MAX_ARRIVALS_PER_DIRECTION}편성까지 표시합니다.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {SUBWAY_ARRIVAL_STATION_NAMES.map((stationName, index) => {
          const query = queries[index];
          return (
            <SubwayDetailStationCard
              key={stationName}
              stationName={stationName}
              arrivals={query.data.arrivals}
            />
          );
        })}
      </div>
    </section>
  );
}
