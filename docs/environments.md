# Environments

AuditApp has three environments. Each one has a committed env file with non-secret defaults and its own npm scripts.

| Environment | Env file | Run locally | Build | Serve the build |
| --- | --- | --- | --- | --- |
| Development | `.env.development` | `npm run dev` | n/a | n/a |
| Staging | `.env.staging` | `npm run dev:stage` | `npm run build:stage` | `npm run start:stage` |
| Production | `.env.production` | n/a | `npm run build` (or `build:prod`) | `npm start` (or `start:prod`) |

Every environment reads the same variables, which are listed in `.env.example`.

## Variables

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_APP_ENV` | `development`, `staging` or `production`. Outside production the app shows an environment badge in the header, appends the environment to the page title, and tells search engines not to index the site. |
| `NEXT_PUBLIC_APP_NAME` | Display name used in the page title. |
| `NEXT_PUBLIC_SITE_URL` | Public base URL of the deployment, used as `metadataBase` for absolute URLs. |
| `NEXT_PUBLIC_API_BASE_URL` | Base URL of the `audit-service` API, including `/api`, with no trailing slash. `src/lib/data.ts` fetches all data from it. The service must allow this deployment's origin in `CORS_ALLOWED_ORIGINS`. |

Application code reads these through `src/lib/env.ts`, never directly from `process.env`. To add a variable:

1. Add it to `.env.example` and to all three `.env.<environment>` files.
2. Expose it from the `env` object in `src/lib/env.ts`. A `NEXT_PUBLIC_*` variable must be written out literally as `process.env.NEXT_PUBLIC_X` so that Next.js can inline it.

## Important rules

- **`NEXT_PUBLIC_*` values are fixed when you build.** They are copied into the JavaScript bundle during the build, so a build made for staging always behaves as staging. Build separately for each environment, and never ship the staging `.next` folder to production.
- **Never put secrets in a `NEXT_PUBLIC_*` variable.** Anyone can read them in the browser.
- **Secrets and personal overrides go in `.env.<environment>.local`**, for example `.env.staging.local`, or in your hosting provider's environment settings. Git ignores `*.local` files, and their values take precedence over the committed files.
- Staging and production builds both write to `.next/`, so the last build you ran is the one `npm start` / `npm run start:stage` will serve.

## How staging works

Next.js itself only knows about development and production modes. `scripts/run-next.mjs` adds support for any other named environment:

1. It loads `.env.<environment>.local`, then `.env.<environment>`, into `process.env`.
2. It then runs the requested `next` command, such as `dev`, `build` or `start`.

Next.js never overwrites a variable that is already set, so the staging values take precedence over `.env.production` during `next build`. The build still runs in production mode, with optimised output and no dev overlay. Only the configuration differs.

To add another environment, for example `qa`:

1. Create `.env.qa`.
2. Add scripts such as `"build:qa": "node scripts/run-next.mjs qa build"`.
3. Add `"qa"` to `AppEnv` in `src/lib/env.ts`.

The script needs Node 20.12 or newer because it uses `process.loadEnvFile`.

## Deploying

Whichever host you use, the pattern is the same:

```bash
npm ci
npm run check          # lint + typecheck + tests
npm run build:stage    # or: npm run build   for production
npm run start:stage    # or: npm start       for production (port 3000; set PORT to change)
```

On platforms that build for you, such as Vercel, set the build command to `npm run build:stage` for the staging project, or set the `NEXT_PUBLIC_*` variables in the platform's dashboard. Variables set on the platform take precedence over the committed env files.
