import { ApiResponseWithBodySchema } from "./schemas/api-response-with-body-schema";

const isProduction = process.env.NODE_ENV === "production";

const baseUrl = isProduction ? process.env.PROD_URL : "http://localhost:3000";

/**
 * 상대 경로로 API를 호출하고 `{ message, status, data }` 본문에서 `data`만 반환합니다.
 * @param path 예: `/shuttle/patterns` → 요청 URL은 `/api/shuttle/patterns`. 이미 `/api/...`이면 그대로 사용합니다.
 */
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${baseUrl}/api${path}`, init);
  const json = await response.json();
  const parsed = ApiResponseWithBodySchema.parse(json);
  if (!response.ok || parsed.data === null) {
    throw new Error(parsed.message);
  }
  return parsed.data as T;
}
