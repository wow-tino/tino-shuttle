import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SelectedShuttlePatternState {
  readonly selectedPatternCode: string | null;
  readonly setSelectedPatternCode: (code: string) => void;
}

export const useSelectedShuttlePatternStore = create<SelectedShuttlePatternState>()(
  persist(
    (set) => ({
      selectedPatternCode: null,
      setSelectedPatternCode: (code: string): void => {
        set({ selectedPatternCode: code });
      },
    }),
    { name: "tino-shuttle:shuttle-selected-pattern" }
  )
);
