# Design

## Context

See `proposal.md` for overall motivation.

The NEXO 2031 commercial intelligence platform is specified in `sistema/` with an OpenAPI 3.0 contract (`sistema/openapi.yaml`) covering authentication, stores, daily metrics, cameras/heatmaps, recommendations, experiments, reports, and circuits. The front-end application will be built from scratch in `/frontend` as a modern Single Page Application (SPA) designed to communicate with the FastAPI backend over HTTP JSON (`/api/v1`) or run in mock mode during independent development.

## Goals / Non-Goals

**Goals:**
- Provide a clean, modular, and maintainable front-end codebase organized by feature slices (`src/features/*`).
- Strictly conform to the OpenAPI 3.0 contract: matching paths, query parameters, `operationId` mappings, `snake_case` DTO bodies, and `ApiError` shapes.
- Implement in-memory JWT session management and role-based route guards (`ADMIN` and `LOJISTA`).
- Enable standalone front-end development through typed mock fixtures corresponding to contract examples.
- Deliver accessible, high-contrast data visualizations using Recharts paired with accessible textual summaries.
- Maintain full transparency on demonstration/simulated data across all screens via explicit `DEMO` badges and informative tooltips.

**Non-Goals:**
- Backend code implementation or database migrations (governed under separate backend/OpenAPI checkpoints).
- Persistent token storage in `localStorage` or `sessionStorage` (strictly forbidden by architectural decision to ensure clean demo resets).
- Real-time video streaming, WebSockets, or webcam access (all camera metrics and snapshots are strictly synthetic placeholders).
- Biometric, emotional, or individual consumer tracking UI.

## Decisions

### 1. Project Organization & Feature-Sliced Architecture
- **Decision:** Structure the `/frontend/src` directory by feature domain:
  ```text
  frontend/
  ├── src/
  │   ├── app/                 # Router, global providers, error boundaries
  │   ├── components/          # Shared layout, UI primitives, chart wrappers
  │   ├── features/            # Feature modules
  │   │   ├── auth/            # Login, session, auth state
  │   │   ├── stores/          # Store selection and switcher
  │   │   ├── dashboard/       # KPIs, daily metrics charts
  │   │   ├── monitoring/      # Demo camera snapshots
  │   │   ├── heatmap/         # 10x8 schematic grid map
  │   │   ├── recommendations/ # Rule-based recommendation cards
  │   │   ├── experiments/     # Action testing timeline and comparisons
  │   │   ├── reports/         # Comparative period metrics and CSV export
  │   │   └── circuits/        # Cooperative 3-store campaigns
  │   ├── lib/                 # Typed API client, error handling, formatters
  │   └── main.tsx
  ```
- **Rationale:** Feature folders isolate UI components, hooks, queries, and fixtures, allowing independent module delivery (M00 through M08) and testability.
- **Alternatives Considered:** Flat `pages/` and `components/` structure (rejected due to cross-module coupling and difficult test colocations).

### 2. State Management & Server Synchronization
- **Decision:** Use **TanStack Query (React Query v5)** for server state and caching, combined with lightweight **React Context** for client-only session state (in-memory JWT and current active store).
- **Rationale:** TanStack Query handles caching, background revalidation, loading/error states, and key-based cache invalidation (e.g. `['metrics', storeId, periodStart, periodEnd]`). React Context is ideal for auth session state without unnecessary third-party runtime weight.
- **Alternatives Considered:** Redux Toolkit or Zustand for server state (rejected as unnecessary boilerplate when TanStack Query already specializes in server-driven caching).

### 3. HTTP Client & OpenAPI Typing
- **Decision:** Build a lightweight, typed API client using native `fetch` configured with a base URL, request interceptors (injecting `Authorization: Bearer <token>`), and error interceptors normalizing backend `ApiError` payloads.
- **Rationale:** Zero external library footprint for HTTP, full TypeScript typing mapped directly to OpenAPI schemas, and seamless integration with the Vite dev server proxy (`/api` -> `http://backend:8000`).
- **Alternatives Considered:** Axios (adds extra dependency without significant benefit over modern `fetch`).

### 4. Charting & Accessible Visualization
- **Decision:** Utilize **Recharts** for rendering time-series visitor/sales trends, accompanied by structured semantic HTML summary tables and ARIA tags for non-visual or keyboard navigation.
- **Rationale:** Recharts provides clean declarative SVG rendering, responsive containers, and good integration with React state. Pairing each chart with an accessible textual summary satisfies WCAG accessibility criteria.
- **Alternatives Considered:** Chart.js (requires imperative canvas wrapping) or D3 (excessive low-level complexity for standard line/bar charts).

### 5. UI Primitives & Styling
- **Decision:** Use **Tailwind CSS** with utility-first styling and a dedicated design token palette for primary, surface, accent, warning (DEMO), and status indicators.
- **Rationale:** Rapid UI construction, zero runtime CSS overhead, accessible contrast ratios, and easy responsiveness across desktop and tablet views.

### 6. Testing & Development Isolation
- **Decision:** Use **Vitest** + **React Testing Library** for fast unit and component tests, coupled with modular JSON/TS fixtures in `__fixtures__/` based on OpenAPI examples.
- **Rationale:** Enables full front-end development and automated test verification even when the backend service is not running.

## Risks / Trade-offs

- **[Risk] Session cleared on page refresh:**
  - *Trade-off:* Storing JWT in memory requires re-authenticating after hard refresh.
  - *Mitigation:* Documented architectural decision for MVP demo security; UI includes quick-fill demo credentials on the login screen for developer/reviewer convenience.
- **[Risk] Schema drift between front-end types and backend responses:**
  - *Trade-off:* Manual TypeScript interfaces may drift if OpenAPI changes.
  - *Mitigation:* Strict contract review process; types and fixtures correspond directly to `sistema/openapi.yaml`.
- **[Risk] Race conditions and concurrent state edits in recommendations and experiments:**
  - *Trade-off:* User actions may trigger 409 Conflict if status transitions are stale.
  - *Mitigation:* Error handling detects 409, displays clear feedback, and automatically triggers query refetching to sync UI state.
