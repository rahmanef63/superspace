/**
 * View System Types
 * 
 * Comprehensive type definitions for the universal view system.
 * Supports 10+ view layouts with dynamic configuration per feature.
 */

import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

/**
 * Available View Types
 * Each view type renders data differently
 */
export enum ViewType {
  // List-based views
  TABLE = "table",           // Traditional data table with sortable columns
  LIST = "list",             // Vertical list with dividers
  COMPACT_LIST = "compact",  // Dense list view
  
  // Card-based views
  GRID = "grid",             // Responsive grid of cards
  GALLERY = "gallery",       // Image-focused gallery view
  TILES = "tiles",           // Compact tile grid
  MASONRY = "masonry",       // Pinterest-style masonry layout
  
  // Board views
  KANBAN = "kanban",         // Kanban board with columns
  BOARD = "board",           // Generic board layout
  
  // Time-based views
  CALENDAR = "calendar",     // Month/week/day calendar
  TIMELINE = "timeline",     // Horizontal timeline
  GANTT = "gantt",          // Gantt chart for project planning
  
  // Hierarchical views
  TREE = "tree",             // Hierarchical tree view
  NESTED = "nested",         // Nested expandable lists
  
  // Specialized views
  MAP = "map",               // Geo map view
  CHART = "chart",           // Data visualization charts
  FEED = "feed",             // Social media style feed
  INBOX = "inbox",           // Email/message inbox layout
}

/**
 * View Mode (for backward compatibility with existing code)
 */
export type ViewMode = 
  | "table" 
  | "list" 
  | "grid" 
  | "kanban" 
  | "calendar" 
  | "timeline"
  | "gallery"
  | "board"
  | "card"      // Alias for grid
  | "details";  // List with detail panel

/**
 * Column Definition for Table/List views
 */
export interface ViewColumn<T = any> {
  id: string;
  label: string;
  accessorKey?: keyof T | string;
  accessor?: (item: T) => any;
  render?: (item: T, value: any) => ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  width?: string | number;
  minWidth?: string | number;
  maxWidth?: string | number;
  align?: "left" | "center" | "right";
  sticky?: boolean;
  hidden?: boolean;
  resizable?: boolean;
}

/**
 * Field Definition (generic data field)
 */
export interface ViewField<T = any> {
  id: string;
  label: string;
  type: "text" | "number" | "date" | "boolean" | "select" | "multiselect" | "image" | "file" | "url" | "email" | "phone" | "color" | "rating" | "progress" | "tag" | "user" | "relation";
  accessor?: (item: T) => any;
  render?: (item: T, value: any) => ReactNode;
  editable?: boolean;
  required?: boolean;
  placeholder?: string;
  options?: Array<{ label: string; value: any; icon?: LucideIcon; color?: string }>;
  validation?: (value: any) => string | undefined;
  defaultValue?: any;
  hidden?: boolean;
}

/**
 * Group Configuration
 */
export interface ViewGroup<T = any> {
  id: string;
  label: string;
  accessor: keyof T | string | ((item: T) => string);
  color?: string;
  icon?: LucideIcon;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  count?: number;
}

/**
 * Sort Configuration
 */
export interface ViewSort {
  field: string;
  direction: "asc" | "desc";
}

/**
 * Filter Configuration
 */
export interface ViewFilter {
  id: string;
  field: string;
  operator: "eq" | "ne" | "gt" | "gte" | "lt" | "lte" | "contains" | "startsWith" | "endsWith" | "in" | "notIn" | "between";
  value: any;
  label?: string;
}

/**
 * Action Button Configuration
 */
export interface ViewAction<T = any> {
  id: string;
  label: string;
  icon?: LucideIcon;
  onClick: (item: T) => void | Promise<void>;
  variant?: "default" | "outline" | "ghost" | "destructive" | "secondary";
  disabled?: boolean | ((item: T) => boolean);
  hidden?: boolean | ((item: T) => boolean);
  confirm?: {
    title: string;
    description: string;
  };
}

/**
 * View Settings (per-view customization)
 */
export interface ViewSettings {
  // Display
  density?: "compact" | "comfortable" | "spacious";
  showHeader?: boolean;
  showFooter?: boolean;
  showSearch?: boolean;
  showFilters?: boolean;
  showGrouping?: boolean;
  showPagination?: boolean;
  
  // Behavior
  selectable?: boolean;
  multiSelect?: boolean;
  draggable?: boolean;
  resizable?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  
  // Pagination
  pageSize?: number;
  pageSizeOptions?: number[];
  
  // Card/Grid specific
  cardWidth?: number | "auto";
  gridColumns?: number | "auto";
  gap?: number;
  
  // Kanban specific
  swimlanes?: boolean;
  wipLimit?: number;
  
  // Calendar specific
  defaultView?: "month" | "week" | "day" | "agenda";
  firstDayOfWeek?: 0 | 1; // 0 = Sunday, 1 = Monday
  
  // Timeline specific
  timeScale?: "day" | "week" | "month" | "quarter" | "year";
  startDate?: Date;
  endDate?: Date;
}

/**
 * View Configuration
 * Main configuration object for each view
 */
export interface ViewConfig<T = any> {
  // Basic info
  id: string;
  type: ViewType;
  label: string;
  icon?: LucideIcon;
  description?: string;
  
  // Data structure
  columns?: ViewColumn<T>[];
  fields?: ViewField<T>[];
  groups?: ViewGroup<T>[];
  
  // Behavior
  actions?: ViewAction<T>[];
  rowActions?: ViewAction<T>[];
  bulkActions?: ViewAction<T>[];
  
  // Sorting & Filtering
  defaultSort?: ViewSort;
  defaultFilters?: ViewFilter[];
  
  // Settings
  settings?: ViewSettings;
  
  // Renderers (custom components)
  renderHeader?: () => ReactNode;
  renderFooter?: () => ReactNode;
  renderEmpty?: () => ReactNode;
  renderLoading?: () => ReactNode;
  renderError?: (error: Error) => ReactNode;
  renderItem?: (item: T, index: number) => ReactNode;
  renderCard?: (item: T, index: number) => ReactNode;
  renderRow?: (item: T, index: number) => ReactNode;
  
  // Callbacks
  onItemClick?: (item: T) => void;
  onItemDoubleClick?: (item: T) => void;
  onItemSelect?: (items: T[]) => void;
  onItemDrag?: (item: T, targetGroup?: string) => void | Promise<void>;
  onCreate?: () => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void | Promise<void>;
  onBulkDelete?: (items: T[]) => void | Promise<void>;
  
  // Data fetching
  onSort?: (sort: ViewSort) => void;
  onFilter?: (filters: ViewFilter[]) => void;
  onSearch?: (query: string) => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

/**
 * View State
 * Runtime state for each view instance
 */
export interface ViewState {
  // Current view
  activeView: ViewType;
  
  // Selection
  selectedIds: Set<string>;
  focusedId: string | null;
  
  // Sorting
  sort: ViewSort | null;
  
  // Filtering
  filters: ViewFilter[];
  searchQuery: string;
  
  // Grouping
  groupBy: string | null;
  expandedGroups: Set<string>;
  
  // Pagination
  currentPage: number;
  pageSize: number;
  totalItems: number;
  
  // UI state
  isLoading: boolean;
  error: Error | null;
  
  // View-specific state
  customState?: Record<string, any>;
}

/**
 * View Context
 * Passed to view components
 */
export interface ViewContext<T = any> {
  data: T[];
  config: ViewConfig<T>;
  state: ViewState;
  actions: ViewActions;
}

/**
 * View Actions
 * Available actions for view state management
 */
export interface ViewActions {
  // View switching
  setView: (view: ViewType) => void;
  
  // Selection
  selectItem: (id: string) => void;
  selectItems: (ids: string[]) => void;
  deselectItem: (id: string) => void;
  clearSelection: () => void;
  selectAll: () => void;
  
  // Sorting
  setSort: (sort: ViewSort | null) => void;
  toggleSortDirection: () => void;
  
  // Filtering
  addFilter: (filter: ViewFilter) => void;
  removeFilter: (id: string) => void;
  clearFilters: () => void;
  setSearchQuery: (query: string) => void;
  
  // Grouping
  setGroupBy: (field: string | null) => void;
  toggleGroup: (groupId: string) => void;
  expandAllGroups: () => void;
  collapseAllGroups: () => void;
  
  // Pagination
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  
  // Custom state
  setCustomState: (key: string, value: any) => void;
  getCustomState: (key: string) => any;
}

/**
 * View Registry Entry
 */
export interface ViewRegistryEntry {
  type: ViewType;
  label: string;
  icon: LucideIcon;
  description: string;
  component: React.ComponentType<ViewComponentProps<any>>;
  defaultSettings?: Partial<ViewSettings>;
  supportedFeatures: {
    sorting?: boolean;
    filtering?: boolean;
    grouping?: boolean;
    searching?: boolean;
    selection?: boolean;
    dragging?: boolean;
    pagination?: boolean;
    export?: boolean;
  };
}

/**
 * View Component Props
 * Props passed to view layout components
 */
export interface ViewComponentProps<T = any> {
  data: T[];
  config: ViewConfig<T>;
  state: ViewState;
  actions: ViewActions;
  className?: string;
}

/**
 * View Provider Props
 */
export interface ViewProviderProps<T = any> {
  children: ReactNode;
  data: T[];
  config: ViewConfig<T>;
  initialView?: ViewType;
  storageKey?: string;
  onStateChange?: (state: ViewState) => void;
}
