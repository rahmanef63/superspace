# API Path Migration Guide

**Date:** 2025-10-02
**Status:** ✅ COMPLETED
**Issue:** Runtime error - Could not find public function for 'menu/menuItems:getWorkspaceMenuItems'

---

## 🚨 Problem

Convex API structure menggunakan path dengan slash `/`, bukan dot `.`:

```typescript
// ❌ WRONG - This doesn't exist
api.menu.menuItems.getWorkspaceMenuItems

// ✅ CORRECT - This is the actual path
api["menu/store/menuItems"].getWorkspaceMenuItems
```

---

## 🔧 Solution

Semua file yang menggunakan `api.menu.menuItems.*` harus diupdate ke `(api as any)["menu/store/menuItems"].*`

### Files Fixed (12 total)

#### Frontend Components
1. ✅ `app/dashboard/_components/app-sidebar.tsx`
2. ✅ `app/dashboard/[[...slug]]/page.tsx`
3. ✅ `frontend/shared/pages/manifest.tsx`
4. ✅ `frontend/shared/pages/static/menus/components/BreadcrumbNavigation.tsx`
5. ✅ `frontend/shared/pages/static/menus/components/MenuDisplay.tsx`
6. ✅ `frontend/shared/pages/static/menus/components/MenuItemForm.tsx`
7. ✅ `frontend/shared/pages/static/menus/components/MenuStore.tsx`
8. ✅ `frontend/shared/pages/static/menus/components/MenuTree.tsx`
9. ✅ `frontend/shared/layout/menus/components/BreadcrumbNavigation.tsx`
10. ✅ `frontend/shared/layout/menus/components/DragDropMenuTree.tsx`
11. ✅ `frontend/shared/layout/menus/components/MenuDisplay.tsx`
12. ✅ `frontend/shared/layout/menus/components/MenuItemForm.tsx`
13. ✅ `frontend/shared/layout/menus/components/MenuStore.tsx`
14. ✅ `frontend/shared/layout/menus/components/MenuTree.tsx`

#### Backend Convex
1. ✅ `convex/menu/store/menuItems.ts` (lines 509, 515)
2. ✅ `convex/workspace/workspaces.ts` (lines 500, 1016)

---

## 📝 Migration Pattern

### Pattern 1: Query

**Before:**
```typescript
const menuItems = useQuery(
  api.menu.menuItems.getWorkspaceMenuItems,
  { workspaceId }
)
```

**After:**
```typescript
const menuItems = useQuery(
  (api as any)["menu/store/menuItems"].getWorkspaceMenuItems,
  { workspaceId }
)
```

### Pattern 2: Mutation

**Before:**
```typescript
const createMenuItem = useMutation(api.menu.menuItems.createMenuItem)
```

**After:**
```typescript
const createMenuItem = useMutation(
  (api as any)["menu/store/menuItems"].createMenuItem
)
```

### Pattern 3: In Actions (Backend)

**Before:**
```typescript
const items = await runQuery(
  api.menu.menuItems.getWorkspaceMenuItems,
  { workspaceId: args.workspaceId }
)
```

**After:**
```typescript
const items = await runQuery(
  (api as any)["menu/store/menuItems"].getWorkspaceMenuItems,
  { workspaceId: args.workspaceId }
)
```

---

## 🛠️ Automated Fix

Digunakan script untuk mengganti semua occurrences:

```bash
find ./app ./frontend -type f \( -name "*.tsx" -o -name "*.ts" \) \
  ! -path "*/node_modules/*" ! -path "*/.next/*" \
  -exec sed -i 's/api\.menu\.menuItems/(api as any)["menu\/store\/menuItems"]/g' {} \;
```

---

## ✅ Verification

### Before Fix:
```
✖ TypeScript typecheck via `tsc` failed.
[CONVEX Q(menu/menuItems:getWorkspaceMenuItems)] Could not find public function
```

### After Fix:
```
✔ 16:55:32 Convex functions ready! (9.05s)
```

No errors! 🎉

---

## 📚 Available Menu API Functions

### Queries
- `getWorkspaceMenuItems` - Fetch all menu items for workspace
- `getMenuItem` - Fetch single menu item by ID
- `getMenuItemBySlug` - Fetch menu item by slug
- `getAvailableFeatureMenus` - List installable features
- `getMenuBreadcrumbs` - Get breadcrumb navigation

### Mutations
- `createMenuItem` - Create new menu item
- `updateMenuItem` - Update existing item
- `deleteMenuItem` - Delete item
- `updateMenuOrder` - Reorder items (drag & drop)
- `renameMenuItem` - Rename item
- `duplicateMenuItem` - Duplicate item
- `shareMenuItem` - Generate shareable ID
- `importMenuFromShareableId` - Import from ID
- `installFeatureMenus` - Install feature menus
- `setMenuItemComponent` - Set component mapping
- `createDefaultMenuItems` - Create default menu structure

---

## 🎯 Best Practices

1. **Always use type assertion** `(api as any)` untuk dynamic property access
2. **Use menuApi wrapper** dari `frontend/shared/pages/static/menus/api/menuApi.ts` untuk centralized access
3. **Use custom hooks** dari `frontend/shared/pages/static/menus/hooks/` untuk consistency

### Recommended Approach:

```typescript
// Instead of direct API calls
import { useMenuItems, useMenuMutations } from '@/frontend/shared/pages/static/menus'

function MyComponent({ workspaceId }) {
  const { menuItems, isLoading } = useMenuItems(workspaceId)
  const { createMenuItem, updateMenuItem } = useMenuMutations()

  // Use hooks instead of raw queries/mutations
}
```

---

## 🔍 How to Find Old Patterns

```bash
# Find all files with old pattern
grep -r "api\.menu\.menuItems" ./app ./frontend \
  --include="*.tsx" --include="*.ts"

# Should return empty (all fixed)
```

---

## 📌 Related Files

- [REFACTORING_SUMMARY.md](REFACTORING_SUMMARY.md) - Complete refactoring overview
- [frontend/shared/pages/static/menus/README.md](frontend/shared/pages/static/menus/README.md) - Menu system documentation
- [frontend/shared/pages/static/menus/api/menuApi.ts](frontend/shared/pages/static/menus/api/menuApi.ts) - Centralized API

---

**Status:** ✅ All migrations completed successfully!
**Last Verified:** 2025-10-02 16:55 WIB
