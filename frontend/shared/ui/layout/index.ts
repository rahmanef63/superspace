// Public API for shared/layout
export { default as MasterDetailLayout } from "./MasterDetailLayout";

// Secondary Sidebar
export * from "./sidebar/secondary";

// Universal Toolbar
// Explicitly namespace toolbar exports to avoid conflicts
export * as Toolbar from "./toolbar";

// ✅ View System (SSOT - Single Source of Truth)
// Registry-based view system with 18+ layouts
// Completely independent from sidebar and toolbar
export * as ViewSystem from "./view-system";

// Re-export view components for convenience (only fully implemented ones)
export { 
  TableView, 
  GridView 
} from "./view-system";

// Layout Compositions
// Combines sidebar, view-system, and toolbar in common patterns
export * as Compositions from "./compositions";
export * from "./compositions";

// Menus
export * as Menus from "./menus";
export * from "./menus";

// Notifications
export * from "./notifications";

// ⚠️ DEPRECATED: Legacy view folder
// The following exports are kept for backward compatibility only.
// New code should use ViewSystem.* instead.
// These will be removed in a future version.
export { ViewSwitcher } from "./view/ViewSwitcher";
export { ViewToolbar } from "./view/ViewToolbar";
export { RowActions } from "./view/RowActions";
export { useViewMode } from "./view/useViewMode";
export type { ViewMode } from "./view/types";
