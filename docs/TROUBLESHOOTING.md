# Troubleshooting Guide

> **Purpose:** Solutions to common SuperSpace issues
> **Last Updated:** 2025-01-18

---

## 🚨 Critical Issues

### Issue #1: New Workspace Has No Menus

**Symptoms:**
- Create new workspace successfully
- Workspace loads but sidebar is empty
- No navigation menu items visible
- Console shows: `createDefaultMenuItems failed`

**Root Cause:**
Schema mismatch between `features.config.ts` and `convex/schema.ts`. The `menuItems.metadata` field was missing the `tags` property.

**Error in Logs:**
```
Uncaught Error: Failed to insert or update a document in table "menuItems"
because it does not match the schema: Object contains extra field `tags`
that is not in the validator.
```

**Fix Applied (2025-01-18):**

1. ✅ **Schema Updated:** Added `tags: v.optional(v.array(v.string()))` to `convex/schema.ts:168`
2. ✅ **Error Logging Improved:** Better error messages in `convex/workspace/workspaces.ts:506-514`
3. ✅ **Health Check Created:** New health check system to detect issues

**Recovery for Existing Broken Workspaces:**

**Option A: Via Convex Dashboard (Recommended)**
```typescript
// In Convex Dashboard Functions tab, run:
await ctx.runMutation(api.workspace.workspaces.resetWorkspace, {
  workspaceId: "your_workspace_id_here",
  mode: "replaceMenus"
})
```

**Option B: Via Health Check Script**
```bash
# Check all workspaces
pnpm run check:workspaces

# Auto-fix issues
pnpm run check:workspaces:fix
```

**Option C: Via Health Check Query**
```typescript
// 1. Check workspace health
const health = await ctx.runQuery(api.workspace.health.checkWorkspaceHealth, {
  workspaceId: "workspace_id"
})
console.log(health)

// 2. Fix issues automatically
const result = await ctx.runMutation(api.workspace.health.fixWorkspaceIssues, {
  workspaceId: "workspace_id",
  fixMenus: true,
  fixRoles: true
})
console.log(result)
```

**Prevention:**
- Always run `pnpm run validate:all` before deploying
- Monitor Convex logs for "CRITICAL: Failed to create default menus"
- Run health checks weekly: `pnpm run check:workspaces`

---

### Issue #2: Permission Denied Errors

**Symptoms:**
- User can access workspace but gets "Not authorized" on certain pages
- Features show in menu but throw errors when clicked
- Console shows: `Permission denied` or `Not authorized`

**Common Causes:**

**1. User's Role Missing Required Permission**

Check user's role and permissions:
```typescript
// In Convex Dashboard
const workspace = await ctx.runQuery(api.workspace.workspaces.getWorkspace, {
  workspaceId: "workspace_id"
})
console.log("User role:", workspace.role)
console.log("Permissions:", workspace.role.permissions)
```

**Fix:**
```typescript
// Add permission to role
await ctx.runMutation(api.workspace.roles.updateRole, {
  roleId: "role_id",
  permissions: ["VIEW_WORKSPACE", "VIEW_REPORTS", /* add more */]
})
```

**2. Feature's `requiresPermission` Too Restrictive**

Check feature config in `features.config.ts`:
```typescript
{
  slug: "reports",
  requiresPermission: "MANAGE_REPORTS", // ❌ Too restrictive
  // Should be:
  requiresPermission: "VIEW_REPORTS", // ✅ Correct
}
```

**3. Inactive Membership**

Check membership status:
```typescript
const membership = await ctx.db
  .query("workspaceMemberships")
  .withIndex("by_user_workspace", q =>
    q.eq("userId", userId).eq("workspaceId", workspaceId)
  )
  .first()

console.log("Membership status:", membership?.status)
// Should be "active"
```

**Fix:**
```typescript
// Reactivate membership
await ctx.runMutation(api.workspace.workspaces.addMember, {
  workspaceId: "workspace_id",
  userId: "user_id",
  roleId: "role_id"
})
```

---

### Issue #3: Feature Not Showing in Menu Store

**Symptoms:**
- Created optional feature
- Ran `pnpm run sync:features`
- Feature doesn't appear in Menu Store

**Checklist:**

1. ✅ **Feature is `type: "optional"`?**
```typescript
// In features.config.ts
{
  slug: "reports",
  type: "optional", // ✅ Correct
  // NOT:
  type: "default", // ❌ Wrong - will auto-install
}
```

2. ✅ **Ran sync command?**
```bash
pnpm run sync:features
```

3. ✅ **Optional catalog exists?**
```bash
ls convex/menu/store/optional_features_catalog.ts
```

4. ✅ **Feature not already installed?**
```typescript
// Check if already installed
const items = await ctx.runQuery(api.menu.store.menuItems.getWorkspaceMenuItems, {
  workspaceId: "workspace_id"
})
console.log("Installed slugs:", items.map(i => i.slug))
```

**Fix:**
```bash
# Regenerate catalogs
pnpm run sync:features

# Verify
cat convex/menu/store/optional_features_catalog.ts
```

---

## ⚠️ Common Issues

### Tests Failing After Schema Changes

**Symptoms:**
- Tests pass locally but fail in CI
- Error: `Type mismatch` or `Schema validation failed`

**Fix:**
```bash
# 1. Regenerate Convex types
npx convex dev --once

# 2. Clear test cache
pnpm test --clearCache

# 3. Run tests
pnpm test
```

---

### TypeScript Errors After Adding Feature

**Symptoms:**
- `Cannot find module 'frontend/features/xyz'`
- `Property does not exist on type`

**Fix:**
```bash
# 1. Restart TypeScript server in VS Code
# Cmd+Shift+P → "TypeScript: Restart TS Server"

# 2. Re-run typecheck
pnpm run typecheck

# 3. Check imports
# Make sure feature exports in index.ts:
// frontend/features/xyz/index.ts
export { XyzPage } from './views/XyzPage'
export { useXyz } from './hooks/useXyz'
export type { XyzType } from './types'
```

---

### Convex Functions Not Updating

**Symptoms:**
- Changed Convex function code
- Changes not reflected in app
- Old version still running

**Fix:**
```bash
# 1. Stop Convex dev server (Ctrl+C)

# 2. Clear .convex folder (optional)
rm -rf .convex

# 3. Restart
npx convex dev

# 4. Hard refresh browser (Cmd+Shift+R)
```

---

### Menu Items Not Updating After Config Change

**Symptoms:**
- Changed `features.config.ts`
- Menu items still show old data

**Fix:**
```bash
# 1. Sync features
pnpm run sync:features

# 2. Reset workspace menus
# In Convex Dashboard:
await ctx.runMutation(api.workspace.workspaces.resetWorkspace, {
  workspaceId: "workspace_id",
  mode: "replaceMenus"
})

# 3. Hard refresh browser
```

---

## 🔍 Debugging Techniques

### Check Workspace Health

```typescript
// In Convex Dashboard
const health = await ctx.runQuery(api.workspace.health.checkWorkspaceHealth, {
  workspaceId: "workspace_id"
})

console.log("Health:", health.isHealthy)
console.log("Issues:", health.issues)
console.log("Stats:", health.stats)
```

**Expected Output:**
```json
{
  "isHealthy": true,
  "issues": [],
  "stats": {
    "menuItems": 12,
    "roles": 6,
    "members": 1,
    "hasDefaultRole": true,
    "hasMenuSet": true
  }
}
```

---

### Check Menu Set Assignment

```typescript
// In Convex Dashboard
const assignment = await ctx.db
  .query("workspaceMenuAssignments")
  .withIndex("by_workspace_default", q =>
    q.eq("workspaceId", workspaceId).eq("isDefault", true)
  )
  .first()

console.log("Menu set assignment:", assignment)
```

**Expected:**
```json
{
  "_id": "...",
  "workspaceId": "...",
  "menuSetId": "...",
  "isDefault": true,
  "order": 0
}
```

---

### Check User Permissions

```typescript
// In Convex Dashboard
const workspace = await ctx.runQuery(api.workspace.workspaces.getWorkspace, {
  workspaceId: "workspace_id"
})

console.log("User:", workspace.membership.userId)
console.log("Role:", workspace.role.name)
console.log("Permissions:", workspace.role.permissions)
```

**Expected Permissions:**
```json
{
  "role": {
    "name": "Owner",
    "permissions": ["*"] // Owner has all permissions
  }
}
```

---

### Inspect Menu Items

```typescript
// In Convex Dashboard
const items = await ctx.runQuery(api.menu.store.menuItems.getWorkspaceMenuItems, {
  workspaceId: "workspace_id"
})

console.log("Menu items count:", items.length)
console.log("Slugs:", items.map(i => i.slug))
console.log("Visible:", items.filter(i => i.isVisible).length)
```

---

### Check Database Integrity

```typescript
// Check for orphaned references
const memberships = await ctx.db
  .query("workspaceMemberships")
  .withIndex("by_workspace", q => q.eq("workspaceId", workspaceId))
  .collect()

for (const m of memberships) {
  const role = await ctx.db.get(m.roleId)
  if (!role) {
    console.error("Orphaned role reference:", m.roleId)
  }
}
```

---

## 🛠️ Tools & Scripts

### Health Check Script

```bash
# Check all workspaces for issues
pnpm run check:workspaces

# Auto-fix detected issues
pnpm run check:workspaces:fix
```

### Workspace Reset

```typescript
// Reset menus only
await ctx.runMutation(api.workspace.workspaces.resetWorkspace, {
  workspaceId: "workspace_id",
  mode: "replaceMenus"
})

// Clean and recreate everything
await ctx.runMutation(api.workspace.workspaces.resetWorkspace, {
  workspaceId: "workspace_id",
  mode: "clean"
})
```

### Bulk Migration

```typescript
// Fix ALL broken workspaces (use with caution!)
const result = await ctx.runMutation(api.workspace.health.migrateAllBrokenWorkspaces, {})

console.log("Total workspaces:", result.total)
console.log("Fixed:", result.fixed)
console.log("Failed:", result.failed)
console.log("Details:", result.details)
```

---

## 📞 Getting Help

### Before Asking for Help

1. ✅ Check this troubleshooting guide
2. ✅ Check [FEATURE_STATUS.md](./FEATURE_STATUS.md) for known issues
3. ✅ Run health check: `pnpm run check:workspaces`
4. ✅ Check Convex logs for errors
5. ✅ Check browser console for errors

### Include This Info

When reporting issues:
```markdown
**Environment:**
- Node version: `node -v`
- Package manager: `pnpm -v`
- Convex version: `cat package.json | grep convex`

**Error:**
- Error message (exact text)
- Stack trace (if available)
- Convex logs (from dashboard)

**Steps to Reproduce:**
1. Step 1
2. Step 2
3. Error occurs

**Expected vs Actual:**
- Expected: [what should happen]
- Actual: [what actually happens]

**Health Check:**
```typescript
// Paste output from:
const health = await ctx.runQuery(api.workspace.health.checkWorkspaceHealth, {
  workspaceId: "workspace_id"
})
```
```

---

## 🔄 Version History

| Date | Issue | Status | Fix |
|------|-------|--------|-----|
| 2025-01-18 | Schema mismatch (tags field) | ✅ Fixed | Added tags to schema |
| 2025-01-18 | Workspace no menus | ✅ Fixed | Improved error handling |
| 2025-01-18 | No health checks | ✅ Fixed | Created health check system |

---

**Last Updated:** 2025-01-18
**Maintained by:** Development Team
