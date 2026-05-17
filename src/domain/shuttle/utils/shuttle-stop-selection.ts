import type { ShuttleStopProps } from "../api/models";
import { DEFAULT_SHUTTLE_STOP_SELECTION } from "../constants/default-stop-selection";
import type { ShuttleStopSelection } from "../hooks/use-selected-shuttle-stop-store";

function hasStopId(stops: ShuttleStopProps[], stopId: string) {
  return stops.some((stop) => stop.id.toString() === stopId);
}

function getFallbackStopId(stops: ShuttleStopProps[], preferredStopId: string) {
  if (hasStopId(stops, preferredStopId)) {
    return preferredStopId;
  }

  return stops[0]?.id.toString() ?? preferredStopId;
}

export function normalizeShuttleStopSelection(
  selection: ShuttleStopSelection,
  stops: ShuttleStopProps[]
): ShuttleStopSelection {
  if (stops.length === 0) {
    return selection;
  }

  const departure = hasStopId(stops, selection.departure)
    ? selection.departure
    : getFallbackStopId(stops, DEFAULT_SHUTTLE_STOP_SELECTION.departure);
  const arrival = hasStopId(stops, selection.arrival)
    ? selection.arrival
    : getFallbackStopId(stops, DEFAULT_SHUTTLE_STOP_SELECTION.arrival);

  return { departure, arrival };
}

export function buildSelectionForDepartureChange(
  selection: ShuttleStopSelection,
  nextDeparture: string,
  stops: ShuttleStopProps[]
) {
  return normalizeShuttleStopSelection(
    {
      departure: nextDeparture,
      arrival: selection.arrival,
    },
    stops
  );
}

export function buildSelectionForArrivalChange(
  selection: ShuttleStopSelection,
  nextArrival: string,
  stops: ShuttleStopProps[]
) {
  return normalizeShuttleStopSelection(
    {
      departure: selection.departure,
      arrival: nextArrival,
    },
    stops
  );
}

export function buildSelectionForSwap(selection: ShuttleStopSelection, stops: ShuttleStopProps[]) {
  return normalizeShuttleStopSelection(
    {
      departure: selection.arrival,
      arrival: selection.departure,
    },
    stops
  );
}
