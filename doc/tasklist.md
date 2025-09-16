# Task List — Dynamic Endpoint ↔ Component Mapping

> Base on `doc/migration.md`. Each task lists the file/folder path affected.

## Phase 0 — Read & Plan

- [ ] Read `doc/migration.md` to understand goals and fallbacks
- [ ] Confirm you can sign in and have at least one workspace

## Phase 1 — Code Alignment (manifest + routing)

- [x] Add `componentId` to manifest entries and registry
  - File: `frontend/shared/pages/manifest.tsx`
- [x] Resolve component via `menuItems.getMenuItemBySlug` → `componentId`
  - File: `frontend/shared/pages/manifest.tsx`
- [x] Relax access check so built‑ins still render even with menus
  - File: `app/dashboard/[[...slug]]/page.tsx`
- [x] Sidebar: prefer fallback by `componentId` (then slug)
  - File: `app/dashboard/_components/app-sidebar.tsx`

## Phase 2 — Seed/Data Alignment (component names)

Align all Convex menu seed/component names to manifest `componentId`s:

- [ ] Default menu manifest (seed data)
  - File: `convex/lib/menu_manifest_data.ts`
  - Ensure these mappings:
    - `dashboard` → `component: "OverviewPage"`
    - `chat` → `component: "ChatPage"`
    - `message` (optional alias) → `component: "ChatPage"`
    - `members` → `component: "MembersPage"`
    - `friends` → `component: "FriendsPage"`
    - `documents` → `component: "DocumentsPage"`
    - `canvas` → `component: "CanvasPage"`
    - `menus` → `component: "MenusPage"`
    - `invitations` → `component: "InvitationsPage"`
    - `user-settings` → `component: "ProfilePage"`
    - `settings` → `component: "WorkspacesPage"`
- [ ] Feature installer (optional plugin menus)
  - File: `convex/menuItems.ts`
  - Section: `installFeatureMenus` available features
  - Update `component` fields to match manifest `componentId`s:
    - Use `ChatPage`, `DocumentsPage`, `CanvasPage`, `MembersPage`, `FriendsPage`, `MenusPage`, `InvitationsPage`
- [ ] Available features metadata
  - File: `convex/menuItems.ts`
  - Section: `getAvailableFeatureMenus` (metadata only) — keep names/versions, no change required, but ensure slugs listed have matching entries in seeds/installer.

## Phase 3 — Existing Data Backfill

- [ ] Backfill `menuItems.component` for existing rows (per workspace)
  - Option A: Temporary Convex mutation (example in `doc/migration.md`)
    - New file (temporary): `convex/migrations.backfillMenuComponents.ts`
    - Run via Console/CLI once per workspace, then delete
  - Option B: Admin UI or script using `convex/react` client
- [ ] Re-run feature installer for existing workspaces (optional)
  - File: `convex/menuItems.ts` → `installFeatureMenus`
  - Call with `forceUpdate: true` to update component names and versions

## Phase 4 — Navigation Constants Review

- [ ] Review static navigation list used for breadcrumbs/slug validation
  - File: `frontend/shared/pages/static/workspaces/constants/navigation.ts`
  - Options:
    - Keep `key: "message"` if you intend to serve `/dashboard/message` and ensure a `menuItems` row exists mapping `component: "ChatPage"`
    - Or remove `"message"` to avoid breadcrumb/slug validation for a page not backed by manifest

## Phase 5 — Verification

- [ ] Start app and sign in
- [ ] Ensure at least one workspace exists
- [ ] Verify built‑in pages render:
  - Paths: `/dashboard`, `/dashboard/chat`, `/dashboard/members`, `/dashboard/friends`, `/dashboard/documents`, `/dashboard/canvas`, `/dashboard/menus`, `/dashboard/invitations`, `/dashboard/user-settings`, `/dashboard/settings`
- [ ] Verify dynamic alias (if configured):
  - Path: `/dashboard/message` renders Chat via `component: "ChatPage"`
- [ ] Confirm sidebar labels/icons and ordering reflect DB menu items
- [ ] Confirm role gating via `visibleForRoleIds` still hides menu items as expected

## Phase 6 — Rollback/Notes

- [ ] If needed, remove `component` values from `menuItems` to return to slug→manifest fallback
- [ ] Keep `doc/migration.md` as reference for future component additions and aliases

## Reference Files

- Manifest & renderer: `frontend/shared/pages/manifest.tsx`
- Dashboard catch‑all: `app/dashboard/[[...slug]]/page.tsx`
- Sidebar: `app/dashboard/_components/app-sidebar.tsx`
- Convex menu API: `convex/menu/menuItems.ts`
- Default menu seed: `convex/lib/menu_manifest_data.ts`
- ER model (north‑star): `doc/Entity-Relationship.txt`
- Migration doc: `doc/migration.md`

## Phase 7 — Advanced Menu Sets & Components (optional, additive)

- [x] Add schema tables for sets, assignments, components, versions, aliases, bindings, activity
  - File: `convex/schema.ts`
- [x] Add organized modules under domain folders
  - Workspace menu sets: `convex/menu/sets.ts`
  - Menu item bindings to component versions: `convex/menu/itemComponents.ts`
  - Component registry & versions: `convex/components/registry.ts`
  - Activity events: `convex/activity.ts`
- [ ] Wire optional UI for managing menu sets and bindings (future)
  - Suggested: `frontend/shared/layout/menus/...`
  - Suggested: `frontend/shared/components/registry/...`
