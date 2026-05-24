import { useEffect } from "react";

import { WebViewEvent } from "#/shared/constants/web-view";
import { useWebView } from "#/shared/hooks/use-web-view";
import { useWebViewStore } from "#/shared/stores/web-view";

interface WebViewEnvironmentProviderProps {
  children: React.ReactNode;
}

export function WebViewEnvironmentProvider({ children }: WebViewEnvironmentProviderProps) {
  const setIsInWebView = useWebViewStore((state) => state.setIsInWebView);

  const { postMessage } = useWebView((event) => {
    const { type } = event;

    if (type === WebViewEvent.IN_APP_WEB_VIEW) {
      setIsInWebView(true);
    }
  });

  useEffect(() => {
    postMessage(WebViewEvent.WEB_READY);
  }, []);

  return <>{children}</>;
}
