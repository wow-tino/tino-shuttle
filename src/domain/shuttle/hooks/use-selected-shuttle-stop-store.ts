import { create } from "zustand";
import { persist } from "zustand/middleware";

import { DEFAULT_SHUTTLE_STOP_SELECTION } from "../constants/default-stop-selection";

export interface ShuttleStopSelection {
  departure: string;
  arrival: string;
}

interface SelectedShuttleStopState extends ShuttleStopSelection {
  setSelectedStopId: (selection: ShuttleStopSelection) => void;
}

export const useSelectedShuttleStopStore = create<SelectedShuttleStopState>()(
  persist(
    (set) => ({
      ...DEFAULT_SHUTTLE_STOP_SELECTION,
      setSelectedStopId: (selection) => {
        set(selection);
      },
    }),
    { name: "tino-shuttle:shuttle-selected-stop" }
  )
);
