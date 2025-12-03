/**
 * DnD Tree Context
 * 
 * Provides DnD state and configuration to all tree components
 */

"use client"

import * as React from "react"
import type { 
  DnDTreeContextValue, 
  BaseTreeItem, 
  DnDState, 
  DnDStateActions,
  DnDFeatureConfig,
  TreeItemCallbacks,
  TreeItemAction,
  IconRenderer,
  DropPreview,
  TreeItemSlots,
} from "./types"
import { DEFAULT_DND_CONFIG, DEFAULT_ACCENT_COLORS } from "./types"

// ============================================================================
// Context
// ============================================================================

const DnDTreeContext = React.createContext<DnDTreeContextValue<any> | null>(null)

// ============================================================================
// Hook
// ============================================================================

export function useDnDTreeContext<T extends BaseTreeItem = BaseTreeItem>() {
  const context = React.useContext(DnDTreeContext)
  if (!context) {
    throw new Error("useDnDTreeContext must be used within a DnDTreeProvider")
  }
  return context as DnDTreeContextValue<T>
}

export function useOptionalDnDTreeContext<T extends BaseTreeItem = BaseTreeItem>() {
  return React.useContext(DnDTreeContext) as DnDTreeContextValue<T> | null
}

// ============================================================================
// Provider Props
// ============================================================================

interface DnDTreeProviderProps<T extends BaseTreeItem> {
  children: React.ReactNode
  config?: DnDFeatureConfig
  callbacks: TreeItemCallbacks<T>
  customActions?: TreeItemAction<T>[]
  selectedId?: string | null
  renderIcon?: IconRenderer
  slots?: TreeItemSlots<T>
  initialExpandedIds?: string[]
}

// ============================================================================
// Provider
// ============================================================================

export function DnDTreeProvider<T extends BaseTreeItem = BaseTreeItem>({
  children,
  config: userConfig,
  callbacks,
  customActions = [],
  selectedId = null,
  renderIcon,
  slots,
  initialExpandedIds = [],
}: DnDTreeProviderProps<T>) {
  // Merge config with defaults
  const config = React.useMemo<Required<DnDFeatureConfig>>(() => ({
    ...DEFAULT_DND_CONFIG,
    ...userConfig,
    accentColors: {
      ...DEFAULT_ACCENT_COLORS,
      ...userConfig?.accentColors,
    },
  }), [userConfig])

  // State
  const [isDragging, setIsDragging] = React.useState(false)
  const [draggedId, setDraggedIdState] = React.useState<string | null>(null)
  const [dropPreview, setDropPreviewState] = React.useState<DropPreview | null>(null)
  const [expandedIds, setExpandedIds] = React.useState<Set<string>>(
    () => new Set(initialExpandedIds)
  )

  // State object
  const state: DnDState = React.useMemo(() => ({
    isDragging,
    draggedId,
    dropPreview,
    expandedIds,
  }), [isDragging, draggedId, dropPreview, expandedIds])

  // Actions
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

  // Context value
  const value: DnDTreeContextValue<T> = React.useMemo(() => ({
    config,
    state,
    actions,
    callbacks,
    customActions,
    selectedId,
    renderIcon,
    slots,
  }), [config, state, actions, callbacks, customActions, selectedId, renderIcon, slots])

  return (
    <DnDTreeContext.Provider value={value}>
      {children}
    </DnDTreeContext.Provider>
  )
}

// ============================================================================
// Export
// ============================================================================

export { DnDTreeContext }
