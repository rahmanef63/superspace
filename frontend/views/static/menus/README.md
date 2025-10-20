# Menu Management System

Sistem manajemen menu yang modular dan terorganisir untuk aplikasi workspace.

## 📁 Struktur Folder

```
frontend/views/static/menus/
├── api/              # Convex API references
│   └── menuApi.ts    # Centralized API endpoints
├── components/       # React components
│   ├── BreadcrumbNavigation.tsx
│   ├── DragDropMenuTree.tsx
│   ├── MenuDisplay.tsx
│   ├── MenuItemForm.tsx
│   ├── MenuStore.tsx
│   └── MenuTree.tsx
├── hooks/           # Custom React hooks
│   ├── useMenuItems.ts
│   └── useMenuMutations.ts
├── types/           # TypeScript type definitions
│   └── index.ts
├── utils/           # Helper utilities
│   ├── icons.ts
│   └── tree.ts
├── index.ts         # Main export file
└── README.md        # Documentation
```

## 🎯 Fitur Utama

### 1. **Manajemen Menu Items**
- Create, Read, Update, Delete (CRUD) menu items
- Drag & drop reordering
- Hierarchical tree structure
- Parent-child relationships

### 2. **Menu Store**
- Install/uninstall feature menus
- Share dan import menu items antar workspace
- Version control untuk menu features
- Available features catalog

### 3. **Permission-Based Visibility**
- Role-based access control
- Visible/hidden menu items
- Permission inheritance

### 4. **Customization**
- Custom icons dengan IconPicker
- Color themes
- Metadata dan badges
- Component mapping

## 🔧 Cara Penggunaan

### Menggunakan Hooks

```typescript
import { useMenuItems, useMenuMutations } from './hooks';

function MyComponent({ workspaceId }) {
  // Fetch menu items
  const { menuItems, isLoading } = useMenuItems(workspaceId);

  // Get mutations
  const {
    createMenuItem,
    updateMenuItem,
    deleteMenuItem
  } = useMenuMutations();

  const handleCreate = async () => {
    await createMenuItem({
      workspaceId,
      name: "New Item",
      slug: "new-item",
      type: "folder",
    });
  };

  return (
    <div>
      {isLoading ? "Loading..." : menuItems.map(item => (
        <div key={item._id}>{item.name}</div>
      ))}
    </div>
  );
}
```

### Menggunakan Tree Utilities

```typescript
import { buildMenuTree, getBreadcrumbPath } from './utils/tree';

// Build hierarchical tree
const tree = buildMenuTree(flatMenuItems);

// Get breadcrumb path
const breadcrumbs = getBreadcrumbPath(menuItems, targetItemId);
```

### Menggunakan Components

```typescript
import { MenuStore, DragDropMenuTree } from './components';

function MenuPage({ workspaceId }) {
  return (
    <div>
      {/* Full menu management interface */}
      <MenuStore workspaceId={workspaceId} />

      {/* Or just the tree view */}
      <DragDropMenuTree
        workspaceId={workspaceId}
        onItemSelect={(itemId) => console.log(itemId)}
      />
    </div>
  );
}
```

## 📝 Type Definitions

### Core Types

```typescript
interface MenuItemRecord {
  _id: Id<"menuItems">;
  workspaceId: Id<"workspaces">;
  name: string;
  slug: string;
  type: MenuItemType;
  order: number;
  parentId?: Id<"menuItems">;
  icon?: string;
  path?: string;
  component?: string;
  isVisible: boolean;
  visibleForRoleIds: Id<"roles">[];
  metadata?: MenuItemMetadata;
}

type MenuItemType =
  | "folder"
  | "route"
  | "document"
  | "chat"
  | "action"
  | "divider";
```

## 🔌 Backend Integration

### Convex API Path
Semua menu operations terhubung ke:
```
convex/menu/store/menuItems.ts
```

Diakses melalui:
```typescript
api["menu/store/menuItems"].getWorkspaceMenuItems
api["menu/store/menuItems"].createMenuItem
// etc.
```

### Available Operations

**Queries:**
- `getWorkspaceMenuItems` - Fetch all menu items untuk workspace
- `getMenuItem` - Fetch single menu item by ID
- `getMenuItemBySlug` - Fetch menu item by slug
- `getAvailableFeatureMenus` - List installable features
- `getMenuBreadcrumbs` - Get breadcrumb navigation

**Mutations:**
- `createMenuItem` - Create new menu item
- `updateMenuItem` - Update existing item
- `deleteMenuItem` - Delete item
- `updateMenuOrder` - Reorder items (drag & drop)
- `renameMenuItem` - Rename item
- `duplicateMenuItem` - Duplicate item
- `shareMenuItem` - Generate shareable ID
- `importMenuFromShareableId` - Import from ID
- `installFeatureMenus` - Install feature menus

## 🎨 Component Details

### MenuStore
Main component dengan tabs:
- **Installed Menus** - Tree/Grid view dari installed items
- **Available Features** - Catalog dari installable features
- **Import Menu** - Import menu dari workspace lain

### DragDropMenuTree
Tree view dengan drag & drop functionality:
- Reorder items
- Move to different parent
- Visual feedback saat drag
- Collapsible folders

### MenuItemForm
Form untuk create/edit menu items:
- Name, slug, type selection
- Icon & color picker
- Path and component mapping
- Metadata (description, badge, etc.)

### MenuDisplay
Display menu items dalam grid/card layout:
- Show metadata
- Icon dengan custom colors
- Badge indicators
- Click to navigate

### BreadcrumbNavigation
Navigation breadcrumb trail:
- Show current path
- Click to navigate
- Home button

### MenuTree
Alternative tree view menggunakan headless-tree library:
- Keyboard navigation
- Accessibility support
- Actions menu (edit, delete, duplicate)

## 🚀 Best Practices

1. **Selalu gunakan hooks** daripada direct API calls
2. **Type safety** - gunakan TypeScript types yang sudah defined
3. **Error handling** - wrap mutations dalam try-catch
4. **Loading states** - check `isLoading` dari hooks
5. **Unique slugs** - gunakan `ensureUniqueSlug` utility
6. **Tree operations** - gunakan utils dari `utils/tree.ts`

## 🐛 Troubleshooting

### Error: "api.menu.menuItems is undefined"
✅ Fix: Gunakan `api["menu/store/menuItems"]` bukan `api.menu.menuItems`

### TypeScript Error: MenuItemRecord children type
✅ Fix: Gunakan `MenuTreeNode` type untuk tree operations dengan guaranteed children array

### Drag & Drop tidak bekerja
✅ Check: Pastikan user memiliki `MANAGE_MENUS` permission

## 📚 Resources

- [Convex Documentation](https://docs.convex.dev)
- [Headless Tree Library](https://github.com/lukasbach/headless-tree)
- [Lucide Icons](https://lucide.dev)

## 🔄 Migration Guide

Jika migrating dari old structure:
1. Update import paths ke folder baru
2. Replace `api.menu.menuItems` dengan `api["menu/store/menuItems"]`
3. Update component imports dari `./components`
4. Use new type definitions dari `./types`
5. Leverage hooks untuk state management

---

**Last Updated:** 2025-10-02
**Version:** 2.0.0
