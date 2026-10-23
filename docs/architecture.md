# Architecture

## Overview

AuditApp is the front end. Its data comes from the Spring Boot `audit-service` (`../audit-service`), a REST API at `NEXT_PUBLIC_API_BASE_URL`. Pages are server components that fetch from the API on every request, so they always show current data and a build does not need the API running.

```
app/layout.tsx  ──►  AppShell (client: sidebar / mobile drawer, env badge)
      │
      └── app/<route>/page.tsx  (async server components)
              │  await data functions
              ▼
          lib/data.ts  (types + API client)  ──HTTP──►  audit-service /api
              │  pass data as props
              ▼
          components/AuditList, FindingList, ...  (client where interactive)
```

## Data

`src/lib/data.ts` is the only data source. It holds:

- the types `Audit`, `Finding`, `AuditStatus` and `Severity`, which match the API's JSON
- async functions `getAudits()`, `getAudit(id)`, `getFindings()` and `getFindingsForAudit(auditId)`

Each function calls `fetch` on `env.apiBaseUrl` with `cache: "no-store"`. `getAudit` returns `null` when the API answers 404, so the page can call `notFound()`. Any other failure, including an unreachable API, throws `ApiError`, and `app/error.tsx` shows a "Couldn't load data" screen with a retry button.

For local development, start the API first with `mvn spring-boot:run` in `../audit-service`. Its dev profile loads sample data. Tests never call the API: they use the fixtures in `src/test/fixtures.ts` and stub `fetch`.

## Routing

| Route | File | Notes |
| --- | --- | --- |
| `/` | `app/page.tsx` | Dashboard: metric cards, recent audits, open findings |
| `/audits` | `app/audits/page.tsx` | All audits, with search and status filter |
| `/audits/[id]` | `app/audits/[id]/page.tsx` | Audit detail. Uses Next 15 async `params` and `notFound()` for unknown IDs. |
| `/findings` | `app/findings/page.tsx` | Open and resolved findings |

Navigation links are defined in the `nav` array in `components/AppShell.tsx`.

## Components

- Pages are **Server Components**. A component gets `"use client"` only when it holds state: `AppShell` (drawer) and `AuditList` (search and filter).
- Filtering logic is exported as a plain function (for example `filterAudits`) so tests can check it without rendering the component.
- **Responsive list pattern:** below `md` a list shows cards (`md:hidden`); from `md` up it shows a table (`hidden md:block`). Extra columns appear with `hidden lg:table-cell` or `xl:table-cell`.

## Styling

Every colour comes from tokens defined once in `app/globals.css`, each with a light and a dark value. Components never use raw Tailwind palette classes such as `bg-slate-100` or `text-white`.

| Group | Tokens | Used for |
| --- | --- | --- |
| Base | `background`, `surface`, `subtle`, `foreground`, `muted`, `line`, `overlay` | Page, cards, hover and progress tracks, text, borders, drawer backdrop |
| Brand | `brand`, `brand-hover`, `brand-soft`, `brand-fg` | Links and buttons, active nav, avatar. `brand-fg` is the text colour on a brand background. |
| Tones | `neutral`, `info`, `review`, `success`, `warning`, `caution`, `danger` | Status and severity. Each tone has a solid colour (bars, accents), `-soft` (badge background) and `-fg` (badge text). |

How the tones are assigned:

| | neutral | info | review | success | warning | caution | danger |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Audit status | Planned | In Progress | In Review | Completed | | | |
| Severity | Low | | | | Medium | High | Critical |
| Other | Open finding | | | Resolved finding, 100% progress | Environment badge | | High-risk stat card |

These mappings live in `statusTone`, `severityTone` and `toneStyles` in `lib/utils.ts`. To colour a new kind of value, map it to a tone; don't add new colours.

Every text/background pair meets WCAG AA (at least 4.5:1) in both light and dark mode. A new token pair must as well.

- Dark mode follows the operating system (`prefers-color-scheme`). There is no manual toggle.
- The shared classes are `.card` and `.input`.
- Use `cn()` to combine classes and `formatDate()` to format dates (en-IN locale).

## Configuration

See [environments.md](environments.md). Code reads configuration only through `src/lib/env.ts`.

## Testing

Tests use Vitest with jsdom and Testing Library, and the jest-dom matchers are loaded in `vitest.setup.ts`. A test file sits next to the file it tests and is named `*.test.ts(x)` under `src/`. The `@/` import alias works in tests.
