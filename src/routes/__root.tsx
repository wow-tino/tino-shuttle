import type { QueryClient } from "@tanstack/react-query";
import type { NotFoundRouteProps } from "@tanstack/react-router";
import { createRootRouteWithContext, HeadContent, Link, Scripts } from "@tanstack/react-router";
import { inject as vercelInject } from "@vercel/analytics";

import appCss from "../styles.css?url";

import { BottomNavigation } from "#/shared/components/bottom-navigation";
import { NaverMapsRootProvider, TanStackProvider } from "#/shared/components/provider";
import { GoogleAnalyticsProvider } from "#/shared/components/provider/google-analytics-provider";

interface MyRouterContext {
  queryClient: QueryClient;
}

const THEME_INIT_SCRIPT = `(function(){try{var stored=window.localStorage.getItem('theme');var mode=(stored==='light'||stored==='dark'||stored==='auto')?stored:'auto';var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var resolved=mode==='auto'?(prefersDark?'dark':'light'):mode;var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(resolved);if(mode==='auto'){root.removeAttribute('data-theme')}else{root.setAttribute('data-theme',mode)}root.style.colorScheme=resolved;}catch(e){}})();`;

function GlobalNotFoundScreen({ routeId }: NotFoundRouteProps) {
  return (
    <main
      className="flex min-h-[50dvh] flex-col items-center justify-center gap-4 px-4 py-12 text-center"
      data-not-found-boundary={routeId}
      role="alert"
      aria-live="polite"
    >
      <h1 className="text-foreground text-xl font-semibold">페이지를 찾을 수 없습니다</h1>
      <p className="text-muted-foreground max-w-sm text-sm">
        주소가 잘못되었거나 삭제된 페이지일 수 있어요.
      </p>
      <Link
        to="/"
        className="text-primary focus-visible:ring-ring rounded-md text-sm font-medium underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        aria-label="홈 화면으로 이동"
      >
        홈으로 돌아가기
      </Link>
    </main>
  );
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  notFoundComponent: GlobalNotFoundScreen,
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
          <div className="max-w-mobile mx-auto min-h-screen w-full pb-[calc(60px+env(safe-area-inset-bottom))]">
            {children}
            <BottomNavigation />
          </div>
        </TanStackProvider>
        <Scripts />
      </body>
    </html>
  );
}
