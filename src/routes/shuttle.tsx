import { createFileRoute } from "@tanstack/react-router";

import { SHUTTLE_QUERIES } from "#/domain/shuttle/api/queries";
import { TimetableScreen } from "#/domain/timetable/timetable-screen";
import { ErrorBoundary } from "#/shared/components/error-boundary";
import { Loading } from "#/shared/components/loading";

export const Route = createFileRoute("/shuttle")({
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(SHUTTLE_QUERIES.GetShuttlePatterns()),
      context.queryClient.ensureQueryData(SHUTTLE_QUERIES.GetShuttleTimetableRules()),
    ]);
  },
  component: ShuttleRoute,
});

function ShuttleRoute() {
  return (
    <ErrorBoundary
      suspenseFallback={
        <Loading containerClassName="min-h-app-main" title="셔틀 시간표를 불러오는 중 이에요..." />
      }
    >
      <TimetableScreen />
    </ErrorBoundary>
  );
}
