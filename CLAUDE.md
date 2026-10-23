# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Environment

Requires Node.js 20.12+ (`scripts/run-next.mjs` uses `process.loadEnvFile`); `.nvmrc` pins 22.12.0. This Windows machine also has a standalone Node 14 on PATH. If `next` fails with `SyntaxError: Unexpected token '??='`, the wrong Node is active: switch with `nvm use 22.12.0` (needs an elevated shell) or put `%NVM_HOME%\v22.12.0` first on PATH.

## Commands

```bash
npm run dev / dev:stage                      # dev server (Turbopack), http://localhost:3000
npm run build / build:stage                  # production / staging build
npm start / start:stage                      # serve the last build
npm run check                                # lint + typecheck + tests (run before finishing a change)
npm run lint                                 # ESLint (next/core-web-vitals + next/typescript)
npm run typecheck                            # tsc --noEmit
npm test                                     # Vitest, single run
npx vitest run src/components/AuditList.test.tsx   # one test file
npx vitest run -t "filters by status"        # tests matching a name
```

Turbopack can fail on long Windows paths. If it does, drop `--turbopack` from the dev scripts.

## Environments

There are three environments: development, staging and production. Each has a committed `.env.<env>` with non-secret `NEXT_PUBLIC_*` values only. Secrets go in git-ignored `.env.<env>.local`, and `.env.example` lists every variable.

Next.js has no staging mode, so the `*:stage` scripts go through `scripts/run-next.mjs`. It preloads `.env.staging` into `process.env` before running `next`, and because Next never overrides variables that are already set, staging values win over `.env.production`.

Read configuration only through `src/lib/env.ts`, which needs a literal `process.env.NEXT_PUBLIC_X` reference for inlining. When adding a variable, update `.env.example`, all three env files and `env.ts`. Outside production, the app shows an environment badge in the header, adds the environment to the page title, and sets `noindex`. Details are in `docs/environments.md`.

## Architecture

This is a front end only, built with Next.js 15 App Router, React 19, TypeScript (strict) and Tailwind CSS 4. It has no backend or API yet.

- **Data**: `src/lib/data.ts` is the only data source. It holds in-memory mock `audits` and `findings` arrays, their types (`Audit`, `Finding`, `AuditStatus`, `Severity`) and lookup helpers (`getAudit`, `getFindingsForAudit`). Pages import these directly. When a real backend arrives, replace data access here.
- **Routes** (`src/app`): `/` dashboard, `/audits`, `/audits/[id]` and `/findings`. Pages are Server Components. `/audits/[id]` uses `generateStaticParams` over the mock data and the Next 15 async `params` (`Promise<{ id: string }>`), and calls `notFound()` for unknown IDs.
- **Layout**: `app/layout.tsx` wraps every page in `AppShell`, a client component. On desktop (`lg`) it is a fixed sidebar; below that it is an off-canvas drawer that closes when the route changes. Add nav entries to the `nav` array in `AppShell.tsx`.
- **Client components**: `AuditList` and `FindingList` hold their own search and filter state. Filtering logic is exported as a pure function (for example `filterAudits`) so it can be unit-tested without rendering.
- **Responsive pattern**: lists render cards below `md` (`md:hidden`) and a table from `md` up (`hidden md:block`). Extra table columns appear at `lg`/`xl` with `hidden lg:table-cell`. Follow this when adding list views.

## Styling conventions

- Theme tokens are CSS variables in `src/app/globals.css`, exposed through `@theme inline` as Tailwind colors: `background`, `foreground`, `surface`, `muted`, `line` and `brand`. Use these, not raw palette colors, for surfaces and text.
- Dark mode follows the OS only (`@custom-variant dark` maps to `prefers-color-scheme`). There is no class toggle.
- Shared component classes are `.card` and `.input`. `.input` uses a 16px font on phones to stop iOS zoom-on-focus.
- Status and severity badge colors live in `statusStyles` and `severityStyles` in `src/lib/utils.ts`. Combine classes with `cn()`. Format dates with `formatDate()`, which uses the `en-IN` locale and parses ISO `YYYY-MM-DD` dates as local time.
- Import from `src` with the `@/` alias, which Vitest resolves via `vite-tsconfig-paths`.

## Testing

Vitest runs with jsdom and Testing Library, and `vitest.setup.ts` loads the jest-dom matchers. Tests sit next to their source files as `src/**/*.test.{ts,tsx}`. Only that pattern is collected.
