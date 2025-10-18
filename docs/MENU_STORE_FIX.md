# Menu Store Fix - Optional Features Not Appearing

> **Date:** 2025-01-18
> **Issue:** Reports and other optional features not showing in Menu Store
> **Status:** ✅ FIXED

---

## 🐛 Problem

**Symptoms:**
- Navigate to `/dashboard/menus` (Menu Store)
- Click "Available Features" tab
- Optional features like "Reports", "Calendar", "Tasks", "Wiki" NOT showing
- Only seeing hardcoded features (chat, documents, canvas, members, friends, menus, invitations)

**Root Cause:**
The `getAvailableFeatureMenus` query in [convex/menu/store/menuItems.ts](../convex/menu/store/menuItems.ts) was using **hardcoded features** instead of reading from `OPTIONAL_FEATURES_CATALOG`.

---

## 🔍 Investigation

### What We Found:

1. ✅ **features.config.ts** - Correctly defined optional features:
   ```typescript
   {
     slug: "reports",
     featureType: "optional",
     // ...
   }
   ```

2. ✅ **OPTIONAL_FEATURES_CATALOG** - Auto-generated correctly by `sync:features`:
   ```typescript
   // convex/menu/store/optional_features_catalog.ts
   export const OPTIONAL_FEATURES_CATALOG = [
     { slug: "chat", ... },
     { slug: "documents", ... },
     { slug: "calendar", ... },
     { slug: "reports", ... },  // ✅ Present
     { slug: "tasks", ... },
     { slug: "wiki", ... }
   ]
   ```

3. ❌ **getAvailableFeatureMenus** - Using hardcoded list:
   ```typescript
   // OLD CODE (BROKEN)
   const availableFeatures = [
     { slug: "chat", name: "Chat", ... },
     { slug: "documents", name: "Documents", ... },
     // ... hardcoded list missing "reports", "tasks", "wiki", "calendar"
   ]
   ```

4. ❌ **installFeatureMenus** - Also using hardcoded list

---

## ✅ Fix Applied

### Fix #1: Import OPTIONAL_FEATURES_CATALOG

```typescript
// convex/menu/store/menuItems.ts
import { DEFAULT_MENU_ITEMS } from "./menu_manifest_data"
import { OPTIONAL_FEATURES_CATALOG } from "./optional_features_catalog" // ✅ Added
```

### Fix #2: Update getAvailableFeatureMenus

```typescript
// BEFORE (HARDCODED)
const availableFeatures = [
  { slug: "chat", name: "Chat", ... },
  // ... hardcoded list
]

// AFTER (DYNAMIC)
const availableFeatures = OPTIONAL_FEATURES_CATALOG.map((feature) => ({
  slug: feature.slug,
  name: feature.name,
  description: feature.description,
  icon: feature.icon,
  version: feature.version,
  category: feature.category,
}))

return availableFeatures.filter((feature) => !installedSlugs.has(feature.slug))
```

### Fix #3: Update installFeatureMenus

```typescript
// Build available features from OPTIONAL_FEATURES_CATALOG
// Map catalog features to full menu item definitions
const availableFeatures = OPTIONAL_FEATURES_CATALOG.map((catalogFeature) => {
  // Try to find in DEFAULT_MENU_ITEMS for full definition
  const defaultFeature = DEFAULT_MENU_ITEMS.find((d) => d.slug === catalogFeature.slug)

  if (defaultFeature) {
    // Use default feature but mark as optional
    return {
      name: defaultFeature.name,
      slug: defaultFeature.slug,
      type: defaultFeature.type,
      icon: defaultFeature.icon,
      path: defaultFeature.path,
      component: defaultFeature.component,
      order: defaultFeature.order,
      version: catalogFeature.version,
      metadata: {
        description: catalogFeature.description,
        version: catalogFeature.version,
        category: catalogFeature.category,
        tags: catalogFeature.tags,
        lastUpdated: Date.now(),
      },
      requiresPermission: catalogFeature.requiresPermission,
    }
  } else {
    // Derive from catalog (for truly optional features)
    return {
      name: catalogFeature.name,
      slug: catalogFeature.slug,
      type: "route" as const,
      icon: catalogFeature.icon,
      path: `/dashboard/${catalogFeature.slug}`,
      component: `${catalogFeature.name.replace(/\s+/g, '')}Page`,
      order: 100,
      version: catalogFeature.version,
      metadata: { ... },
      requiresPermission: catalogFeature.requiresPermission,
    }
  }
})
```

**Benefits:**
- ✅ Automatically includes ALL optional features from `features.config.ts`
- ✅ Single source of truth via `OPTIONAL_FEATURES_CATALOG`
- ✅ No more manual updates needed
- ✅ New optional features automatically appear after `pnpm run sync:features`

---

## 🧪 Testing

### Test Case 1: Check Available Features

```typescript
// In Convex Dashboard or app
const available = await ctx.runQuery(api.menu.store.menuItems.getAvailableFeatureMenus, {
  workspaceId: "your_workspace_id"
})

console.log("Available features:", available.map(f => f.slug))
// Expected: ["chat", "documents", "calendar", "reports", "tasks", "wiki"]
// (minus any already installed)
```

### Test Case 2: Install Reports Feature

**Via UI:**
1. Navigate to `/dashboard/menus`
2. Click "Available Features" tab
3. Find "Reports" card
4. Click "Install" button
5. Verify "Reports" appears in sidebar

**Via Convex:**
```typescript
const result = await ctx.runMutation(api.menu.store.menuItems.installFeatureMenus, {
  workspaceId: "workspace_id",
  featureSlugs: ["reports"]
})

console.log("Installed menu IDs:", result)
```

### Test Case 3: Verify Reports in Sidebar

```typescript
const menuItems = await ctx.runQuery(api.menu.store.menuItems.getWorkspaceMenuItems, {
  workspaceId: "workspace_id"
})

const reportsMenu = menuItems.find(m => m.slug === "reports")
console.log("Reports menu:", reportsMenu)
// Should be present after installation
```

---

## 📊 Impact

### Before Fix:
- Available optional features: **7** (hardcoded)
- Missing from Menu Store: **Reports, Calendar, Tasks, Wiki**
- Manual updates required for new features

### After Fix:
- Available optional features: **6** (all from catalog)
- All optional features from `features.config.ts` automatically available
- Zero maintenance - auto-synced via `pnpm run sync:features`

---

## 🎯 How to Add New Optional Features

### Step 1: Add to features.config.ts

```typescript
// features.config.ts
{
  slug: "analytics",
  name: "Analytics",
  description: "Advanced analytics dashboard",
  featureType: "optional",  // ← Key: mark as optional
  category: "analytics",
  icon: "TrendingUp",
  path: "/dashboard/analytics",
  component: "AnalyticsPage",
  order: 15,
  type: "route",
  version: "1.0.0",
  hasUI: true,
  hasConvex: true,
  hasTests: true,
}
```

### Step 2: Run Sync

```bash
pnpm run sync:features
```

This auto-generates:
- `convex/menu/store/optional_features_catalog.ts` (updated)
- `convex/menu/store/menu_manifest_data.ts` (if default feature)

### Step 3: Verify

```bash
# Check catalog
cat convex/menu/store/optional_features_catalog.ts | grep analytics

# Test in app
# Navigate to /dashboard/menus → Available Features
# "Analytics" should now appear
```

**That's it!** No code changes needed.

---

## 🔄 Data Flow

```
features.config.ts
    ↓ (pnpm run sync:features)
optional_features_catalog.ts
    ↓ (imported by)
menuItems.ts (getAvailableFeatureMenus)
    ↓ (called by)
Frontend MenuStore component
    ↓ (displays)
Available Features tab in UI
```

---

## 📝 Related Files

| File | Purpose | Auto-generated? |
|------|---------|-----------------|
| [features.config.ts](../features.config.ts) | Single source of truth | ❌ Manual |
| [optional_features_catalog.ts](../convex/menu/store/optional_features_catalog.ts) | Optional features list | ✅ Auto |
| [menuItems.ts](../convex/menu/store/menuItems.ts) | Menu CRUD + install logic | ❌ Manual |
| [MenuStore.tsx](../frontend/shared/pages/static/menus/components/MenuStore.tsx) | UI component | ❌ Manual |

---

## 🚀 Next Steps

### Immediate:
1. ✅ Test in browser: `/dashboard/menus` → Available Features
2. ✅ Install "Reports" feature
3. ✅ Verify sidebar shows "Reports"

### Short Term:
1. Implement Reports feature UI ([frontend/features/reports/](../frontend/features/reports/))
2. Implement Reports backend ([convex/features/reports/](../convex/features/reports/))
3. Add tests for Reports

### Long Term:
1. Add Calendar, Tasks, Wiki features
2. Build feature marketplace (external features)
3. Add feature dependencies/requirements

---

## 🔗 References

- [FEATURE_STATUS.md](./FEATURE_STATUS.md) - Overall project status
- [KNOWLEDGE_BASE.md](./KNOWLEDGE_BASE.md) - Quick reference
- [Feature System Diagram](./feature-system-diagram.md) - Visual architecture

---

**Last Updated:** 2025-01-18
**Fixed By:** Claude Code Assistant
