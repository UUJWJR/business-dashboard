# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` — Start the Vite dev server on port 5173 with auto-open.
- `npm run build` — Type-check with `tsc` and build for production to `dist/`.
- `npm run preview` — Preview the production build locally.

There is no test runner or linter configured in this project.

## Tech Stack

- React 18 + TypeScript + Vite
- Tailwind CSS (dark mode via `class` strategy)
- ECharts via `echarts-for-react` for data visualization
- Framer Motion for animations
- Lucide React for icons
- SheetJS (`xlsx`) for Excel export
- Path alias `@/*` maps to `src/*`

## Architecture

This is a multi-module dashboard SPA with a Chinese-language UI. All data is client-side mock data — there are no API calls.

### Routing

The app uses `react-router-dom` with nested routes. Top-level routes map to business modules (e.g. `/sales-revenue`, `/broadband`). Each module redirects its root path to `/overview` and exposes sub-routes:

- `/sales-revenue` → overview, by-region, by-product, by-channel
- `/customer-acquisition` → overview, profile, channel, churn
- `/broadband` → overview, speed, coverage, competitor
- `/smart-home` → overview, ranking, binding, feedback
- `/rights-products` → overview, ranking, profile, revenue
- `/home-networking` → overview, solution, coverage, workorder

### Data Flow

- `useModuleData<T>(moduleId, timeRange)` (`src/hooks/useModuleData.ts`) fetches mock data for a given module and time range.
- Mock generators live in `src/utils/dataGenerator.ts`.
- Time range is persisted in the URL query string (`?range=30d`). Valid values: `7d`, `30d`, `90d`, `year`.

### Authentication

- Auth state is stored in `localStorage` under the key `dashboard-auth`.
- `useAuth` hook (`src/hooks/useAuth.ts`) provides login/logout helpers.
- The `Navbar` renders a user avatar dropdown with a logout action that clears auth and redirects to `/login`.

### Component Patterns

- **ModuleLayout** (`src/components/layout/ModuleLayout.tsx`) wraps every module page. It renders a title bar (with an optional `actions` slot) and the page content.
- **SubIconNav** (`src/components/common/SubIconNav.tsx`) renders the icon-based sub-navigation inside each module.
- **TimeRangeSelector** (`src/components/common/TimeRangeSelector.tsx`) lets users switch the global time range.
- **ExportButton** (`src/components/common/ExportButton.tsx`) triggers Excel export. Each module page builds its own `handleExport` callback and passes it via `ModuleLayout`'s `actions` prop.
- **ChartCard** (`src/components/charts/ChartCard.tsx`) is a wrapper used by all chart components. It provides a title bar with refresh and PNG export buttons. Charts pass a `chartRef` to enable the export feature, which calls `getEchartsInstance().getDataURL()`.
- **KPICard** (`src/components/kpi/KPICard.tsx`) renders metric cards with animated number transitions via `src/utils/numberAnimation.ts`. It maps `icon` and `color` strings from `KPIData` to Lucide components and Tailwind color classes using local lookup objects (`iconMap`, `colorMap`).

The dashboard layout uses a fixed `Navbar` and `Sidebar` with a `main` content area offset by `pt-16 pl-56`.

### Excel Export

- `src/utils/excelExport.ts` provides typed conversion helpers (`kpiToSheet`, `trendToSheet`, `distributionToSheet`, `regionToSheet`, etc.) and `exportToExcel(filename, sheets)` which generates a multi-sheet `.xlsx` file with auto-sized columns.
- All 6 business modules expose an export button that downloads module-specific data.

### Tailwind Customization

`tailwind.config.js` extends the theme with custom color scales (`primary`, `success`, `warning`, `danger`, `info`), shadow tokens (`shadow-card`, `shadow-card-hover`, etc.), and a `rounded-card` utility. Dark-mode-aware card styles typically pair `bg-white dark:bg-gray-800`, `border-gray-100 dark:border-gray-700`, and `shadow-card dark:shadow-card-dark`.
