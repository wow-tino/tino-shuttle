import { useSuspenseQueries } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import type { SubwayHomePreviewLine } from "#/domain/subway/api/models";
import { SUBWAY_QUERIES } from "#/domain/subway/api/queries";
import { SubwayArrivalRow } from "#/domain/subway/components/subway-arrival-row";
import { SUBWAY_ARRIVAL_STATION_NAMES } from "#/domain/subway/constants/stations";
import { Button } from "#/shared/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "#/shared/components/card";

function SubwayHomeStationCard(input: {
  readonly stationName: string;
  readonly lines: readonly SubwayHomePreviewLine[];
}) {
  return (
    <div
      className="bg-muted/20 rounded-lg border p-3"
      aria-label={`${input.stationName}역 실시간 도착 요약`}
    >
      <h3 className="text-foreground mb-2 text-sm font-semibold">{input.stationName}역</h3>
      <div role="list" aria-label={`${input.stationName}역 방향별 도착 요약`}>
        {input.lines.flatMap((subwayLine) =>
          subwayLine.directions.map((arrival) => (
            <div key={`${subwayLine.subwayId}-${arrival.directionName}`} role="listitem">
              <SubwayArrivalRow fallbackDirectionLabel={arrival.directionName} arrival={arrival} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export function SubwayArrivalHomePreview() {
  const queries = useSuspenseQueries({
    queries: SUBWAY_ARRIVAL_STATION_NAMES.map((stationName) =>
      SUBWAY_QUERIES.GetSubwayHomePreview(stationName)
    ),
  });

  return (
    <Card aria-label="등하교 전철 도착 요약">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">전철 도착 정보</CardTitle>
        <p className="text-muted-foreground text-xs leading-relaxed">
          정왕역, 오이도역 기준 요약입니다. 더 많은 편성은 전철 탭에서 확인하세요.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          {SUBWAY_ARRIVAL_STATION_NAMES.map((stationName, index) => {
            const query = queries[index];
            return (
              <SubwayHomeStationCard
                key={stationName}
                stationName={stationName}
                lines={query.data.lines}
              />
            );
          })}
        </div>
        <div className="flex justify-end">
          <Button variant="link" size="sm" asChild>
            <Link to="/subway" aria-label="전철 탭에서 전체 도착 정보 보기">
              전철 전체 보기
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
