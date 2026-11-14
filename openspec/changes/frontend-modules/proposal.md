# Proposal

## Why
Currently, the NEXO 2031 commercial intelligence platform documentation defines a complete specification for retail store intelligence, but no front-end code exists in the repository. Starting from scratch to build the front-end modules establishes a clean, modern, and accessible web interface based on React, TypeScript, and TanStack Query, enabling users to authenticate, inspect store KPIs, view synthetic heatmaps, manage recommendations, track experiments, and analyze comparative reports while adhering strictly to the contract-first OpenAPI specification.

## What Changes
- Initialize the front-end application in `/frontend` from scratch using React, TypeScript, Vite, React Router, and TanStack Query.
- Build the core front-end shell and foundational infrastructure (layout, responsive navigation, topbar with active store context, DEMO badges, and typed API client).
- Implement the front-end modules corresponding to M00 through M08 and screens TELA001 to TELA011:
  - **M00**: Setup project structure, tooling (Vite, TypeScript, Tailwind CSS), typed API client with Vite `/api/v1` proxy, mock fixtures support, and connection health page.
  - **M01 (TELA001, TELA002)**: Login screen, in-memory JWT session storage, store selection screen, role-based route guard (`ADMIN` vs `LOJISTA`), and 403 access denied view.
  - **M02 (TELA003)**: Main dashboard with retail KPI cards (visitors, interactions, sales, conversion, revenue), date range filters, Recharts daily trends, and empty/loading/error states.
  - **M03 (TELA004, TELA005)**: Demonstration monitoring view with camera placeholders and interactive 10x8 store heat map with cell intensity coloring and zone filters.
  - **M04 (TELA006)**: Explainable commercial recommendations feed with hypothesis details, evidence display, priority filtering, and accept/dismiss workflows.
  - **M05 (TELA007, TELA008)**: Action testing and experiments tracking, including experiment creation wizard from accepted recommendations, status lifecycle transitions, and observational before/after metrics.
  - **M06 (TELA009)**: Period comparative reports comparing equivalent historical timeframes with percentage and percentage-point deltas, and client-side aggregated CSV export.
  - **M07 (TELA010, TELA011)**: Three-store cooperative circuit management with admin creation and lojista aggregated completion metrics.
  - **M08**: Front-end hardening, comprehensive Vitest + React Testing Library suites, keyboard accessibility, ARIA compliance, and Dockerfile containerization.

## Capabilities

### New Capabilities
- `frontend-shell`: Core front-end infrastructure, layout shell (sidebar, header, store switcher), typed API client with proxy, theme/design tokens, and system health status screen.
- `store-auth`: User authentication, in-memory JWT management, store selection screen, session clearing on 401, and permission-based route guards.
- `store-dashboard`: Executive analytics dashboard displaying aggregated retail metrics (visitors, interactions, sales, conversion, revenue), period filtering, and Recharts trends.
- `store-monitoring`: Demo camera monitoring placeholders and interactive 10x8 store heat map with zone overlays and explicit simulation disclaimers.
- `store-recommendations`: Rule-based commercial recommendations interface with evidence display, status filters, and accept/dismiss workflows.
- `store-experiments`: Growth experiment tracker allowing creation from accepted recommendations, lifecycle transitions (DRAFT -> RUNNING -> COMPLETED/CANCELLED), and before-and-after metric comparisons.
- `store-reports`: Comparative period analysis reports comparing equivalent historical timeframes with percentage and percentage-point deltas.
- `store-circuits`: Cooperative three-store circuit campaign management with admin setup and aggregated progress visualization.

### Modified Capabilities
<!-- None: Greenfield front-end implementation with no existing specs in the project -->

## Impact
- **Affected code**: Creates `/frontend` directory with all front-end source code, configurations, test suites, and mock fixtures.
- **APIs**: Consumes OpenAPI 3.0 specification (`sistema/openapi.yaml`), matching `operationId`, paths, query parameters, snake_case DTO schemas, and standard error handling.
- **Dependencies**: React 18+, TypeScript, Vite, React Router DOM 6+, TanStack Query 5+, Recharts, Tailwind CSS / Lucide icons, Vitest, React Testing Library.
- **Compatibility**: Standalone development via Vite dev server and proxy, or orchestratable via Docker Compose alongside backend and PostgreSQL services.
