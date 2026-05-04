import { useEffect } from "react";

import { WebViewEvent } from "#/shared/constants/web-view";
import { useWebView } from "#/shared/hooks/use-web-view";
import { useWebViewStore } from "#/shared/stores/web-view";

interface WebViewEnvironmentProviderProps {
  children: React.ReactNode;
}

export function WebViewEnvironmentProvider({ children }: WebViewEnvironmentProviderProps) {
  const setStorePlatform = useWebViewStore((state) => state.setStorePlatform);

  const { postMessage } = useWebView((event) => {
    const { type, data } = event;

    if (type === WebViewEvent.IN_APP_WEB_VIEW) {
      const { storePlatform } = data as { storePlatform: string };
      // storePlatform에 해당하는 스토어 값 설정하기
      setStorePlatform(storePlatform);
    }
  });

  useEffect(() => {
    postMessage(WebViewEvent.WEB_READY);
  }, []);

  return <>{children}</>;
}
