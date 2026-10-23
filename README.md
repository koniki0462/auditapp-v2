# AuditApp

A responsive web front end for managing audits, built with **Next.js 15 (App Router)**, **React 19**, **TypeScript** and **Tailwind CSS 4**. It lets you plan, track and close audits and their findings. Unit tests run on **Vitest**.

> Data comes from the Spring Boot API in [`../audit-service`](../audit-service/README.md). Start it before the front end.

## Requirements

- **Node.js 20.12 or newer.** `.nvmrc` pins **22.12.0**.
- npm (comes with Node).

With [nvm-windows](https://github.com/coreybutler/nvm-windows) or nvm:

```bash
nvm install 22.12.0
nvm use 22.12.0        # on Windows, run this in an Administrator terminal
node -v                # should print v22.12.0
```

> **`SyntaxError: Unexpected token '??='`** when starting the app means an old Node version (for example 14) is active. Switch to Node 22 as shown above. On Windows, also make sure no separate older Node install comes earlier in your `PATH`.

## Getting started

Start the API first. It serves `http://localhost:4000/api` and loads sample data:

```bash
cd ../audit-service && mvn spring-boot:run
```

Then, in this folder:

```bash
npm install
npm run dev            # http://localhost:3000
```

If the API isn't running, pages show a "Couldn't load data" message with a retry button.

## Scripts

### Develop

| Command | Description |
| --- | --- |
| `npm run dev` | Dev server with development settings (`.env.development`) |
| `npm run dev:stage` | Dev server with staging settings (`.env.staging`) |

### Build and run

| Command | Description |
| --- | --- |
| `npm run build` / `npm run build:prod` | Production build (`.env.production`) |
| `npm start` / `npm run start:prod` | Serve the production build |
| `npm run build:stage` | Staging build (`.env.staging`) |
| `npm run start:stage` | Serve the staging build |

### Quality

| Command | Description |
| --- | --- |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check, without building |
| `npm test` | Run all tests once |
| `npm run test:watch` | Tests in watch mode |
| `npm run check` | Lint, typecheck and tests together. Run this before pushing or deploying. |

Run a single test file with `npx vitest run src/components/AuditList.test.tsx`, or tests matching a name with `npx vitest run -t "filters by status"`.

## Environments

| | Development | Staging | Production |
| --- | --- | --- | --- |
| Settings file | `.env.development` | `.env.staging` | `.env.production` |
| Header badge / title suffix | yes | yes | no |
| Search engine indexing | blocked | blocked | allowed |

- Every variable is listed in **`.env.example`**.
- Put secrets and personal overrides in `.env.<environment>.local`. These files are git-ignored.
- `NEXT_PUBLIC_*` values are baked in when you build, so build separately for each environment.

Full details are in **[docs/environments.md](docs/environments.md)**: how staging works, how to add a variable or a new environment, and how to deploy.

## Project structure

```
src/
  app/            Routes: / (dashboard), /audits, /audits/[id], /findings
  components/     AppShell (responsive sidebar/drawer), AuditList, FindingList, ...
  lib/
    data.ts       Types and the API client (the app's only data source)
    env.ts        Typed access to environment variables
    utils.ts      cn(), formatDate(), badge colour maps
  test/
    fixtures.ts   Sample audits and findings for tests
scripts/
  run-next.mjs    Runs Next.js with a named environment (used by the *:stage scripts)
docs/             Project documentation
```

The code architecture and conventions are described in **[docs/architecture.md](docs/architecture.md)**.

## Responsive behaviour

- **Phones (<640px):** a slide-out navigation menu, single-column cards, and 16px input text so iOS doesn't zoom in when you tap a field.
- **Tablets (640–1023px):** a two-column card grid, switching to a table from 768px.
- **Desktop (1024px+):** a fixed sidebar and the full data table. Extra columns appear on wider screens.
- Light and dark mode follow the device setting. The layout also adapts to notched phones and to mobile browser toolbars that show and hide.

## Note for Windows

Turbopack (`next dev --turbopack`) can fail when the project sits in a very long folder path. If the dev server fails to start, move the project to a short path such as `C:\dev\auditapp`, or remove `--turbopack` from the `dev` scripts to use webpack instead.
