/**
 * Three Column Layout Types
 */

import type { ReactNode } from "react"

export interface ThreeColumnLayoutAdvancedProps {
  /** Left panel content */
  left: ReactNode
  /** Center panel content (main content area) */
  center: ReactNode
  /** Right panel content */
  right: ReactNode
  /** Additional class names for the container */
  className?: string
  
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
  /** Width when collapsed */
  collapsedWidth?: number
  
  // Size Distribution (when panels collapse)
  /** How to distribute space: 'center-priority' gives most to center, 'right-priority' to right */
  spaceDistribution?: "center-priority" | "right-priority" | "equal"
  
  // Collapse State
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
  /** Show collapse buttons */
  showCollapseButtons?: boolean
  /** Persist collapse state to localStorage */
  persistState?: boolean
  /** Storage key for persisting state */
  storageKey?: string
  
  // Labels
  /** Left panel label (for accessibility) */
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
