/**
 * Unified DnD Tree Component
 * 
 * A fully-featured drag-and-drop tree component that can be used for:
 * - Workspace hierarchy management
 * - Menu item organization
 * - Any hierarchical data structure
 * 
 * Features:
 * - Drag and drop reordering
 * - Drop above/below/inside targets
 * - Root level drop zone
 * - Inline renaming
 * - Customizable actions
 * - Icon/color customization
 * - Keyboard navigation
 */

"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ScrollArea } from "@/components/ui/scroll-area"

import { DnDTreeProvider } from "./context"
import { DnDTreeItem } from "./DnDTreeItem"
import { RootDropZone } from "./RootDropZone"
import { buildTree, computeNextOrder, buildMoveOperation } from "./utils"
import type { 
  UnifiedDnDTreeProps, 
  BaseTreeItem, 
  TreeNode,
  MoveOperation,
} from "./types"

// ============================================================================
// Component
// ============================================================================

export function UnifiedDnDTree<T extends BaseTreeItem>({
  items,
  selectedId,
  config,
  callbacks,
  customActions = [],
  renderItem,
  renderIcon,
  slots,
  isLoading = false,
  emptyMessage = "No items",
  rootDropMessage = "Drag here to move to the top level",
  className,
  idField = "id" as keyof T,
  parentIdField = "parentId" as keyof T,
  orderField = "order" as keyof T,
  childrenField = "children" as keyof T,
}: UnifiedDnDTreeProps<T>) {
  // Build tree from items
  const tree = React.useMemo(() => {
    return buildTree(items, { 
      idField, 
      parentIdField, 
      orderField 
    })
  }, [items, idField, parentIdField, orderField])

  // Item lookup map
  const itemMap = React.useMemo(() => {
    const map = new Map<string, T>()
    items.forEach(item => map.set(String(item[idField]), item))
    return map
  }, [items, idField])

  // Enhanced move callback that calculates proper order
  const handleMove = React.useCallback(async (operation: MoveOperation<T>) => {
    if (!callbacks.onMove) return

    // Get the actual dragged item
    const draggedItem = itemMap.get(operation.itemId)
    if (!draggedItem) return

    // Calculate the new order based on position
    const enhancedOperation = buildMoveOperation(
      draggedItem,
      operation.toParentId ? itemMap.get(operation.toParentId) ?? null : null,
      operation.position,
      items,
      { idField, parentIdField, orderField }
    )

    await callbacks.onMove(enhancedOperation)
  }, [callbacks, itemMap, items, idField, parentIdField, orderField])

  // Enhanced callbacks with proper item resolution
  const enhancedCallbacks = React.useMemo(() => ({
    ...callbacks,
    onMove: handleMove,
  }), [callbacks, handleMove])

  // Loading state
  if (isLoading) {
    return (
      <div className={cn("p-4 text-center text-muted-foreground", className)}>
        Loading...
      </div>
    )
  }

  // Empty state
  if (items.length === 0) {
    return (
      <div className={cn("p-4 text-center text-muted-foreground", className)}>
        {emptyMessage}
      </div>
    )
  }

  return (
    <DnDTreeProvider
      config={config}
      callbacks={enhancedCallbacks}
      customActions={customActions}
      selectedId={selectedId ?? null}
      renderIcon={renderIcon}
      slots={slots}
    >
      <div className={cn("space-y-2", className)}>
        <RootDropZone message={rootDropMessage} />
        
        <div className="space-y-0.5">
          {tree.map((node) => (
            <DnDTreeItem
              key={node.id}
              node={node as TreeNode<T>}
              depth={0}
              isSelected={selectedId === node.id}
              onSelect={() => callbacks.onSelect?.(node.data as T)}
            />
          ))}
        </div>
      </div>
    </DnDTreeProvider>
  )
}

// ============================================================================
// Scrollable Variant
// ============================================================================

export function ScrollableUnifiedDnDTree<T extends BaseTreeItem>(
  props: UnifiedDnDTreeProps<T> & { height?: string }
) {
  const { height = "100%", className, ...rest } = props

  return (
    <ScrollArea style={{ height }} className={className}>
      <UnifiedDnDTree {...rest} className="p-2" />
    </ScrollArea>
  )
}
