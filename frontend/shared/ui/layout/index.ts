// Public API for shared/layout
export { default as MasterDetailLayout } from "./MasterDetailLayout";

// ============================================================================
// Chrome (Top-level UI)
// ============================================================================

export { HeaderBar } from "./header/components/HeaderBar";
export type { HeaderBarProps, Breadcrumb } from "./header/components/HeaderBar";
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
export {
  SecondarySidebarLayout,
  SecondarySidebarHeader,
  SecondarySidebar,
  SecondarySidebarTools,
  SecondaryList,
  // Registry
  itemVariantRegistry,
  createVariant,
  itemVariant,
  asVariantId,
  registerBuiltInVariants,
  // Types
  type SecondarySidebarLayoutProps,
  type SecondarySidebarHeaderProps,
  type SecondarySidebarProps,
  type SecondarySidebarSectionProps,
  type SecondarySidebarItem,
  type SecondaryListProps,
  type VariantId,
  type ItemBase,
  type RenderUtils,
  type RenderCtx,
  type VariantDef,
  type SecondaryItem,
  // Namespace
  SecondarySidebarLayoutNamespace,
} from "./sidebar/secondary";

// Explicit exports for SecondaryLayout components
// (Merged above)

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
  type MenuItemMetadata,
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
  PageContainer,
  SingleColumnLayout,
  TwoColumnLayout,
  ResizeHandle,
  // Column Layout System
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
  type PageContainerProps,
  type SingleColumnLayoutProps,
  type TwoColumnLayoutProps,
  type ColumnLayoutProps,
  type ColumnHeaderProps,
  type ColumnMainProps,
  type ColumnFooterProps,
} from "./container";

// ============================================================================
// Feature Layout (Standard minimum layout with AI panel support)
// ============================================================================

export { FeatureLayout } from "./feature-layout";
export type { FeatureLayoutProps } from "./feature-layout";

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
// IDE Layout System (VS Code-style)
// ============================================================================

export * as IDE from "./ide";
export {
  IDELayout,
  IDEActivityBar,
  IDEEditorTabs,
  IDEPanel,
  IDEPanelHeader,
  IDEPanelSection,
  IDEPanelTabs,
  IDEEditorArea,
  IDELayoutProvider,
  useIDEContext,
  useIDEContextSafe,
  usePersistedLayoutState,
  usePanelVisibility,
  useEditorTabs,
  useIDEKeyboardShortcuts,
  type PanelPosition,
  type PanelState,
  type ActivityBarItem,
  type EditorTab,
  type PanelConfig,
  type IDELayoutConfig,
  type IDELayoutState,
  type IDELayoutProps,
  type IDEPanelProps,
  type IDEActivityBarProps,
  type IDEEditorTabsProps,
  type IDEPanelHeaderProps,
} from "./ide";

// ============================================================================
// Notifications
// ============================================================================

// export * from "./notifications"; // DEPRECATED - Use foundation/utils/notifications

// ============================================================================
// Floating Panels System
// ============================================================================

export * as Panels from "./panels";
export {
  FloatingPanel,
  useFloatingPanels,
  type FloatingPanelPosition,
  type FloatingPanelSize,
  type FloatingPanelConfig,
  type FloatingPanelProps,
  type FloatingPanelState,
  type UseFloatingPanelsReturn,
} from "./panels";

