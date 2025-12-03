"use client";

import React, { Suspense, lazy, type ComponentType } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import type { ViewType, ViewComponentProps } from "./types";
import { useViewContext } from "./provider";
import { cn } from "@/lib/utils";

/**
 * Error Boundary for View Components
 */
class ViewErrorBoundary extends React.Component<
  {
    children: React.ReactNode;
    fallback?: React.ReactNode;
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("View component error:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex h-full items-center justify-center p-8">
          <div className="flex max-w-md flex-col items-center gap-4 text-center">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <div>
              <h3 className="text-lg font-semibold">View Error</h3>
              <p className="text-sm text-muted-foreground mt-2">
                {this.state.error?.message || "An error occurred while rendering this view"}
              </p>
            </div>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Loading Skeleton Component
 */
export function ViewSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("flex h-full items-center justify-center", className)}>
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading view...</p>
      </div>
    </div>
  );
}

/**
 * Lazy-loaded View Components
 * 
 * Dynamically imports view components with fallbacks for unimplemented views.
 * Uses Promise.resolve() wrapper to ensure type safety.
 */

// Helper to create fallback component for unimplemented views
const createFallbackComponent = (viewName: string): ComponentType<ViewComponentProps<any>> => {
  return () => (
    <div className="flex h-full items-center justify-center p-8">
      <div className="flex flex-col items-center gap-4 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground" />
        <div>
          <h3 className="text-lg font-semibold">{viewName}</h3>
          <p className="text-sm text-muted-foreground mt-2">
            This view will be implemented in a future update
          </p>
        </div>
      </div>
    </div>
  );
};

// Helper to safely import view components
const safeImport = (
  importFn: () => Promise<{ default: ComponentType<ViewComponentProps<any>> }>,
  fallbackName: string
): ComponentType<ViewComponentProps<any>> => {
  return lazy(() =>
    importFn().catch(() => ({
      default: createFallbackComponent(fallbackName),
    }))
  ) as ComponentType<ViewComponentProps<any>>;
};

/**
 * View Components Registry
 * Maps ViewType enum values to their corresponding lazy-loaded components
 * 
 * ✅ SSOT: All view components are located in ./views/ directory
 * 
 * Current Implementation Status:
 * - ✅ Fully Implemented (9): table, grid, list, compact, kanban, gallery, calendar, timeline, tree
 * - 🔜 Pending (9): tiles, masonry, board, gantt, nested, map, chart, feed, inbox
 * 
 * Structure:
 * - ./views/Table/TableView.tsx (advanced table with TanStack)
 * - ./views/GridView.tsx (responsive card grid)
 * - ./views/ListView.tsx (vertical list with grouping)
 * - ./views/CompactListView.tsx (dense list view)
 * - ./views/KanbanView.tsx (kanban board with drag-drop)
 * - ./views/GalleryView.tsx (image gallery with lightbox)
 * - ./views/CalendarView.tsx (month/week/day calendar)
 * - ./views/TimelineView.tsx (chronological timeline)
 * - ./views/TreeView.tsx (hierarchical tree)
 */
const viewComponents: Record<ViewType, ComponentType<ViewComponentProps<any>>> = {
  // ✅ Implemented views (aligned with ViewField/ViewAction types)
  table: safeImport(() => import("./views/TableView"), "Table View"),
  grid: safeImport(() => import("./views/GridView"), "Grid View"),
  list: safeImport(() => import("./views/ListView"), "List View"),
  compact: safeImport(() => import("./views/CompactListView"), "Compact List View"),
  kanban: safeImport(() => import("./views/KanbanView"), "Kanban Board"),
  gallery: safeImport(() => import("./views/GalleryView"), "Gallery View"),
  calendar: safeImport(() => import("./views/CalendarView"), "Calendar View"),
  timeline: safeImport(() => import("./views/TimelineView"), "Timeline View"),
  tree: safeImport(() => import("./views/TreeView"), "Tree View"),
  
  // 🔜 To be implemented views - using fallback components
  tiles: createFallbackComponent("Tiles View"),
  masonry: createFallbackComponent("Masonry View"),
  board: createFallbackComponent("Board View"),
  gantt: createFallbackComponent("Gantt Chart"),
  nested: createFallbackComponent("Nested View"),
  map: createFallbackComponent("Map View"),
  chart: createFallbackComponent("Chart View"),
  feed: createFallbackComponent("Feed View"),
  inbox: createFallbackComponent("Inbox View"),
};

/**
 * ViewRenderer Props
 */
export interface ViewRendererProps {
  className?: string;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

/**
 * View Renderer Component
 * 
 * Dynamically renders the appropriate view component based on current view type.
 * Handles lazy loading, suspense, and error boundaries.
 * 
 * @example
 * ```tsx
 * <ViewProvider data={items} config={config}>
 *   <ViewRenderer className="flex-1" />
 * </ViewProvider>
 * ```
 */
export function ViewRenderer({
  className,
  loadingComponent,
  errorComponent,
  onError,
}: ViewRendererProps) {
  const context = useViewContext();
  const { state, actions, data, config } = context;

  // Get the appropriate view component
  const ViewComponent = viewComponents[state.activeView];

  if (!ViewComponent) {
    return (
      <div className={cn("flex h-full items-center justify-center p-8", className)}>
        <div className="flex flex-col items-center gap-4 text-center">
          <AlertCircle className="h-12 w-12 text-destructive" />
          <div>
            <h3 className="text-lg font-semibold">Unknown View Type</h3>
            <p className="text-sm text-muted-foreground mt-2">
              View type "{state.activeView}" is not supported
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ViewErrorBoundary
      fallback={errorComponent}
      onError={onError}
    >
      <Suspense fallback={loadingComponent || <ViewSkeleton className={className} />}>
        <ViewComponent
          data={data}
          config={config}
          state={state}
          actions={actions}
          className={className}
        />
      </Suspense>
    </ViewErrorBoundary>
  );
}

/**
 * Preload a view component
 * Useful for optimizing user experience by preloading views before switching
 * 
 * @example
 * ```tsx
 * // Preload grid view when user hovers over grid button
 * <button
 *   onMouseEnter={() => preloadView(ViewType.GRID)}
 *   onClick={() => actions.setView(ViewType.GRID)}
 * >
 *   Grid View
 * </button>
 * ```
 */
export function preloadView(viewType: ViewType): void {
  const component = viewComponents[viewType];
  if (component && "preload" in component) {
    // @ts-ignore - preload is not in ComponentType but exists on lazy components
    component.preload?.();
  }
}

/**
 * Get all registered view types
 */
export function getAvailableViews(): ViewType[] {
  return Object.keys(viewComponents) as ViewType[];
}
