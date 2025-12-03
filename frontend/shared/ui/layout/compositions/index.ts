/**
 * Layout Compositions
 * 
 * Higher-order components that combine multiple layout entities.
 * Use these for common patterns instead of manually composing.
 */

// Composition components
export { LayoutSwitcher, useLayoutMode, type LayoutMode } from "./LayoutSwitcher";
export type { LayoutSwitcherProps } from "./LayoutSwitcher";

export { SecondarySidebarWithView } from "./SecondarySidebarWithView";
export type { SecondarySidebarWithViewProps } from "./SecondarySidebarWithView";

// ThreeColumnLayout - SSOT is in container/three-column/
// Re-export for backward compatibility
export { 
  ThreeColumnLayoutAdvanced as ThreeColumnLayout,
  useThreeColumnLayout,
  LeftPanel,
  CenterPanel,
  RightPanel,
} from "../container/three-column";
export type { ThreeColumnLayoutAdvancedProps as ThreeColumnLayoutProps } from "../container/three-column";
