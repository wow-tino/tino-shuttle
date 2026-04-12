import { Suspense } from "react";

import { QueryErrorResetBoundary } from "@tanstack/react-query";

import { Mail, RotateCcw } from "lucide-react";
import type { FallbackProps } from "react-error-boundary";
import { ErrorBoundary as ReactErrorBoundary } from "react-error-boundary";

import { Button } from "#/shared/components/button";
import { getErrorMessage } from "#/shared/utils";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  suspenseFallback?: React.ReactNode;
  errorFallback?: (props: FallbackProps) => React.ReactNode;
  resetKeys?: unknown[];
}

const DISAPPOINTED_TINO = "/assets/disappointed-tino.webp";

export function ErrorBoundary({
  children,
  suspenseFallback,
  errorFallback,
  resetKeys,
}: ErrorBoundaryProps) {
  return (
    <QueryErrorResetBoundary>
      {({ reset }) => {
        return (
          <ReactErrorBoundary
            onReset={reset}
            fallbackRender={errorFallback ?? ((props) => <DefaultErrorFallback {...props} />)}
            resetKeys={resetKeys}
          >
            {suspenseFallback ? (
              <Suspense fallback={suspenseFallback}>{children}</Suspense>
            ) : (
              children
            )}
          </ReactErrorBoundary>
        );
      }}
    </QueryErrorResetBoundary>
  );
}

function DefaultErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const { title, description } = getErrorMessage(error);

  return (
    <main
      className="relative flex min-h-dvh flex-col items-center justify-center"
      role="alert"
      aria-live="polite"
      aria-label="오류 안내"
    >
      <img src={DISAPPOINTED_TINO} alt="티노 실망" className="size-50" />
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-foreground text-lg font-semibold text-pretty">{title}</h1>
        <p className="text-muted-foreground text-sm leading-relaxed text-pretty">{description}</p>
      </div>
      <div className="mt-5 flex flex-col gap-2">
        <Button
          type="button"
          className="w-full sm:w-auto sm:min-w-30"
          size="default"
          onClick={resetErrorBoundary}
          aria-label="오류 화면을 닫고 다시 불러오기"
        >
          <RotateCcw className="size-4" aria-hidden />
          다시 시도
        </Button>
        <Button asChild variant="secondary" className="w-full sm:w-auto sm:min-w-30" size="default">
          <a
            href="mailto:official.tino.shuttle@gmail.com"
            aria-label="문의 메일 official.tino.shuttle@gmail.com 보내기"
          >
            <Mail className="size-4" aria-hidden />
            문의하기
          </a>
        </Button>
      </div>
    </main>
  );
}
