# AI Knowledge Base

> **Technical reference for AI agents working with SuperSpace**
> **Last Updated:** 2025-01-19
> **Token Budget:** Optimized for < 8000 tokens

---

## Project Identity

**Name:** SuperSpace v0
**Type:** Collaborative workspace platform (Notion + Chats + Slack hybrid)
**Stack:**
- Frontend: Next.js 15 (App Router) + React 18
- Database: Convex (real-time, serverless)
- Auth: Clerk + @convex-dev/auth
- UI: shadcn/ui + Tailwind CSS
- State: Zustand
- Forms: react-hook-form + Zod

**Architecture:** Feature Package System with RBAC

---

## Critical File Locations

### Single Source of Truth

```typescript
// ALL features defined here
features.config.ts

// Database schema
convex/schema.ts

// Project guardrails
.claude/CLAUDE.md
```

### Auto-Generated (DO NOT EDIT)

```typescript
// Generated from features.config.ts via sync:all
convex/features/menus/menu_manifest_data.ts
convex/features/menus/optional_features_catalog.ts
```

### Core Systems

```typescript
// Workspace CRUD + bootstrap (CRITICAL FIX AT LINE 498-515)
convex/workspace/workspaces.ts

// Menu system with RBAC
convex/features/menus/menuItems.ts

// RBAC utilities
convex/auth/helpers.ts

// Permission constants
convex/workspace/permissions.ts
```

### Scripts

```bash
scripts/sync-features.ts           # Regenerate manifests
scripts/validate-features.ts       # Validate features.config.ts
scripts/scaffold-feature.ts        # Generate feature boilerplate
scripts/check-workspace-health.ts  # Health checks
```

### Tests

```
tests/workspaces.test.ts          # Workspace tests
tests/features/{slug}/            # Feature-specific tests
```

---

## Core Patterns

### 1. RBAC Check Pattern

**Every Convex query/mutation MUST check permissions:**

```typescript
import { requireActiveMembership, requirePermission } from "../../auth/helpers"
import { PERMS } from "../../workspace/permissions"

// Pattern A: Basic workspace access
export const listItems = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    // ✅ REQUIRED: Throws if not active member
    const { membership, role } = await requireActiveMembership(
      ctx,
      args.workspaceId
    )

    // User is verified workspace member
    return await ctx.db.query("items")
      .withIndex("by_workspace", q => q.eq("workspaceId", args.workspaceId))
      .collect()
  }
})

// Pattern B: Specific permission required
export const deleteItem = mutation({
  args: {
    workspaceId: v.id("workspaceId"),
    itemId: v.id("items"),
  },
  handler: async (ctx, args) => {
    // ✅ REQUIRED: Throws if lacks permission
    const { membership, role } = await requirePermission(
      ctx,
      args.workspaceId,
      PERMS.DOCUMENTS_DELETE
    )

    // User has specific permission
    await ctx.db.delete(args.itemId)
    return true
  }
})
```

**Available Permissions (PERMS):**

```typescript
// Workspace management
PERMS.MANAGE_WORKSPACE
PERMS.MANAGE_MEMBERS
PERMS.INVITE_MEMBERS
PERMS.MANAGE_ROLES
PERMS.MANAGE_MENUS
PERMS.MANAGE_INVITATIONS

// Document management
PERMS.DOCUMENTS_CREATE
PERMS.DOCUMENTS_EDIT
PERMS.DOCUMENTS_DELETE
PERMS.DOCUMENTS_MANAGE

// Communication
PERMS.CREATE_CONVERSATIONS
PERMS.MANAGE_CONVERSATIONS

// Basic access
PERMS.VIEW_WORKSPACE
```

### 2. Audit Logging Pattern

**All mutations MUST log changes:**

```typescript
import { internal } from "../../_generated/api"

export const updateDocument = mutation({
  handler: async (ctx, args) => {
    const { membership } = await requirePermission(...)

    // Get old data for diff
    const oldDoc = await ctx.db.get(args.documentId)

    // Perform update
    await ctx.db.patch(args.documentId, {
      title: args.newTitle
    })

    // ✅ REQUIRED: Log the change
    await ctx.runMutation(internal.audit.logEvent, {
      actorUserId: membership.userId,
      workspaceId: args.workspaceId,
      entityType: "document",
      entityId: String(args.documentId),
      action: "update",
      diff: {
        old: { title: oldDoc.title },
        new: { title: args.newTitle }
      },
      createdAt: Date.now(),
    })

    return args.documentId
  }
})
```

### 3. API Layer Pattern

**Frontend accesses Convex via typed API:**

```typescript
// frontend/features/documents/api/index.ts
import { api } from "@/convex/_generated/api"
import { useMutation, useQuery } from "convex/react"
import type { Id } from "@/convex/_generated/dataModel"

export function useDocuments(workspaceId: Id<"workspaces">) {
  return useQuery(api.features.documents.queries.listDocuments, {
    workspaceId
  })
}

export function useCreateDocument() {
  return useMutation(api.features.documents.mutations.createDocument)
}

// Usage in component:
const documents = useDocuments(workspaceId)
const createDocument = useCreateDocument()

await createDocument({
  workspaceId,
  title: "New Doc"
})
```

### 4. Feature Structure Pattern

```
frontend/features/{slug}/
  ├── index.ts              # Public exports
  ├── views/
  │   └── {Name}Page.tsx    # Main page component
  ├── components/           # Feature-specific components
  ├── hooks/                # React hooks (useFeature)
  ├── api/                  # Convex API wrappers
  ├── types/                # TypeScript types
  └── lib/                  # Utilities

convex/features/{slug}/
  ├── index.ts              # Public exports
  ├── queries.ts            # Read operations (RBAC required)
  ├── mutations.ts          # Write operations (RBAC + audit required)
  └── actions.ts            # Background jobs (optional)

tests/features/{slug}/
  ├── {slug}.test.ts        # Unit tests
  └── {slug}.integration.test.ts  # Integration tests
```

---

## Critical Issue & Fix

### Issue: Workspace Bootstrap - No Menus

**Location:** `convex/workspace/workspaces.ts:498-515`

**Problem:**
When creating a workspace, `createDefaultMenuItems` mutation could fail silently due to schema mismatches, leaving workspaces without navigation menus.

**Root Cause:**
Schema mismatch - `menuItems.metadata.tags` field missing from schema but present in features.config.ts.

**Fix Applied (2025-01-18):**

1. **Schema Updated:**
```typescript
// convex/schema.ts:168
metadata: v.optional(
  v.object({
    // ... other fields
    tags: v.optional(v.array(v.string())), // ✅ Added
    // ...
  })
)
```

2. **Error Logging Improved:**
```typescript
// convex/workspace/workspaces.ts:498-515
try {
  await ctx.runMutation(internal.features.menus.menuItems.createDefaultMenuItems, {
    workspaceId,
    selectedSlugs: Array.isArray(args.selectedMenuSlugs) ? args.selectedMenuSlugs : [],
    actorUserId: userId,
  })
  console.log("[createWorkspace] Default menus created successfully")
} catch (err) {
  // ✅ Better error logging
  console.error("[createWorkspace] CRITICAL: Failed to create default menus", {
    workspaceId,
    error: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined,
  })
  // Don't throw - allow workspace creation to complete
  console.warn("[createWorkspace] Workspace created without menus - use resetWorkspace to fix")
}
```

**Recovery for Broken Workspaces:**

```typescript
// Via Convex Dashboard
await ctx.runMutation(api.workspace.workspaces.resetWorkspace, {
  workspaceId: "workspace_id_here",
  mode: "replaceMenus"
})

// Via Health Check
const health = await ctx.runQuery(api.workspace.health.checkWorkspaceHealth, {
  workspaceId: "workspace_id"
})

if (!health.isHealthy) {
  await ctx.runMutation(api.workspace.health.fixWorkspaceIssues, {
    workspaceId: "workspace_id",
    fixMenus: true,
    fixRoles: true
  })
}
```

**Prevention:**
```bash
# Always run before deploying
pnpm run validate:all

# Monitor for this error in logs
"CRITICAL: Failed to create default menus"

# Run health checks weekly
pnpm run check:workspaces
```

---

## Common Workflows

### Workflow 1: Add New Default Feature

```bash
# 1. Scaffold
pnpm run scaffold:feature analytics --type default --category analytics

# 2. Implement
# - Edit frontend/features/analytics/
# - Edit convex/features/analytics/
# - Write tests in tests/features/analytics/

# 3. Update config
# - Edit features.config.ts (add/modify entry)

# 4. Sync
pnpm run sync:all

# 5. Validate
pnpm run validate:all

# 6. Test
pnpm test

# 7. Commit
git add .
git commit -m "feat: add analytics feature"
```

### Workflow 2: Add New Optional Feature

```bash
# Same as Workflow 1, but:
# - Use --type optional
# - Verify appears in Menu Store after sync

pnpm run scaffold:feature tasks --type optional --category productivity
# ... implement ...
pnpm run sync:all

# Verify catalog updated:
cat convex/features/menus/optional_features_catalog.ts
```

### Workflow 3: Fix Broken Workspace

```typescript
// 1. Check workspace health
const health = await ctx.runQuery(api.workspace.health.checkWorkspaceHealth, {
  workspaceId
})

console.log(health)
// {
//   isHealthy: false,
//   issues: ["No menu items", "Missing default role"],
//   stats: { menuItems: 0, roles: 6, ... }
// }

// 2. Auto-fix
await ctx.runMutation(api.workspace.health.fixWorkspaceIssues, {
  workspaceId,
  fixMenus: true,
  fixRoles: true
})

// 3. Verify
const fixed = await ctx.runQuery(api.workspace.health.checkWorkspaceHealth, {
  workspaceId
})
console.log(fixed.isHealthy) // true
```

### Workflow 4: Debug Menu Issues

```typescript
// 1. Check menu items exist
const items = await ctx.runQuery(api.menu.store.menuItems.getWorkspaceMenuItems, {
  workspaceId
})
console.log("Menu items:", items.length, items.map(i => i.slug))

// 2. Check menu set assignment
const assignment = await ctx.db
  .query("workspaceMenuAssignments")
  .withIndex("by_workspace_default", q =>
    q.eq("workspaceId", workspaceId).eq("isDefault", true)
  )
  .first()
console.log("Menu set:", assignment)

// 3. If missing, reset
if (!assignment || items.length === 0) {
  await ctx.runMutation(api.workspace.workspaces.resetWorkspace, {
    workspaceId,
    mode: "replaceMenus"
  })
}
```

---

## Instructions for AI

### When Starting a Task

1. **Read project context:**
   - This file (AI_KNOWLEDGE_BASE.md)
   - .claude/CLAUDE.md (guardrails)
   - Relevant feature docs

2. **Check current state:**
   ```bash
   git status
   pnpm run validate:all
   ```

3. **Verify understanding:**
   - What feature/bug are we working on?
   - What files need to be changed?
   - What are the acceptance criteria?

### When Implementing Features

1. **Always use scaffold first:**
   ```bash
   pnpm run scaffold:feature {slug} --type {type} --category {category}
   ```

2. **Follow RBAC pattern:**
   - Every query → `requireActiveMembership()`
   - Every mutation → `requirePermission()`

3. **Follow audit pattern:**
   - Every mutation → Log via `internal.audit.logEvent`

4. **Follow testing pattern:**
   - Write unit tests for utilities
   - Write integration tests for Convex functions
   - Test RBAC scenarios

5. **Always sync after config changes:**
   ```bash
   pnpm run sync:all
   ```

6. **Always validate before committing:**
   ```bash
   pnpm run validate:all
   pnpm test
   ```

### When Fixing Bugs

1. **Reproduce first:**
   - Understand the issue
   - Find minimal reproduction steps

2. **Check known issues:**
   - Review TROUBLESHOOTING.md
   - Check git blame for context

3. **Add regression test:**
   - Write failing test first
   - Fix bug
   - Verify test passes

4. **Update docs:**
   - Add to TROUBLESHOOTING.md if user-facing
   - Add JSDoc comments if code-facing

### When Answering Questions

1. **Check documentation first:**
   - AI_KNOWLEDGE_BASE.md (this file)
   - DEVELOPER_GUIDE.md
   - TROUBLESHOOTING.md
   - FEATURE_REFERENCE.md

2. **Provide code examples:**
   - Show actual code from project
   - Include file paths
   - Explain why, not just what

3. **Link to resources:**
   - Reference specific docs
   - Link to related code
   - Provide next steps

### Common Pitfalls to Avoid

❌ **DON'T:**
- Edit auto-generated files (manifest, catalog)
- Skip permission checks
- Skip audit logging
- Skip tests
- Change schema without validation
- Bypass RBAC
- Remove error logging

✅ **DO:**
- Use scaffold for new features
- Check permissions in ALL handlers
- Log ALL mutations
- Write tests BEFORE marking done
- Validate schema changes
- Follow established patterns
- Improve error messages

---

## Quick Reference

### Feature Types

| Type | Auto-install | Uninstallable | Location |
|------|-------------|---------------|----------|
| default | ✅ Yes | ❌ No | Built-in |
| optional | ❌ No | ✅ Yes | Menu Store |
| experimental | ❌ No | ✅ Yes | Hidden |

### Role Hierarchy

| Role | Level | Permissions |
|------|-------|-------------|
| Owner | 0 | All (*) |
| Admin | 10 | Manage workspace, members, roles |
| Manager | 30 | Manage content, conversations |
| Staff | 50 | Create content, chat |
| Client | 70 | Limited (no member list) |
| Guest | 90 | Read-only |

### Commands

```bash
# Scaffolding
pnpm run scaffold:feature {slug} --type {type} --category {category}

# Syncing
pnpm run sync:all              # Full sync
pnpm run sync:features         # Features only
pnpm run generate:manifest     # Manifest only

# Validation
pnpm run validate:all          # All schemas
pnpm run validate:features     # Features only
pnpm run check:features        # Validate + dry-run sync

# Testing
pnpm test                      # All tests
pnpm test:coverage             # With coverage
pnpm test tests/features/{slug} # Specific feature

# Health checks
pnpm run check:workspaces      # Check all workspaces
pnpm run check:workspaces:fix  # Auto-fix issues

# Pre-commit
pnpm run precommit             # Lint + validate + test
```

### File Paths

```
# Config
features.config.ts
convex/schema.ts
.claude/CLAUDE.md

# Auto-generated
convex/features/menus/menu_manifest_data.ts
convex/features/menus/optional_features_catalog.ts

# Core
convex/workspace/workspaces.ts
convex/features/menus/menuItems.ts
convex/auth/helpers.ts
convex/workspace/permissions.ts

# Features
frontend/features/{slug}/
convex/features/{slug}/
tests/features/{slug}/
```

---

## Error Messages to Watch For

**CRITICAL Errors:**
```
"CRITICAL: Failed to create default menus"
→ Workspace created without menus, run resetWorkspace

"Schema validation failed"
→ Run pnpm run validate:all, fix schema issues

"Permission denied" / "Not authorized"
→ Check RBAC implementation, verify role permissions
```

**Warning Errors:**
```
"Workspace created without menus - use resetWorkspace to fix"
→ Non-fatal, but workspace needs manual fix

"Manifest out of sync"
→ Run pnpm run sync:all
```

---

## Debug Queries (Convex Dashboard)

```typescript
// Check workspace health
await ctx.runQuery(api.workspace.health.checkWorkspaceHealth, {
  workspaceId: "workspace_id"
})

// Check menu items
await ctx.runQuery(api.menu.store.menuItems.getWorkspaceMenuItems, {
  workspaceId: "workspace_id"
})

// Check user permissions
await ctx.runQuery(api.workspace.workspaces.getWorkspace, {
  workspaceId: "workspace_id"
})

// Fix workspace
await ctx.runMutation(api.workspace.workspaces.resetWorkspace, {
  workspaceId: "workspace_id",
  mode: "replaceMenus"
})
```

---

## Shared Chat Module Cheat Sheet

- Core entry points live in `frontend/shared/chat/components`, with container wrappers exposed per feature under `frontend/features/{domain}/components`.
- The Convex adapter (`frontend/features/chat/adapters/convexChatAdapter.ts`) is the single place to extend realtime behaviour; reuse it when adding reactions, thread support, or audit metadata.
- Common containers:
  - `WorkspaceChatContainer` for room-based collaboration.
  - `AIChatContainer` for assistant conversations (supports `assistant`, `workflow`, `gpt`, `custom` modes).
  - `SupportChatContainer`, `ProjectDiscussionChat`, `CRMChatContainer`, `DocumentCollaboration`, and `CommentsPanel` wrap the shared primitives for domain-specific layouts.
- Schema expectations:
  - `chatRooms`: supply `contextMode`, `linkedEntities`, `participantIds`, and optional `settings` or `roles`.
  - `chatMessages`: enable threading via `threadOf`, moderation via `isSystem`, and analytics via `readBy`.
- Migration playbook:
  1. Keep the legacy view running while importing the shared container alongside it.
  2. Redirect event handlers (send/edit/delete/pin) to the shared adapter mutations.
  3. Remove bespoke components once QA signs off; update navigation tests (`tests/features/navigation-registry.test.ts`) if new slugs are introduced.
- Usage snippets are available under `frontend/shared/chat/examples/`; copy the preset closest to your use case and adjust props instead of duplicating logic.

---

## Links to Other Docs

- [Developer Guide](./2_DEVELOPER_GUIDE.md) - How to create features
- [Troubleshooting](./4_TROUBLESHOOTING.md) - Common issues
- [Feature Reference](./5_FEATURE_REFERENCE.md) - All features
- [CLAUDE.md](../.claude/CLAUDE.md) - Project guardrails

---

**Last Updated:** 2025-01-19
**Next Review:** 2025-02-01
**Maintained by:** Development Team
