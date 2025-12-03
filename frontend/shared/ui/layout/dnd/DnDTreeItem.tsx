/**
 * DnD Tree Item Component
 * 
 * Renders a single tree item with drag-and-drop support
 */

"use client"

import * as React from "react"
import { 
  GripVertical, 
  ChevronRight, 
  ChevronDown, 
  MoreVertical,
  Hash,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"

import { useDnDTreeContext } from "./context"
import { calculateDropPosition } from "./utils"
import type { 
  BaseTreeItem, 
  TreeNode, 
  DropPosition,
  TreeItemAction,
} from "./types"

// ============================================================================
// Props
// ============================================================================

interface DnDTreeItemProps<T extends BaseTreeItem> {
  /** The tree node to render */
  node: TreeNode<T>
  /** Current depth level */
  depth?: number
  /** Whether this item is selected */
  isSelected?: boolean
  /** Callback when item is selected */
  onSelect?: () => void
}

// ============================================================================
// Component
// ============================================================================

export function DnDTreeItem<T extends BaseTreeItem>({
  node,
  depth = 0,
  isSelected = false,
  onSelect,
}: DnDTreeItemProps<T>) {
  const { 
    config, 
    state, 
    actions, 
    callbacks,
    customActions,
    renderIcon,
    slots,
  } = useDnDTreeContext<T>()

  const itemId = node.id
  const hasChildren = Boolean(node.children?.length)
  const isExpanded = state.expandedIds.has(itemId)
  const isDropTarget = state.dropPreview?.id === itemId
  const dropPosition = isDropTarget ? state.dropPreview?.position : null
  const isDragging = state.draggedId === itemId

  // Rename state
  const [isRenaming, setIsRenaming] = React.useState(false)
  const [renameValue, setRenameValue] = React.useState(node.name)
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Focus input when renaming starts
  React.useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isRenaming])

  // ============================================================================
  // Drag and Drop Handlers
  // ============================================================================

  const handleDragStart = (event: React.DragEvent) => {
    if (!config.allowDragAndDrop) return
    actions.setDraggedId(itemId)
    event.dataTransfer.effectAllowed = "move"
    event.dataTransfer.setData("text/plain", itemId)
  }

  const handleDragOver = (event: React.DragEvent) => {
    if (!config.allowDragAndDrop) return
    if (state.draggedId === itemId) return // Can't drop on self
    
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
    
    const position = calculateDropPosition(
      event, 
      event.currentTarget as HTMLElement, 
      config.dropThreshold
    )
    
    actions.setDropPreview({ id: itemId, position })
  }

  const handleDragLeave = (event: React.DragEvent) => {
    if (!config.allowDragAndDrop) return
    
    const related = event.relatedTarget as Node | null
    if (!(event.currentTarget as HTMLElement).contains(related)) {
      if (state.dropPreview?.id === itemId) {
        actions.setDropPreview(null)
      }
    }
  }

  const handleDrop = async (event: React.DragEvent) => {
    if (!config.allowDragAndDrop) return
    event.preventDefault()

    const draggedId = state.draggedId
    if (!draggedId || draggedId === itemId) {
      actions.clearDragState()
      return
    }

    const position = state.dropPreview?.position ?? "inside"
    
    if (callbacks.onMove) {
      // Get the dragged item data from the node if possible
      // For now, we'll let the parent handle finding the item
      await callbacks.onMove({
        itemId: draggedId,
        item: { id: draggedId, name: "" } as T, // Will be filled by parent
        fromParentId: null,
        toParentId: position === "inside" ? itemId : (node.parentId ?? null),
        newOrder: 0, // Will be calculated by parent
        position,
      })
    }

    actions.clearDragState()
  }

  const handleDragEnd = () => {
    actions.clearDragState()
  }

  // ============================================================================
  // Action Handlers
  // ============================================================================

  const handleRenameStart = () => {
    if (!config.allowRename) return
    setRenameValue(node.name)
    setIsRenaming(true)
  }

  const handleRenameSubmit = async () => {
    if (!renameValue.trim() || renameValue === node.name) {
      setIsRenaming(false)
      return
    }

    if (callbacks.onRename && node.data) {
      await callbacks.onRename(node.data, renameValue.trim())
    }
    setIsRenaming(false)
  }

  const handleRenameCancel = () => {
    setIsRenaming(false)
    setRenameValue(node.name)
  }

  const handleRenameKeyDown = (event: React.KeyboardEvent) => {
    event.stopPropagation()
    if (event.key === "Enter") {
      handleRenameSubmit()
    } else if (event.key === "Escape") {
      handleRenameCancel()
    }
  }

  // ============================================================================
  // Render
  // ============================================================================

  const accentColors = config.accentColors

  // Drop indicator styles
  const showLineAbove = isDropTarget && dropPosition === "above"
  const showLineBelow = isDropTarget && dropPosition === "below"
  const showInsideOverlay = isDropTarget && dropPosition === "inside"

  // Slot props for customization
  const slotProps = {
    item: node.data as T,
    isSelected,
    isExpanded,
    isRenaming,
    depth,
    config,
  }

  // Icon rendering - prioritize slots.renderIcon, then renderIcon, then default
  const IconComponent = renderIcon
  const iconElement = slots?.renderIcon ? (
    slots.renderIcon({ ...slotProps, icon: node.icon || "Hash", className: "h-4 w-4", color: node.color })
  ) : IconComponent ? (
    <IconComponent 
      icon={node.icon || "Hash"} 
      className="h-4 w-4" 
      color={node.color}
    />
  ) : (
    <Hash className="h-4 w-4" />
  )

  return (
    <div className="relative select-none">
      {/* Drop position indicators */}
      {(showLineAbove || showLineBelow) && (
        <span
          className="pointer-events-none absolute left-0 right-0 h-0.5 rounded-full z-10"
          style={{
            backgroundColor: accentColors.primary,
            top: showLineAbove ? 0 : undefined,
            bottom: showLineBelow ? 0 : undefined,
          }}
        />
      )}

      {/* Main item row */}
      <div
        className={cn(
          "group relative flex items-center gap-2 py-1.5 pr-2 rounded cursor-pointer transition-colors",
          "hover:bg-muted",
          isSelected && "bg-accent",
          isDragging && "opacity-50"
        )}
        style={{ paddingLeft: `${depth * config.indentSize + 8}px` }}
        draggable={config.allowDragAndDrop}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onDragEnd={handleDragEnd}
        onClick={() => onSelect?.()}
      >
        {/* Selection/drop overlay */}
        {(isSelected || showInsideOverlay) && (
          <span
            className="pointer-events-none absolute inset-0 rounded"
            style={{
              backgroundColor: accentColors.primary,
              border: `1px solid ${accentColors.boundary}`,
              opacity: showInsideOverlay ? 0.18 : 0.1,
            }}
          />
        )}

        {/* Grip handle */}
        {config.showGripHandle && config.allowDragAndDrop ? (
          <GripVertical className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity cursor-grab" />
        ) : (
          <span className="w-3" />
        )}

        {/* Expand/collapse button */}
        {hasChildren ? (
          <Button
            variant="ghost"
            size="sm"
            className="z-10 h-5 w-5 p-0"
            onClick={(e) => {
              e.stopPropagation()
              actions.toggleExpanded(itemId)
            }}
          >
            {isExpanded ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </Button>
        ) : (
          <div className="w-5" />
        )}

        {/* Icon */}
        <span className="z-10 flex-shrink-0">
          {iconElement}
        </span>

        {/* Name / Rename input */}
        {isRenaming ? (
          <input
            ref={inputRef}
            className="z-10 flex-1 text-sm bg-background border border-border rounded px-1 py-0.5 min-w-0"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={handleRenameSubmit}
            onKeyDown={handleRenameKeyDown}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <div className="z-10 flex flex-1 items-center gap-2 text-sm min-w-0">
            <span className="truncate">{node.name}</span>
            {/* Name suffix slot */}
            {slots?.renderNameSuffix?.(slotProps)}
          </div>
        )}

        {/* Before actions slot */}
        {slots?.renderBeforeActions?.(slotProps)}

        {/* Actions dropdown */}
        {config.showActions && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="z-20 ml-auto h-7 w-7 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
              {/* Menu items start slot */}
              {slots?.renderMenuItemsStart?.(slotProps)}

              {/* Rename */}
              {config.allowRename && (
                <DropdownMenuItem onClick={handleRenameStart}>
                  Rename
                </DropdownMenuItem>
              )}

              {/* Duplicate */}
              {config.allowDuplicate && callbacks.onDuplicate && node.data && (
                <DropdownMenuItem 
                  onClick={() => callbacks.onDuplicate?.(node.data!)}
                >
                  Duplicate
                </DropdownMenuItem>
              )}

              {/* Custom actions */}
              {customActions.map((action, index) => {
                const isHidden = typeof action.hidden === "function" 
                  ? action.hidden(node.data!) 
                  : action.hidden
                if (isHidden) return null

                const isDisabled = typeof action.disabled === "function"
                  ? action.disabled(node.data!)
                  : action.disabled

                const Icon = action.icon

                return (
                  <DropdownMenuItem
                    key={action.id}
                    onClick={() => action.onClick(node.data!)}
                    disabled={isDisabled}
                    className={action.variant === "destructive" ? "text-destructive" : undefined}
                  >
                    {Icon && <Icon className="h-4 w-4 mr-2" />}
                    {action.label}
                  </DropdownMenuItem>
                )
              })}

              {/* Menu items end slot */}
              {slots?.renderMenuItemsEnd?.(slotProps)}

              {/* Delete */}
              {config.allowDelete && callbacks.onDelete && node.data && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => callbacks.onDelete?.(node.data!)}
                    className="text-destructive"
                  >
                    Delete
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="space-y-0.5">
          {node.children?.map((child) => (
            <DnDTreeItem
              key={child.id}
              node={child as TreeNode<T>}
              depth={depth + 1}
              isSelected={false} // Parent handles selection
              onSelect={() => callbacks.onSelect?.(child.data as T)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
