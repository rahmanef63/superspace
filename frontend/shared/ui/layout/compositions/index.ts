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

export { ThreeColumnLayout, useThreeColumnLayout } from "./ThreeColumnLayout";
export type { ThreeColumnLayoutProps } from "./ThreeColumnLayout";
