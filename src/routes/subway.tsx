import { createFileRoute } from "@tanstack/react-router";

import { SUBWAY_QUERIES } from "#/domain/subway/api/queries";
import { SubwayScreen } from "#/domain/subway/components/subway-screen";
import { SUBWAY_ARRIVAL_STATION_NAMES } from "#/domain/subway/constants/stations";
import { ErrorBoundary } from "#/shared/components/error-boundary";
import { Loading } from "#/shared/components/loading";

export const Route = createFileRoute("/subway")({
  loader: async ({ context }) => {
    await Promise.all(
      SUBWAY_ARRIVAL_STATION_NAMES.map((stationName) =>
        context.queryClient.ensureQueryData(SUBWAY_QUERIES.GetRealtimeStationArrival(stationName))
      )
    );
  },
  component: SubwayRoute,
});

function SubwayRoute() {
  return (
    <ErrorBoundary
      suspenseFallback={
        <Loading
          containerClassName="min-h-app-main"
          title="전철 도착 정보를 불러오는 중 이에요..."
        />
      }
    >
      <SubwayScreen />
    </ErrorBoundary>
  );
}
