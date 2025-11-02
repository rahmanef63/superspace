/**
 * Universal Toolbar System - Type Definitions
 * 
 * Type-safe, modular toolbar system with built-in responsive support.
 * Similar to variant-registry but for toolbars.
 * 
 * @author SuperSpace Team
 * @version 1.0.0
 */

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import type { z } from "zod";

/** Branded ID for type safety */
export type ToolId = string & { readonly __brand: "ToolId" };

/** Helper to create type-safe tool IDs */
export const asToolId = (s: string): ToolId => s as ToolId;

/**
 * Tool position in toolbar
 */
export type ToolPosition = "left" | "center" | "right";

/**
 * Toolbar layout orientation
 */
export type ToolbarLayout = "horizontal" | "vertical" | "wrap";

/**
 * Toolbar position on screen
 */
export type ToolbarPosition = "top" | "bottom" | "floating" | "sticky";

/**
 * View mode types for content display
 */
export type ViewMode = 
  | "grid"        // Grid of cards
  | "list"        // List rows
  | "tiles"       // Compact tiles
  | "detail"      // With detail panel
  | "thumbnails"  // Thumbnail gallery
  | "content"     // Content-focused
  | "table"       // Table view
  | "kanban"      // Kanban board
  | "calendar";   // Calendar view

/**
 * Responsive breakpoint behavior
 */
export interface ResponsiveConfig {
  /** Hide on mobile (<640px) */
  hideMobile?: boolean;
  /** Hide on tablet (640-1024px) */
  hideTablet?: boolean;
  /** Hide on desktop (>1024px) */
  hideDesktop?: boolean;
  /** Collapse to dropdown on mobile */
  collapseOnMobile?: boolean;
  /** Custom breakpoint behavior */
  customBreakpoints?: {
    sm?: boolean;   // 640px
    md?: boolean;   // 768px
    lg?: boolean;   // 1024px
    xl?: boolean;   // 1280px
    "2xl"?: boolean; // 1536px
  };
}

/**
 * Base tool configuration
 */
export interface ToolConfig<Params = any> {
  /** Unique tool identifier */
  id: ToolId;
  /** Tool type (search, filter, sort, etc.) */
  type: string;
  /** Tool label */
  label?: string;
  /** Tool icon */
  icon?: LucideIcon;
  /** Position in toolbar */
  position?: ToolPosition;
  /** Responsive behavior */
  responsive?: ResponsiveConfig;
  /** Tool-specific parameters */
  params?: Params;
  /** Whether tool is disabled */
  disabled?: boolean;
  /** Custom className */
  className?: string;
}

/**
 * Search tool parameters
 */
export interface SearchToolParams {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
  clearable?: boolean;
  shortcuts?: string; // e.g., "Ctrl+K"
}

/**
 * Sort option configuration
 */
export interface SortOption {
  label: string;
  value: string;
  icon?: LucideIcon;
  direction?: "asc" | "desc";
}

/**
 * Sort tool parameters
 */
export interface SortToolParams {
  options: SortOption[];
  currentSort?: string;
  currentDirection?: "asc" | "desc";
  onChange: (value: string, direction?: "asc" | "desc") => void;
  showDirection?: boolean;
}

/**
 * Filter option configuration
 */
export interface FilterOption {
  label: string;
  value: string;
  icon?: LucideIcon;
  active?: boolean;
  count?: number;
  color?: string;
}

/**
 * Filter tool parameters
 */
export interface FilterToolParams {
  options: FilterOption[];
  onToggle: (value: string) => void;
  mode?: "single" | "multiple";
  showCount?: boolean;
  showClearAll?: boolean;
}

/**
 * View option configuration
 */
export interface ViewOption {
  label: string;
  value: ViewMode;
  icon: LucideIcon;
  description?: string;
}

/**
 * View tool parameters
 */
export interface ViewToolParams {
  options: ViewOption[];
  currentView: ViewMode;
  onChange: (value: ViewMode) => void;
  layout?: "buttons" | "dropdown" | "segmented";
  showLabels?: boolean;
}

/**
 * Action button configuration
 */
export interface ActionButton {
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  disabled?: boolean;
  loading?: boolean;
  shortcut?: string;
}

/**
 * Actions tool parameters
 */
export interface ActionsToolParams {
  actions: ActionButton[];
  layout?: "inline" | "dropdown" | "menu";
  primary?: string; // ID of primary action
  maxVisible?: number; // Max actions visible before overflow
}

/**
 * Tabs configuration
 */
export interface TabOption {
  label: string;
  value: string;
  icon?: LucideIcon;
  count?: number;
  disabled?: boolean;
}

/**
 * Tabs tool parameters
 */
export interface TabsToolParams {
  tabs: TabOption[];
  currentTab: string;
  onChange: (value: string) => void;
  variant?: "default" | "pills" | "underline";
}

/**
 * Breadcrumb item
 */
export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: LucideIcon;
}

/**
 * Breadcrumb tool parameters
 */
export interface BreadcrumbToolParams {
  items: BreadcrumbItem[];
  separator?: ReactNode;
  maxItems?: number;
  collapseBefore?: number;
}

/**
 * Context passed to tool renderers
 */
export interface ToolRenderContext<Params = any> {
  /** Tool configuration */
  tool: ToolConfig<Params>;
  /** Whether toolbar is in mobile view */
  isMobile: boolean;
  /** Whether toolbar is in tablet view */
  isTablet: boolean;
  /** Whether toolbar is in desktop view */
  isDesktop: boolean;
  /** Current breakpoint */
  breakpoint: "mobile" | "tablet" | "desktop";
}

/**
 * Tool definition with type-safe params
 */
export interface ToolDef<Params = any> {
  /** Unique tool type identifier */
  id: ToolId;
  /** Human-readable title */
  title?: string;
  /** Description for documentation */
  description?: string;
  /** Zod schema for validating params */
  paramsSchema: z.ZodType<Params>;
  /** Render function that returns React element */
  render: (ctx: ToolRenderContext<Params>) => ReactNode;
  /** Default responsive config */
  defaultResponsive?: ResponsiveConfig;
}

/**
 * Toolbar configuration
 */
export interface ToolbarConfig {
  /** Toolbar tools */
  tools: ToolConfig[];
  /** Layout orientation */
  layout?: ToolbarLayout;
  /** Position on screen */
  position?: ToolbarPosition;
  /** Spacing between tools */
  spacing?: "compact" | "normal" | "relaxed";
  /** Border style */
  border?: "none" | "top" | "bottom" | "both";
  /** Background style */
  background?: "transparent" | "muted" | "card";
  /** Custom className */
  className?: string;
  /** Stick to top when scrolling */
  sticky?: boolean;
  /** Z-index for stacking */
  zIndex?: number;
}
