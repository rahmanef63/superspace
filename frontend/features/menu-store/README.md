# Menu Store Feature

> **Modular, scalable menu management system for SuperSpace**
> **Last Updated:** 2025-12-03
> **Version:** 3.0.0 (Three-Column Layout - Following WorkspaceStorePage Pattern)

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Folder Structure](#folder-structure)
4. [Core Concepts](#core-concepts)
5. [Usage Guide](#usage-guide)
6. [API Reference](#api-reference)
7. [Component Reference](#component-reference)
8. [Hooks Reference](#hooks-reference)
9. [Development Guide](#development-guide)

---

## Overview

The Menu Store is a **feature-based module** that provides comprehensive menu management functionality for SuperSpace workspaces. It follows the **WorkspaceStorePage pattern** with a **Three-Column Layout** for better UX.

### Key Features

- ✅ **Three-Column Layout**: Left (Tree), Center (Inspector/Features/Import), Right (Preview)
- ✅ **Modular & Scalable**: Components, hooks, and utilities organized by concern
- ✅ **DRY Principle**: Reusable components and logic
- ✅ **Type-Safe**: Full TypeScript coverage
- ✅ **Access Control**: Requires `MANAGE_MENUS` permission (Owner & Admin only)
- ✅ **Tabbed Center Panel**: Inspector, Available Features, Import
- ✅ **View Mode Toggle**: Tree & Grid views in left panel
- ✅ **CRUD Operations**: Create, read, update, delete menu items
- ✅ **Feature Management**: Install/uninstall optional features
- ✅ **Import/Export**: Share menus across workspaces
- ✅ **Feature Preview**: Preview features before installing

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Menu Store Page (3-Column Layout)            │
│                      (MenuStorePage.tsx)                        │
└────────────────────────────┬────────────────────────────────────┘
                             │
┌────────────────────────────┼────────────────────────────────────┐
│ Left Panel      │  Center Panel    │  Right Panel               │
│ (Menu Tree)     │  (Details)       │  (Preview)                 │
├─────────────────┼──────────────────┼────────────────────────────┤
│ • Search        │  • Inspector Tab │  • Feature Preview         │
│ • Tree/Grid     │  • Available Tab │  • Close Button            │
│ • View Toggle   │  • Import Tab    │                            │
│ • Sync Button   │                  │                            │
└─────────────────┴──────────────────┴────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────────────────────┐
        │                    │               │                    │
   ┌────▼────┐         ┌─────▼────┐   ┌─────▼────┐         ┌─────▼─────┐
   │ Hooks   │         │Components│   │ Dialogs  │         │  Sections │
   │         │         │          │   │          │         │  (Legacy) │
   │ • State │         │ • Cards  │   │ • Rename │         └───────────┘
   │ • Data  │         │          │   │ • Share  │
   │ • Mut   │         └──────────┘   └──────────┘
   └────┬────┘                 
        │                      
   ┌────▼────┐            
   │   API   │            
   │         │            
   │ Convex  │            
   └─────────┘            
```

### Design Principles

1. **Three-Column Layout**: Follows WorkspaceStorePage pattern for consistency
2. **Separation of Concerns**: Each folder has a specific responsibility
3. **Single Responsibility**: Each file does one thing well
4. **Dependency Inversion**: Components depend on abstractions (hooks), not implementations
5. **Composition**: Small, reusable components composed into larger features
6. **Co-location**: Related code stays together

---

## Folder Structure

```
frontend/features/menu-store/
├── MenuStorePage.tsx           # NEW: Main 3-column page (follows WorkspaceStorePage)
├── page.tsx                    # Legacy SecondarySidebarLayout page
├── page.old.tsx                # Backup of original monolithic implementation
├── index.ts                    # Public API exports
├── README.md                   # This file
│
├── types/                      # TypeScript type definitions
│   └── index.ts                # MenuItem, FeatureType, ViewMode, etc.
│
├── constants/                  # Configuration and constants
│   └── index.ts                # VIEW_MODES, FEATURE_TYPES, MENU_STORE_CONFIG
│
├── api/                        # Convex API abstraction
│   └── menuStoreApi.ts         # Centralized API endpoints
│
├── lib/                        # Utility functions
│   ├── featureTypeHelpers.ts   # Feature type normalization & checks
│   ├── searchHelpers.ts        # Search/filter logic
│   └── index.ts                # Lib exports
│
├── hooks/                      # Custom React hooks
│   ├── useMenuStoreData.ts     # Data fetching
│   ├── useMenuStoreMutations.ts# Mutations with error handling
│   ├── useMenuStoreState.ts    # Local state management
│   └── index.ts                # Hook exports
│
├── components/                 # Reusable UI components
│   ├── MenuItemCard.tsx        # Grid view menu card
│   ├── FeatureCard.tsx         # Available feature card
│   └── index.ts                # Component exports
│
├── sections/                   # LEGACY: Tab content components (for old layout)
│   ├── InstalledSection.tsx    # Installed menus tab
│   ├── AvailableSection.tsx    # Available features tab
│   ├── ImportSection.tsx       # Import menu tab
│   └── index.ts                # Section exports
│
└── dialogs/                    # Modal dialog components
    ├── RenameDialog.tsx        # Rename menu dialog
    ├── ShareDialog.tsx         # Share menu dialog
    └── index.ts                # Dialog exports
```

---

## Core Concepts

### 1. Three-Column Layout (NEW)

The new layout follows WorkspaceStorePage pattern:

| Panel | Content | Features |
|-------|---------|----------|
| **Left** | Menu Tree | Tree/Grid toggle, Search, Sync |
| **Center** | Inspector/Available/Import | Tabbed interface, Menu details |
| **Right** | Feature Preview | Collapsible, Shows feature preview |

### 2. Feature Types

| Type | Description | Access | Badge Color |
|------|-------------|--------|-------------|
| **default** | Standard workspace features | All members | Outline |
| **system** | Admin/owner-only features | Owner & Admin | Destructive (red) |
| **optional** | Installable features | Based on permission | Secondary |
| **custom** | User-created menus | All members | Outline |

### 3. View Modes

- **Tree View**: Hierarchical structure with drag-drop
- **Grid View**: Compact card-based layout

### 4. Center Panel Tabs

- **Inspector**: View/edit selected menu item details
- **Available**: Browse and install optional features
- **Import**: Import shared menus from other workspaces

### 5. Access Control

Menu Store is wrapped in `MenuStoreMenuWrapper` which:
- Checks `MANAGE_MENUS` permission
- Only allows access to workspace Owners and Admins
- Shows "Access Denied" message for unauthorized users

---

## Usage Guide

### Basic Usage (New 3-Column Layout)

```typescript
import { MenuStorePage } from "@/frontend/features/menu-store";

// In your route page
<MenuStorePage workspaceId={workspaceId} />
```

### Legacy Usage (SecondarySidebarLayout)

```typescript
import { MenuStorePageLegacy } from "@/frontend/features/menu-store";

// In your route page
<MenuStorePageLegacy workspaceId={workspaceId} />
```

### Using Individual Components

```typescript
import { MenuItemCard, FeatureCard } from "@/frontend/features/menu-store";

<MenuItemCard
  item={menuItem}
  isSelected={selected}
  isUpdating={updating}
  onSelect={handleSelect}
  onEdit={handleEdit}
  onDelete={handleDelete}
  // ... other handlers
/>
```

### Using Hooks

```typescript
import {
  useMenuStoreData,
  useMenuStoreMutations,
  useMenuStoreState,
} from "@/frontend/features/menu-store";

function MyComponent({ workspaceId }: Props) {
  // Fetch data
  const { menuItems, availableFeatures, isLoading } = useMenuStoreData(workspaceId);

  // Get mutations
  const mutations = useMenuStoreMutations();

  // Local state
  const { state, setSearchQuery, setViewMode } = useMenuStoreState();

  // Use them
  const handleInstall = async (slug: string) => {
    await mutations.installFeature(workspaceId, [slug]);
  };
}
```

### Using Utilities

```typescript
import {
  getFeatureType,
  canRestoreFeatureType,
  filterMenuItems,
} from "@/frontend/features/menu-store";

const featureType = getFeatureType(item);
const canRestore = canRestoreFeatureType(item);
const filtered = filterMenuItems(items, searchQuery);
```

---

## API Reference

### `menuStoreApi`

Centralized Convex API endpoints.

```typescript
import { menuStoreApi } from "@/frontend/features/menu-store";

// Queries
menuStoreApi.getWorkspaceMenuItems
menuStoreApi.getAvailableFeatureMenus

// Mutations
menuStoreApi.deleteMenuItem
menuStoreApi.installFeatureMenus
menuStoreApi.renameMenuItem
menuStoreApi.duplicateMenuItem
menuStoreApi.shareMenuItem
menuStoreApi.importMenuFromShareableId
menuStoreApi.setMenuItemFeatureType
menuStoreApi.syncWorkspaceDefaultMenus
```

---

## Component Reference

### MenuItemCard

Card component for grid view display of menu items.

**Props:**
```typescript
interface MenuItemCardProps {
  item: MenuItem;
  isSelected: boolean;
  isUpdating: boolean;
  onSelect: (id: Id<"menuItems">) => void;
  onEdit: (id: Id<"menuItems">) => void;
  onRename: (item: MenuItem) => void;
  onDuplicate: (item: MenuItem) => void;
  onShare: (item: MenuItem) => void;
  onDelete: (id: Id<"menuItems">) => void;
  onRestrictToSystem: (item: MenuItem) => void;
  onRestoreVisibility: (item: MenuItem) => void;
}
```

### FeatureCard

Card component for available features display.

**Props:**
```typescript
interface FeatureCardProps {
  feature: AvailableFeatureMenu;
  isInstalling: boolean;
  onInstall: (slug: string) => void;
}
```

### InstalledSection

Tab content for installed menus.

**Features:**
- Form for creating/editing menus
- Tree view with preview panel
- Grid view with cards
- Full CRUD operations

### AvailableSection

Tab content for browsing available features.

**Features:**
- Feature catalog from `OPTIONAL_FEATURES_CATALOG`
- Install button with loading states
- Status badges (stable, beta, development, etc.)
- Version and category info

### ImportSection

Tab content for importing menus.

**Features:**
- Shareable ID input
- Import button with validation
- Instructions for users
- Error handling

---

## Hooks Reference

### useMenuStoreData

Fetches menu store data from Convex.

```typescript
const { menuItems, availableFeatures, isLoading } = useMenuStoreData(workspaceId);
```

**Returns:**
- `menuItems`: Array of installed menu items
- `availableFeatures`: Array of features available for installation
- `isLoading`: Boolean loading state

### useMenuStoreMutations

Provides mutation functions with built-in error handling and toast notifications.

```typescript
const mutations = useMenuStoreMutations();

// All mutations include error handling and success toasts
await mutations.deleteMenuItem(id, onSuccess);
await mutations.installFeature(workspaceId, [slug], onSuccess);
await mutations.renameMenuItem(id, name, onSuccess);
await mutations.duplicateMenuItem(id, onSuccess);
await mutations.shareMenuItem(id); // Returns shareableId
await mutations.importMenu(workspaceId, shareableId, onSuccess);
await mutations.setFeatureType(id, featureType, onSuccess);
await mutations.syncDefaults(workspaceId, onSuccess);
```

### useMenuStoreState

Manages local component state.

```typescript
const {
  state,                        // Full state object
  setSearchQuery,              // Update search
  setSelectedItemId,           // Update selection
  setShowForm,                 // Toggle form
  setEditingItemId,            // Set editing item
  setViewMode,                 // Switch view mode
  setActiveTab,                // Switch tab
  addInstallingFeature,        // Mark feature as installing
  removeInstallingFeature,     // Unmark feature
  openRenameDialog,            // Open rename dialog
  closeRenameDialog,           // Close rename dialog
  setRenameDialogName,         // Update rename name
  openShareDialog,             // Open share dialog
  closeShareDialog,            // Close share dialog
  setImportMenuId,             // Update import ID
  setImporting,                // Toggle importing state
  setSyncingDefaults,          // Toggle syncing state
  setUpdatingFeatureTypeId,    // Set updating feature type
} = useMenuStoreState();
```

---

## Development Guide

### Adding a New Component

1. Create file in `components/` directory
2. Export from `components/index.ts`
3. Use in sections or page

```typescript
// components/MyComponent.tsx
export function MyComponent({ prop }: Props) {
  return <div>...</div>;
}

// components/index.ts
export * from "./MyComponent";
```

### Adding a New Hook

1. Create file in `hooks/` directory
2. Export from `hooks/index.ts`
3. Use in page or components

```typescript
// hooks/useMyHook.ts
export function useMyHook() {
  const [state, setState] = useState();
  return { state, setState };
}

// hooks/index.ts
export * from "./useMyHook";
```

### Adding a New Utility

1. Create file in `lib/` directory
2. Export from `lib/index.ts`
3. Use anywhere

```typescript
// lib/myHelper.ts
export function myHelper(input: string): string {
  return input.toUpperCase();
}

// lib/index.ts
export * from "./myHelper";
```

### Adding a New Constant

1. Add to `constants/index.ts`
2. Use anywhere

```typescript
// constants/index.ts
export const MY_CONSTANT = {
  key: "value",
} as const;
```

### Testing Checklist

- [ ] Component renders without errors
- [ ] All props are typed correctly
- [ ] Handlers are called with correct arguments
- [ ] Loading states work
- [ ] Error states work
- [ ] Success states work
- [ ] Dialogs open/close correctly
- [ ] Forms validate correctly
- [ ] API calls succeed
- [ ] Toasts show correct messages

---

## Best Practices

### 1. State Management

- **Use hooks**: `useMenuStoreState` for local state
- **Use Convex**: `useQuery` and `useMutation` for server state
- **Avoid prop drilling**: Pass only what's needed

### 2. Error Handling

- **Always use try/catch**: In all async handlers
- **Show toast notifications**: For user feedback
- **Log errors**: For debugging

### 3. Performance

- **Memoize expensive computations**: Use `useMemo`
- **Debounce search**: Prevent excessive re-renders
- **Use lazy loading**: For heavy components

### 4. Accessibility

- **Use semantic HTML**: `button`, `dialog`, `nav`
- **Add ARIA labels**: For screen readers
- **Keyboard navigation**: Support Tab, Enter, Escape

### 5. Code Style

- **Use TypeScript**: No `any` types
- **Follow naming conventions**: camelCase for variables, PascalCase for components
- **Keep functions small**: Single responsibility
- **Document complex logic**: Add comments

---

## Migration Guide

### From Old Implementation

The old monolithic `page.tsx` (844 lines) has been refactored into a modular structure:

**Before:**
```typescript
// All logic in one file (page.tsx - 844 lines)
export default function MenuStorePage() {
  // 100+ lines of state
  // 20+ handler functions
  // 700+ lines of JSX
}
```

**After:**
```typescript
// Clean, organized imports (page.tsx - 260 lines)
import { useMenuStoreData, useMenuStoreMutations, useMenuStoreState } from "./hooks";
import { InstalledSection, AvailableSection, ImportSection } from "./sections";
import { RenameDialog, ShareDialog } from "./dialogs";

export default function MenuStorePage() {
  // Hooks for data, mutations, state
  // Clean handler functions
  // Delegated rendering to sections
}
```

**Benefits:**
- ✅ Reduced complexity: 260 lines (vs 844) - **69% reduction**
- ✅ Better testability: Each module can be tested independently
- ✅ Easier maintenance: Changes are localized
- ✅ Reusable code: Components and hooks can be used elsewhere
- ✅ Better TypeScript inference
- ✅ Clearer separation of concerns

---

## Troubleshooting

### Import Errors

**Error**: `Cannot find module '@/frontend/features/menu-store/hooks'`

**Solution**: Make sure all `index.ts` files are exporting correctly:
```bash
# Check exports
cat frontend/features/menu-store/hooks/index.ts
```

### Type Errors

**Error**: `Type 'X' is not assignable to type 'Y'`

**Solution**: Import types from the correct location:
```typescript
import type { MenuItem, FeatureType } from "@/frontend/features/menu-store/types";
```

### State Not Updating

**Error**: State changes don't trigger re-renders

**Solution**: Make sure you're using state setters correctly:
```typescript
// ❌ Wrong
state.searchQuery = "new value";

// ✅ Correct
setSearchQuery("new value");
```

---

## References

- [Secondary Sidebar Layout](../../shared/layout/secondary-sidebar/README.md)
- [Menu Components](../../shared/layout/menus/index.ts)
- [Convex Menu API](../../../convex/features/menus/menuItems.ts)
- [Features Config](../../../features.config.ts)

---

## Comparison: `frontend/views/static/menus` vs `frontend/shared/layout/menus`

### `frontend/views/static/menus/` (Route Page)
- **Purpose**: Next.js route page wrapper untuk menu store
- **Contains**: Hanya page.tsx yang menjadi route entry point
- **Role**: Routing layer, menerima workspaceId dari URL params
- **Location**: App router path `/dashboard/menus`

### `frontend/shared/layout/menus/` (Shared Components)
- **Purpose**: Reusable menu-related components untuk seluruh app
- **Contains**: Components, hooks, utils, types yang bisa dipakai di mana saja
- **Role**: Shared library untuk menu functionality
- **Examples**: DragDropMenuTree, MenuItemForm, MenuPreview, BreadcrumbNavigation

**Kesimpulan**: `views/static/menus` adalah **route wrapper**, sedangkan `shared/layout/menus` adalah **component library**.

---

**Created:** 2025-01-19
**Author:** AI Assistant (Claude)
**Version:** 2.0.0 (Modular Refactoring)
