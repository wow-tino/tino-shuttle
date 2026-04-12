import type { QueryClient } from "@tanstack/react-query";
import { createRootRouteWithContext, HeadContent, Scripts } from "@tanstack/react-router";
import { inject as vercelInject } from "@vercel/analytics";

import appCss from "../styles.css?url";

import { BottomNavigation } from "#/shared/components/bottom-navigation";
import { GlobalError } from "#/shared/components/global/global-error";
import { GlobalNotFound } from "#/shared/components/global/global-not-found";
import { NaverMapsRootProvider, TanStackProvider } from "#/shared/components/provider";
import { GoogleAnalyticsProvider } from "#/shared/components/provider/google-analytics-provider";

interface MyRouterContext {
  queryClient: QueryClient;
}

const THEME_INIT_SCRIPT = `(function(){try{var stored=window.localStorage.getItem('theme');var mode=(stored==='light'||stored==='dark'||stored==='auto')?stored:'auto';var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var resolved=mode==='auto'?(prefersDark?'dark':'light'):mode;var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(resolved);if(mode==='auto'){root.removeAttribute('data-theme')}else{root.setAttribute('data-theme',mode)}root.style.colorScheme=resolved;}catch(e){}})();`;

export const Route = createRootRouteWithContext<MyRouterContext>()({
  notFoundComponent: GlobalNotFound,
  errorComponent: GlobalError,
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
      },
      {
        title: "티노 셔틀 | 스마트한 셔틀 버스 조회",
      },
      {
        name: "description",
        content:
          "기다림 없는 실시간 셔틀 버스 정보, 티노 셔틀에서 확인하세요. 노선도 및 도착 예정 시간을 제공합니다.",
      },
      {
        name: "keywords",
        content:
          "셔틀버스, 실시간 버스, 학교 셔틀, 통학 버스, 티노 셔틀, 버스 시간표, 한국공대 셔틀, 한국공학대학교 셔틀",
      },
      {
        property: "og:type",
        content: "website",
      },
      {
        property: "og:title",
        content: "티노 셔틀",
      },
      {
        property: "og:description",
        content:
          "기다림 없는 실시간 셔틀 버스 정보, 티노 셔틀에서 확인하세요. 노선도 및 도착 예정 시간을 제공합니다.",
      },
      {
        property: "og:image",
        content: "/og-image.webp",
      },
      {
        property: "og:url",
        content: "https://tino-shuttle.kro.kr",
      },
      {
        name: "twitter:card",
        content: "summary_large_image",
      },
      {
        name: "twitter:title",
        content: "티노 셔틀",
      },
      {
        name: "twitter:description",
        content:
          "기다림 없는 실시간 셔틀 버스 정보, 티노 셔틀에서 확인하세요. 노선도 및 도착 예정 시간을 제공합니다.",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "icon",
        href: "/favicon.ico",
      },
    ],
  }),
  shellComponent: RootDocument,
});

if (import.meta.env.PROD) {
  vercelInject({
    mode: "production",
  });
}

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <NaverMapsRootProvider />
        <HeadContent />
        <GoogleAnalyticsProvider />
      </head>
      <body>
        <TanStackProvider>
          <div className="max-w-mobile pb-app-shell-padding-bottom mx-auto min-h-screen w-full">
            {children}
            <BottomNavigation />
          </div>
        </TanStackProvider>
        <Scripts />
      </body>
    </html>
  );
}
