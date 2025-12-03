/**
 * Layout Container Utilities
 * 
 * Helper functions for layout manipulation, validation, and size calculations.
 */

import type { LayoutNode, LayoutType, Breakpoint } from "./types"

// ============================================================================
// Type Guards
// ============================================================================

/**
 * Check if a layout node is a split type
 */
export function isSplit(node: LayoutNode): boolean {
  return node.type === "split_vertical" || node.type === "split_horizontal"
}

/**
 * Check if a layout node is a single panel
 */
export function isSingle(node: LayoutNode): boolean {
  return node.type === "single"
}

/**
 * Check if a layout type is vertical (columns)
 */
export function isVerticalSplit(type: LayoutType): boolean {
  return type === "split_vertical"
}

/**
 * Check if a layout type is horizontal (rows)
 */
export function isHorizontalSplit(type: LayoutType): boolean {
  return type === "split_horizontal"
}

// ============================================================================
// Size Utilities
// ============================================================================

/**
 * Convert a size value to a CSS flex value
 */
export function getSizeStyle(
  size: string | number | undefined,
  mode: "equal" | "custom" = "equal"
): React.CSSProperties {
  if (mode === "equal" || size === undefined) {
    return { flex: 1, minWidth: 0, minHeight: 0 }
  }

  if (typeof size === "number") {
    return { flex: size, minWidth: 0, minHeight: 0 }
  }

  // Handle percentage
  if (size.endsWith("%")) {
    const percent = parseFloat(size)
    return { 
      flex: `0 0 ${percent}%`,
      minWidth: 0, 
      minHeight: 0 
    }
  }

  // Handle fr units (treat as flex ratio)
  if (size.endsWith("fr")) {
    const fr = parseFloat(size)
    return { flex: fr, minWidth: 0, minHeight: 0 }
  }

  // Handle fixed sizes (px, rem, etc)
  if (size.endsWith("px") || size.endsWith("rem") || size.endsWith("em")) {
    return { 
      flex: `0 0 ${size}`,
      minWidth: 0, 
      minHeight: 0 
    }
  }

  // Handle "auto"
  if (size === "auto") {
    return { flex: "0 0 auto", minWidth: 0, minHeight: 0 }
  }

  // Default: treat as flex ratio
  const numericSize = parseFloat(size)
  if (!isNaN(numericSize)) {
    return { flex: numericSize, minWidth: 0, minHeight: 0 }
  }

  return { flex: 1, minWidth: 0, minHeight: 0 }
}

/**
 * Get min/max size constraints as CSS properties
 */
export function getConstraintStyles(
  node: LayoutNode,
  direction: "vertical" | "horizontal"
): React.CSSProperties {
  const styles: React.CSSProperties = {}
  
  if (direction === "vertical") {
    if (node.minSize) {
      styles.minWidth = typeof node.minSize === "number" 
        ? `${node.minSize}px` 
        : node.minSize
    }
    if (node.maxSize) {
      styles.maxWidth = typeof node.maxSize === "number" 
        ? `${node.maxSize}px` 
        : node.maxSize
    }
  } else {
    if (node.minSize) {
      styles.minHeight = typeof node.minSize === "number" 
        ? `${node.minSize}px` 
        : node.minSize
    }
    if (node.maxSize) {
      styles.maxHeight = typeof node.maxSize === "number" 
        ? `${node.maxSize}px` 
        : node.maxSize
    }
  }
  
  return styles
}

/**
 * Convert gap value to CSS
 */
export function getGapStyle(gap: number | string | undefined): string {
  if (gap === undefined || gap === 0) return "0"
  if (typeof gap === "number") return `${gap * 4}px` // Tailwind spacing (4px per unit)
  return gap
}

// ============================================================================
// Layout Normalization
// ============================================================================

/**
 * Normalize a layout node by filling in default values
 */
export function normalizeLayout(node: LayoutNode): LayoutNode {
  const normalized: LayoutNode = { ...node }

  // Set default mode for splits
  if (isSplit(normalized) && !normalized.mode) {
    normalized.mode = "equal"
  }

  // Recursively normalize children
  if (normalized.children) {
    normalized.children = normalized.children.map(normalizeLayout)
  }

  // Normalize responsive layouts
  if (normalized.responsive) {
    normalized.responsive = Object.fromEntries(
      Object.entries(normalized.responsive).map(([key, value]) => [
        key,
        value ? normalizeLayout(value) : value
      ])
    ) as Partial<Record<Breakpoint, LayoutNode>>
  }

  return normalized
}

/**
 * Get all panel IDs from a layout tree
 */
export function getPanelIds(node: LayoutNode): string[] {
  const ids: string[] = []
  
  if (node.id) {
    ids.push(node.id)
  }
  
  if (node.children) {
    for (const child of node.children) {
      ids.push(...getPanelIds(child))
    }
  }
  
  return ids
}

/**
 * Find a node by ID in the layout tree
 */
export function findNodeById(node: LayoutNode, id: string): LayoutNode | null {
  if (node.id === id) {
    return node
  }
  
  if (node.children) {
    for (const child of node.children) {
      const found = findNodeById(child, id)
      if (found) return found
    }
  }
  
  return null
}

// ============================================================================
// Validation
// ============================================================================

/**
 * Validation result
 */
export interface ValidationResult {
  valid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Validate a layout configuration
 */
export function validateLayout(node: LayoutNode, path: string[] = []): ValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  const currentPath = [...path, node.id || `[${node.type}]`].join(" > ")

  // Check split nodes have children
  if (isSplit(node)) {
    if (!node.children || node.children.length === 0) {
      errors.push(`${currentPath}: Split layout must have at least one child`)
    } else if (node.children.length === 1) {
      warnings.push(`${currentPath}: Split layout with only one child is equivalent to single`)
    }
  }

  // Check single nodes don't have children
  if (isSingle(node) && node.children && node.children.length > 0) {
    errors.push(`${currentPath}: Single layout should not have children`)
  }

  // Recursively validate children
  if (node.children) {
    for (const child of node.children) {
      const childResult = validateLayout(child, [...path, node.id || `[${node.type}]`])
      errors.push(...childResult.errors)
      warnings.push(...childResult.warnings)
    }
  }

  // Validate responsive layouts
  if (node.responsive) {
    for (const [breakpoint, responsiveNode] of Object.entries(node.responsive)) {
      if (responsiveNode) {
        const responsiveResult = validateLayout(
          responsiveNode, 
          [...path, `@${breakpoint}`]
        )
        errors.push(...responsiveResult.errors)
        warnings.push(...responsiveResult.warnings)
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  }
}

// ============================================================================
// Responsive Utilities
// ============================================================================

/**
 * Get the current breakpoint based on window width
 */
export function getCurrentBreakpoint(): Breakpoint {
  if (typeof window === "undefined") return "desktop"
  
  const width = window.innerWidth
  if (width < 768) return "mobile"
  if (width < 1024) return "tablet"
  return "desktop"
}

/**
 * Get the active layout for the current breakpoint
 */
export function getResponsiveLayout(
  node: LayoutNode,
  breakpoint: Breakpoint
): LayoutNode {
  // Check if there's a responsive override for this breakpoint
  if (node.responsive) {
    // Check in order of specificity: mobile -> tablet -> desktop
    if (breakpoint === "mobile" && node.responsive.mobile) {
      return node.responsive.mobile
    }
    if (breakpoint === "tablet" && node.responsive.tablet) {
      return node.responsive.tablet
    }
    if (breakpoint === "desktop" && node.responsive.desktop) {
      return node.responsive.desktop
    }
  }
  
  // Return the base layout (without responsive overrides)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { responsive, ...baseNode } = node
  return baseNode
}

// ============================================================================
// Size Distribution
// ============================================================================

/**
 * Calculate initial sizes for children based on their size config
 */
export function calculateInitialSizes(
  children: LayoutNode[],
  mode: "equal" | "custom" = "equal"
): number[] {
  if (mode === "equal" || children.every(c => c.size === undefined)) {
    // Equal distribution
    const equalSize = 100 / children.length
    return children.map(() => equalSize)
  }

  // Custom distribution
  const sizes: number[] = []
  let totalFlex = 0
  let remainingPercent = 100

  // First pass: collect fixed sizes and flex values
  for (const child of children) {
    if (typeof child.size === "string" && child.size.endsWith("%")) {
      const percent = parseFloat(child.size)
      sizes.push(percent)
      remainingPercent -= percent
    } else if (typeof child.size === "number") {
      totalFlex += child.size
      sizes.push(-child.size) // Negative to mark as flex
    } else if (typeof child.size === "string" && child.size.endsWith("fr")) {
      const fr = parseFloat(child.size)
      totalFlex += fr
      sizes.push(-fr) // Negative to mark as flex
    } else {
      totalFlex += 1
      sizes.push(-1) // Default flex
    }
  }

  // Second pass: distribute remaining space
  return sizes.map(size => {
    if (size >= 0) return size // Fixed percentage
    const flex = Math.abs(size)
    return (flex / totalFlex) * remainingPercent
  })
}
