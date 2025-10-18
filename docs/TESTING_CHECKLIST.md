# Testing Checklist - Feature Status System

> **Date:** 2025-01-18
> **Purpose:** End-to-end testing guide for all fixes and features
> **Status:** Ready for Testing

---

## 🎯 Testing Overview

This checklist covers:
1. ✅ Workspace bootstrap (menu creation)
2. ✅ Menu Store (optional features visible)
3. ✅ Feature installation (Reports)
4. ✅ Feature status badges
5. ✅ FeatureNotReady screens
6. ✅ Health check system

---

## 🚀 Pre-Testing Setup

### 1. Start Convex
```bash
npx convex dev
```

**Expected Output:**
```
✔ Convex functions ready! (X.XXs)
```

### 2. Verify Sync Completed
```bash
pnpm run sync:features
```

**Expected Output:**
```
✅ Validating features...
  ✓ Validated 17 features
📝 Syncing DEFAULT_MENU_ITEMS...
  ✓ Synced 11 default features
📝 Syncing optional features catalog...
  ✓ Synced 6 optional features
✨ Feature sync completed successfully!
```

### 3. Run Validations
```bash
pnpm run validate:all
```

**Expected Output:**
```
✓ Workspace payload is valid
✓ Workspace settings are valid
✓ Document payload is valid
✓ Role payload is valid
✓ Conversation payload is valid
✓ Component payload is valid  # ✅ NOW FIXED
```

---

## 📋 Test Case 1: Workspace Bootstrap

### Objective
Verify new workspaces get all default menus without errors.

### Steps
1. Open app: `http://localhost:3000`
2. Create new workspace:
   - Name: "Test Workspace"
   - Type: "Personal"
   - Click "Create"

### Expected Results

✅ **Workspace Created Successfully**
- No errors in UI
- Redirected to workspace dashboard

✅ **Check Convex Logs**
```
[createWorkspace] Default menus created successfully for workspace: xxx
```

✅ **Verify Sidebar Menus**
Should see all default menus:
- Overview
- WhatsApp (with submenu: Chats, Calls, Status, AI, Starred, Archived, Settings, Profile)
- Members
- Friends
- Pages
- Databases
- Canvas
- Menu Store
- Settings

✅ **NO Error Messages**
Should NOT see:
```
❌ createDefaultMenuItems failed; continuing
```

### If Test Fails
Run health check:
```bash
pnpm run check:workspaces
```

Or manually in Convex Dashboard:
```typescript
const health = await ctx.runQuery(api.workspace.health.checkWorkspaceHealth, {
  workspaceId: "workspace_id_here"
})
console.log(health)
```

---

## 📋 Test Case 2: Menu Store - Optional Features Visible

### Objective
Verify all 6 optional features appear in Menu Store.

### Steps
1. Navigate to Menu Store: `http://localhost:3000/dashboard/menus`
2. Click "Available Features" tab

### Expected Results

✅ **All 6 Optional Features Visible**

Should see cards for:
1. **Chat** (stable) - No badge
2. **Documents** (stable) - No badge
3. **Calendar** (development) - 🟡 Dev badge
4. **Reports** (development) - 🟡 Dev badge
5. **Tasks** (development) - 🟡 Dev badge
6. **Wiki** (development) - 🟡 Dev badge

✅ **Development Features Show Status**
Each development feature card should display:
- 🟡 "DEV" badge (yellow)
- Feature name
- Description
- "In Development - Expected: Q1/Q2 2025" message (optional)

✅ **Install Button Present**
Each feature should have an "Install" button

### If Test Fails

**Missing features?**
```bash
# Check catalog
cat convex/menu/store/optional_features_catalog.ts

# Should see all 6 features with status fields
```

**No badges?**
```bash
# Verify sync ran
pnpm run sync:features

# Check features.config.ts has status fields
cat features.config.ts | grep -A 5 "reports"
```

---

## 📋 Test Case 3: Install Reports Feature

### Objective
Test feature installation flow and verify status handling.

### Steps
1. In Menu Store → Available Features
2. Find "Reports" card (should have 🟡 Dev badge)
3. Click "Install" button
4. Wait for installation to complete

### Expected Results

✅ **Installation Succeeds**
- Success message appears
- "Reports" card moves to "Installed Features" section (or disappears from Available)

✅ **Reports Appears in Sidebar**
- New "Reports" menu item visible in sidebar
- Located near bottom (order: 100)
- Has BarChart icon

✅ **Click Reports Menu**
- Clicking "Reports" loads page
- Should see "FeatureNotReady" component (because isReady: false)

### If Test Fails

**Installation fails?**
Check Convex logs for errors. Verify RBAC permissions:
```typescript
// User must have MANAGE_MENUS permission
const workspace = await ctx.runQuery(api.workspace.workspaces.getWorkspace, {
  workspaceId
})
console.log("User role:", workspace.role)
console.log("Permissions:", workspace.role.permissions)
```

**Reports not in sidebar?**
```bash
# Check if menu item was created
# In Convex Dashboard:
const items = await ctx.db
  .query("menuItems")
  .withIndex("by_workspace", q => q.eq("workspaceId", workspaceId))
  .collect()
console.log("Reports menu:", items.find(i => i.slug === "reports"))
```

---

## 📋 Test Case 4: FeatureNotReady Screen

### Objective
Verify professional "under development" screen displays correctly.

### Steps
1. With Reports installed, click "Reports" in sidebar
2. Observe the page content

### Expected Results

✅ **FeatureNotReady Component Displays**

Should see:
```
┌────────────────────────────────────────┐
│  🚧  Reports                           │
│      Slug: reports          [DEV]      │
├────────────────────────────────────────┤
│                                        │
│  ⚠️  Feature in Development            │
│  The Reports feature is currently      │
│  under development. Core functionality │
│  is being built.                       │
│                                        │
│  Expected Release: Q1 2025             │
│                                        │
│  📋 Development Status                 │
│  • Backend API endpoints incomplete    │
│  • UI components being refined         │
│  • Features may change                 │
│                                        │
│  [Go Back]  [View Docs]  [Report]     │
│                                        │
└────────────────────────────────────────┘
```

✅ **Interactive Elements Work**
- [Go Back] button → navigates back
- [View Docs] button → opens docs (may 404 if not created)
- [Report Issue] button → opens GitHub issues

✅ **Badge Displayed**
- 🟡 "DEV" badge visible
- Yellow color scheme

### If Test Fails

**Shows blank page?**
- Check browser console for errors
- Verify FeatureNotReady component imported correctly
- Check ReportsPage.tsx has status check logic

**Shows error instead?**
```typescript
// Check menu item has metadata
const menuItem = await ctx.runQuery(
  api.menu.store.menuItems.getMenuItemBySlug,
  { workspaceId, slug: "reports" }
)
console.log("Menu item metadata:", menuItem?.metadata)
// Should have: status, isReady, expectedRelease
```

---

## 📋 Test Case 5: Feature Badge in Menu Store

### Objective
Verify badges display correctly in Menu Store catalog.

### Steps
1. Go to Menu Store → Available Features
2. Locate development features (Calendar, Reports, Tasks, Wiki)

### Expected Results

✅ **Badges Display on Development Features**
- Calendar: 🟡 "DEV" badge
- Reports: 🟡 "DEV" badge
- Tasks: 🟡 "DEV" badge
- Wiki: 🟡 "DEV" badge

✅ **No Badges on Stable Features**
- Chat: No badge
- Documents: No badge

✅ **Badge Tooltips Work** (if implemented)
- Hover over badge
- Tooltip appears: "This feature is under active development"

### If Test Fails

**No badges showing?**
1. Check optional_features_catalog.ts has status fields
2. Verify Menu Store component uses FeatureBadge
3. Check CSS isn't hiding badges

---

## 📋 Test Case 6: Health Check System

### Objective
Verify health check queries and CLI tools work.

### Steps

#### A. Via CLI
```bash
pnpm run check:workspaces
```

**Expected Output:**
```
🔍 Checking workspace health...
⚠️  Note: This script requires authentication
✅ Health check structure created

📋 Health Check Categories:
  ✅ Menu Items - Ensures workspace has navigation
  ✅ Menu Set Assignment - Ensures default menu set exists
  ✅ Default Role - Ensures new members get a role
  ✅ Role Permissions - Ensures roles have valid permissions
```

#### B. Via Convex Dashboard
```typescript
// 1. Check specific workspace
const health = await ctx.runQuery(api.workspace.health.checkWorkspaceHealth, {
  workspaceId: "workspace_id_here"
})

console.log("Healthy?", health.isHealthy)
console.log("Issues:", health.issues)
console.log("Stats:", health.stats)
```

**Expected Output:**
```javascript
{
  isHealthy: true,
  issues: [],
  stats: {
    menuItems: 12,
    roles: 6,
    members: 1,
    hasDefaultRole: true,
    hasMenuSet: true
  }
}
```

#### C. Check All Workspaces
```typescript
const allHealth = await ctx.runQuery(api.workspace.health.checkAllWorkspacesHealth, {})

console.log("All workspaces:", allHealth)
```

#### D. Auto-Fix Issues
```typescript
const result = await ctx.runMutation(api.workspace.health.fixWorkspaceIssues, {
  workspaceId: "workspace_id_here",
  fixMenus: true,
  fixRoles: true
})

console.log("Fixed:", result.fixed)
console.log("Failed:", result.failed)
```

### Expected Results

✅ **Health Check Runs Without Errors**
✅ **Accurate Diagnosis**
- Correctly identifies missing menus
- Correctly identifies missing roles
- Shows proper statistics

✅ **Auto-Fix Works**
- Fixes broken workspaces
- Returns detailed results

---

## 📋 Test Case 7: Change Feature from Development to Stable

### Objective
Verify workflow for promoting a feature to stable status.

### Steps

1. **Edit features.config.ts**
```typescript
{
  slug: "reports",
  // ... other fields

  // Change these:
  status: "stable",   // was: "development"
  isReady: true,      // was: false
  // Remove: expectedRelease
}
```

2. **Run Sync**
```bash
pnpm run sync:features
```

3. **Reinstall Feature** (or wait for existing to update)
```typescript
// Uninstall
await ctx.runMutation(api.menu.store.menuItems.uninstallFeature, {
  workspaceId,
  featureSlug: "reports"
})

// Reinstall
await ctx.runMutation(api.menu.store.menuItems.installFeatureMenus, {
  workspaceId,
  featureSlugs: ["reports"]
})
```

4. **Click Reports Menu**

### Expected Results

✅ **Badge Removed**
- No more 🟡 "DEV" badge

✅ **FeatureNotReady Screen Gone**
- Shows actual Reports page
- No "under development" message

✅ **Feature Fully Functional**
- Can use Reports feature normally

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot read properties of undefined (reading '_zod')"

**Solution:**
```typescript
// Was:
propsSchema: z.record(z.any()).optional()

// Fixed:
propsSchema: z.record(z.string(), z.any()).optional()
```

Already fixed in `scripts/validate-component.ts`.

---

### Issue: Reports page shows blank/white screen

**Possible Causes:**
1. Missing FeatureNotReady component
2. Import error
3. Component not registered in manifest

**Debug:**
```bash
# Check file exists
ls frontend/shared/components/FeatureNotReady.tsx

# Check manifest has Reports
grep -A 5 "reports" frontend/shared/pages/manifest.tsx
```

---

### Issue: Status badges not showing

**Check:**
1. Run sync: `pnpm run sync:features`
2. Verify catalog has status fields:
   ```bash
   cat convex/menu/store/optional_features_catalog.ts | grep -A 5 "status"
   ```
3. Check FeatureBadge component imported

---

## ✅ Final Checklist

Before marking as COMPLETE, verify:

- [ ] ✅ New workspace creates with all menus
- [ ] ✅ Menu Store shows all 6 optional features
- [ ] ✅ Development features show 🟡 Dev badge
- [ ] ✅ Stable features show no badge
- [ ] ✅ Can install Reports feature
- [ ] ✅ Reports shows FeatureNotReady screen
- [ ] ✅ FeatureNotReady screen is professional
- [ ] ✅ Expected release date shown
- [ ] ✅ Go Back button works
- [ ] ✅ Health check system works
- [ ] ✅ validate:all passes
- [ ] ✅ No errors in Convex logs
- [ ] ✅ No errors in browser console

---

## 📊 Success Criteria

**All tests pass:** ✅ System is production-ready
**Some tests fail:** 🟡 Review failed tests, fix issues
**Many tests fail:** 🔴 Need debugging session

---

**Last Updated:** 2025-01-18
**Tester:** [Your Name]
**Environment:** Local Development
