import type { ErrorComponentProps } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";

import { Home, Mail, RotateCcw } from "lucide-react";

import { Button } from "#/shared/components/button";
import { getErrorMessage } from "#/shared/utils";

const DISAPPOINTED_TINO = "/assets/disappointed-tino.webp";

export function GlobalError({ error, reset }: ErrorComponentProps) {
  const { title, description } = getErrorMessage(error);

  return (
    <main
      className="relative flex min-h-dvh flex-col items-center justify-center px-4"
      role="alert"
      aria-live="polite"
      aria-label="오류 안내"
    >
      <img src={DISAPPOINTED_TINO} alt="티노 실망" className="size-50" />
      <div className="mt-2 flex max-w-md flex-col items-center gap-2 text-center">
        <h1 className="text-foreground text-lg font-semibold text-pretty">{title}</h1>
        <p className="text-muted-foreground text-sm leading-relaxed text-pretty">{description}</p>
      </div>
      <div className="mt-5 flex w-full max-w-sm flex-col gap-2">
        <Button
          type="button"
          className="w-full sm:mx-auto sm:min-w-30"
          size="default"
          onClick={reset}
          aria-label="오류를 초기화하고 다시 시도하기"
        >
          <RotateCcw className="size-4" aria-hidden />
          다시 시도
        </Button>
        <Button
          asChild
          variant="secondary"
          className="w-full sm:mx-auto sm:min-w-30"
          size="default"
        >
          <a
            href="mailto:official.tino.shuttle@gmail.com"
            aria-label="문의 메일 official.tino.shuttle@gmail.com 보내기"
          >
            <Mail className="size-4" aria-hidden />
            문의하기
          </a>
        </Button>
        <Button asChild variant="outline" className="w-full sm:mx-auto sm:min-w-30" size="default">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2"
            aria-label="홈 화면으로 이동"
          >
            <Home className="size-4" aria-hidden />
            홈으로 돌아가기
          </Link>
        </Button>
      </div>
    </main>
  );
}
