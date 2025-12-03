// Public API for shared/layout
export { default as MasterDetailLayout } from "./MasterDetailLayout";

// ============================================================================
// Chrome (Top-level UI)
// ============================================================================

export { HeaderBar } from "./chrome/HeaderBar";
export type { HeaderBarProps, Breadcrumb } from "./chrome/HeaderBar";
export { StatusBar } from "./chrome/StatusBar";
export type { StatusBarProps } from "./chrome/StatusBar";

// ============================================================================
// Sidebar System (SSOT)
// ============================================================================

// Primary Sidebar
export { 
  AppSidebar,
  WorkspaceSwitcher,
  NavMain,
  NavSecondary,
  NavSystem,
  NavUser 
} from "./sidebar/primary";
export type { AppSidebarProps } from "./sidebar/primary";

// Secondary Sidebar (includes SecondaryList and variants)
export * from "./sidebar/secondary";

// Explicit exports for SecondaryLayout components
export {
  SecondarySidebarLayout,
  SecondarySidebarHeader,
  SecondarySidebar,
  SecondarySidebarTools,
  type SecondarySidebarLayoutProps,
  type SecondarySidebarHeaderProps,
  type SecondarySidebarProps,
} from "./sidebar/secondary";

// Site Header & Components
export {
  SiteHeader,
  BreadcrumbsProvider,
  useBreadcrumbs,
  LoadingBar,
  OnboardingGuard,
} from "./sidebar/components";

// ============================================================================
// Toolbar System (SSOT)
// ============================================================================

export * as Toolbar from "./toolbar";

// ============================================================================
// View System (SSOT)
// ============================================================================

export * as ViewSystem from "./view-system";

// Re-export commonly used views
export { TableView, GridView } from "./view-system";

// ============================================================================
// Compositions (High-level layouts)
// ============================================================================

export * as Compositions from "./compositions";
export { 
  LayoutSwitcher,
  SecondarySidebarWithView,
  ThreeColumnLayout,
  useThreeColumnLayout,
  useLayoutMode,
  type LayoutMode,
  type LayoutSwitcherProps,
  type SecondarySidebarWithViewProps,
  type ThreeColumnLayoutProps,
} from "./compositions";

// ============================================================================
// Menus System
// ============================================================================

export * as Menus from "./menus";
export { 
  SecondaryMenuProvider,
  useSecondaryMenuContext,
  useMenuItems,
  useMenuMutations,
  buildMenuTree,
  flattenMenuTree,
  computeNextOrder as menuComputeNextOrder,
  DragDropMenuTree,
  BreadcrumbNavigation,
  MenuStoreMenuWrapper,
  DocumentMenuWrapper,
  ChatMenuWrapper,
  MenuItemForm,
  MenuDisplay,
  MenuPreview,
  MenuTree,
  type SecondaryMenuContextValue,
  type SecondaryMenuProviderProps,
} from "./menus";

// ============================================================================
// Unified DnD System
// ============================================================================

export * as DnD from "./dnd";
export { 
  DnDTreeProvider,
  useDnDTreeContext,
  useDnDState,
  useDnDConfig,
  UnifiedDnDTree,
  DnDTreeItem,
  RootDropZone,
  computeNextOrder,
  buildTree,
  flattenTree,
} from "./dnd";

// ============================================================================
// Layout Container System
// ============================================================================

export * as Container from "./container";
export { 
  LayoutContainer,
  SingleLayout,
  SplitVerticalLayout,
  SplitHorizontalLayout,
  SidebarLayout,
  ResizeHandle,
  CollapsiblePanel,
  type LayoutType,
  type SplitMode,
  type LayoutNode,
  type PanelRenderContext,
  type LayoutContainerProps,
} from "./container";

// ============================================================================
// Tabs System (SSOT)
// ============================================================================

export * as TabsSystem from "./tabs";
export * from "./tabs";

// ============================================================================
// Header System (SSOT)
// ============================================================================

export * as HeaderSystem from "./header";
export * from "./header";

// ============================================================================
// Notifications
// ============================================================================

export * from "./notifications";
