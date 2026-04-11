import { HTTPError } from "ky";

export function getErrorMessage(error: unknown): {
  title: string;
  description: string;
} {
  if (error instanceof HTTPError) {
    if (error.response.status === 400) {
      return {
        title: "잘못된 요청",
        description: "요청한 내용을 확인해주세요.",
      };
    }

    if (error.response.status === 403) {
      return {
        title: "접근 권한이 없습니다",
        description: "접근 권한이 없는 페이지입니다.",
      };
    }

    if (error.response.status === 500) {
      return {
        title: "서버 오류",
        description: "서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.",
      };
    }
  }

  if (error instanceof Error) {
    return {
      title: typeof error.message === "string" ? error.message : "문제가 발생했습니다",
      description: "문제가 지속될 경우 문의 메일로 연락주세요.",
    };
  }

  return {
    title: typeof error === "string" ? error : "문제가 발생했습니다",
    description: "문제가 지속될 경우 문의 메일로 연락주세요.",
  };
}
