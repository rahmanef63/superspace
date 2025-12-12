/**
 * Three Column Layout Types
 */

import type { ReactNode } from "react"

// ---------------------------------------------------------------------------
// Presets
// ---------------------------------------------------------------------------

export type ThreeColumnPresetName = "feature" | "store" | "admin" | "ide"

export type ThreeColumnPresetConfig = Partial<
  Omit<
    ThreeColumnLayoutAdvancedProps,
    "left" | "center" | "right" | "className" | "preset" | "leftHeader" | "centerHeader" | "rightHeader"
  >
>

// ---------------------------------------------------------------------------
// Main Props
// ---------------------------------------------------------------------------

export interface ThreeColumnLayoutAdvancedProps {
  /** Left panel content (optional). If null/undefined, left panel is hidden. */
  left?: ReactNode
  /** Center panel content (main content area) */
  center: ReactNode
  /** Right panel content (optional). If null/undefined, right panel is hidden. */
  right?: ReactNode
  /** Additional class names for the container */
  className?: string

  /** Optional preset name or config to reduce duplication */
  preset?: ThreeColumnPresetName | ThreeColumnPresetConfig

  // Panel Configuration
  /** Left panel default width */
  leftWidth?: number
  /** Right panel default width */
  rightWidth?: number
  /** Center panel minimum width (prevents squishing) */
  centerMinWidth?: number
  /** Minimum width for side panels */
  minSideWidth?: number
  /** Maximum width for side panels */
  maxSideWidth?: number
  /** Width when collapsed (applies to both sides unless hidden) */
  collapsedWidth?: number

  // Size Distribution (when viewport is constrained)
  /** How to distribute/allow shrinking: 'center-priority' protects center, 'right-priority' protects right */
  spaceDistribution?: "center-priority" | "right-priority" | "equal"

  // Optional custom headers per panel (rendered when expanded)
  leftHeader?: ReactNode
  centerHeader?: ReactNode
  rightHeader?: ReactNode

  // Collapse / Visibility State
  /** Force-hide left panel entirely (overrides left content) */
  leftHidden?: boolean
  /** Force-hide right panel entirely (overrides right content) */
  rightHidden?: boolean
  /** Whether left panel is collapsed (controlled) */
  leftCollapsed?: boolean
  /** Whether right panel is collapsed (controlled) */
  rightCollapsed?: boolean
  /** Callback when left panel collapse state changes */
  onLeftCollapsedChange?: (collapsed: boolean) => void
  /** Callback when right panel collapse state changes */
  onRightCollapsedChange?: (collapsed: boolean) => void
  /** Default left collapsed state */
  defaultLeftCollapsed?: boolean
  /** Default right collapsed state */
  defaultRightCollapsed?: boolean

  // Features
  /** Enable resizable panels */
  resizable?: boolean
  /** Show collapse buttons (global default) */
  showCollapseButtons?: boolean
  /** Override collapse button visibility for left panel */
  showLeftCollapseButton?: boolean
  /** Override collapse button visibility for right panel */
  showRightCollapseButton?: boolean
  /** Persist collapse state to localStorage */
  persistState?: boolean
  /** Storage key for persisting state */
  storageKey?: string

  // Labels
  /** Left panel label (for accessibility & collapsed indicator) */
  leftLabel?: string
  /** Center panel label */
  centerLabel?: string
  /** Right panel label */
  rightLabel?: string

  // Responsive
  /** Breakpoint to collapse left panel automatically (px). Default: 640 (mobile only) */
  collapseLeftAt?: number
  /** Breakpoint to collapse right panel automatically (px). Default: 1024 (collapses first) */
  collapseRightAt?: number
  /** Breakpoint to stack vertically (px). Default: 480. Set to 0 to disable. */
  stackAt?: number
}

export interface ThreeColumnContextValue {
  leftCollapsed: boolean
  rightCollapsed: boolean
  toggleLeft: () => void
  toggleRight: () => void
}

export interface CollapseButtonProps {
  side: "left" | "right"
  collapsed: boolean
  onClick: () => void
  label?: string
}

export interface PanelHeaderProps {
  side: "left" | "right"
  collapsed: boolean
  onToggle: () => void
  label?: string
  showButton: boolean
  children?: ReactNode
}

export interface CollapsedPanelProps {
  side: "left" | "right"
  label?: string
  onClick: () => void
  width: number
}

export interface PanelProps {
  children: ReactNode
  className?: string
}
