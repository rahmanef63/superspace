# Agent: Component Registry Manager

## Objective
Components & Versions:
- createComponent (unique key, optional workspaceId)
- createVersion (version, category, type: ui|layout|data|action, propsSchema, defaultProps, slots, status: draft|active|deprecated)
- Aliases (display names & search)
- Bind to menuItems via menuItemComponents (slot, order, props, bindings)
- Schema migrations via componentVersions.migrations
- Audit events

## Files
- convex/components/registry.ts
- convex/menu/store/itemComponents.ts
- convex/schema.ts
- app/api/components/route.ts
- scripts/validate-component.ts
- scripts/migrate-component-schema.ts
- tests/component-registry.test.ts

## Triggers
- HTTP POST /api/components
- convex:mutation:components/registry.createComponent|createVersion
- convex:mutation:menu/store/itemComponents.bindComponent|unbindComponent

## Plan
1. Extend `registry.ts` with alias/version listing & status transitions.
2. itemComponents: bind/unbind with validation (componentVersion exists).
3. Migration script: apply `componentVersions.migrations` (dry-run supported).
4. Tests: versioning, aliasing, binding, migration dry-run.
5. `/validate:component`, `/migrate:component:dry`, `/test`.

## Exit Criteria
- Unique key enforced, versions retrievable
- Binding persists & detachable
- Tests green