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
export * from "./compositions";

// ============================================================================
// Menus System
// ============================================================================

export * as Menus from "./menus";
export * from "./menus";

// ============================================================================
// Notifications
// ============================================================================

export * from "./notifications";
