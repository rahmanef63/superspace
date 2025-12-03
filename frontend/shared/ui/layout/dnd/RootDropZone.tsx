/**
 * Root Drop Zone Component
 * 
 * Provides a drop zone for moving items to the root level
 */

"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { useDnDTreeContext } from "./context"
import type { BaseTreeItem } from "./types"

// ============================================================================
// Props
// ============================================================================

interface RootDropZoneProps<T extends BaseTreeItem> {
  /** Message to display in the drop zone */
  message?: string
  /** Callback when item is dropped to root */
  onDrop?: (itemId: string) => void
  /** Additional class name */
  className?: string
}

// ============================================================================
// Component
// ============================================================================

export function RootDropZone<T extends BaseTreeItem>({
  message = "Drag here to move to the top level",
  onDrop,
  className,
}: RootDropZoneProps<T>) {
  const { config, state, actions, callbacks } = useDnDTreeContext<T>()

  if (!config.allowDropToRoot || !config.allowDragAndDrop) {
    return null
  }

  const isDropTarget = state.dropPreview?.id === "root"
  const accentColors = config.accentColors

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
    actions.setDropPreview({ id: "root", position: "inside" })
  }

  const handleDragLeave = () => {
    if (state.dropPreview?.id === "root") {
      actions.setDropPreview(null)
    }
  }

  const handleDrop = async (event: React.DragEvent) => {
    event.preventDefault()
    
    const draggedId = state.draggedId
    if (!draggedId) {
      actions.clearDragState()
      return
    }

    if (onDrop) {
      onDrop(draggedId)
    } else if (callbacks.onMove) {
      await callbacks.onMove({
        itemId: draggedId,
        item: { id: draggedId, name: "" } as T,
        fromParentId: null,
        toParentId: null,
        newOrder: 0,
        position: "inside",
      })
    }

    actions.clearDragState()
  }

  return (
    <div
      className={cn(
        "rounded border border-dashed border-muted-foreground/40 p-2 text-xs text-center transition-colors",
        isDropTarget && "border-primary bg-primary/5",
        className
      )}
      style={
        isDropTarget
          ? {
              borderColor: accentColors.boundary,
              backgroundColor: accentColors.background,
            }
          : undefined
      }
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {message}
    </div>
  )
}
