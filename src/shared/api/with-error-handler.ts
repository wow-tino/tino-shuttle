import { withErrorResponse } from "./api-response-with-body";

interface HandlerArgs {
  request: Request;
  params: Record<string, string | undefined>;
}

export function withErrorHandler(handler: (args: HandlerArgs) => Promise<Response>) {
  return async (args: HandlerArgs) => {
    try {
      const response = await handler(args);
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다.";
      return withErrorResponse(message, 500);
    }
  };
}
