import { create } from "zustand";
import { persist } from "zustand/middleware";

// storePlatform이 null이면 웹뷰 환경이므로 스토어 링크를 넣지 않아도 됨
interface WebViewStore {
  storePlatform: string | null;
  setStorePlatform: (storePlatform: string) => void;
}

export const useWebViewStore = create<WebViewStore>()(
  persist(
    (set) => ({
      storePlatform: null,
      setStorePlatform: (storePlatform) => set({ storePlatform }),
    }),
    { name: "tino-shuttle:web-view" }
  )
);
