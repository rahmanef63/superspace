# Migration Guide – Dynamic Dashboard & 2025-10 Refactors

Context
-------
The dashboard supports dynamic routing via menu-driven manifests while the feature set continues to expand (documents, WhatsApp-style collaboration, etc.). This guide consolidates the previously scattered notes and the refactors completed on 2025-10-02 so new workstreams can align quickly.

1. Dashboard manifest ↔ menu alignment
--------------------------------------
- Every workspace menu item resolves a page via the `componentId` stored in `menuItems.component`.
- The App Router catch-all (`app/dashboard/[[...slug]]/page.tsx`) first checks for a workspace menu entry; it then falls back to the default manifest (`frontend/shared/pages/manifest.ts`) if no explicit mapping exists.
- Built-in pages remain accessible even when a workspace overrides the menu tree, which prevents accidental lock-outs.

Recommended data hygiene:
- Ensure each menu item has `component` set to one of the manifest ids (`dashboard`, `chat`, `documents`, etc.).
- Backfill legacy data with a one-off Convex mutation (see previous git history for examples) or a SQL script if you manage data externally.
- When introducing a new page:
  1. Implement the React component inside `frontend/features/<domain>`.
  2. Register it inside the manifest with a stable `componentId`.
  3. Link a menu item to that `componentId`.

2. Front-end refactor highlights (Oct 2025)
------------------------------------------
- **Shared Row Actions**  
  The new `frontend/shared/layout/view/RowActions.tsx` centralises rendering for row-level buttons. `TableView`, `CardView`, and `DetailListView` now delegate to it, fixing styling drift and reducing repeated logic. Use these primitives instead of hand-coding action bars in feature views.

- **Documents workspace shell**  
  `frontend/features/documents/views/page-management.tsx` was tidied up (no stray Tailwind tokens) to ensure the split-view layout behaves consistently across themes.

- **WhatsApp Calls experience**  
  Calls data now lives in `frontend/features/wa/components/calls/mockData.ts` and feeds both the list and detail view. `CallsView` handles mobile vs desktop transitions, and the navigation top bar surfaces real contact data (when available) via the updated `TopBar` props.

- **Navigation TopBar**  
  `TopBar`, `TopBarHeader`, and `TopBarActions` accept an optional `contact` object. The contact modal only appears when the caller provides metadata, removing the brittle mock wiring.

- **Linting foundation**  
  Project ships with `.eslintrc.json` (`extends: ["next/core-web-vitals","next/typescript"]`). Install the dev dependency once (`pnpm install eslint@^8.57.0`) to enable `pnpm lint`. This prevents the Next CLI from prompting for interactive setup.

3. Migration checklist for new contributors
-------------------------------------------
1. Run `pnpm install` (to pick up `eslint`) and `pnpm lint` before committing.
2. Build dashboards by composing the shared view primitives (`ViewSwitcher`, `RowActions`, etc.) instead of cloning markup from feature modules.
3. When enhancing WhatsApp features, centralise any mock or fixture data inside `frontend/features/wa/components/<area>/mockData.ts`. Swap in Convex queries by replacing the selector used by the view components.
4. Keep documentation in `doc/` in sync with feature changes—ASCII only, with a `Last updated:` header.

