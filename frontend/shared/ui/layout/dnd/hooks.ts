/**
 * DnD Hooks
 * 
 * Custom hooks for drag-and-drop functionality
 */

"use client"

import * as React from "react"
import type { 
  BaseTreeItem, 
  DnDState, 
  DnDStateActions,
  DnDFeatureConfig,
  DropPreview,
} from "./types"
import { DEFAULT_DND_CONFIG, DEFAULT_ACCENT_COLORS } from "./types"

// ============================================================================
// useDnDState Hook
// ============================================================================

/**
 * Hook for managing DnD state locally
 */
export function useDnDState(initialExpandedIds: string[] = []) {
  const [isDragging, setIsDragging] = React.useState(false)
  const [draggedId, setDraggedIdState] = React.useState<string | null>(null)
  const [dropPreview, setDropPreviewState] = React.useState<DropPreview | null>(null)
  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(
    () => new Set(initialExpandedIds)
  )

  const state: DnDState = React.useMemo(() => ({
    isDragging,
    draggedId,
    dropPreview,
    expandedIds,
  }), [isDragging, draggedId, dropPreview, expandedIds])

  const actions: DnDStateActions = React.useMemo(() => ({
    setDraggedId: (id: string | null) => {
      setDraggedIdState(id)
      setIsDragging(id !== null)
    },
    setDropPreview: (preview: DropPreview | null) => {
      setDropPreviewState(preview)
    },
    clearDragState: () => {
      setDraggedIdState(null)
      setDropPreviewState(null)
      setIsDragging(false)
    },
    toggleExpanded: (id: string) => {
      setExpandedIds(prev => {
        const next = new Set(prev)
        if (next.has(id)) {
          next.delete(id)
        } else {
          next.add(id)
        }
        return next
      })
    },
    expandItem: (id: string) => {
      setExpandedIds(prev => new Set(prev).add(id))
    },
    collapseItem: (id: string) => {
      setExpandedIds(prev => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    },
  }), [])

  return { state, actions }
}

// ============================================================================
// useDnDConfig Hook
// ============================================================================

/**
 * Hook for merging DnD configuration with defaults
 */
export function useDnDConfig(
  userConfig?: DnDFeatureConfig
): Required<DnDFeatureConfig> {
  return React.useMemo(() => ({
    ...DEFAULT_DND_CONFIG,
    ...userConfig,
    accentColors: {
      ...DEFAULT_ACCENT_COLORS,
      ...userConfig?.accentColors,
    },
  }), [userConfig])
}

// ============================================================================
// useTreeExpansion Hook
// ============================================================================

/**
 * Hook for managing tree expansion state
 */
export function useTreeExpansion(initialExpandedIds: string[] = []) {
  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(
    () => new Set(initialExpandedIds)
  )

  const toggle = React.useCallback((id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const expand = React.useCallback((id: string) => {
    setExpandedIds(prev => new Set(prev).add(id))
  }, [])

  const collapse = React.useCallback((id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }, [])

  const expandAll = React.useCallback((ids: string[]) => {
    setExpandedIds(new Set(ids))
  }, [])

  const collapseAll = React.useCallback(() => {
    setExpandedIds(new Set())
  }, [])

  const isExpanded = React.useCallback((id: string) => {
    return expandedIds.has(id)
  }, [expandedIds])

  return {
    expandedIds,
    toggle,
    expand,
    collapse,
    expandAll,
    collapseAll,
    isExpanded,
  }
}

// ============================================================================
// useTreeSelection Hook
// ============================================================================

/**
 * Hook for managing tree selection state (single or multi-select)
 */
export function useTreeSelection(options?: {
  multiSelect?: boolean
  initialSelectedIds?: string[]
}) {
  const { multiSelect = false, initialSelectedIds = [] } = options ?? {}

  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(
    () => new Set(initialSelectedIds)
  )

  const select = React.useCallback((id: string) => {
    setSelectedIds(prev => {
      if (multiSelect) {
        const next = new Set(prev)
        next.add(id)
        return next
      }
      return new Set([id])
    })
  }, [multiSelect])

  const deselect = React.useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }, [])

  const toggle = React.useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        if (!multiSelect) {
          next.clear()
        }
        next.add(id)
      }
      return next
    })
  }, [multiSelect])

  const selectAll = React.useCallback((ids: string[]) => {
    if (multiSelect) {
      setSelectedIds(new Set(ids))
    }
  }, [multiSelect])

  const clearSelection = React.useCallback(() => {
    setSelectedIds(new Set())
  }, [])

  const isSelected = React.useCallback((id: string) => {
    return selectedIds.has(id)
  }, [selectedIds])

  // Single select convenience
  const selectedId = React.useMemo(() => {
    if (!multiSelect && selectedIds.size === 1) {
      return Array.from(selectedIds)[0]
    }
    return null
  }, [selectedIds, multiSelect])

  return {
    selectedIds,
    selectedId,
    select,
    deselect,
    toggle,
    selectAll,
    clearSelection,
    isSelected,
  }
}
