import { createFileRoute } from "@tanstack/react-router";

import { SHUTTLE_QUERIES } from "#/domain/shuttle/api/queries";
import { ShuttleHomeScreen } from "#/domain/shuttle/components/shuttle-home-screen";
import { SUBWAY_QUERIES } from "#/domain/subway/api/queries";
import { SUBWAY_ARRIVAL_STATION_NAMES } from "#/domain/subway/constants/stations";
import { ErrorBoundary } from "#/shared/components/error-boundary";
import { Loading } from "#/shared/components/loading";

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(SHUTTLE_QUERIES.GetShuttlePatterns()),
      context.queryClient.ensureQueryData(SHUTTLE_QUERIES.GetShuttleTimetableRules()),
      ...SUBWAY_ARRIVAL_STATION_NAMES.map((stationName) =>
        context.queryClient.ensureQueryData(SUBWAY_QUERIES.GetRealtimeStationArrival(stationName))
      ),
    ]);
  },
  component: ShuttleHomeRoute,
});

function ShuttleHomeRoute() {
  return (
    <ErrorBoundary
      suspenseFallback={
        <Loading containerClassName="min-h-app-main" title="탑승 노선을 불러오는 중 이에요..." />
      }
    >
      <ShuttleHomeScreen />
    </ErrorBoundary>
  );
}
