export type ApiResponseWithBody<T = unknown> = {
  message: string;
  status: number;
  data: T;
};

const DEFAULT_SUCCESS_MESSAGE = "OK";

export function withSuccessResponse<T>(
  data: T,
  options?: { message?: string; status?: number }
): Response {
  const status: number = options?.status ?? 200;
  const message: string = options?.message ?? DEFAULT_SUCCESS_MESSAGE;
  const body: ApiResponseWithBody<T> = { message, status, data };
  return Response.json(body, { status });
}

export function withErrorResponse(message: string, status: number): Response {
  const body = { message, status, data: null, statusText: message };
  return Response.json(body, { status });
}

export function withErrorResponseFromUnknown(error: unknown): Response {
  const message: string =
    error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
  return withErrorResponse(message, 500);
}
