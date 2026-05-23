import { createFileRoute } from "@tanstack/react-router";

import { SUBWAY_QUERIES } from "#/domain/subway/api/queries";
import { SubwayScreen } from "#/domain/subway/components/subway-screen";

export const Route = createFileRoute("/subway")({
  loader: async ({ context }) => {
    await Promise.allSettled([
      context.queryClient.ensureQueryData(SUBWAY_QUERIES.GetSubwayTimetable("4호선")),
      context.queryClient.ensureQueryData(SUBWAY_QUERIES.GetSubwayTimetable("수인분당선")),
    ]);
  },
  component: SubwayRoute,
});

function SubwayRoute() {
  return <SubwayScreen />;
}
