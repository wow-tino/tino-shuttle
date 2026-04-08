import { createFileRoute } from "@tanstack/react-router";

import { TimetableScreen } from "#/domain/timetable/timetable-screen";

export const Route = createFileRoute("/timetable")({
  component: TimetableRoute,
});

function TimetableRoute() {
  return <TimetableScreen />;
}
