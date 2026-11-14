# Tasks

## 1. Frontend Workspace & Core Shell (M00)

- [x] 1.1 Initialize the `/frontend` workspace with Vite, React 18+, TypeScript, and Tailwind CSS, and verify that `npm run build` succeeds cleanly.
- [x] 1.2 Implement core UI primitives (Button, Card, Input, Badge, Modal, Skeleton) and verify basic component render tests with Vitest.
- [x] 1.3 Create the persistent application layout shell (collapsible sidebar navigation, topbar with active store context, and DEMO warning badge) and verify responsiveness.
- [x] 1.4 Implement the typed API client with Vite proxy routing `/api/v1` to `http://backend:8000` and `GET /health` connectivity monitor, verifying connection status display.

## 2. Authentication & Store Selection (M01 - TELA001, TELA002)

- [x] 2.1 Implement `AuthContext` with in-memory session token storage, auto-logout on 401 responses, and verify that tokens are never written to `localStorage`.
- [x] 2.2 Build the Login view (TELA001) with email/password validation, password reveal toggle, demo credential helpers, and verify login submission with unit tests.
- [x] 2.3 Build the Store Selection view (TELA002) listing stores with segment and DEMO tags, and verify active store selection sets global store context.
- [x] 2.4 Implement role-based route guards (`ADMIN` vs `LOJISTA`) and the 403 Forbidden view, verifying that unauthorized store navigation displays the 403 screen.

## 3. Executive Dashboard & Metrics (M02 - TELA003)

- [x] 3.1 Implement the retail KPI cards (visitors, interactions, sales, conversion, revenue) and verify that zero visitors outputs an em dash (`—`) rather than `NaN` or `Infinity`.
- [x] 3.2 Implement the period date range picker with validation (`start_date <= end_date`) and verify that applying a date range triggers TanStack Query cache updates.
- [x] 3.3 Build the daily trend visualization with Recharts and an accompanying accessible summary data table, verifying rendering with mock fixtures.
- [x] 3.4 Implement empty, loading skeleton, and error retry states for the dashboard, verifying state transitions with component tests.

## 4. Demo Monitoring & Store Heat Map (M03 - TELA004, TELA005)

- [x] 4.1 Build the simulated camera monitoring screen (TELA004) with illustrative placeholders, synthetic counters, refresh trigger, and explicit DEMO disclaimers, verifying no video/webcam access occurs.
- [x] 4.2 Build the interactive 10x8 store heat map grid (TELA005) with cell intensity coloring, zone overlay badges, and accessible intensity level legends (Low/Medium/High).
- [x] 4.3 Implement date selector and empty state fallback for the heat map, verifying that dates with no data render the schematic store perimeter with explanatory guidance.

## 5. Commercial Recommendations (M04 - TELA006)

- [x] 5.1 Implement the recommendation card list (TELA006) displaying priority badges, strategic hypotheses, supporting metric evidence, and rule-based demo origin tags.
- [x] 5.2 Implement status filtering (`ALL`, `PROPOSED`, `ACCEPTED`, `DISMISSED`) and verify that filtering updates the visible card list.
- [x] 5.3 Implement the Accept and Dismiss actions with optimistic cache updates and HTTP 409 conflict error handling, verifying auto-refresh on conflict with unit tests.

## 6. Action Testing & Experiments (M05 - TELA007, TELA008)

- [x] 6.1 Build the experiment listing and creation wizard (TELA007) allowing selection of accepted recommendations, target metrics, and date ranges with validation.
- [x] 6.2 Build the experiment detail view (TELA008) featuring the lifecycle status timeline (`DRAFT`, `RUNNING`, `COMPLETED`, `CANCELLED`) and status transition controls.
- [x] 6.3 Implement the before/after observational outcome comparison card with the non-causal methodology disclaimer, verifying display when outcome data is available and fallback when missing.

## 7. Comparative Period Reports (M06 - TELA009)

- [x] 7.1 Implement the comparative period reporting screen (TELA009) with date pickers automatically calculating equal-length baseline comparison intervals.
- [x] 7.2 Implement metric comparison cards displaying current values, baseline values, percentage change, and conversion rate percentage-point (p.p.) deltas.
- [x] 7.3 Implement client-side aggregated CSV export, verifying that clicking export downloads a CSV containing the active aggregated report metrics.

## 8. Multi-Store Cooperative Circuits (M07 - TELA010, TELA011)

- [x] 8.1 Implement the circuit listing view (TELA010) showing campaigns to participating lojistas and the New Circuit button only to administrators.
- [x] 8.2 Build the administrator circuit creation form with validation requiring exactly three distinct participating stores, verifying rejection of invalid counts.
- [x] 8.3 Implement the circuit detail view (TELA011) displaying the 3-store illustrative sequence, synthetic completion stats, and administrative status lifecycle actions.

## 9. Quality Hardening, Accessibility & Containerization (M08)

- [x] 9.1 Audit and remediate keyboard navigation (Tab/Shift+Tab focus traversal) and ARIA attributes across all forms, dialogs, and navigation elements.
- [x] 9.2 Execute full Vitest + React Testing Library suite across all features and verify 100% test pass rate.
- [x] 9.3 Create a production multi-stage `frontend/Dockerfile` and nginx configuration, verifying successful container image build and execution.
