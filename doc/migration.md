# Migration Guide — Manifest Component Mapping and Dynamic Menu Endpoints

This document explains how to align data and code with the updated page manifest that supports many‑to‑many mapping between menu items (endpoints) and UI components (by `componentId`). The goal is to enable dynamic endpoints per workspace while keeping progress intact.

## Summary of Changes

- Manifest now defines each page with both a route `id` and a stable `componentId`.
- A menu item’s `slug` (path under `/dashboard/<slug>`) is decoupled from the component it renders by using `menuItems.component` (string) that must match a `componentId` from the manifest.
- The dashboard catch‑all resolves the component by looking up the menu item (workspace + slug) and then mapping its `component` to the manifest. If no menu item exists, it falls back to the built‑in manifest route by slug.
- Access check is relaxed: built‑in manifest pages continue to render even when menus are present but don’t contain that slug.

## Files Touched (already applied)

- `frontend/shared/pages/manifest.tsx`
  - Added `componentId` for each entry.
  - Exported `COMPONENT_REGISTRY_MAP` and `getComponentById`.
  - `AppContent` now resolves component via `api.menuItems.getMenuItemBySlug` → `component` → manifest.
- `app/dashboard/[[...slug]]/page.tsx`
  - Access check allows rendering built‑in manifest pages even if not present in workspace menus.
- `app/dashboard/_components/app-sidebar.tsx`
  - Menu→Nav mapping prefers manifest fallback by `componentId`; then by `slug`.

## Current Component IDs (manifest)

- `OverviewPage` (id: `dashboard`)
- `ChatPage` (id: `chat`)
- `MembersPage` (id: `members`)
- `FriendsPage` (id: `friends`)
- `DocumentsPage` (id: `documents`)
- `CanvasPage` (id: `canvas`)
- `MenusPage` (id: `menus`)
- `InvitationsPage` (id: `invitations`)
- `ProfilePage` (id: `user-settings`)
- `WorkspacesPage` (id: `settings`)

You can reuse any of these components under arbitrary slugs by setting `menuItems.component` to the desired `componentId`.

## Data Model Alignment (Convex)

Implemented `menuItems` fields (as used today):

- `workspaceId`: Id of workspace
- `name`: Display name
- `slug`: Endpoint under `/dashboard/<slug>`
- `type`: `route|folder|divider|action|chat|document`
- `icon`: Icon name (e.g., `MessageSquare`)
- `path`: Optional internal path
- `component`: Component identifier (must match a manifest `componentId`)
- `order`: Sort order
- `isVisible`: Visibility flag
- `visibleForRoleIds`: Role gating (array of role ids)
- `metadata`: Arbitrary object including `description`, etc.
- `parentId`: Optional for nested menus

Note: The ER doc includes broader concepts (menu sets, component versions, CMS, etc.). Those are planned/aspirational; the implemented subset above is what the app currently uses.

## Backfill: Set `component` on Existing Menu Items

For existing workspaces that have menu items without `component`, backfill using this mapping:

- `dashboard` → `OverviewPage`
- `chat` → `ChatPage`
- `members` → `MembersPage`
- `friends` → `FriendsPage`
- `documents` → `DocumentsPage`
- `canvas` → `CanvasPage`
- `menus` → `MenusPage`
- `invitations` → `InvitationsPage`
- `user-settings` → `ProfilePage`
- `settings` → `WorkspacesPage`
- Optional alias: `message` → `ChatPage`

Example Convex migration (temporary mutation you can run once):

\`\`\`ts
// convex/migrations.backfillMenuComponents.ts
import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const backfillMenuComponents = mutation({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const map: Record<string, string> = {
      dashboard: "OverviewPage",
      chat: "ChatPage",
      message: "ChatPage", // alias
      members: "MembersPage",
      friends: "FriendsPage",
      documents: "DocumentsPage",
      canvas: "CanvasPage",
      menus: "MenusPage",
      invitations: "InvitationsPage",
      "user-settings": "ProfilePage",
      settings: "WorkspacesPage",
    };

    const items = await ctx.db
      .query("menuItems")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    for (const mi of items) {
      const target = map[mi.slug];
      if (!mi.component && target) {
        await ctx.db.patch(mi._id, { component: target });
      }
    }
  },
});
\`\`\`

Alternatively, patch directly via an admin UI or a one‑off script using the Convex client.

## Adding a New Dynamic Endpoint

1) Decide the endpoint slug under `/dashboard/<slug>` (e.g., `reports`).
2) Choose an existing component (`componentId`) from the manifest, or add a new manifest entry:
   - Add a new record in `DEFAULT_PAGE_MANIFEST` with a unique `componentId`, `id` (optional default slug), and `component` implementation.
3) Create or update a `menuItems` row in the workspace:
   - `slug: "reports"`, `component: "DocumentsPage"` (for example).
4) Navigate to `/dashboard/reports` — it renders the chosen component.

## Behavior Notes

- If menus are installed for a workspace and a slug is not accessible for the user, the page shows a “Not Found or No Access” message unless it is a built‑in manifest page.
- If a menu item exists for a slug but its `component` doesn’t match any manifest `componentId`, the renderer falls back to the manifest route by slug; if none, it falls back to `dashboard`.

## ERD vs Implementation (What’s Deferred)

The ER document includes advanced concepts like `menuSets`, `componentVersions`, alias registries, CMS graph editors, etc. These are useful as a north‑star. The current implementation intentionally uses:

- One menu item list per workspace (no menu set assignments yet).
- Direct `component` mapping via stable `componentId` (no versioning layer yet).

This keeps the system flexible and shippable. If/when we introduce sets and versioning, the manifest `componentId` can remain stable and serve as the join key.

## Verification Checklist

- Sign in and ensure at least one workspace exists.
- Seed or backfill `menuItems` with `component` values as needed.
- Visit representative endpoints: `/dashboard/chat`, `/dashboard/documents`, `/dashboard/message` (if alias added), etc.
- Confirm the sidebar shows menu items with correct labels and icons.
- Confirm that role restrictions (`visibleForRoleIds`) continue to apply.

## Rollback

The changes are additive and non‑destructive:

- If needed, remove the `component` values from `menuItems` to return to direct slug→manifest rendering.
- The relaxed access check still preserves built‑in pages for comfort during transition.

## Optional: Menu Sets & Component Versioning

These are additive capabilities aligned with the ER document and do not change current behavior unless adopted.

- New schema tables (additive): `menuSets`, `workspaceMenuAssignments`, `userMenuAssignments`, `components`, `componentVersions`, `componentAliases`, `menuItemComponents`, `activityEvents` (see `convex/schema.ts`).
- New server modules (organized by domain):
  - `convex/menu/sets.ts`: create/list/assign menu sets.
  - `convex/menu/itemComponents.ts`: bind component versions to menu items.
  - `convex/components/registry.ts`: register components, add versions, manage aliases.
  - `convex/workspace/activity.ts`: activity log utilities.

You can adopt these incrementally without removing existing `menuItems` usage.
