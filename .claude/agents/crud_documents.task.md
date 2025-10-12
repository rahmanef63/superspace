# Agent: CRUD Documents

## Objective
Documents CRUD (workspace-scoped) with:
- Validation: title, workspaceId, isPublic, content, parentId same workspace
- Ownership & membership checks
- Hierarchy (parentId)
- Update timestamps & metadata.lastEditedBy
- Search index update (title)
- Public/private toggle
- Audit events

## Files
- convex/menu/page/documents.ts
- convex/schema.ts
- convex/workspace/activity.ts
- app/api/documents/route.ts
- scripts/validate-document.ts
- tests/documents.test.ts

## Triggers
- HTTP POST /api/documents
- convex:mutation:menu/page/documents.create|update|deleteDocument|togglePublic|updateTitle

## Plan
1. Add Zod validation logic in `scripts/validate-document.ts`.
2. Implement mutations in `convex/menu/page/documents.ts`:
   - `create`, `update`, `updateTitle`, `togglePublic`, `deleteDocument`
   - permission: member of workspace; owner/author checks on update/delete
   - parentId must belong to same workspace
   - update `lastModified`, `metadata.lastEditedBy`
   - write `activityEvents` & trigger search index (stub function OK)
3. HTTP route `app/api/documents/route.ts`.
4. Tests: create, hierarchy, toggle visibility, search stub called.
5. Run `/validate:document` & `/test`.

## Exit Criteria
- Parent/visibility enforced
- Audit logged, search trigger called
- Tests green