# Unified DnD System

A reusable drag-and-drop tree system for managing hierarchical data structures.

## Features

- **Drag and Drop**: Reorder and reparent items with intuitive DnD
- **Drop Positions**: Drop above, below, or inside target items
- **Root Drop Zone**: Move items to top level
- **Inline Renaming**: Double-click or use menu to rename items
- **Customizable Actions**: Add custom dropdown menu actions
- **Icon Customization**: Use custom icon renderers
- **Consistent UX**: Same hover, drag, and action patterns across all uses

## Quick Start

### Basic Usage

```tsx
import { UnifiedDnDTree } from "@/frontend/shared/ui/layout/dnd"

const items = [
  { id: "1", name: "Item 1", parentId: null, order: 0 },
  { id: "2", name: "Item 2", parentId: "1", order: 0 },
]

<UnifiedDnDTree
  items={items}
  selectedId={selectedId}
  callbacks={{
    onSelect: (item) => setSelectedId(item.id),
    onMove: async (operation) => {
      await moveItem(operation.itemId, operation.toParentId, operation.newOrder)
    },
    onDelete: async (item) => {
      await deleteItem(item.id)
    },
  }}
/>
```

### Pre-configured Adapters

For common use cases, use the pre-configured adapters:

#### Workspace Store

```tsx
import { WorkspaceDnDTree } from "@/frontend/shared/ui/layout/dnd"

<WorkspaceDnDTree
  workspaces={workspaces}
  selectedId={selectedId}
  onSelect={(workspace) => setSelectedId(workspace.id)}
  onMove={async ({ workspaceId, newParentId, newSortOrder }) => {
    await moveWorkspace(workspaceId, newParentId, newSortOrder)
  }}
  onEdit={(workspace) => openEditDialog(workspace)}
  onDelete={(workspace) => openDeleteDialog(workspace)}
  onAddChild={(workspace) => openCreateDialog(workspace)}
/>
```

#### Menu Store

```tsx
import { MenuDnDTree } from "@/frontend/shared/ui/layout/dnd"

<MenuDnDTree
  workspaceId={workspaceId}
  menuItems={menuItems}
  selectedId={selectedId}
  onSelect={(menuItem) => setSelectedId(menuItem._id)}
  onMove={async (menuItemId, parentId, order) => {
    await updateMenuItem({ menuItemId, parentId, order })
  }}
  onRename={async (menuItemId, newName) => {
    await updateMenuItem({ menuItemId, name: newName })
  }}
/>
```

## Configuration

### DnDFeatureConfig

```tsx
interface DnDFeatureConfig {
  /** Enable drag and drop (default: true) */
  allowDragAndDrop?: boolean
  
  /** Allow renaming items inline (default: true) */
  allowRename?: boolean
  
  /** Allow duplicating items (default: true) */
  allowDuplicate?: boolean
  
  /** Allow deleting items (default: true) */
  allowDelete?: boolean
  
  /** Allow changing icon/appearance (default: true) */
  allowAppearanceChange?: boolean
  
  /** Allow dropping to root level (default: true) */
  allowDropToRoot?: boolean
  
  /** Show action buttons on hover (default: true) */
  showActions?: boolean
  
  /** Show grip handle (default: true) */
  showGripHandle?: boolean
  
  /** Max depth for hierarchy (default: 6) */
  maxDepth?: number
  
  /** Threshold for above/below drop zones (default: 0.25) */
  dropThreshold?: number
  
  /** Custom accent colors */
  accentColors?: {
    primary: string
    boundary: string
    background: string
  }
  
  /** Indent size per level in px (default: 20) */
  indentSize?: number
}
```

## Custom Actions

Add custom actions to the dropdown menu:

```tsx
const customActions = [
  {
    id: "archive",
    label: "Archive",
    icon: Archive,
    onClick: (item) => archiveItem(item.id),
  },
  {
    id: "share",
    label: "Share",
    icon: Share,
    onClick: (item) => openShareDialog(item),
    hidden: (item) => !item.canShare,
  },
]

<UnifiedDnDTree
  items={items}
  callbacks={callbacks}
  customActions={customActions}
/>
```

## Custom Icon Renderer

Provide a custom icon renderer:

```tsx
function MyIconRenderer({ icon, className, color }) {
  return (
    <div 
      className={cn("rounded p-1", className)}
      style={{ backgroundColor: color }}
    >
      <DynamicIcon name={icon} />
    </div>
  )
}

<UnifiedDnDTree
  items={items}
  callbacks={callbacks}
  renderIcon={MyIconRenderer}
/>
```

## Hooks

### useDnDState

Manage local DnD state:

```tsx
const { state, actions } = useDnDState(['initial-expanded-id'])

// state.isDragging
// state.draggedId
// state.dropPreview
// state.expandedIds

// actions.setDraggedId(id)
// actions.setDropPreview({ id, position })
// actions.clearDragState()
// actions.toggleExpanded(id)
```

### useTreeExpansion

Manage tree expansion:

```tsx
const {
  expandedIds,
  toggle,
  expand,
  collapse,
  expandAll,
  collapseAll,
  isExpanded,
} = useTreeExpansion(['initial-expanded-id'])
```

### useTreeSelection

Manage tree selection:

```tsx
const {
  selectedIds,
  selectedId,
  select,
  deselect,
  toggle,
  selectAll,
  clearSelection,
  isSelected,
} = useTreeSelection({ multiSelect: false })
```

## Utilities

### buildTree

Build a tree structure from flat items:

```tsx
import { buildTree } from "@/frontend/shared/ui/layout/dnd"

const tree = buildTree(flatItems, {
  idField: 'id',
  parentIdField: 'parentId',
  orderField: 'order',
})
```

### wouldCreateCycle

Check if a move would create a cycle:

```tsx
import { wouldCreateCycle } from "@/frontend/shared/ui/layout/dnd"

if (wouldCreateCycle(itemId, newParentId, itemsMap)) {
  toast.error("Cannot move item: would create circular reference")
  return
}
```

### computeNextOrder

Calculate order for new items:

```tsx
import { computeNextOrder } from "@/frontend/shared/ui/layout/dnd"

const order = computeNextOrder(items, parentId)
```

## Architecture

```
frontend/shared/ui/layout/dnd/
├── index.ts           # Public API exports
├── types.ts           # Type definitions
├── context.tsx        # DnD context provider
├── hooks.ts           # Custom hooks
├── utils.ts           # Utility functions
├── UnifiedDnDTree.tsx # Main tree component
├── DnDTreeItem.tsx    # Individual tree item
├── RootDropZone.tsx   # Root level drop zone
└── adapters/
    ├── index.ts
    ├── WorkspaceDnDTree.tsx  # Workspace-specific adapter
    └── MenuDnDTree.tsx       # Menu-specific adapter
```

## Comparison with DragDropMenuTree

The existing `DragDropMenuTree` in `frontend/shared/ui/layout/menus` is a specialized component that integrates deeply with the menu system. The unified DnD system is more generic and can be used for any hierarchical data.

| Feature | UnifiedDnDTree | DragDropMenuTree |
|---------|----------------|------------------|
| Generic items | ✅ | ❌ (menu-specific) |
| TypeScript generics | ✅ | ❌ |
| Pre-built adapters | ✅ | N/A |
| Convex integration | Via adapter | Built-in |
| Icon picker | Via callback | Built-in |
| Update notifications | Via custom action | Built-in |

Choose **UnifiedDnDTree** when:
- Building new features with hierarchical data
- Need a generic, reusable tree component
- Want consistent UX across different stores

Choose **DragDropMenuTree** when:
- Working specifically with menu items
- Need built-in Convex mutations
- Need built-in icon picker
