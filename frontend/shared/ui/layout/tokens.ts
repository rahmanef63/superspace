/**
 * Layout Tokens - Single Source of Truth for Layout Styling
 * 
 * Consistent padding, spacing, sizing, and styling across all layout components.
 * Import these tokens instead of hardcoding values to ensure UI consistency.
 * 
 * @module shared/ui/layout/tokens
 */

// =============================================================================
// SPACING TOKENS
// =============================================================================

/**
 * Padding presets for content areas
 * Use these for consistent internal padding across all layouts
 */
export const LAYOUT_PADDING = {
  none: "",
  xs: "p-1",
  sm: "p-2",
  md: "p-3",
  lg: "p-4",
  xl: "p-6",
  "2xl": "p-8",
} as const;

/**
 * Horizontal padding (for headers, footers, toolbars)
 */
export const LAYOUT_PADDING_X = {
  none: "",
  xs: "px-1",
  sm: "px-2",
  md: "px-3",
  lg: "px-4",
  xl: "px-6",
  "2xl": "px-8",
} as const;

/**
 * Vertical padding
 */
export const LAYOUT_PADDING_Y = {
  none: "",
  xs: "py-1",
  sm: "py-1.5",
  md: "py-2",
  lg: "py-3",
  xl: "py-4",
  "2xl": "py-6",
} as const;

/**
 * Combined padding for headers/footers (horizontal + vertical)
 */
export const LAYOUT_HEADER_PADDING = {
  none: "",
  xs: "px-2 py-1",
  sm: "px-3 py-1.5",
  md: "px-4 py-2",
  lg: "px-4 py-3",
  xl: "px-6 py-4",
} as const;

/**
 * Gap spacing for flex/grid layouts
 */
export const LAYOUT_GAP = {
  none: "",
  xs: "gap-1",
  sm: "gap-2",
  md: "gap-3",
  lg: "gap-4",
  xl: "gap-6",
} as const;

// =============================================================================
// SIZE TOKENS
// =============================================================================

/**
 * Standard panel widths (in pixels)
 */
export const PANEL_WIDTH = {
  /** Extra small sidebar - 200px */
  xs: 200,
  /** Small sidebar - 240px */
  sm: 240,
  /** Medium sidebar - 280px */
  md: 280,
  /** Standard sidebar - 320px */
  default: 320,
  /** Large sidebar - 360px */
  lg: 360,
  /** Extra large sidebar - 400px */
  xl: 400,
  /** Wide inspector - 480px */
  "2xl": 480,
} as const;

/**
 * Panel width constraints
 */
export const PANEL_CONSTRAINTS = {
  /** Minimum sidebar width */
  minSidebar: 200,
  /** Maximum sidebar width */
  maxSidebar: 480,
  /** Minimum center panel width */
  minCenter: 300,
  /** Collapsed panel width */
  collapsed: 40,
} as const;

/**
 * Panel width CSS classes (for Tailwind)
 */
export const PANEL_WIDTH_CLASS = {
  xs: "w-[200px]",
  sm: "w-[240px]",
  md: "w-[280px]",
  default: "w-[320px]",
  lg: "w-[360px]",
  xl: "w-[400px]",
  "2xl": "w-[480px]",
} as const;

/**
 * Header heights
 */
export const HEADER_HEIGHT = {
  sm: "h-10",
  md: "h-12",
  lg: "h-14",
} as const;

/**
 * Toolbar heights (consistent with header)
 */
export const TOOLBAR_HEIGHT = {
  sm: "h-9",
  md: "h-10",
  lg: "h-12",
} as const;

// =============================================================================
// BORDER TOKENS
// =============================================================================

export const LAYOUT_BORDER = {
  none: "",
  default: "border",
  top: "border-t",
  bottom: "border-b",
  left: "border-l",
  right: "border-r",
  subtle: "border border-border/50",
  subtleTop: "border-t border-border/50",
  subtleBottom: "border-b border-border/50",
} as const;

// =============================================================================
// BACKGROUND TOKENS
// =============================================================================

export const LAYOUT_BACKGROUND = {
  transparent: "",
  default: "bg-background",
  muted: "bg-muted/30",
  mutedStrong: "bg-muted/50",
  sidebar: "bg-muted/30",
  panel: "bg-muted/20",
  surface: "bg-card",
} as const;

// =============================================================================
// CONTAINER TOKENS (Full classes for common patterns)
// =============================================================================

/**
 * Root container classes
 */
export const CONTAINER_ROOT = "flex flex-col h-full w-full overflow-hidden" as const;

/**
 * Flex row container
 */
export const CONTAINER_ROW = "flex flex-row h-full w-full overflow-hidden" as const;

/**
 * Scrollable content area
 */
export const CONTAINER_SCROLL = "flex-1 min-h-0 overflow-auto" as const;

/**
 * Fixed header/footer area
 */
export const CONTAINER_FIXED = "shrink-0" as const;

// =============================================================================
// PRESET CLASSES (Ready-to-use class combinations)
// =============================================================================

/**
 * Panel header preset classes
 */
export const PANEL_HEADER_CLASSES = {
  default: "shrink-0 px-4 py-2 border-b",
  muted: "shrink-0 px-4 py-2 border-b bg-muted/30",
  transparent: "shrink-0 px-4 py-2 border-b",
  minimal: "shrink-0 px-3 py-1.5 border-b border-border/50",
} as const;

/**
 * Panel body preset classes
 */
export const PANEL_BODY_CLASSES = {
  default: "flex-1 min-h-0 overflow-auto",
  padded: "flex-1 min-h-0 overflow-auto p-4",
  paddedSm: "flex-1 min-h-0 overflow-auto p-2",
  paddedLg: "flex-1 min-h-0 overflow-auto p-6",
} as const;

/**
 * Panel footer preset classes
 */
export const PANEL_FOOTER_CLASSES = {
  default: "shrink-0 px-4 py-2 border-t",
  muted: "shrink-0 px-4 py-2 border-t bg-muted/30",
  minimal: "shrink-0 px-3 py-1.5 border-t border-border/50",
} as const;

/**
 * Sidebar panel preset classes
 */
export const SIDEBAR_CLASSES = {
  left: "shrink-0 border-r bg-muted/30 overflow-hidden",
  right: "shrink-0 border-l bg-muted/20 overflow-hidden",
  center: "flex-1 min-w-0 overflow-hidden",
} as const;

// =============================================================================
// RESPONSIVE BREAKPOINTS
// =============================================================================

export const BREAKPOINTS = {
  /** Extra small screens */
  xs: 480,
  /** Small screens (mobile) */
  sm: 640,
  /** Medium screens (tablet) */
  md: 768,
  /** Large screens (desktop) */
  lg: 1024,
  /** Extra large screens */
  xl: 1280,
  /** 2x extra large screens */
  "2xl": 1536,
} as const;

/**
 * Default responsive behavior for layouts
 */
export const RESPONSIVE_COLLAPSE = {
  /** Stack all panels at this width */
  stackAt: 480,
  /** Collapse left panel at this width */
  collapseLeftAt: 640,
  /** Collapse right panel at this width */
  collapseRightAt: 1024,
} as const;

// =============================================================================
// ANIMATION TOKENS
// =============================================================================

export const LAYOUT_TRANSITION = {
  none: "",
  fast: "transition-all duration-150 ease-in-out",
  default: "transition-all duration-200 ease-in-out",
  slow: "transition-all duration-300 ease-in-out",
} as const;

// =============================================================================
// TYPE EXPORTS
// =============================================================================

export type LayoutPadding = keyof typeof LAYOUT_PADDING;
export type LayoutPaddingX = keyof typeof LAYOUT_PADDING_X;
export type LayoutPaddingY = keyof typeof LAYOUT_PADDING_Y;
export type LayoutHeaderPadding = keyof typeof LAYOUT_HEADER_PADDING;
export type LayoutGap = keyof typeof LAYOUT_GAP;
export type PanelWidth = keyof typeof PANEL_WIDTH;
export type HeaderHeight = keyof typeof HEADER_HEIGHT;
export type ToolbarHeight = keyof typeof TOOLBAR_HEIGHT;
export type LayoutBorder = keyof typeof LAYOUT_BORDER;
export type LayoutBackground = keyof typeof LAYOUT_BACKGROUND;
export type LayoutTransition = keyof typeof LAYOUT_TRANSITION;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get panel width in pixels
 */
export function getPanelWidth(size: PanelWidth | number): number {
  if (typeof size === "number") return size;
  return PANEL_WIDTH[size];
}

/**
 * Get padding class
 */
export function getPaddingClass(
  size: LayoutPadding,
  type: "all" | "x" | "y" = "all"
): string {
  if (type === "x") return LAYOUT_PADDING_X[size as keyof typeof LAYOUT_PADDING_X] ?? "";
  if (type === "y") return LAYOUT_PADDING_Y[size as keyof typeof LAYOUT_PADDING_Y] ?? "";
  return LAYOUT_PADDING[size] ?? "";
}

/**
 * Create consistent header classes
 */
export function createHeaderClasses(options: {
  padding?: LayoutHeaderPadding;
  border?: "none" | "default" | "subtle";
  background?: "transparent" | "muted" | "solid";
} = {}): string {
  const { padding = "md", border = "default", background = "transparent" } = options;
  
  const classes = ["shrink-0 z-10", LAYOUT_HEADER_PADDING[padding]];
  
  if (border === "default") classes.push("border-b");
  if (border === "subtle") classes.push("border-b border-border/50");
  
  if (background === "muted") classes.push("bg-muted/30");
  if (background === "solid") classes.push("bg-background");
  
  return classes.filter(Boolean).join(" ");
}

/**
 * Create consistent footer classes
 */
export function createFooterClasses(options: {
  padding?: LayoutHeaderPadding;
  border?: "none" | "default" | "subtle";
  background?: "transparent" | "muted" | "solid";
} = {}): string {
  const { padding = "md", border = "default", background = "transparent" } = options;
  
  const classes = ["shrink-0 z-10", LAYOUT_HEADER_PADDING[padding]];
  
  if (border === "default") classes.push("border-t");
  if (border === "subtle") classes.push("border-t border-border/50");
  
  if (background === "muted") classes.push("bg-muted/30");
  if (background === "solid") classes.push("bg-background");
  
  return classes.filter(Boolean).join(" ");
}
