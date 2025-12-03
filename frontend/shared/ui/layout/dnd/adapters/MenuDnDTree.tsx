/**
 * Menu DnD Tree Adapter
 * 
 * Adapts the unified DnD system for menu-store
 * Provides menu-specific styling and behavior
 */

"use client"

import * as React from "react"
import {
  Copy,
  ArrowUpCircle,
  Shield,
} from "lucide-react"
import { toast } from "sonner"
import { Id } from "@convex/_generated/dataModel"

import {
  UnifiedDnDTree,
  ScrollableUnifiedDnDTree,
  type BaseTreeItem,
  type TreeItemAction,
  type IconRendererProps,
  type DnDFeatureConfig,
  type MoveOperation,
  type TreeItemSlots,
} from "@/frontend/shared/ui/layout/dnd"
import { DynamicIcon, IconPicker } from "@/frontend/shared/ui/icons"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"

// ============================================================================
// Types
// ============================================================================

/**
 * Menu item type for the DnD tree
 */
export interface MenuDnDItem extends BaseTreeItem {
  _id: Id<"menuItems">
  id: string
  name: string
  slug: string
  icon?: string
  color?: string
  parentId?: string | null
  order: number
  metadata?: {
    featureType?: "system" | "user"
    version?: string
    [key: string]: unknown
  }
  children?: MenuDnDItem[]
}

/**
 * Feature config for menu tree
 */
export interface MenuFeatureConfig {
  allowDragAndDrop?: boolean
  allowRename?: boolean
  allowDuplicate?: boolean
  allowDelete?: boolean
  allowAppearanceChange?: boolean
}

/**
 * Update info for menu items
 */
export interface MenuUpdateInfo {
  currentVersion: string
  latestVersion: string
}

/**
 * Props for the menu DnD tree
 */
export interface MenuDnDTreeProps {
  /** Workspace ID */
  workspaceId: Id<"workspaces">
  /** Array of menu items */
  menuItems: MenuDnDItem[]
  /** Currently selected menu item ID */
  selectedId?: string | null
  /** Feature configuration */
  featureConfig?: MenuFeatureConfig
  /** Map of menu item IDs to available updates */
  updatesMap?: Map<string, MenuUpdateInfo>
  /** Loading state */
  isLoading?: boolean
  /** Empty state message */
  emptyMessage?: string
  /** Additional class name */
  className?: string
  
  // Callbacks
  onSelect?: (menuItem: MenuDnDItem) => void
  onMove?: (menuItemId: Id<"menuItems">, parentId: Id<"menuItems"> | null, order: number) => Promise<void>
  onRename?: (menuItemId: Id<"menuItems">, newName: string) => Promise<void>
  onDuplicate?: (menuItemId: Id<"menuItems">) => Promise<void>
  onDelete?: (menuItemId: Id<"menuItems">) => Promise<void>
  onIconChange?: (menuItemId: Id<"menuItems">, newIcon: string) => Promise<void>
  onUpdate?: (menuItem: MenuDnDItem) => Promise<void>
}

// ============================================================================
// Component
// ============================================================================

export function MenuDnDTree({
  workspaceId,
  menuItems,
  selectedId,
  featureConfig,
  updatesMap = new Map(),
  isLoading = false,
  emptyMessage = "No menu items",
  className,
  onSelect,
  onMove,
  onRename,
  onDuplicate,
  onDelete,
  onIconChange,
  onUpdate,
}: MenuDnDTreeProps) {
  // Convert menu items to base tree items format
  const items = React.useMemo(() => {
    return menuItems.map(item => ({
      ...item,
      id: String(item._id),
      parentId: item.parentId ? String(item.parentId) : null,
    }))
  }, [menuItems])

  // Build menu lookup map
  const menuMap = React.useMemo(() => {
    const map = new Map<string, MenuDnDItem>()
    menuItems.forEach(item => map.set(String(item._id), item))
    return map
  }, [menuItems])

  // Handle move operation
  const handleMove = React.useCallback(async (operation: MoveOperation<MenuDnDItem>) => {
    if (!onMove) return

    const menuItem = menuMap.get(operation.itemId)
    if (!menuItem) return

    await onMove(
      menuItem._id,
      operation.toParentId ? (operation.toParentId as unknown as Id<"menuItems">) : null,
      operation.newOrder
    )
  }, [onMove, menuMap])

  // Handle rename
  const handleRename = React.useCallback(async (item: MenuDnDItem, newName: string) => {
    if (!onRename) return
    await onRename(item._id, newName)
    toast.success("Renamed successfully")
  }, [onRename])

  // Handle duplicate
  const handleDuplicate = React.useCallback(async (item: MenuDnDItem) => {
    if (!onDuplicate) return
    await onDuplicate(item._id)
    toast.success("Duplicated successfully")
  }, [onDuplicate])

  // Handle delete
  const handleDelete = React.useCallback(async (item: MenuDnDItem) => {
    if (!onDelete) return
    await onDelete(item._id)
    toast.success("Deleted successfully")
  }, [onDelete])

  // Custom actions for menu dropdown
  const customActions: TreeItemAction<MenuDnDItem>[] = React.useMemo(() => {
    const actions: TreeItemAction<MenuDnDItem>[] = []

    // Update action (if update available)
    if (onUpdate) {
      actions.push({
        id: "update",
        label: "Update",
        icon: ArrowUpCircle,
        onClick: (item) => {
          onUpdate(item)
        },
        hidden: (item) => !updatesMap.has(String(item._id)),
      })
    }

    // Copy menu ID
    actions.push({
      id: "copy-id",
      label: "Copy Menu ID",
      icon: Copy,
      onClick: (item) => {
        navigator.clipboard.writeText(String(item._id))
        toast.success("Menu ID copied")
      },
    })

    return actions
  }, [onUpdate, updatesMap])

  // Merged config
  const mergedConfig: DnDFeatureConfig = React.useMemo(() => ({
    allowDragAndDrop: featureConfig?.allowDragAndDrop ?? true,
    allowRename: featureConfig?.allowRename ?? true,
    allowDuplicate: featureConfig?.allowDuplicate ?? true,
    allowDelete: featureConfig?.allowDelete ?? true,
    allowAppearanceChange: featureConfig?.allowAppearanceChange ?? true,
    allowDropToRoot: true,
    showActions: true,
    showGripHandle: true,
    maxDepth: 6,
    dropThreshold: 0.25,
    indentSize: 20,
  }), [featureConfig])

  // Slots for menu-specific rendering
  const slots: TreeItemSlots<MenuDnDItem> = React.useMemo(() => ({
    // Custom icon renderer with IconPicker
    renderIcon: ({ item, config: cfg }) => {
      if (cfg.allowAppearanceChange && onIconChange) {
        return (
          <div className="z-10" onClick={(e) => e.stopPropagation()}>
            <IconPicker
              icon={item.icon || "Hash"}
              onIconChange={(newIcon) => onIconChange(item._id, newIcon)}
              showColor={false}
              showBackground={false}
              trigger={
                <button className="hover:bg-accent rounded p-0.5 transition-colors">
                  <DynamicIcon name={item.icon || "Hash"} className="w-4 h-4" />
                </button>
              }
            />
          </div>
        )
      }
      return (
        <span className="z-10">
          <DynamicIcon name={item.icon || "Hash"} className="w-4 h-4" />
        </span>
      )
    },

    // Name suffix with system icon and update indicator
    renderNameSuffix: ({ item }) => {
      const isSystem = item.metadata?.featureType === "system"
      const hasUpdate = updatesMap.has(String(item._id))

      return (
        <>
          {isSystem && (
            <Shield 
              className="h-4 w-4 text-muted-foreground flex-shrink-0" 
              aria-label="System menu item" 
            />
          )}
          {hasUpdate && (
            <ArrowUpCircle
              className="h-4 w-4 text-blue-500 animate-pulse flex-shrink-0"
              aria-label="Update available"
            />
          )}
        </>
      )
    },

    // Menu items start - update action if available
    renderMenuItemsStart: ({ item }) => {
      const updateInfo = updatesMap.get(String(item._id))
      if (!updateInfo || !onUpdate) return null

      return (
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation()
            onUpdate(item)
          }}
          className="text-blue-600 dark:text-blue-400 font-medium"
        >
          <ArrowUpCircle className="w-4 h-4 mr-2" />
          Update to v{updateInfo.latestVersion}
        </DropdownMenuItem>
      )
    },
  }), [onIconChange, updatesMap, onUpdate])

  // Handle select with proper type
  const handleSelect = React.useCallback((item: MenuDnDItem) => {
    const originalItem = menuMap.get(String(item._id))
    if (originalItem && onSelect) {
      onSelect(originalItem)
    }
  }, [menuMap, onSelect])

  return (
    <ScrollableUnifiedDnDTree<MenuDnDItem>
      items={items}
      selectedId={selectedId}
      config={mergedConfig}
      callbacks={{
        onSelect: handleSelect,
        onMove: handleMove,
        onRename: handleRename,
        onDuplicate: handleDuplicate,
        onDelete: handleDelete,
      }}
      customActions={customActions}
      slots={slots}
      isLoading={isLoading}
      emptyMessage={emptyMessage}
      rootDropMessage="Drag here to move to the top level"
      className={className}
      idField="id"
      parentIdField="parentId"
      orderField="order"
    />
  )
}
