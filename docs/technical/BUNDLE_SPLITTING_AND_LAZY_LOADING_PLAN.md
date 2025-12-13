# Bundle Splitting & Lazy Loading Plan (Pareto Layer 2)

**Date:** December 12, 2025  
**Status:** ✅ Complete  
**Prerequisite:** Foundation hardening completed.

## Why This Matters

The dependency graph is intentionally rich (editors, charts, flow tools), but:

- Large initial bundles slow first‑load and dashboard navigation.
- Heavy client libs are not needed on most routes.

Strategic splitting yields big wins without rewriting features.

## Current Risk Areas

Heavy libraries in `package.json` likely impacting JS size:

- Editors: `@blocknote/*`, `@tiptap/*`, `katex`, `shiki`
- Graph/flow: `reactflow`, `@xyflow/react`, `@dagrejs/dagre`
- Animations: `framer-motion`, `motion`, `react-bits`
- Charts: `recharts`

## Goals

1. Keep initial dashboard bundle lean.
2. Load heavy libs only when their feature route mounts.
3. Preserve SSR where possible.

## Progress (Dec 12, 2025)

### Baseline (route stats)

From `pnpm build` (saved in `build-baseline.log`):

- `/dashboard/[[...slug]]` First Load JS: **1.34 MB**

### Change applied

- Switched dashboard entrypoint imports from the heavy facade modules to leaf imports:
  - `app/dashboard/[[...slug]]/page.tsx`

### Result

From `pnpm build` (saved in `build-after-import-splitting.log`):

- `/dashboard/[[...slug]]` First Load JS: **379 kB**

### Additional win: Workspace Store preview lazy-load

From `pnpm build`:

- Baseline (`build-baseline.log`): `/dashboard/workspace-store` First Load JS **1.66 MB**
- After lazy-load (`build-after-preview-lazy.log`): `/dashboard/workspace-store` First Load JS **483 kB**

Change applied:

- Removed eager `all-previews` auto-registration from `@/frontend/shared/preview` public API.
- Added `loadAllFeaturePreviews()` and load previews on-demand in:
  - `frontend/features/workspace-store/WorkspaceStorePage.tsx`
  - `frontend/features/menu-store/MenuStorePage.tsx`

### Additional win: Mock dashboard preview lazy-load

From `pnpm build` (saved in `build-after-mock-dashboard-preview-lazy.log`):

- `/mock-dashboard/[[...slug]]` First Load JS: **159 kB**

Change applied:

- Removed direct `all-previews` import from the demo wrapper and load previews lazily via `loadAllFeaturePreviews()`:
  - `app/(landing)/mock-dashboard/[[...slug]]/GuestContentWrapper.tsx`

### Notes

- Feature page components are already lazy-loaded via the manifest in `frontend/shared/foundation/manifest/registry.tsx`.
- Biggest risk area: importing `@/frontend/shared/ui` or `@/frontend/shared/foundation` facades from entrypoints can pull heavy exports into the same chunk; prefer leaf imports.
- Resolved: `.eslintrc.json` now allows leaf imports; we still block importing from `@/frontend/shared` root directly.

## Plan of Work

### Step 1: Measure Baseline

- Run `next build` with analyzer (locally):
  - Add `ANALYZE=true pnpm build` using `@next/bundle-analyzer` or Next built‑in stats.
- Record:
  - initial JS for `/dashboard/[[...slug]]` (catch-all route)
  - JS for `/dashboard/database/*`
  - JS for `/dashboard/documents/*`

### Step 2: Identify Feature‑Scoped Heavy Imports

Create a table:

| Feature | Heavy deps | Current entry points |
|--------|------------|----------------------|
| documents | blocknote/tiptap/katex/shiki | `frontend/features/documents/view/*` |
| builder / flow | reactflow/xyflow/dagre | `frontend/features/builder/*` |
| analytics | recharts | `frontend/features/analytics/*` |

### Step 3: Add Dynamic Imports

Patterns:

1. **Client‑only heavy widgets**
   ```ts
   const FlowCanvas = dynamic(() => import("./FlowCanvas"), { ssr: false });
   ```

2. **SSR‑safe but heavy**
   ```ts
   const Chart = dynamic(() => import("./Chart"), { loading: () => <ChartSkeleton /> });
   ```

3. **Editor modules**
   - Split editor toolbar/plugins into separate dynamic chunks.

### Step 4: Route‑Level Boundaries

- Ensure each feature route (`app/dashboard/*`) is a natural split.
- Move non‑critical subpanels behind Suspense/dynamic boundaries.

### Step 5: Reduce Cross‑Feature Imports

- Prevent shared UI from importing heavy feature libs.
- Enforce rule: `frontend/shared/**` must stay dependency‑light.

### Step 6: Add Performance Budgets

- Add CI step that fails if:
  - initial dashboard JS exceeds a defined budget (set after baseline).
  - any single chunk exceeds a defined size (e.g., 500kb gzip).

Done:
- Added `scripts/validation/next-build-budgets.ts` and CI workflow `.github/workflows/next-build-budgets.yml`.
- Current budgets (First Load JS):
  - `/dashboard/[[...slug]]` ≤ 450 kB
  - `/dashboard/workspace` ≤ 500 kB
  - `/dashboard/workspace-store` ≤ 550 kB
  - `/mock-dashboard/[[...slug]]` ≤ 250 kB

## Acceptance Criteria

- Initial dashboard JS reduced measurably vs baseline.
- Heavy libs only appear in feature‑specific chunks.
- No regression in TTI or hydration errors.

## Estimated Effort

- Baseline + audit: 1 hour.
- Dynamic imports across 3–5 features: 3–5 hours.
- CI budgets: 1–2 hours.
