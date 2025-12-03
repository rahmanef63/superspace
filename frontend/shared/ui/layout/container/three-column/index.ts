/**
 * Three Column Layout (Advanced)
 * 
 * Modular three-column layout system with:
 * - Collapsible left and right panels
 * - Resizable panel widths
 * - Responsive breakpoint behavior
 * - Keyboard accessibility (Cmd+B, Cmd+Shift+B)
 * - Smooth animations
 * - Persist collapse state (optional)
 * 
 * @example
 * ```tsx
 * import { ThreeColumnLayoutAdvanced, LeftPanel, CenterPanel, RightPanel } from "./three-column"
 * 
 * <ThreeColumnLayoutAdvanced
 *   left={<Sidebar />}
 *   center={<MainContent />}
 *   right={<Inspector />}
 *   resizable
 *   showCollapseButtons
 *   persistState
 * />
 * ```
 */

// Types
export type {
  ThreeColumnLayoutAdvancedProps,
  ThreeColumnContextValue,
  CollapseButtonProps,
  PanelHeaderProps,
  CollapsedPanelProps,
  PanelProps,
} from "./types"

// Context
export { ThreeColumnContext, useThreeColumnLayout, useThreeColumnLayoutSafe } from "./context"

// Hooks
export { usePersistedState, useResponsiveCollapse, useStackedLayout } from "./hooks"

// Components
export { ThreeColumnLayoutAdvanced } from "./ThreeColumnLayout"
export { CollapseButton } from "./CollapseButton"
export { PanelHeader } from "./PanelHeader"
export { CollapsedPanel } from "./CollapsedPanel"
export { LeftPanel, CenterPanel, RightPanel } from "./Panels"
