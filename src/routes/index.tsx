import { createFileRoute } from "@tanstack/react-router";

import { SHUTTLE_QUERIES } from "#/domain/shuttle/api/queries";
import { ShuttleHomeScreen } from "#/domain/shuttle/components/shuttle-home-screen";
import { DEFAULT_SHUTTLE_STOP_SELECTION } from "#/domain/shuttle/constants/default-stop-selection";
import { getServiceDayForLocalDate } from "#/domain/shuttle/utils/service-day";
import { ErrorBoundary } from "#/shared/components/error-boundary";
import { Loading } from "#/shared/components/loading";

export const Route = createFileRoute("/")({
  loader: async ({ context }) => {
    const weekday = getServiceDayForLocalDate(new Date());

    await Promise.all([
      context.queryClient.ensureQueryData(SHUTTLE_QUERIES.GetShuttleStops()),
      weekday === "SUNDAY"
        ? Promise.resolve()
        : context.queryClient.ensureQueryData(
            SHUTTLE_QUERIES.GetShuttleTimes({
              ...DEFAULT_SHUTTLE_STOP_SELECTION,
              weekday,
            })
          ),
    ]);

    return weekday;
  },
  component: ShuttleHomeRoute,
});

function ShuttleHomeRoute() {
  const weekday = Route.useLoaderData();

  return (
    <ErrorBoundary
      suspenseFallback={
        <Loading containerClassName="min-h-screen" title="탑승 노선을 불러오는 중 이에요..." />
      }
    >
      <ShuttleHomeScreen weekday={weekday} />
    </ErrorBoundary>
  );
}
