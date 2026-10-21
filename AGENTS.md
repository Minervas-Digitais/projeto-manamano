# AGENTS.md

## Repo shape

- npm workspaces monorepo: `backend/` (NestJS 10 + Prisma 6 + PostgreSQL) and `frontend/` (Expo 52 / React Native 0.76). Root owns all lint/format config, Husky hooks, `docker-compose.yaml`, and `prisma.config.ts` (schema lives at `backend/prisma/schema.prisma`).
- Node >= 24 (`.nvmrc`). Default branch is `develop`; PRs target `develop`, branches named `TYPE/AREA/desc` (e.g. `fix/back/login`). See `docs/standards.md`, `docs/pull-request.md`, `docs/development.md`, `docs/setup.md`.
- Single root `.env` (template: `.env.example`) read by docker-compose, backend (`backend/src/load-env.ts` — custom parser with `${VAR}` expansion), and Expo (`frontend/metro.config.js`).

## Verification

- **Never run test suites (`npm test`) unless explicitly asked.** Verification should be limited to `npm run lint`, `npm run format:check` and `tsc --noEmit`.

## Commands (run from repo root)

```bash
npm install                 # installs all workspaces + activates husky hooks (do this once)
npm run lint / lint:fix     # flat ESLint config at root; CI runs this
npm run format / format:check
npm test -w backend         # requires Docker (Testcontainers spins postgres:16-alpine)
npm test -w frontend
npm test -w backend -- auth # single suite (pattern match); same for frontend: -- SignIn
npm run seed -w backend
npm run prisma:migrate -w backend -- --name x   # other prisma scripts: generate/deploy/reset/studio
```

## Gotchas

- Backend `npm test` only runs `backend/src/test/*.e2e-spec.ts` (jest config `testRegex`), `--runInBand`, coverage always on. `npm run test:e2e` is broken — it points to a nonexistent `backend/test/jest-e2e.json`. Full backend suite: 381 tests, green on `develop`.
- Frontend suite is green on `develop` (Jest with the `react-native` preset). Reproduce CI with `npm test -w frontend -- --ci`; if form tests fail with `waitFor` timeouts, check whether your branch is stale before treating it as a regression.
- Prisma CLI is configured at the repo root (`prisma.config.ts` imports `backend/src/load-env.ts`). Backend prisma scripts `cd ..` to the root — run them via `npm run prisma:* -w backend`, not from inside `backend/` with a bare `npx prisma`.
- CI (`.github/workflows`) runs `lint`, `format:check`, `typecheck` and tests (frontend + backend) on PRs. The pre-commit hook (`husky` → `npx lint-staged`) auto-fixes eslint/prettier on staged `*.{ts,tsx,json,md,css}`; if hooks are dead, root `npm install` re-activates them.
- Docker: `docker compose up -d --build` = postgres + backend + nginx (landing page + APK at `/downloads/app.apk`). Backend `entrypoint.sh`: `APP_ENV=development` → `prisma migrate dev --name init` + watch; otherwise `migrate deploy` + prod. Dockerfile uses `npm ci --ignore-scripts` + `npm rebuild bcrypt`.
- Repo rules: no `.env` commits, no `console.log` in production code, no commented-out code, single-scope PRs (`docs/standards.md`).
