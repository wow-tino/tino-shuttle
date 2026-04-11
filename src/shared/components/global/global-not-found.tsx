import type { NotFoundRouteProps } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";

export function GlobalNotFound({ routeId }: NotFoundRouteProps) {
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
