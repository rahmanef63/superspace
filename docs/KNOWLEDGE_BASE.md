# SuperSpace Knowledge Base

> **Purpose:** Single reference document for AI agents to quickly understand the project
> **Last Updated:** 2025-01-18
> **Token Budget:** Optimized for < 5000 tokens per session

---

## 🎯 Project Identity

**Name:** SuperSpace v0
**Stack:** Next.js 15 + Convex + shadcn/ui + Zustand
**Architecture:** Feature Package System with RBAC
**Database:** Convex (real-time, serverless)
**Auth:** Clerk + @convex-dev/auth

---

## 📁 Critical File Locations

### Configuration (Single Source of Truth)
- `features.config.ts` - ALL features defined here
- `convex/schema.ts` - Database schema
- `.claude/CLAUDE.md` - Project guardrails

### Auto-Generated (DO NOT EDIT)
- `convex/menu/store/menu_manifest_data.ts` - Generated from features.config.ts
- `convex/menu/store/optional_features_catalog.ts` - Generated from features.config.ts

### Core Systems
- `convex/workspace/workspaces.ts` - Workspace CRUD, **LINE 498-515 HAS CRITICAL FIX**
- `convex/menu/store/menuItems.ts` - Menu system with RBAC
- `convex/auth/helpers.ts` - RBAC utilities (`requirePermission`, `requireActiveMembership`)
- `convex/workspace/permissions.ts` - Permission constants

### Scripts
- `scripts/sync-features.ts` - Regenerate manifests (run after editing features.config.ts)
- `scripts/validate-features.ts` - Validate features.config.ts
- `scripts/scaffold-feature.ts` - Generate new feature boilerplate

### Tests
- `tests/workspaces.test.ts` - Workspace integration tests
- `tests/features/` - Feature-specific tests

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│         features.config.ts (Single Source)              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Default    │  │   Optional   │  │ Experimental │ │
│  │  Features    │  │  Features    │  │   Features   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└────────────────────┬────────────────────────────────────┘
                     │
         ┌───────────┴────────────┐
         │  pnpm run sync:features │
         └───────────┬────────────┘
                     │
    ┌────────────────┴────────────────┐
    │                                 │
    ▼                                 ▼
┌─────────────────────┐   ┌─────────────────────┐
│ menu_manifest_data  │   │optional_features    │
│      (Auto)         │   │   _catalog (Auto)   │
└──────────┬──────────┘   └──────────┬──────────┘
           │                         │
           └──────────┬──────────────┘
                      │
          ┌───────────┴────────────┐
          │ createWorkspace()      │
          │ → createDefaultMenus() │
          └───────────┬────────────┘
                      │
              ┌───────┴────────┐
              │                │
              ▼                ▼
        ┌──────────┐    ┌──────────┐
        │ Default  │    │ Optional │
        │  Menus   │    │  (Store) │
        └──────────┘    └──────────┘
```

---

## 🔑 Key Concepts

### 1. Feature Types

| Type | Auto-installed | Visible by default | Uninstallable |
|------|----------------|-------------------|---------------|
| **default** | ✅ Yes | ✅ Yes | ❌ No |
| **optional** | ❌ No | ❌ No (until installed) | ✅ Yes |
| **experimental** | ❌ No | ❌ No | ✅ Yes |

### 2. RBAC (Role-Based Access Control)

**Hierarchy (0 = highest):**
- Owner (level 0) - Full access
- Admin (level 10) - Manage workspace
- Manager (level 30) - Manage content
- Staff (level 50) - Create content
- Client (level 70) - Limited access
- Guest (level 90) - Read-only

**Permission Check Pattern:**
```typescript
// In any Convex query/mutation
import { requirePermission } from "../../auth/helpers"
import { PERMS } from "../../workspace/permissions"

export const myQuery = query({
  handler: async (ctx, args) => {
    // This throws if user lacks permission
    const { membership, role } = await requirePermission(
      ctx,
      args.workspaceId,
      PERMS.VIEW_REPORTS
    )

    // Your logic here
  }
})
```

### 3. Audit Logging

**Pattern:**
```typescript
import { logAuditEvent } from "../../lib/audit"

export const myMutation = mutation({
  handler: async (ctx, args) => {
    const { membership } = await requirePermission(ctx, args.workspaceId, PERMS.CREATE_REPORTS)

    const id = await ctx.db.insert("reports", { /* ... */ })

    // Log every mutation
    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      userId: membership.userId,
      action: "REPORT_CREATED",
      resourceType: "report",
      resourceId: id,
      metadata: { /* ... */ }
    })

    return id
  }
})
```

### 4. Feature Package Structure

```
frontend/features/{slug}/
  ├── index.ts              # Exports: Page, hooks, types
  ├── views/
  │   └── {Name}Page.tsx    # Main page component
  ├── components/           # Feature-specific components
  ├── hooks/                # Data fetching hooks
  ├── types/                # TypeScript types
  └── lib/                  # Utilities

convex/features/{slug}/
  ├── index.ts              # Exports: queries, mutations, actions
  ├── queries.ts            # Read operations (with RBAC)
  ├── mutations.ts          # Write operations (with RBAC + audit)
  └── actions.ts            # Background jobs (optional)

tests/features/{slug}/
  ├── {slug}.test.ts        # Unit tests
  └── {slug}.integration.test.ts  # Integration tests
```

---

## 🚨 Critical Issues & Fixes

### Issue #1: Workspace Bootstrap - No Menus

**Location:** `convex/workspace/workspaces.ts:498-515`

**Problem:**
```typescript
// OLD CODE (BROKEN)
try {
  await ctx.runMutation(api.menu.store.menuItems.createDefaultMenuItems, {
    workspaceId,
    selectedSlugs: [],
  })
} catch (err) {
  console.warn("createDefaultMenuItems failed; continuing", err) // ❌ Suppressed!
}
```

**Fix Applied:**
```typescript
// NEW CODE (FIXED)
try {
  await ctx.runMutation(api.menu.store.menuItems.createDefaultMenuItems, {
    workspaceId,
    selectedSlugs: [],
  })
  console.log("[createWorkspace] Default menus created successfully for workspace:", workspaceId)
} catch (err) {
  console.error("[createWorkspace] CRITICAL: Failed to create default menus", {
    workspaceId,
    error: err instanceof Error ? err.message : String(err),
    stack: err instanceof Error ? err.stack : undefined,
  })
  // User can manually reset via resetWorkspace mutation
  console.warn("[createWorkspace] Workspace created without menus - use resetWorkspace to fix")
}
```

**Recovery:**
```typescript
// If a workspace has no menus, run:
await ctx.runMutation(api.workspace.workspaces.resetWorkspace, {
  workspaceId: "xxx",
  mode: "replaceMenus"
})
```

---

## 🔄 Common Workflows

### Workflow 1: Add New Feature

```bash
# 1. Scaffold
pnpm run scaffold:feature reports --type optional --category analytics

# 2. Implement
# - frontend/features/reports/
# - convex/features/reports/
# - tests/features/reports/

# 3. Sync
pnpm run sync:features

# 4. Validate
pnpm run validate:features
pnpm test

# 5. Commit
git commit -m "feat: add reports"
```

### Workflow 2: Pre-commit Checks

```bash
# Always run before committing:
pnpm run validate:all    # All schema validators
pnpm run typecheck       # TypeScript
pnpm run lint            # ESLint
pnpm test                # All tests
```

### Workflow 3: Debug Menu Issues

```typescript
// 1. Check if menus exist for workspace
const items = await ctx.runQuery(api.menu.store.menuItems.getWorkspaceMenuItems, {
  workspaceId
})
console.log("Menu items:", items.length)

// 2. Check menu set assignment
const assignment = await ctx.db
  .query("workspaceMenuAssignments")
  .withIndex("by_workspace_default", q =>
    q.eq("workspaceId", workspaceId).eq("isDefault", true)
  )
  .first()
console.log("Menu set assignment:", assignment)

// 3. If missing, reset workspace
await ctx.runMutation(api.workspace.workspaces.resetWorkspace, {
  workspaceId,
  mode: "replaceMenus"
})
```

---

## 📊 Feature Status Summary

**As of 2025-01-18:**

| Category | Status | Details |
|----------|--------|---------|
| **Core System** | 🟡 83% | 10/12 complete, 2 in progress |
| **Default Features** | 🟢 85% | 11/13 complete |
| **Optional Features** | 🔴 17% | 1/6 complete |
| **Infrastructure** | 🟢 88% | 7/8 complete |
| **Overall** | 🟡 67% | 26/39 tasks complete |

**Critical Blockers:**
1. ✅ FIXED: Workspace bootstrap menu creation
2. 🚧 IN PROGRESS: Optional features catalog generation
3. 📋 TODO: CI/CD pipeline testing

See [FEATURE_STATUS.md](./FEATURE_STATUS.md) for detailed breakdown.

---

## 🛡️ Project Guardrails

**From `.claude/CLAUDE.md`:**

### MUST DO
1. ✅ Validate schema (Zod) before deployment
2. ✅ Apply RBAC to ALL queries/mutations
3. ✅ Log audit events for ALL mutations
4. ✅ Write tests (unit + integration)
5. ✅ Run `validate:all` before commit

### MUST NOT DO
1. ❌ Change RBAC/Convex architecture without approval
2. ❌ Remove audit logging
3. ❌ Bypass permission checks
4. ❌ Edit auto-generated files manually
5. ❌ Skip tests

### Sources of Truth
- `convex/workspace/*` - Workspace logic
- `convex/menu/*` - Menu system
- `convex/components/*` - Shared components
- `convex/user/*` - User logic
- `convex/schema.ts` - Database schema
- `scripts/validate-*.ts` - Validation scripts
- `tests/*.test.ts` - Test suites

---

## 📝 Quick Reference

### Validation Commands

```bash
pnpm run validate:workspace      # Workspace schema
pnpm run validate:settings       # Settings schema
pnpm run validate:document       # Document schema
pnpm run validate:role           # Role schema
pnpm run validate:conversation   # Conversation schema
pnpm run validate:features       # Features config
pnpm run validate:all            # ALL validators
```

### Permission Constants (PERMS)

```typescript
// From convex/workspace/permissions.ts
PERMS.MANAGE_WORKSPACE
PERMS.MANAGE_MEMBERS
PERMS.INVITE_MEMBERS
PERMS.MANAGE_ROLES
PERMS.MANAGE_MENUS
PERMS.DOCUMENTS_CREATE
PERMS.DOCUMENTS_EDIT
PERMS.DOCUMENTS_DELETE
PERMS.DOCUMENTS_MANAGE
PERMS.CREATE_CONVERSATIONS
PERMS.MANAGE_CONVERSATIONS
PERMS.VIEW_WORKSPACE
```

### Schema Tables

```typescript
// Key tables in convex/schema.ts
users
workspaces
workspaceMemberships
roles
roleMenuPermissions
menuSets
menuItems
workspaceMenuAssignments
userMenuAssignments
documents
conversations
messages
// ... and more
```

---

## 🎯 For AI Agents

### When Starting a New Session

1. **Read this file first** (you're here!)
2. Check [FEATURE_STATUS.md](./FEATURE_STATUS.md) for current status
3. Review [CLAUDE.md](../.claude/CLAUDE.md) for guardrails
4. Check git status for uncommitted changes

### When Implementing Features

1. **Scaffold first:** `pnpm run scaffold:feature {slug}`
2. **RBAC always:** Every query/mutation needs `requirePermission()`
3. **Audit always:** Every mutation needs `logAuditEvent()`
4. **Test always:** Write tests before marking complete
5. **Validate always:** Run `pnpm run validate:all` before commit

### When Fixing Bugs

1. **Check FEATURE_STATUS.md** for known issues
2. **Check git blame** to understand history
3. **Read tests** to understand expected behavior
4. **Add regression test** before fixing
5. **Update docs** after fixing

### When Debugging

1. **Use Convex dashboard** for real-time queries
2. **Check browser console** for frontend errors
3. **Check Convex logs** for backend errors
4. **Verify RBAC** - most issues are permission-related
5. **Check menu assignments** - common workspace issues

---

## 📞 Where to Get Help

1. **This file** - Quick overview
2. [FEATURE_STATUS.md](./FEATURE_STATUS.md) - Detailed status
3. [feature-system-diagram.md](./feature-system-diagram.md) - Visual diagrams
4. [FEATURE_SYSTEM.md](./FEATURE_SYSTEM.md) - Deep dive
5. [README.md](./README.md) - Complete guide

---

## 🔄 Document Maintenance

**Update this file when:**
- Adding new critical systems
- Fixing critical bugs
- Changing architecture
- Adding new guardrails
- Major project milestones

**Review frequency:** Weekly or after major changes

---

**Last Updated:** 2025-01-18
**Next Review:** 2025-01-25
**Maintained by:** Development Team
