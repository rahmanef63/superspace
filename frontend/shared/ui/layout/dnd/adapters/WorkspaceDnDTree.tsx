/**
 * Workspace DnD Tree Adapter
 * 
 * Adapts the unified DnD system for workspace-store
 * Provides workspace-specific styling and behavior with:
 * - IconPicker for changing workspace icon
 * - ColorPicker for changing workspace color
 * - Type-based default icons
 */

"use client"

import * as React from "react"
import {
  Home,
  Building2,
  Users,
  Heart,
  Briefcase,
  Crown,
  Link2,
  Pencil,
  Trash2,
  Palette,
  FolderPlus,
  Unlink,
  Copy,
  Layers,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

import {
  ScrollableUnifiedDnDTree,
  type BaseTreeItem,
  type TreeItemAction,
  type DnDFeatureConfig,
  type MoveOperation,
  type TreeItemSlots,
} from "@/frontend/shared/ui/layout/dnd"
import { DynamicIcon, IconPicker } from "@/frontend/shared/ui/icons"
import { InlineColorPicker } from "@/frontend/shared/foundation/utils/color-picker"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// ============================================================================
// Types
// ============================================================================

/**
 * Workspace item type for the DnD tree
 */
export interface WorkspaceDnDItem extends BaseTreeItem {
  id: string
  name: string
  type?: "personal" | "organization" | "institution" | "group" | "family"
  color: string
  icon?: string
  parentId?: string | null
  sortOrder?: number
  isMainWorkspace?: boolean
  isLinked?: boolean
  createdAt?: number
  updatedAt?: number
  children?: WorkspaceDnDItem[]
}

/**
 * Props for the workspace DnD tree
 */
export interface WorkspaceDnDTreeProps {
  /** Array of workspace items */
  workspaces: WorkspaceDnDItem[]
  /** Currently selected workspace ID */
  selectedId?: string | null
  /** Configuration overrides */
  config?: DnDFeatureConfig
  /** Loading state */
  isLoading?: boolean
  /** Empty state message */
  emptyMessage?: string
  /** Additional class name */
  className?: string

  // Callbacks
  onSelect?: (workspace: WorkspaceDnDItem) => void
  onMove?: (data: { workspaceId: string; newParentId: string | null; newSortOrder: number }) => Promise<void> | void
  onEdit?: (workspace: WorkspaceDnDItem) => void
  onDelete?: (workspace: WorkspaceDnDItem) => void
  onAddChild?: (workspace: WorkspaceDnDItem) => void
  onIconChange?: (workspace: WorkspaceDnDItem, newIcon: string) => Promise<void> | void
  onColorChange?: (workspace: WorkspaceDnDItem, newColor: string) => Promise<void> | void
  onUnlink?: (workspace: WorkspaceDnDItem) => void
  onDuplicate?: (workspace: WorkspaceDnDItem) => void
  onShowFeatures?: (workspace: WorkspaceDnDItem) => void
}

// ============================================================================
// Workspace Type Icons
// ============================================================================

const WORKSPACE_TYPE_ICONS: Record<string, React.ElementType> = {
  personal: Home,
  organization: Building2,
  institution: Building2,
  group: Users,
  family: Heart,
}

// Default icon names for workspace types (for IconPicker)
const WORKSPACE_TYPE_ICON_NAMES: Record<string, string> = {
  personal: "Home",
  organization: "Building2",
  institution: "Building2",
  group: "Users",
  family: "Heart",
}

// ============================================================================
// Component
// ============================================================================

export function WorkspaceDnDTree({
  workspaces,
  selectedId,
  config,
  isLoading = false,
  emptyMessage = "No workspaces found",
  className,
  onSelect,
  onMove,
  onEdit,
  onDelete,
  onAddChild,
  onIconChange,
  onColorChange,
  onUnlink,
  onDuplicate,
  onShowFeatures,
}: WorkspaceDnDTreeProps) {
  // Convert workspace items to base tree items format
  const items = React.useMemo(() => {
    return workspaces.map(ws => ({
      ...ws,
      order: ws.sortOrder ?? 0,
    }))
  }, [workspaces])

  // Build workspace lookup map
  const workspaceMap = React.useMemo(() => {
    const map = new Map<string, WorkspaceDnDItem>()
    workspaces.forEach(ws => map.set(ws.id, ws))
    return map
  }, [workspaces])

  // Handle move operation
  const handleMove = React.useCallback(async (operation: MoveOperation<WorkspaceDnDItem>) => {
    if (!onMove) return

    await onMove({
      workspaceId: operation.itemId,
      newParentId: operation.toParentId,
      newSortOrder: operation.newOrder,
    })
  }, [onMove])

  // Handle rename (not typically used for workspaces, use onEdit instead)
  const handleRename = React.useCallback(async (workspace: WorkspaceDnDItem, newName: string) => {
    toast.info("Use Edit to rename workspaces")
  }, [])

  // Handle duplicate
  const handleDuplicate = React.useCallback(async (workspace: WorkspaceDnDItem) => {
    if (onDuplicate) {
      onDuplicate(workspace)
    } else {
      toast.info("Duplicate workspace not implemented")
    }
  }, [onDuplicate])

  // Handle delete
  const handleDelete = React.useCallback(async (workspace: WorkspaceDnDItem) => {
    if (workspace.isMainWorkspace) {
      toast.error("Cannot delete main workspace")
      return
    }
    onDelete?.(workspace)
  }, [onDelete])

  // Custom actions for workspace dropdown (removed show-features, now it's a separate button)
  const customActions: TreeItemAction<WorkspaceDnDItem>[] = React.useMemo(() => {
    const actions: TreeItemAction<WorkspaceDnDItem>[] = []

    if (onEdit) {
      actions.push({
        id: "edit",
        label: "Edit",
        icon: Pencil,
        onClick: onEdit,
      })
    }

    if (onAddChild) {
      actions.push({
        id: "add-child",
        label: "Add Child Workspace",
        icon: FolderPlus,
        onClick: onAddChild,
      })
    }

    actions.push({
      id: "copy-id",
      label: "Copy Workspace ID",
      icon: Copy,
      onClick: (ws) => {
        navigator.clipboard.writeText(ws.id)
        toast.success("Workspace ID copied")
      },
    })

    if (onUnlink) {
      actions.push({
        id: "unlink",
        label: "Unlink",
        icon: Unlink,
        onClick: onUnlink,
        hidden: (ws) => !ws.isLinked,
      })
    }

    return actions
  }, [onEdit, onAddChild, onUnlink])

  // Merged config
  const mergedConfig: DnDFeatureConfig = React.useMemo(() => ({
    allowDragAndDrop: true,
    allowRename: false, // Workspaces use Edit dialog
    allowDuplicate: !!onDuplicate,
    allowDelete: !!onDelete,
    allowAppearanceChange: !!(onIconChange || onColorChange),
    allowDropToRoot: true,
    showActions: true,
    showGripHandle: true,
    maxDepth: 6,
    dropThreshold: 0.25,
    indentSize: 16,
    ...config,
  }), [config, onDuplicate, onDelete, onIconChange, onColorChange])

  // Slots for workspace-specific rendering
  const slots: TreeItemSlots<WorkspaceDnDItem> = React.useMemo(() => ({
    // Custom icon renderer with IconPicker + ColorPicker in popover
    renderIcon: ({ item, config: cfg }) => {
      const workspace = workspaceMap.get(item.id) || item
      const defaultIconName = WORKSPACE_TYPE_ICON_NAMES[workspace.type || "personal"] || "Briefcase"
      const iconName = workspace.icon || defaultIconName
      const color = workspace.color || "#3b82f6"

      // Icon button component
      const iconButton = (
        <button
          className="flex h-6 w-6 items-center justify-center rounded text-white shrink-0 hover:opacity-80 transition-opacity"
          style={{ backgroundColor: color }}
        >
          <DynamicIcon name={iconName} className="h-3.5 w-3.5" />
        </button>
      )

      // If appearance change is allowed and we have callbacks
      if (cfg.allowAppearanceChange && (onIconChange || onColorChange)) {
        return (
          <div className="z-10 flex items-center" onClick={(e) => e.stopPropagation()}>
            <Popover>
              <PopoverTrigger asChild>
                {iconButton}
              </PopoverTrigger>
              <PopoverContent className="w-auto p-3" align="start" side="right">
                <div className="flex flex-col gap-3">
                  {/* Icon Picker */}
                  {onIconChange && (
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-2">Icon</div>
                      <IconPicker
                        icon={iconName}
                        onIconChange={(newIcon) => onIconChange(workspace, newIcon)}
                        showColor={false}
                        showBackground={false}
                      />
                    </div>
                  )}
                  {/* Color Picker */}
                  {onColorChange && (
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-2">Color</div>
                      <InlineColorPicker
                        value={color}
                        onChange={(newColor) => onColorChange(workspace, newColor)}
                      />
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )
      }

      // Static icon display
      return (
        <div
          className="flex h-6 w-6 items-center justify-center rounded text-white shrink-0"
          style={{ backgroundColor: color }}
        >
          <DynamicIcon name={iconName} className="h-3.5 w-3.5" />
        </div>
      )
    },

    // Show main workspace badge
    renderNameSuffix: ({ item }) => {
      const workspace = workspaceMap.get(item.id) || item
      if (workspace.isMainWorkspace) {
        return (
          <Crown className="h-3.5 w-3.5 text-yellow-500 flex-shrink-0" aria-label="Main workspace" />
        )
      }
      if (workspace.isLinked) {
        return (
          <Link2 className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" aria-label="Linked workspace" />
        )
      }
      return null
    },

    // Show Features button before action dropdown (appears on hover)
    renderBeforeActions: ({ item }) => {
      if (!onShowFeatures) return null
      const workspace = workspaceMap.get(item.id) || item

      return (
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation()
                  onShowFeatures(workspace)
                }}
              >
                <Layers className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="text-xs">
              Show Features
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    },
  }), [workspaceMap, onIconChange, onColorChange, onShowFeatures])

  return (
    <ScrollableUnifiedDnDTree<WorkspaceDnDItem>
      items={items}
      selectedId={selectedId}
      config={mergedConfig}
      callbacks={{
        onSelect,
        onMove: handleMove,
        onRename: handleRename,
        onDuplicate: handleDuplicate,
        onDelete: handleDelete,
      }}
      customActions={customActions}
      slots={slots}
      isLoading={isLoading}
      emptyMessage={emptyMessage}
      rootDropMessage="Drag here to move to root level"
      className={className}
      parentIdField="parentId"
      orderField="sortOrder"
    />
  )
}
