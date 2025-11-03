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

// ✅ View Components (Fully Implemented)
// These components are fully aligned with ViewField/ViewAction types
export { default as TableView } from "./views/Table/TableView";
export { default as GridView } from "./views/GridView";

// 📝 TODO: Implement remaining views with proper ViewField/ViewAction types
// Note: Legacy CardView and DetailListView were moved to view/ folder
// as they use incompatible Column/RowAction types and need rewriting.
// For now, all unimplemented view types use fallback components in renderer.tsx

// ⚠️ DEPRECATED: Legacy Compatibility Layer
// TODO: Remove after migrating all features to new ViewProvider/ViewRenderer API
export { ViewSwitcher, type LegacyViewConfig } from "./ViewSwitcher-compat";
