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
  const status = options?.status ?? 200;
  const message = options?.message ?? DEFAULT_SUCCESS_MESSAGE;
  const body = { message, status, data };
  return Response.json(body, { status });
}

export function withErrorResponse(message: string, status: number): Response {
  const body = { message, status, data: null };
  return Response.json(body, { status });
}
