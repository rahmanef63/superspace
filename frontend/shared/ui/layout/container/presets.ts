/**
 * Layout Presets
 * 
 * Pre-built layout configurations for common use cases.
 * These can be used directly or as starting points for customization.
 */

import type { LayoutNode } from "./types"

// ============================================================================
// Basic Layouts
// ============================================================================

/**
 * Single full-width panel
 */
export const LAYOUT_FULL: LayoutNode = {
  type: "single",
  id: "main"
}

/**
 * Two equal columns (left-right)
 */
export const LAYOUT_SPLIT_2_VERTICAL: LayoutNode = {
  type: "split_vertical",
  mode: "equal",
  resizable: true,
  children: [
    { type: "single", id: "left" },
    { type: "single", id: "right" }
  ]
}

/**
 * Two equal rows (top-bottom)
 */
export const LAYOUT_SPLIT_2_HORIZONTAL: LayoutNode = {
  type: "split_horizontal",
  mode: "equal",
  resizable: true,
  children: [
    { type: "single", id: "top" },
    { type: "single", id: "bottom" }
  ]
}

/**
 * Three equal columns
 */
export const LAYOUT_SPLIT_3_VERTICAL: LayoutNode = {
  type: "split_vertical",
  mode: "equal",
  resizable: true,
  children: [
    { type: "single", id: "left" },
    { type: "single", id: "center" },
    { type: "single", id: "right" }
  ]
}

/**
 * Three equal rows
 */
export const LAYOUT_SPLIT_3_HORIZONTAL: LayoutNode = {
  type: "split_horizontal",
  mode: "equal",
  resizable: true,
  children: [
    { type: "single", id: "top" },
    { type: "single", id: "middle" },
    { type: "single", id: "bottom" }
  ]
}

// ============================================================================
// Common App Layouts
// ============================================================================

/**
 * Sidebar + Content layout (30% - 70%)
 */
export const LAYOUT_SIDEBAR_CONTENT: LayoutNode = {
  type: "split_vertical",
  mode: "custom",
  resizable: true,
  children: [
    { type: "single", id: "sidebar", size: "30%", minSize: 200, maxSize: 400 },
    { type: "single", id: "content", size: "70%" }
  ]
}

/**
 * IDE-style layout: Sidebar + Editor + Inspector
 */
export const LAYOUT_IDE: LayoutNode = {
  type: "split_vertical",
  mode: "custom",
  resizable: true,
  children: [
    { type: "single", id: "sidebar", size: "20%", minSize: 200, maxSize: 350 },
    { type: "single", id: "editor", size: "55%", minSize: 300 },
    { type: "single", id: "inspector", size: "25%", minSize: 250, maxSize: 400 }
  ]
}

/**
 * Master-detail layout with header
 */
export const LAYOUT_MASTER_DETAIL: LayoutNode = {
  type: "split_horizontal",
  mode: "custom",
  children: [
    { type: "single", id: "header", size: "auto" },
    {
      type: "split_vertical",
      mode: "custom",
      resizable: true,
      children: [
        { type: "single", id: "master", size: "35%", minSize: 250 },
        { type: "single", id: "detail", size: "65%" }
      ]
    }
  ]
}

// ============================================================================
// Nested Layouts
// ============================================================================

/**
 * Sidebar with split content (horizontal split on right)
 */
export const LAYOUT_SIDEBAR_SPLIT_CONTENT: LayoutNode = {
  type: "split_vertical",
  mode: "custom",
  resizable: true,
  children: [
    { type: "single", id: "sidebar", size: "25%", minSize: 200 },
    {
      type: "split_horizontal",
      mode: "equal",
      resizable: true,
      children: [
        { type: "single", id: "content_top" },
        { type: "single", id: "content_bottom" }
      ]
    }
  ]
}

/**
 * Dashboard layout: Header + Sidebar + Main + Right panel
 */
export const LAYOUT_DASHBOARD: LayoutNode = {
  type: "split_horizontal",
  mode: "custom",
  children: [
    { type: "single", id: "header", size: "60px" },
    {
      type: "split_vertical",
      mode: "custom",
      resizable: true,
      children: [
        { type: "single", id: "sidebar", size: "240px", minSize: 200 },
        { type: "single", id: "main", size: 3 },
        { type: "single", id: "panel", size: 1, minSize: 280 }
      ]
    }
  ]
}

// ============================================================================
// Responsive Layouts
// ============================================================================

/**
 * Responsive sidebar layout
 * - Desktop: Sidebar + Content
 * - Tablet: Sidebar + Content (smaller sidebar)
 * - Mobile: Single panel (sidebar hidden or overlay)
 */
export const LAYOUT_RESPONSIVE_SIDEBAR: LayoutNode = {
  type: "split_vertical",
  mode: "custom",
  resizable: true,
  children: [
    { type: "single", id: "sidebar", size: "280px", minSize: 200 },
    { type: "single", id: "content" }
  ],
  responsive: {
    mobile: {
      type: "single",
      id: "content"
    },
    tablet: {
      type: "split_vertical",
      mode: "custom",
      resizable: true,
      children: [
        { type: "single", id: "sidebar", size: "220px", minSize: 180 },
        { type: "single", id: "content" }
      ]
    }
  }
}

/**
 * Responsive 3-column layout
 * - Desktop: 3 columns
 * - Tablet: 2 columns (right panel hidden)
 * - Mobile: 1 column
 */
export const LAYOUT_RESPONSIVE_3_COLUMN: LayoutNode = {
  type: "split_vertical",
  mode: "equal",
  resizable: true,
  children: [
    { type: "single", id: "left" },
    { type: "single", id: "center" },
    { type: "single", id: "right" }
  ],
  responsive: {
    mobile: {
      type: "single",
      id: "center"
    },
    tablet: {
      type: "split_vertical",
      mode: "custom",
      resizable: true,
      children: [
        { type: "single", id: "left", size: "35%" },
        { type: "single", id: "center", size: "65%" }
      ]
    }
  }
}

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Create a split layout with N equal panels
 */
export function createEqualSplit(
  direction: "vertical" | "horizontal",
  panelIds: string[],
  options?: {
    resizable?: boolean
    gap?: number | string
  }
): LayoutNode {
  return {
    type: direction === "vertical" ? "split_vertical" : "split_horizontal",
    mode: "equal",
    resizable: options?.resizable ?? true,
    gap: options?.gap,
    children: panelIds.map(id => ({ type: "single", id }))
  }
}

/**
 * Create a split layout with custom sizes
 */
export function createCustomSplit(
  direction: "vertical" | "horizontal",
  panels: Array<{
    id: string
    size: string | number
    minSize?: string | number
    maxSize?: string | number
  }>,
  options?: {
    resizable?: boolean
    gap?: number | string
  }
): LayoutNode {
  return {
    type: direction === "vertical" ? "split_vertical" : "split_horizontal",
    mode: "custom",
    resizable: options?.resizable ?? true,
    gap: options?.gap,
    children: panels.map(panel => ({
      type: "single",
      id: panel.id,
      size: panel.size,
      minSize: panel.minSize,
      maxSize: panel.maxSize
    }))
  }
}

/**
 * Wrap a layout with responsive overrides
 */
export function withResponsive(
  baseLayout: LayoutNode,
  overrides: {
    mobile?: LayoutNode
    tablet?: LayoutNode
  }
): LayoutNode {
  return {
    ...baseLayout,
    responsive: overrides
  }
}

// ============================================================================
// Preset Map (for AI/config-driven selection)
// ============================================================================

export const LAYOUT_PRESETS = {
  full: LAYOUT_FULL,
  "split-2-vertical": LAYOUT_SPLIT_2_VERTICAL,
  "split-2-horizontal": LAYOUT_SPLIT_2_HORIZONTAL,
  "split-3-vertical": LAYOUT_SPLIT_3_VERTICAL,
  "split-3-horizontal": LAYOUT_SPLIT_3_HORIZONTAL,
  "sidebar-content": LAYOUT_SIDEBAR_CONTENT,
  ide: LAYOUT_IDE,
  "master-detail": LAYOUT_MASTER_DETAIL,
  "sidebar-split": LAYOUT_SIDEBAR_SPLIT_CONTENT,
  dashboard: LAYOUT_DASHBOARD,
  "responsive-sidebar": LAYOUT_RESPONSIVE_SIDEBAR,
  "responsive-3-column": LAYOUT_RESPONSIVE_3_COLUMN,
} as const

export type LayoutPresetName = keyof typeof LAYOUT_PRESETS

/**
 * Get a preset layout by name
 */
export function getPreset(name: LayoutPresetName): LayoutNode {
  return LAYOUT_PRESETS[name]
}
