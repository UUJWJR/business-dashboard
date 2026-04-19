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
- Path alias `@/*` maps to `src/*`

## Architecture

This is a single-page dashboard application (`src/pages/Dashboard.tsx`) with a Chinese-language UI. All data is client-side mock data — there are no API calls. The `useDashboardData` hook (`src/hooks/useDashboardData.ts`) orchestrates data by calling generators in `src/utils/dataGenerator.ts` and simulates real-time updates via a `setInterval` that mutates KPI values every 8 seconds. Data refreshes are also triggered when the time range changes.

The `useTheme` hook manages dark/light mode by toggling the `dark` class on `document.documentElement` and persists the choice to `localStorage` under the key `dashboard-theme`. Chart components receive an `isDark` boolean prop and manually compute ECharts color values (text, axis, grid, tooltip backgrounds) based on this flag.

### Component Patterns

- **ChartCard** (`src/components/charts/ChartCard.tsx`) is a wrapper used by all chart components. It provides a title bar with refresh and PNG export buttons. Charts pass a `chartRef` to enable the export feature, which calls `getEchartsInstance().getDataURL()`.
- **KPICard** (`src/components/kpi/KPICard.tsx`) renders metric cards with animated number transitions via `src/utils/numberAnimation.ts`. It maps `icon` and `color` strings from `KPIData` to Lucide components and Tailwind color classes using local lookup objects (`iconMap`, `colorMap`).
- The dashboard layout uses a fixed `Navbar` and `Sidebar` with a `main` content area offset by `pt-16 pl-56`.

### Tailwind Customization

`tailwind.config.js` extends the theme with custom color scales (`primary`, `success`, `warning`, `danger`, `info`), shadow tokens (`shadow-card`, `shadow-card-hover`, etc.), and a `rounded-card` utility. Dark-mode-aware card styles typically pair `bg-white dark:bg-gray-800`, `border-gray-100 dark:border-gray-700`, and `shadow-card dark:shadow-card-dark`.
