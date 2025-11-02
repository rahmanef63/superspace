/**
 * Universal Toolbar System
 * 
 * A modular, registry-based toolbar system for building dynamic toolbars
 * with search, sort, filter, view modes, and more.
 * 
 * Fully responsive with automatic mobile/tablet/desktop adaptations.
 * 
 * @example
 * ```tsx
 * import { UniversalToolbar, toolType, viewMode } from '@/frontend/shared/ui/layout/toolbar'
 * 
 * <UniversalToolbar
 *   tools={[
 *     {
 *       id: "search-1",
 *       type: toolType.search,
 *       params: {
 *         value: searchQuery,
 *         onChange: setSearchQuery,
 *         placeholder: "Search items..."
 *       }
 *     },
 *     {
 *       id: "view-1",
 *       type: toolType.view,
 *       position: "right",
 *       params: {
 *         options: [
 *           { label: "Grid", value: viewMode.grid, icon: Grid3x3 },
 *           { label: "List", value: viewMode.list, icon: List }
 *         ],
 *         currentView: viewMode.grid,
 *         onChange: setView
 *       }
 *     }
 *   ]}
 *   sticky
 *   border="bottom"
 * />
 * ```
 * 
 * @module shared/ui/layout/toolbar
 */

// Main component
export { UniversalToolbar } from "./components/UniversalToolbar";
export type { UniversalToolbarProps } from "./components/UniversalToolbar";

// Registry and tool types
export {
  toolbarRegistry,
  createTool,
  toolType,
  viewMode,
  registerBuiltInTools,
} from "./lib/toolbar-registry";

// Types
export type {
  ToolId,
  ToolPosition,
  ToolbarLayout,
  ToolbarPosition,
  ViewMode,
  ResponsiveConfig,
  ToolConfig,
  SearchToolParams,
  SortOption,
  SortToolParams,
  FilterOption,
  FilterToolParams,
  ViewOption,
  ViewToolParams,
  ActionButton,
  ActionsToolParams,
  TabOption,
  TabsToolParams,
  BreadcrumbItem,
  BreadcrumbToolParams,
  ToolRenderContext,
  ToolDef,
  ToolbarConfig,
} from "./lib/types";

// Built-in tools (for custom registration)
export { builtInTools } from "./lib/built-in-tools";
export { builtInToolsPart2 } from "./lib/built-in-tools-part2";

// Hooks
export {
  useToolbarState,
  useViewMode,
  useSearchState,
  useSortState,
  useFilterState,
  useToolbar,
} from "./hooks/useToolbarState";
