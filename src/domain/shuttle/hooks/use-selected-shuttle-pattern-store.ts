import { create } from "zustand";
import { persist } from "zustand/middleware";

export const DEFAULT_PATTERN_CODE = "main_to_jungwang";

interface SelectedShuttlePatternState {
  readonly selectedPatternCode: string;
  readonly setSelectedPatternCode: (code: string) => void;
}

export const useSelectedShuttlePatternStore = create<SelectedShuttlePatternState>()(
  persist(
    (set) => ({
      selectedPatternCode: DEFAULT_PATTERN_CODE,
      setSelectedPatternCode: (code: string): void => {
        set({ selectedPatternCode: code });
      },
    }),
    { name: "tino-shuttle:shuttle-selected-pattern" }
  )
);
