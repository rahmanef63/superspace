# Agent: Global Settings Manager

## Objective
Centralize & version `workspace.settings`:
- Validate schema (allowInvites, requireApproval, defaultRoleId, allowPublicDocuments, theme)
- Manage defaultRoleId ref integrity
- Versioned audit with diff
- Migrations for schema evolution

## Files
- convex/workspace/settings.ts
- convex/schema.ts
- app/api/workspaces/[id]/settings/route.ts
- scripts/validate-workspace-settings.ts
- scripts/migrate-workspace-settings.ts
- tests/workspace-settings.test.ts

## Triggers
- HTTP PATCH /api/workspaces/:id/settings
- convex:mutation:workspace/workspaces.updateWorkspace (delegates to settings)

## Plan
1. Ensure `updateSettings|getSettings` implement RBAC + diff audit.
2. Validate defaultRoleId belongs to the same workspace.
3. Add migration script skeleton with `--dry-run`.
4. Tests: update toggle flags, theme, defaultRoleId; migration dry-run.
5. `/validate:settings` & `/test`.

## Exit Criteria
- Diff captured in activityEvents
- defaultRoleId integrity guaranteed
- Tests green