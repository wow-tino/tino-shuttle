import { createFileRoute } from "@tanstack/react-router";

import { SHUTTLE_QUERIES } from "#/domain/shuttle/api/queries";
import { DEFAULT_SHUTTLE_STOP_SELECTION } from "#/domain/shuttle/constants/default-stop-selection";
import { getServiceDayForLocalDate } from "#/domain/shuttle/utils/service-day";
import { TimetableScreen } from "#/domain/timetable/components/timetable-screen";
import { ErrorBoundary } from "#/shared/components/error-boundary";
import { Loading } from "#/shared/components/loading";

export const Route = createFileRoute("/shuttle")({
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
  component: ShuttleRoute,
});

function ShuttleRoute() {
  const weekday = Route.useLoaderData();

  return (
    <ErrorBoundary
      suspenseFallback={
        <Loading containerClassName="min-h-app-main" title="셔틀 시간표를 불러오는 중 이에요..." />
      }
    >
      <TimetableScreen weekday={weekday} />
    </ErrorBoundary>
  );
}
