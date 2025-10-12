# Agent: CRUD Workspaces

## Objective
Implement workspace CRUD with:
- Zod validation (scripts/validate-workspace.ts)
- **RBAC**: PERMS.MANAGE_WORKSPACE, PERMS.MANAGE_MEMBERS
- Autocreate system roles (Owner, Admin, Manager, Staff, Client, Guest)
- Creator membership as Owner
- Audit events: workspace_created/updated/deleted
- Cascade deletion (roles, memberships, menuItems, conversations, documents, etc.)
- Cache invalidation for queries

## Files (read/update)
- convex/workspace/workspaces.ts
- convex/workspace/roles.ts
- convex/workspace/permissions.ts
- convex/workspace/activity.ts
- convex/auth/helpers.ts
- app/api/workspaces/route.ts
- scripts/validate-workspace.ts
- tests/workspaces.test.ts

## Triggers
- HTTP POST /api/workspaces
- convex:mutation:workspace/workspaces.createWorkspace|updateWorkspace|deleteWorkspace

## Plan
1. Edit `convex/workspace/permissions.ts`: ensure PERMS constants & helpers.
2. Implement `createWorkspace | updateWorkspace | deleteWorkspace`:
   - requirePermission + ensureUser
   - on create → `roles.setupBasicRoles(workspaceId)` (idempotent)
   - create Owner membership for creator
   - write `activityEvents` (+ minimal diff on update)
   - cascade delete on delete
3. Add HTTP route handler `app/api/workspaces/route.ts`.
4. Update tests in `tests/workspaces.test.ts` (roles created, membership owner, cascade OK).
5. Run `/validate:workspace` & `/test`.

## Exit Criteria
- All mutations enforce RBAC & write audit
- `/validate:workspace` OK; `/test` green
- Cascade delete verified by test