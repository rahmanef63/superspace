# Agent: CRUD Menu Items

## Objective
Menu items CRUD with:
- Validate (name, slug, type, order, workspaceId, parentId)
- Hierarchy (parentId) & breadcrumb utilities
- Visibility filter by `visibleForRoleIds`
- Types: folder|route|divider|action|chat|document
- Bind to componentVersions via `menuItemComponents`
- Update menuSet when given
- Audit events

## Files
- convex/menu/store/menuItems.ts
- convex/menu/store/menus.ts
- convex/menu/store/itemComponents.ts
- convex/schema.ts
- app/api/menu-items/route.ts
- scripts/validate-menu-item.ts
- tests/menu-items.test.ts

## Triggers
- HTTP POST /api/menu-items
- convex:mutation:menu/store/menuItems.createDefaultMenuItems
- convex:mutation:menu/store/menus.createMenuStructure

## Plan
1. Validator: unique slug within same parent/workspace; order numeric.
2. Implement create/update/delete; hierarchy constraint; breadcrumbs, siblings.
3. Bind/unbind componentVersion with props/bindings/slot/order.
4. Visibility by role filtering helper.
5. Tests: hierarchy ops, visibility filter, binding.
6. `/test`.

## Exit Criteria
- Role-based visibility works
- Component binding stored & retrieved
- Tests green