import { config } from "dotenv";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

let didLoad = false;

/**
 * 서버(serverFn) 실행 시 `.env*`에서 비-VITE 변수를 읽는다.
 * 클라이언트 번들에서 이 모듈을 정적으로 import하지 않는다.
 */
export function loadServerEnvFiles(): void {
  if (didLoad) {
    return;
  }
  didLoad = true;
  const root: string = process.cwd();
  const candidates: string[] = [
    resolve(root, ".env.development.local"),
    resolve(root, ".env.development"),
    resolve(root, ".env.local"),
    resolve(root, ".env"),
  ];
  for (const path of candidates) {
    if (existsSync(path)) {
      config({ path, override: false });
    }
  }
}
