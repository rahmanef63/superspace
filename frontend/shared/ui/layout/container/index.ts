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
 * - AI-Contactly configuration
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

// Three Column Layout (Advanced) - Modular structure in ./three-column/
export {
  ThreeColumnLayoutAdvanced,
  ThreeColumnLayoutAdvanced as ThreeColumnLayout, // Alias for backward compatibility
  useThreeColumnLayout,
  useThreeColumnLayoutSafe,
  LeftPanel,
  CenterPanel,
  RightPanel,
  // Sub-components for custom compositions
  CollapseButton,
  PanelHeader as ThreeColumnPanelHeader,
  CollapsedPanel as ThreeColumnCollapsedPanel,
  // Hooks for custom implementations
  usePersistedState,
  useResponsiveCollapse,
  useStackedLayout,
  useWindowWidth,
  THREE_COLUMN_PRESETS,
  resolveThreeColumnPreset,
} from "./three-column"
export type { 
  ThreeColumnLayoutAdvancedProps,
  ThreeColumnContextValue,
  ThreeColumnPresetName,
  ThreeColumnPresetConfig,
} from "./three-column"

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

// Column Layout System - For header/main/footer structure in each column
export {
  ColumnLayout,
  ColumnHeader,
  ColumnMain,
  ColumnFooter,
  LeftPanelLayout,
  CenterPanelLayout,
  RightPanelLayout,
  PanelRoot,
  PanelHeader,
  PanelBody,
  PanelFooter,
} from "./column-layout"
export type {
  ColumnLayoutProps,
  ColumnHeaderProps,
  ColumnMainProps,
  ColumnFooterProps,
} from "./column-layout"
