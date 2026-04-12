import { createFileRoute } from "@tanstack/react-router";

import { TimetableScreen } from "#/domain/timetable/timetable-screen";
import { ErrorBoundary } from "#/shared/components/error-boundary";
import { Loading } from "#/shared/components/loading";

export const Route = createFileRoute("/timetable")({
  component: TimetableRoute,
});

function TimetableRoute() {
  return (
    <ErrorBoundary
      suspenseFallback={
        <Loading
          containerClassName="min-h-app-main"
          title="시간표를 불러오는 중 이에요..."
        />
      }
    >
      <TimetableScreen />
    </ErrorBoundary>
  );
}
