# tino-shuttle — 에이전트 안내

TanStack Intent 스킬 경로는 pnpm 해시/버전에 묶일 수 있어, 의존성 major 업데이트 후에는 `npx @tanstack/intent@latest list`로 경로를 확인하는 것이 좋습니다.

<!-- intent-skills:start -->

# Skill mappings - when working in these areas, load the linked skill file into context.

skills:

- task: "TanStack Start 코어 — Vite tanstackStart, 실행 모델, 배포, 미들웨어, 서버 런타임"
  load: "node_modules/.pnpm/@tanstack+start-client-core@1.167.7/node_modules/@tanstack/start-client-core/skills/start-core/SKILL.md"
- task: "React Start — StartClient, createStart, useServerFn, React 전용 설정"
  load: "node_modules/@tanstack/react-start/skills/react-start/SKILL.md"
- task: "TanStack Router 코어 — 라우트 트리, 파일 규칙, 매칭, 타입 등록"
  load: "node_modules/.pnpm/@tanstack+router-core@1.168.7/node_modules/@tanstack/router-core/skills/router-core/SKILL.md"
- task: "라우트 loader, loaderDeps, pending/error, Await, 지연 로딩 데이터"
  load: "node_modules/.pnpm/@tanstack+router-core@1.168.7/node_modules/@tanstack/router-core/skills/router-core/data-loading/SKILL.md"
- task: "검색 파라미터 검증·직렬화 (Zod 어댑터와 함께 쓰는 경우 포함)"
  load: "node_modules/.pnpm/@tanstack+router-core@1.168.7/node_modules/@tanstack/router-core/skills/router-core/search-params/SKILL.md"
- task: "createServerFn, 서버 라우트 핸들러, 입력 검증, 리다이렉트·notFound"
  load: "node_modules/.pnpm/@tanstack+start-client-core@1.167.7/node_modules/@tanstack/start-client-core/skills/start-core/server-functions/SKILL.md"
- task: "TanStack Router 번들러 플러그인 — 라우트 생성, autoCodeSplitting, routesDirectory"
  load: "node_modules/@tanstack/router-plugin/skills/router-plugin/SKILL.md"
- task: "@tanstack/devtools-vite — Vite 플러그인 순서(맨 앞), inspect, 프로덕션 제거"
load: "node_modules/@tanstack/devtools-vite/skills/devtools-vite-plugin/SKILL.md"
<!-- intent-skills:end -->
