# Troubleshooting Guide

> **Solutions to common SuperSpace issues**
> **Last Updated:** 2025-01-19

---

## Table of Contents

1. [Workspace Has No Menus](#1-workspace-has-no-menus)
2. [Feature Not Showing in Menu Store](#2-feature-not-showing-in-menu-store)
3. [Permission Denied Errors](#3-permission-denied-errors)
4. [Path API Errors](#4-path-api-errors)
5. [Tests Failing After Schema Changes](#5-tests-failing-after-schema-changes)
6. [TypeScript Errors After Adding Feature](#6-typescript-errors-after-adding-feature)
7. [Convex Functions Not Updating](#7-convex-functions-not-updating)
8. [Menu Items Not Updating](#8-menu-items-not-updating)
9. [Debug Queries Reference](#debug-queries-reference)

---

## 1. Workspace Has No Menus

### Symptoms
- New workspace created successfully
- Workspace loads but sidebar is empty
- No navigation menu items visible
- Console error: `createDefaultMenuItems failed`

### Root Cause
Schema mismatch between `features.config.ts` and `convex/schema.ts`. Common causes:
- Missing fields in schema (e.g., `tags`, `status`, `isReady`)
- Type mismatches in metadata
- Invalid feature configuration

### Error in Logs
```
Uncaught Error: Failed to insert or update a document in table "menuItems"
because it does not match the schema: Object contains extra field `tags`
that is not in the validator.
```

### Recovery Steps

#### Option A: Via Convex Dashboard (Recommended)

1. Open Convex Dashboard
2. Go to Functions tab
3. Run this mutation:

```typescript
await ctx.runMutation(api.workspace.workspaces.resetWorkspace, {
  workspaceId: "your_workspace_id_here",
  mode: "replaceMenus"
})
```

4. Refresh browser to see menus

#### Option B: Via Health Check Script

```bash
# Check all workspaces for issues
pnpm run check:workspaces

# Auto-fix detected issues
pnpm run check:workspaces:fix
```

#### Option C: Via Health Check Query

```typescript
// 1. Check workspace health
const health = await ctx.runQuery(api.workspace.health.checkWorkspaceHealth, {
  workspaceId: "workspace_id"
})

console.log(health)
// {
//   isHealthy: false,
//   issues: ["No menu items found"],
//   stats: { menuItems: 0, roles: 6, members: 1, ... }
// }

// 2. Auto-fix issues
const result = await ctx.runMutation(api.workspace.health.fixWorkspaceIssues, {
  workspaceId: "workspace_id",
  fixMenus: true,
  fixRoles: true
})

console.log(result)
// { success: true, fixed: ["menus", "roles"] }
```

### Prevention

1. **Always validate schema before deploying:**
   ```bash
   pnpm run validate:all
   ```

2. **Monitor Convex logs for critical errors:**
   ```
   "CRITICAL: Failed to create default menus"
   ```

3. **Run health checks weekly:**
   ```bash
   pnpm run check:workspaces
   ```

4. **Keep schema in sync with features.config.ts:**
   - After updating features.config.ts, run `pnpm run sync:all`
   - Verify schema matches all metadata fields

---

## 2. Feature Not Showing in Menu Store

### Symptoms
- Created optional feature
- Ran `pnpm run sync:features`
- Feature doesn't appear in Menu Store catalog
- Or feature appears but can't be installed

### Diagnostic Checklist

#### Check 1: Feature Type

```typescript
// ✅ CORRECT: Optional feature
{
  slug: "reports",
  featureType: "optional",  // Must be "optional"
  // ...
}

// ❌ WRONG: Default feature (auto-installs)
{
  slug: "reports",
  featureType: "default",  // Won't show in Menu Store
  // ...
}
```

#### Check 2: Sync Status

```bash
# Sync features to manifests
pnpm run sync:all

# Verify optional catalog exists and contains your feature
cat convex/menu/store/optional_features_catalog.ts

# Should see:
export const OPTIONAL_FEATURES_CATALOG = [
  {
    slug: "reports",
    name: "Reports",
    description: "Analytics and reporting",
    // ...
  },
  // ...
]
```

#### Check 3: Feature Not Already Installed

```typescript
// In Convex Dashboard, check if feature already installed
const items = await ctx.runQuery(api.menu.store.menuItems.getWorkspaceMenuItems, {
  workspaceId: "workspace_id"
})

console.log("Installed features:", items.map(i => i.slug))

// If "reports" is in the list, it's already installed
```

#### Check 4: Feature Status

```typescript
// In features.config.ts
{
  slug: "reports",
  featureType: "optional",
  status: "stable",        // ✅ Shows in store
  isReady: true,           // ✅ Can be installed
  // OR:
  status: "development",   // ⚠️ Shows but marked as in-dev
  isReady: false,          // ⚠️ Shows but not installable
}
```

### Fix Steps

1. **Update features.config.ts:**
   ```typescript
   {
     slug: "reports",
     featureType: "optional",  // Must be optional
     status: "stable",          // Or "beta", "development"
     isReady: true,             // Set to true when ready
     // ...
   }
   ```

2. **Sync manifests:**
   ```bash
   pnpm run sync:all
   ```

3. **Verify catalog:**
   ```bash
   cat convex/menu/store/optional_features_catalog.ts | grep "reports"
   ```

4. **Restart Convex dev:**
   ```bash
   # Stop Convex dev (Ctrl+C)
   npx convex dev
   ```

5. **Hard refresh browser:**
   ```
   Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
   ```

---

## 3. Permission Denied Errors

### Symptoms
- User can access workspace
- Gets "Not authorized" or "Permission denied" on certain features
- Features show in menu but throw errors when clicked

### Diagnostic Steps

#### Check 1: User's Role and Permissions

```typescript
// In Convex Dashboard
const workspace = await ctx.runQuery(api.workspace.workspaces.getWorkspace, {
  workspaceId: "workspace_id"
})

console.log("User role:", workspace.role.name)
console.log("Role level:", workspace.role.level)
console.log("Permissions:", workspace.role.permissions)

// Expected output:
// {
//   role: {
//     name: "Owner",
//     level: 0,
//     permissions: ["*"]  // Owner has all permissions
//   }
// }
```

#### Check 2: Feature's Required Permission

```typescript
// In features.config.ts
{
  slug: "reports",
  requiresPermission: "VIEW_REPORTS",  // Check this
  // ...
}

// Does user's role have this permission?
```

#### Check 3: Membership Status

```typescript
// Check membership
const membership = await ctx.db
  .query("workspaceMemberships")
  .withIndex("by_user_workspace", q =>
    q.eq("userId", userId).eq("workspaceId", workspaceId)
  )
  .first()

console.log("Membership status:", membership?.status)
// Should be "active", not "inactive" or "pending"
```

### Fix Steps

#### Fix 1: Add Permission to Role

```typescript
// Via Convex Dashboard
await ctx.runMutation(api.workspace.roles.updateRole, {
  roleId: "role_id",
  permissions: [
    "VIEW_WORKSPACE",
    "VIEW_REPORTS",      // Add missing permission
    "DOCUMENTS_CREATE",
    // ... other permissions
  ]
})
```

#### Fix 2: Update Feature Permission Requirement

```typescript
// In features.config.ts
{
  slug: "reports",
  requiresPermission: "VIEW_WORKSPACE",  // Less restrictive
  // Was: "MANAGE_REPORTS" (too restrictive)
}
```

Then sync:
```bash
pnpm run sync:all
```

#### Fix 3: Reactivate Membership

```typescript
// Via Convex Dashboard
await ctx.runMutation(api.workspace.workspaces.addMember, {
  workspaceId: "workspace_id",
  userId: "user_id",
  roleId: "role_id"  // Use appropriate role
})
```

### Common Permission Patterns

```typescript
// Public features (everyone can access)
{
  requiresPermission: "VIEW_WORKSPACE"
}

// Member features (need basic access)
{
  requiresPermission: "DOCUMENTS_CREATE"
}

// Admin features (need admin access)
{
  requiresPermission: "MANAGE_MEMBERS"
}

// Owner-only features
{
  requiresPermission: "MANAGE_WORKSPACE"
}
```

---

## 4. Path API Errors

### Symptoms
```
Error: Cannot find module 'api["menu/store/menuItems"]'
TypeError: Cannot read property 'menuItems' of undefined
```

### Cause
Incorrect import path for Convex API

### Fix

```typescript
// ❌ WRONG: String path
import { api } from "@/convex/_generated/api"
const items = await ctx.runQuery(api["menu/store/menuItems"].getWorkspaceMenuItems, ...)

// ✅ CORRECT: Dot notation
import { api } from "@/convex/_generated/api"
const items = await ctx.runQuery(api.menu.store.menuItems.getWorkspaceMenuItems, ...)

// ✅ CORRECT: For features
const docs = await ctx.runQuery(api.features.documents.queries.listDocuments, ...)
```

### Convex API Path Reference

```typescript
// Workspace
api.workspace.workspaces.createWorkspace
api.workspace.workspaces.getWorkspace
api.workspace.workspaces.resetWorkspace

// Menu Store
api.menu.store.menuItems.getWorkspaceMenuItems
api.menu.store.menuItems.installFeatureMenus

// Features
api.features.{slug}.queries.{queryName}
api.features.{slug}.mutations.{mutationName}

// Internal (use with ctx.runMutation)
internal.menu.store.menuItems.createDefaultMenuItems
internal.audit.logEvent
```

---

## 5. Tests Failing After Schema Changes

### Symptoms
- Tests pass locally but fail in CI
- Error: `Type mismatch` or `Schema validation failed`
- Error: `Cannot find module` or `Property does not exist`

### Fix Steps

1. **Regenerate Convex types:**
   ```bash
   npx convex dev --once
   # Or keep Convex dev running:
   npx convex dev
   ```

2. **Clear test cache:**
   ```bash
   pnpm test --clearCache
   ```

3. **Update test fixtures:**
   ```bash
   # If using fixtures, update them to match new schema
   # e.g., fixtures/workspace.json
   ```

4. **Run tests:**
   ```bash
   pnpm test
   ```

5. **If still failing, check schema validation:**
   ```bash
   pnpm run validate:all
   ```

---

## 6. TypeScript Errors After Adding Feature

### Symptoms
```
Cannot find module 'frontend/features/xyz'
Property 'XyzPage' does not exist on type
Type 'undefined' is not assignable to type 'XyzType'
```

### Fix Steps

1. **Restart TypeScript server in VS Code:**
   ```
   Cmd+Shift+P → "TypeScript: Restart TS Server"
   ```

2. **Verify exports in feature index.ts:**
   ```typescript
   // frontend/features/xyz/index.ts
   export { XyzPage } from './views/XyzPage'
   export { useXyz } from './hooks/useXyz'
   export type { XyzType } from './types'
   ```

3. **Check import paths:**
   ```typescript
   // ✅ CORRECT: From feature index
   import { XyzPage } from '@/frontend/features/xyz'

   // ❌ WRONG: Deep import
   import { XyzPage } from '@/frontend/features/xyz/views/XyzPage'
   ```

4. **Run type check:**
   ```bash
   pnpm run typecheck
   ```

5. **If still failing, check tsconfig.json paths:**
   ```json
   {
     "compilerOptions": {
       "paths": {
         "@/*": ["./*"]
       }
     }
   }
   ```

---

## 7. Convex Functions Not Updating

### Symptoms
- Changed Convex function code
- Changes not reflected in app
- Old version still running
- Stale data in queries

### Fix Steps

1. **Stop Convex dev server:**
   ```bash
   # Press Ctrl+C in terminal running convex dev
   ```

2. **Clear .convex cache (optional but recommended):**
   ```bash
   rm -rf .convex
   ```

3. **Restart Convex dev:**
   ```bash
   npx convex dev
   ```

4. **Hard refresh browser:**
   ```
   Cmd+Shift+R (Mac)
   Ctrl+Shift+R (Windows)
   ```

5. **Check Convex logs:**
   - Open Convex Dashboard
   - Go to Logs tab
   - Verify function is being called with new code

---

## 8. Menu Items Not Updating

### Symptoms
- Changed `features.config.ts`
- Menu items still show old data
- New features not appearing
- Icon/name/order not updating

### Fix Steps

1. **Sync features to manifests:**
   ```bash
   pnpm run sync:all
   ```

2. **Reset workspace menus:**
   ```typescript
   // In Convex Dashboard
   await ctx.runMutation(api.workspace.workspaces.resetWorkspace, {
     workspaceId: "workspace_id",
     mode: "replaceMenus"
   })
   ```

3. **Clear browser cache:**
   ```
   Hard refresh: Cmd+Shift+R or Ctrl+Shift+R
   Or: Developer Tools → Application → Clear Storage
   ```

4. **Verify manifest updated:**
   ```bash
   cat convex/menu/store/menu_manifest_data.ts
   # Should show updated feature data
   ```

5. **Check Convex logs:**
   - Verify `createDefaultMenuItems` succeeded
   - Look for any schema validation errors

---

## Debug Queries Reference

### Check Workspace Health

```typescript
// In Convex Dashboard Functions tab
const health = await ctx.runQuery(api.workspace.health.checkWorkspaceHealth, {
  workspaceId: "workspace_id"
})

console.log(health)
```

**Expected Output:**
```json
{
  "isHealthy": true,
  "issues": [],
  "stats": {
    "menuItems": 11,
    "roles": 6,
    "members": 1,
    "hasDefaultRole": true,
    "hasMenuSet": true
  }
}
```

**Unhealthy Workspace:**
```json
{
  "isHealthy": false,
  "issues": [
    "No menu items found",
    "Missing default role"
  ],
  "stats": {
    "menuItems": 0,
    "roles": 5,
    // ...
  }
}
```

### Check Menu Set Assignment

```typescript
const assignment = await ctx.db
  .query("workspaceMenuAssignments")
  .withIndex("by_workspace_default", q =>
    q.eq("workspaceId", workspaceId).eq("isDefault", true)
  )
  .first()

console.log(assignment)
```

**Expected:**
```json
{
  "_id": "...",
  "workspaceId": "...",
  "menuSetId": "...",
  "isDefault": true,
  "order": 0,
  "createdAt": 1234567890
}
```

### Check User Permissions

```typescript
const workspace = await ctx.runQuery(api.workspace.workspaces.getWorkspace, {
  workspaceId: "workspace_id"
})

console.log("User:", workspace.membership.userId)
console.log("Role:", workspace.role.name)
console.log("Level:", workspace.role.level)
console.log("Permissions:", workspace.role.permissions)
```

**Expected (Owner):**
```json
{
  "role": {
    "name": "Owner",
    "slug": "owner",
    "level": 0,
    "permissions": ["*"]
  }
}
```

### Check Menu Items

```typescript
const items = await ctx.runQuery(api.menu.store.menuItems.getWorkspaceMenuItems, {
  workspaceId: "workspace_id"
})

console.log("Total items:", items.length)
console.log("Slugs:", items.map(i => i.slug))
console.log("Visible:", items.filter(i => i.isVisible).length)
```

### Check for Orphaned Data

```typescript
// Check for memberships with invalid roles
const memberships = await ctx.db
  .query("workspaceMemberships")
  .withIndex("by_workspace", q => q.eq("workspaceId", workspaceId))
  .collect()

for (const m of memberships) {
  const role = await ctx.db.get(m.roleId)
  if (!role) {
    console.error("Orphaned role reference:", {
      membershipId: m._id,
      userId: m.userId,
      roleId: m.roleId
    })
  }
}
```

### Fix Workspace Issues

```typescript
// Auto-fix common issues
const result = await ctx.runMutation(api.workspace.health.fixWorkspaceIssues, {
  workspaceId: "workspace_id",
  fixMenus: true,
  fixRoles: true,
  fixMemberships: true
})

console.log(result)
// { success: true, fixed: ["menus", "roles"] }
```

### Reset Workspace (Nuclear Option)

```typescript
// Replace menus only (safe)
await ctx.runMutation(api.workspace.workspaces.resetWorkspace, {
  workspaceId: "workspace_id",
  mode: "replaceMenus"
})

// Clean and recreate everything (use with caution!)
await ctx.runMutation(api.workspace.workspaces.resetWorkspace, {
  workspaceId: "workspace_id",
  mode: "clean"
})
```

---

## Common Error Messages

### Schema Errors

```
"Object contains extra field `tags` that is not in the validator"
→ Update convex/schema.ts to include missing field
→ Run pnpm run sync:all
```

```
"Schema validation failed"
→ Run pnpm run validate:all to see specific issues
→ Fix schema mismatches
```

### Permission Errors

```
"Not authorized"
"Permission denied"
→ Check user role and permissions
→ Verify feature requiresPermission setting
→ Check membership status
```

### Menu Errors

```
"CRITICAL: Failed to create default menus"
→ Schema mismatch between config and database
→ Run resetWorkspace mutation
```

```
"No menu items found"
→ Run workspace health check
→ Auto-fix with fixWorkspaceIssues
```

### API Errors

```
"Cannot find module 'api["menu/store/menuItems"]'"
→ Use dot notation: api.menu.store.menuItems
→ Not string paths: api["menu/store/menuItems"]
```

---

## Getting Help

### Before Asking for Help

1. ✅ Check this troubleshooting guide
2. ✅ Check [AI_KNOWLEDGE_BASE.md](./3_AI_KNOWLEDGE_BASE.md)
3. ✅ Check [DEVELOPER_GUIDE.md](./2_DEVELOPER_GUIDE.md)
4. ✅ Run health check: `pnpm run check:workspaces`
5. ✅ Check Convex logs in dashboard
6. ✅ Check browser console for errors

### Include This Info When Reporting Issues

```markdown
**Environment:**
- Node version: `node -v`
- Package manager: `pnpm -v`
- Convex version: `grep convex package.json`

**Error:**
[Paste exact error message]
[Include stack trace if available]
[Include Convex logs from dashboard]

**Steps to Reproduce:**
1. Step one
2. Step two
3. Error occurs

**Expected vs Actual:**
- Expected: [what should happen]
- Actual: [what actually happens]

**Health Check:**
```typescript
const health = await ctx.runQuery(api.workspace.health.checkWorkspaceHealth, {
  workspaceId: "workspace_id"
})
console.log(health)
// [Paste output here]
```
```

---

## Issue History

| Date | Issue | Status | Fix |
|------|-------|--------|-----|
| 2025-01-18 | Schema mismatch (tags field) | ✅ Fixed | Added tags to menuItems.metadata |
| 2025-01-18 | Workspace no menus on creation | ✅ Fixed | Improved error handling in createWorkspace |
| 2025-01-18 | No health check system | ✅ Fixed | Created health check queries/mutations |
| 2025-01-19 | Features not showing in Menu Store | ✅ Documented | Sync and catalog generation guide |

---

**Last Updated:** 2025-01-19
**Maintained by:** Development Team
