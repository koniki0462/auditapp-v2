# Architecture

## Overview

AuditApp is front-end only. Next.js renders the pages from mock data at build time, so every route is prerendered as a static page (the `/audits/[id]` pages via `generateStaticParams`).

```
app/layout.tsx  ──►  AppShell (client: sidebar / mobile drawer, env badge)
      │
      └── app/<route>/page.tsx  (server components)
              │  read data directly
              ▼
          lib/data.ts  (mock audits + findings, types, lookup helpers)
              │  pass data as props
              ▼
          components/AuditList, FindingList, ...  (client where interactive)
```

## Data

`src/lib/data.ts` is the only data source. It holds:

- the types `Audit`, `Finding`, `AuditStatus` and `Severity`
- in-memory `audits` and `findings` arrays
- the lookup helpers `getAudit(id)` and `getFindingsForAudit(auditId)`

Pages call these functions directly. When a backend is added, change the data access here, for example to `fetch` from `env.apiBaseUrl`. The pages and components can stay as they are.

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

- Theme colours are CSS variables in `app/globals.css`, exposed to Tailwind as `background`, `foreground`, `surface`, `muted`, `line` and `brand`. Use these colour names instead of raw Tailwind palette colours.
- Dark mode follows the operating system (`prefers-color-scheme`). There is no manual toggle.
- The shared classes are `.card` and `.input`.
- Badge colours come from `statusStyles` and `severityStyles` in `lib/utils.ts`. Use `cn()` to combine classes and `formatDate()` to format dates (en-IN locale).

## Configuration

See [environments.md](environments.md). Code reads configuration only through `src/lib/env.ts`.

## Testing

Tests use Vitest with jsdom and Testing Library, and the jest-dom matchers are loaded in `vitest.setup.ts`. A test file sits next to the file it tests and is named `*.test.ts(x)` under `src/`. The `@/` import alias works in tests.
