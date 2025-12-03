/**
 * Layout Container System
 * 
 * Declarative, JSON-driven layout system for flexible panel arrangements.
 * 
 * Features:
 * - Single, split vertical, split horizontal layouts
 * - Nested combinations
 * - Resizable panels with drag handles
 * - Responsive breakpoint support
 * - AI-friendly configuration
 * 
 * @example
 * ```tsx
 * import { LayoutContainer, LAYOUT_SPLIT_2_VERTICAL } from "@/frontend/shared/ui/layout/container"
 * 
 * <LayoutContainer
 *   layout={LAYOUT_SPLIT_2_VERTICAL}
 *   renderPanel={(ctx) => <div>Panel {ctx.id}</div>}
 * />
 * ```
 */

// Types
export type {
  LayoutType,
  SplitMode,
  LayoutNode,
  Breakpoint,
  PanelRenderContext,
  LayoutContainerProps,
  LayoutNodeRendererProps,
  ResizeState,
} from "./types"

// Utils
export {
  isSplit,
  isSingle,
  isVerticalSplit,
  isHorizontalSplit,
  getSizeStyle,
  getConstraintStyles,
  getGapStyle,
  normalizeLayout,
  getPanelIds,
  findNodeById,
  validateLayout,
  getCurrentBreakpoint,
  getResponsiveLayout,
  calculateInitialSizes,
} from "./utils"
export type { ValidationResult } from "./utils"

// Presets
export {
  LAYOUT_FULL,
  LAYOUT_SPLIT_2_VERTICAL,
  LAYOUT_SPLIT_2_HORIZONTAL,
  LAYOUT_SPLIT_3_VERTICAL,
  LAYOUT_SPLIT_3_HORIZONTAL,
  LAYOUT_SIDEBAR_CONTENT,
  LAYOUT_IDE,
  LAYOUT_MASTER_DETAIL,
  LAYOUT_SIDEBAR_SPLIT_CONTENT,
  LAYOUT_DASHBOARD,
  LAYOUT_RESPONSIVE_SIDEBAR,
  LAYOUT_RESPONSIVE_3_COLUMN,
  LAYOUT_PRESETS,
  createEqualSplit,
  createCustomSplit,
  withResponsive,
  getPreset,
} from "./presets"
export type { LayoutPresetName } from "./presets"

// Components
export {
  LayoutContainer,
  SingleLayout,
  SplitVerticalLayout,
  SplitHorizontalLayout,
  SidebarLayout,
} from "./LayoutContainer"

export { ResizeHandle } from "./ResizeHandle"
export type { ResizeHandleProps } from "./ResizeHandle"

// Collapsible Panel
export { CollapsiblePanel } from "./CollapsiblePanel"
export type { CollapsiblePanelProps, CollapseDirection } from "./CollapsiblePanel"

// Three Column Layout (Advanced)
export {
  ThreeColumnLayoutAdvanced,
  ThreeColumnLayoutAdvanced as ThreeColumnLayout, // Alias for backward compatibility
  useThreeColumnLayout,
  LeftPanel,
  CenterPanel,
  RightPanel,
} from "./ThreeColumnLayout"
export type { ThreeColumnLayoutAdvancedProps } from "./ThreeColumnLayout"

// Page Container
export { PageContainer } from "./PageContainer"
export type { PageContainerProps } from "./PageContainer"

// Draggable Topbar
export { 
  DraggableTopbar,
  PanelTopbar,
} from "./DraggableTopbar"
export type { 
  DraggableTopbarProps,
  PanelTopbarProps,
  TopbarTab,
} from "./DraggableTopbar"
