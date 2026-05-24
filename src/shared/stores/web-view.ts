import { create } from "zustand";
import { persist } from "zustand/middleware";

interface WebViewStore {
  isInWebView: boolean;
  setIsInWebView: (isInWebView: boolean) => void;
}

export const useWebViewStore = create<WebViewStore>()(
  persist(
    (set) => ({
      isInWebView: false,
      setIsInWebView: (isInWebView) => set({ isInWebView }),
    }),
    { name: "tino-shuttle:web-view" }
  )
);
