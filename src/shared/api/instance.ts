import type { Options } from "ky";
import ky from "ky";

import { ApiResponseWithBodySchema } from "./schemas/api-response-with-body-schema";

const isProduction = process.env.NODE_ENV === "production";

const baseUrl = isProduction ? "https://tino-shuttle.kro.kr" : "http://localhost:3000";

const client = ky.create({
  prefixUrl: `${baseUrl}/api`,
});

/**
 * 상대 경로로 API를 호출하고 `{ message, status, data }` 본문에서 `data`만 반환합니다.
 * @param path 예: `/shuttle/patterns` → 요청 URL은 `/api/shuttle/patterns`. 이미 `/api/...`이면 그대로 사용합니다.
 */
export async function api<T>(path: string, init?: Options): Promise<T> {
  const response = await client(path, init).json();
  const parsed = ApiResponseWithBodySchema.parse(response);
  return parsed.data as T;
}
