# Feature Validation & Error Handling Setup

## ✅ Completed Enhancements

### 1. **Feature Sync & Catalog**
Updated 6 implemented optional features from "development" to "stable" status:
- ✅ Reports
- ✅ Support
- ✅ Projects
- ✅ CRM
- ✅ Notifications
- ✅ Workflows

**Result:** Menu Store now shows 9 installable features (up from 4)

### 2. **Activity Events Schema Fix**
**Problem:** Installation failed with schema validation error:
```
Object contains extra field `featureType` that is not in the validator.
Path: .diff
```

**Solution:** Changed `activityEvents.diff` from `v.object({})` to `v.any()` in:
- `convex/features/activity/api/schema.ts`

This allows flexible audit logging for different action types.

### 3. **Page Validation Script**
Created `scripts/validate-features-pages.ts` to validate that all features have corresponding page files.

**Usage:**
```bash
pnpm run validate:pages
```

**Reports:**
- ✅ Existing pages count
- ❌ Missing pages (critical vs optional)
- 📁 Stats by feature type
- 📝 Detailed paths for missing files

**Current Status:**
- ✅ All 15 default features have pages
- ✅ All 3 system features have pages
- ⚠️  6/9 optional features have pages
- Missing (in development): Calendar, Tasks, Wiki

### 4. **Enhanced Error Handling**
Created `frontend/views/AppContentWrapper.tsx` with:

**Error Boundary:**
- Catches page load failures (missing files, compilation errors)
- Shows user-friendly error message
- Displays technical details in collapsible section
- Provides "Go to Dashboard" recovery button

**Suspense Boundary:**
- Shows loading spinner while page chunks load
- Prevents flash of incomplete UI

**Updated:** `app/dashboard/[[...slug]]/page.tsx` to use `AppContentWrapper`

## 🔧 Validation Commands

### Feature Validation
```bash
# Validate all features configuration
pnpm run validate:features

# Validate page files exist
pnpm run validate:pages

# Sync features to catalog
pnpm run sync:features

# Generate page manifest
pnpm run generate:manifest

# Run all syncs
pnpm run sync:all

# Run all validations
pnpm run validate:all
```

### Development Workflow
```bash
# 1. Add/update feature in features.config.ts
# 2. Run sync to update catalog and manifest
pnpm run sync:all

# 3. Validate everything
pnpm run validate:pages

# 4. Deploy Convex schema if needed
npx convex dev --once
```

## 📊 Current Feature Status

### Default Features (15/15) ✅
All implemented and accessible:
- Overview, Chats, Calls, Status, AI
- Starred, Archived, Profile, Members, Friends
- Pages, Databases, Canvas, Documents, User Settings

### System Features (3/3) ✅
- Menus (Menu Store)
- Invitations
- Workspace Settings

### Optional Features (9 total)

**Ready to Install (6):**
- 📊 Reports
- 🎧 Support
- 📁 Projects
- 👥 CRM
- 🔔 Notifications
- ⚙️ Workflows

**In Development (3):**
- 📅 Calendar (Q1 2025)
- ✅ Tasks (Q2 2025)
- 📖 Wiki (Q2 2025)

## 🐛 Troubleshooting

### Page Shows "Not Found" After Installation

**Symptoms:**
- Feature installs successfully in Menu Store
- Appears in navigation menu
- But shows "Page Not Found" when clicked

**Causes & Solutions:**

1. **Page file doesn't exist**
   ```bash
   # Run validation to check
   pnpm run validate:pages

   # Create missing page at expected path
   # See validation output for path
   ```

2. **Manifest not regenerated**
   ```bash
   # Regenerate manifest after adding page files
   pnpm run generate:manifest
   ```

3. **Lazy import path incorrect**
   - Check `frontend/views/manifest.tsx`
   - Ensure path matches actual file location
   - Regenerate manifest if paths changed

4. **Component has compilation error**
   - Error boundary will show technical details
   - Check browser console for import errors
   - Fix component syntax/imports

### Feature Not Showing in Menu Store

**Check:**
1. Is feature marked as `featureType: "optional"` in `features.config.ts`?
2. Is feature marked as `isReady: true`?
3. Did you run `pnpm run sync:features`?
4. Check `convex/menu/store/optional_features_catalog.ts` - is it there?

### Activity Events Insert Error

**Symptoms:**
```
Failed to insert document in table "activityEvents"
Object contains extra field...
```

**Solution:**
Ensure `convex/features/activity/api/schema.ts` has:
```typescript
diff: v.optional(v.any())  // Not v.object({})
```

## 📝 Adding a New Optional Feature

### Step 1: Add to features.config.ts
```typescript
{
  slug: "my-feature",
  name: "My Feature",
  description: "Description here",
  featureType: "optional",
  category: "productivity",
  icon: "Icon",
  path: "/dashboard/my-feature",
  component: "MyFeaturePage",
  order: 20,
  type: "route",
  version: "1.0.0",
  hasUI: true,
  hasConvex: true,
  hasTests: true,
  tags: ["tag1", "tag2"],
  status: "stable",      // or "development"
  isReady: true,         // or false if not ready
}
```

### Step 2: Create Page Component
```bash
# Create page file
mkdir -p frontend/features/my-feature
touch frontend/features/my-feature/page.tsx
```

### Step 3: Implement Component
```typescript
"use client";
import { Id } from "@convex/_generated/dataModel";

export interface MyFeaturePageProps {
  workspaceId: Id<"workspaces"> | null;
}

export default function MyFeaturePage({ workspaceId }: MyFeaturePageProps) {
  // Your implementation here
  return <div>My Feature Content</div>
}
```

### Step 4: Sync & Validate
```bash
# Sync features to catalog and manifest
pnpm run sync:all

# Validate everything works
pnpm run validate:pages

# Deploy Convex if needed
npx convex dev --once
```

### Step 5: Test Installation
1. Go to `/dashboard/menus`
2. Click "Available Features" tab
3. Find your feature in the list
4. Click "Install"
5. Navigate to `/dashboard/my-feature` to verify

## 🎯 Best Practices

### Before Marking Feature as Ready
- ✅ Page component implemented
- ✅ Basic UI functional
- ✅ Error states handled
- ✅ Convex queries/mutations working
- ✅ Validated with `pnpm run validate:pages`

### Feature Status Guidelines
- `status: "development", isReady: false` - Feature in progress, page may not exist
- `status: "beta", isReady: true` - Feature works but may have bugs
- `status: "stable", isReady: true` - Feature fully implemented and tested

### Catalog Management
- Keep `features.config.ts` as single source of truth
- Always run `pnpm run sync:all` after changes
- Never manually edit generated files:
  - `convex/menu/store/menu_manifest_data.ts`
  - `convex/menu/store/optional_features_catalog.ts`
  - `frontend/views/manifest.tsx`

## 🔍 Architecture Overview

```
features.config.ts (Source of Truth)
    ↓
[pnpm run sync:features]
    ↓
convex/menu/store/optional_features_catalog.ts
    ↓
[Menu Store queries this catalog]
    ↓
[User installs feature]
    ↓
[menuItems table gets new row]
    ↓
[Navigation shows menu item]
    ↓
[User clicks menu item]
    ↓
frontend/views/manifest.tsx (maps slug → component)
    ↓
[AppContentWrapper error boundary]
    ↓
[Lazy load page component]
    ↓
[Render feature page]
```

## 📚 Related Files

### Configuration
- `features.config.ts` - All feature definitions
- `package.json` - Validation scripts

### Generated Files (Auto-generated, don't edit)
- `convex/menu/store/menu_manifest_data.ts`
- `convex/menu/store/optional_features_catalog.ts`
- `frontend/views/manifest.tsx`

### Validation Scripts
- `scripts/validate-features.ts` - Validates feature config
- `scripts/validate-features-pages.ts` - Validates page files exist
- `scripts/sync-features.ts` - Syncs config to catalog
- `scripts/generate-manifest.ts` - Generates page manifest

### Runtime Components
- `app/dashboard/[[...slug]]/page.tsx` - Main catch-all route
- `frontend/views/AppContentWrapper.tsx` - Error boundary wrapper
- `frontend/views/manifest.tsx` - Page component registry

### Convex
- `convex/menu/store/menuItems.ts` - Installation logic
- `convex/features/activity/api/schema.ts` - Activity audit schema

## 🚀 Next Steps

1. **Test CRM page rendering** - Refresh browser and check if error boundary shows helpful message
2. **Create pages for in-development features** - Calendar, Tasks, Wiki placeholder pages
3. **Add feature-specific validation** - Extend validation script to check for required Convex functions
4. **Enhance error messages** - Add suggestions based on specific error types
5. **Add rollback capability** - Allow uninstalling features from Menu Store

---

**Last Updated:** 2025-01-20
**Status:** ✅ Validation system operational
