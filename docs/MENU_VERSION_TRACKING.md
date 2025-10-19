# Menu Version Tracking & Update Notifications

## Overview

Fitur version tracking untuk menu items memungkinkan pengguna untuk:
1. Melihat versi dari setiap menu item
2. Mendapatkan notifikasi jika ada update tersedia
3. Melakukan update menu dengan satu klik
4. Tracking history version changes melalui audit log

## Features

### 1. Version Display
Setiap menu item menampilkan badge version (contoh: `v1.0.0`) di DragDropMenuTree.

### 2. Update Notifications
Menu items yang memiliki update tersedia akan menampilkan:
- Badge "Update Available" dengan ikon `ArrowUpCircle`
- Badge dengan animasi pulse untuk menarik perhatian
- Warna biru untuk membedakan dari badge lain

### 3. One-Click Update
Di dropdown menu setiap item, jika ada update tersedia akan muncul opsi:
```
🔼 Update to v2.0.0
```
User tinggal klik untuk mengupdate menu ke versi terbaru.

### 4. Audit Logging
Setiap perubahan version akan tercatat di `activityEvents` table dengan:
- `action: "version_updated"` - untuk update
- `action: "feature_installed"` - untuk instalasi baru
- `diff` yang berisi informasi version sebelum dan sesudah

## Technical Implementation

### Backend (Convex)

#### 1. Schema
Field `version` sudah ada di `menuItems.metadata`:
```typescript
metadata: {
  version: v.optional(v.string()),
  previousVersion: v.optional(v.string()),
  lastUpdated: v.optional(v.number()),
  // ... other fields
}
```

#### 2. Query: getMenuUpdates
File: `convex/menu/store/menuItems.ts`

```typescript
export const getMenuUpdates = query({
  args: { workspaceId: v.id("workspaces") },
  returns: v.array(v.object({
    menuItemId: v.id("menuItems"),
    slug: v.string(),
    name: v.string(),
    currentVersion: v.string(),
    latestVersion: v.string(),
    hasUpdate: v.boolean(),
  })),
  handler: async (ctx, args) => {
    // Membandingkan version installed dengan catalog
    // Return list menu yang ada update
  }
})
```

#### 3. Mutation: installFeatureMenus (Enhanced)
Parameter tambahan:
```typescript
{
  workspaceId: Id<"workspaces">,
  featureSlugs: string[],
  forceUpdate?: boolean  // NEW: untuk force update existing menu
}
```

Fitur:
- Compare version (semantic versioning)
- Update metadata dengan `previousVersion`
- Audit logging untuk setiap update

#### 4. Helper: compareVersions
```typescript
function compareVersions(v1: string, v2: string): number {
  // Returns: 1 if v1 > v2, -1 if v1 < v2, 0 if equal
  // Supports semantic versioning (1.2.3)
}
```

### Frontend

#### 1. DragDropMenuTree Component
File: `frontend/shared/layout/menus/components/DragDropMenuTree.tsx`

**New Features:**
- Import `useQuery` dan `api` dari Convex
- Fetch menu updates via `getMenuUpdates` query
- Display version badge untuk setiap item
- Display "Update Available" badge jika ada update
- Tambah menu option "Update to vX.X.X" di dropdown

**Key Changes:**
```typescript
// Fetch updates
const menuUpdates = useQuery(api.menu.store.menuItems.getMenuUpdates, { workspaceId })
const updatesMap = useMemo(() => {
  // Build map untuk quick lookup
}, [menuUpdates])

// Handler untuk update
const handleUpdateMenu = async (itemId: Id<"menuItems">) => {
  await allMutations.installFeatureMenus({
    workspaceId,
    featureSlugs: [item.slug],
    forceUpdate: true,
  })
}
```

#### 2. useMenuMutations Hook
File: `frontend/shared/pages/static/menus/hooks/useMenuMutations.ts`

**Enhanced:**
```typescript
installFeatureMenus: async (params: {
  workspaceId: Id<"workspaces">;
  featureSlugs: string[];
  forceUpdate?: boolean;  // NEW
}) => {
  return await installFeatureMenus(params);
}
```

## Usage Examples

### Developer: Set Version untuk Menu
```typescript
// Di menu_manifest_data.ts atau optional_features_catalog.ts
{
  name: "Chat",
  slug: "chat",
  type: "route",
  icon: "MessageSquare",
  version: "2.1.0",  // Update version number
  metadata: {
    version: "2.1.0",
    description: "Enhanced chat with new features",
    // ...
  }
}
```

### User: Update Menu via UI
1. Buka workspace settings → Menus
2. Lihat menu tree
3. Menu dengan update akan memiliki badge biru "Update Available"
4. Klik ⋮ (more options) pada menu tersebut
5. Klik "🔼 Update to vX.X.X"
6. Menu akan diupdate ke versi terbaru

### Programmatic Update
```typescript
import { useMutation } from "convex/react"
import { api } from "@convex/_generated/api"

const installFeatureMenus = useMutation(api.menu.store.menuItems.installFeatureMenus)

// Update specific menus
await installFeatureMenus({
  workspaceId,
  featureSlugs: ["chat", "documents", "calendar"],
  forceUpdate: true,
})
```

## Audit Trail

Semua version changes tercatat di `activityEvents`:

```typescript
{
  actorUserId: Id<"users">,
  workspaceId: Id<"workspaces">,
  entityType: "menuItem",
  entityId: string,
  action: "version_updated",
  diff: {
    slug: "chat",
    previousVersion: "1.0.0",
    newVersion: "2.0.0",
    updatedFields: ["name", "icon", "path", "component", "metadata"]
  },
  createdAt: number
}
```

## Future Enhancements

1. **Batch Updates**: Update semua menu sekaligus
2. **Changelog Display**: Show release notes untuk setiap version
3. **Rollback**: Kembalikan ke version sebelumnya
4. **Auto-Update**: Otomatis update saat user login
5. **Update Notifications**: Push notification untuk updates
6. **Version Comparison**: Side-by-side comparison sebelum update

## Security & Permissions

- Update menu memerlukan permission `MANAGE_MENUS`
- Semua updates di-audit log dengan user ID
- RBAC check dilakukan di mutation level
- Version validation untuk prevent malicious updates

## Testing

```bash
# Run validation scripts
npm run validate:features

# Run tests
npm test

# Type check
npx tsc --noEmit
```

## References

- Schema: `convex/schema.ts`
- Menu Items API: `convex/menu/store/menuItems.ts`
- UI Component: `frontend/shared/layout/menus/components/DragDropMenuTree.tsx`
- Hooks: `frontend/shared/pages/static/menus/hooks/useMenuMutations.ts`
