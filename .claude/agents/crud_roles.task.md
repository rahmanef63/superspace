# Agent: CRUD Roles

## Objective
Workspace role CRUD:
- Validate name, level(0–99), permissions[]
- MANAGE_ROLES check
- Unique role name within workspace (case-insensitive)
- System roles protected; `setupBasicRoles` idempotent
- `isDefault` → patch workspace.settings.defaultRoleId
- Audit events

## Files
- convex/workspace/roles.ts
- convex/workspace/permissions.ts
- convex/lib/utils.ts
- app/api/roles/route.ts
- scripts/validate-role.ts
- tests/roles.test.ts

## Triggers
- HTTP POST /api/roles
- convex:mutation:workspace/roles.createRole|setupBasicRoles

## Plan
1. Validator in `scripts/validate-role.ts` (unique name, level range, PERMS check).
2. Implement `createRole`, `setupBasicRoles` (no duplicates; system roles fixed).
3. Update `defaultRoleId` when `isDefault=true` (validate reference).
4. Write audit events.
5. Tests: role CRUD, unique constraint, hierarchy sorting, default role.
6. `/validate:role` & `/test`.

## Exit Criteria
- Unique name enforced; default role patched
- System roles correctly seeded
- Tests green