# AuditApp

Responsive audit management front end built with **Next.js 15 (App Router)**, **React 19**, **TypeScript** and **Tailwind CSS 4**. Unit tests run on **Vitest** (Vite-powered).

## Requirements

- Node.js 20.9+ (`.nvmrc` pins 22.12.0)

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server on http://localhost:3000 |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm test` | Run Vitest once |
| `npm run test:watch` | Vitest in watch mode |
| `npm run lint` | ESLint |

## Structure

```
src/
  app/                 Routes: / (dashboard), /audits, /audits/[id], /findings
  components/          AppShell (responsive sidebar/drawer), AuditList, FindingList, ...
  lib/                 Mock data and helpers
```

## Responsive behaviour

- **Phones (<640px):** off-canvas navigation drawer, single-column cards, 16px inputs (no iOS zoom).
- **Tablets (640–1023px):** two-column card grid, table view from 768px.
- **Desktop (1024px+):** fixed sidebar, full data table; extra columns appear on wider screens.
- Light and dark mode follow the device setting; `viewport-fit=cover` and `dvh` units handle notched devices and mobile browser bars.

## Note for Windows

Turbopack can fail on very long folder paths. The scripts use the default webpack bundler, which works fine; keep the project in a short path (e.g. `C:\dev\auditapp`) if you want to try `next dev --turbopack`.
