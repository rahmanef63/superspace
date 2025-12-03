/**
 * View System - Public API
 * 
 * Registry-based view system for displaying data in 18+ different layouts.
 * Completely independent from sidebar and toolbar systems.
 * 
 * ✅ SSOT (Single Source of Truth) for all view-related functionality
 */

// Core types
export type {
  ViewMode,
  ViewColumn,
  ViewField,
  ViewGroup,
  ViewSort,
  ViewFilter,
  ViewAction,
  ViewSettings,
  ViewConfig,
  ViewState,
  ViewContext,
  ViewActions,
  ViewRegistryEntry,
  ViewComponentProps,
  ViewProviderProps,
} from "./types";

export { ViewType } from "./types";

// Registry
export {
  viewRegistry,
  createView,
  registerBuiltInViews,
} from "./registry";

// Provider & Hooks
export {
  ViewProvider,
  useViewContext,
  useViewState,
  useViewActions,
} from "./provider";

// Renderer & Utilities
export {
  ViewRenderer,
  ViewSkeleton,
  preloadView,
  getAvailableViews,
} from "./renderer";

// ✅ View Toolbar
export { ViewToolbar, ViewSwitcher as ViewToolbarSwitcher } from "./ViewToolbar";

// ✅ View Header (combines Header + ViewToolbar)
export { 
  ViewHeader, 
  ViewHeaderRoot, 
  ViewHeaderContent, 
  ViewHeaderToolbar,
  type ViewHeaderProps,
  type ViewHeaderAction,
} from "./ViewHeader";

// ✅ View Components (Fully Implemented)
// These components are fully aligned with ViewField/ViewAction types
export { default as TableView } from "./views/TableView";
export { default as GridView } from "./views/GridView";
export { default as ListView } from "./views/ListView";
export { default as CompactListView } from "./views/CompactListView";
export { default as KanbanView } from "./views/KanbanView";
export { default as GalleryView } from "./views/GalleryView";
export { default as CalendarView } from "./views/CalendarView";
export { default as TimelineView } from "./views/TimelineView";
export { default as TreeView } from "./views/TreeView";

// ⚠️ DEPRECATED: Legacy Compatibility Layer
// TODO: Remove after migrating all features to new ViewProvider/ViewRenderer API
export { ViewSwitcher, type LegacyViewConfig } from "./ViewSwitcher-compat";
