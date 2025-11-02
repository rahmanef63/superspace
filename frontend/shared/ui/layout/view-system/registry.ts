/**
 * View System Registry
 * 
 * Central registry for all view types with registration system.
 * Features can register custom views or override built-in ones.
 */

import {
  Table,
  List,
  Grid3x3,
  LayoutGrid,
  Kanban,
  Calendar,
  Clock,
  TreePine,
  Map,
  BarChart3,
  Rss,
  Inbox,
  Image,
  FileStack,
  type LucideIcon,
} from "lucide-react";
import type {
  ViewType,
  ViewRegistryEntry,
  ViewComponentProps,
  ViewSettings,
} from "./types";

/**
 * View Registry
 * Stores all registered view types
 */
class ViewRegistry {
  private views: Record<string, ViewRegistryEntry> = {};

  /**
   * Register a view type
   */
  register(entry: ViewRegistryEntry): void {
    this.views[entry.type] = entry;
  }

  /**
   * Unregister a view type
   */
  unregister(type: ViewType): void {
    delete this.views[type];
  }

  /**
   * Get a view entry
   */
  get(type: ViewType): ViewRegistryEntry | undefined {
    return this.views[type];
  }

  /**
   * Get all registered views
   */
  getAll(): ViewRegistryEntry[] {
    return Object.values(this.views);
  }

  /**
   * Check if a view type is registered
   */
  has(type: ViewType): boolean {
    return type in this.views;
  }

  /**
   * Get views by feature (filtering)
   */
  getByFeature(feature: keyof ViewRegistryEntry["supportedFeatures"]): ViewRegistryEntry[] {
    return Object.values(this.views).filter(
      (view: ViewRegistryEntry) => view.supportedFeatures[feature]
    );
  }

  /**
   * Get view types as array
   */
  getTypes(): ViewType[] {
    return Object.keys(this.views) as ViewType[];
  }

  /**
   * Get view labels
   */
  getLabels(): Record<ViewType, string> {
    const labels: Partial<Record<ViewType, string>> = {};
    Object.entries(this.views).forEach(([type, entry]) => {
      labels[type as ViewType] = entry.label;
    });
    return labels as Record<ViewType, string>;
  }

  /**
   * Get view icons
   */
  getIcons(): Record<ViewType, LucideIcon> {
    const icons: Partial<Record<ViewType, LucideIcon>> = {};
    Object.entries(this.views).forEach(([type, entry]) => {
      icons[type as ViewType] = entry.icon;
    });
    return icons as Record<ViewType, LucideIcon>;
  }
}

/**
 * Global view registry instance
 */
export const viewRegistry = new ViewRegistry();

/**
 * Helper to create a view entry
 */
export function createView<T = any>(
  type: ViewType,
  label: string,
  icon: LucideIcon,
  component: React.ComponentType<ViewComponentProps<T>>,
  options?: {
    description?: string;
    defaultSettings?: Partial<ViewSettings>;
    supportedFeatures?: Partial<ViewRegistryEntry["supportedFeatures"]>;
  }
): ViewRegistryEntry {
  return {
    type,
    label,
    icon,
    description: options?.description || "",
    component: component as React.ComponentType<ViewComponentProps<any>>,
    defaultSettings: options?.defaultSettings || {},
    supportedFeatures: {
      sorting: true,
      filtering: true,
      grouping: false,
      searching: true,
      selection: true,
      dragging: false,
      pagination: true,
      export: true,
      ...options?.supportedFeatures,
    },
  };
}

/**
 * Register built-in views
 * Will import and register actual components later
 */
export function registerBuiltInViews(): void {
  // Placeholder components (will be replaced with real implementations)
  const PlaceholderComponent = () => null;

  // TABLE VIEW
  viewRegistry.register(
    createView(
      "table" as ViewType,
      "Table",
      Table,
      PlaceholderComponent,
      {
        description: "Traditional data table with sortable columns",
        defaultSettings: {
          density: "comfortable",
          sortable: true,
          filterable: true,
          showPagination: true,
        },
        supportedFeatures: {
          sorting: true,
          filtering: true,
          grouping: true,
          searching: true,
          selection: true,
          dragging: false,
          pagination: true,
          export: true,
        },
      }
    )
  );

  // LIST VIEW
  viewRegistry.register(
    createView(
      "list" as ViewType,
      "List",
      List,
      PlaceholderComponent,
      {
        description: "Vertical list with dividers",
        defaultSettings: {
          density: "comfortable",
          showPagination: false,
        },
        supportedFeatures: {
          sorting: true,
          filtering: true,
          grouping: true,
          searching: true,
          selection: true,
          dragging: true,
          pagination: false,
          export: false,
        },
      }
    )
  );

  // GRID VIEW
  viewRegistry.register(
    createView(
      "grid" as ViewType,
      "Grid",
      Grid3x3,
      PlaceholderComponent,
      {
        description: "Responsive grid of cards",
        defaultSettings: {
          gridColumns: "auto",
          gap: 4,
          showPagination: true,
        },
        supportedFeatures: {
          sorting: true,
          filtering: true,
          grouping: false,
          searching: true,
          selection: true,
          dragging: false,
          pagination: true,
          export: false,
        },
      }
    )
  );

  // GALLERY VIEW
  viewRegistry.register(
    createView(
      "gallery" as ViewType,
      "Gallery",
      Image,
      PlaceholderComponent,
      {
        description: "Image-focused gallery view",
        defaultSettings: {
          gridColumns: "auto",
          gap: 2,
        },
        supportedFeatures: {
          sorting: true,
          filtering: true,
          grouping: false,
          searching: true,
          selection: true,
          dragging: false,
          pagination: true,
          export: false,
        },
      }
    )
  );

  // KANBAN VIEW
  viewRegistry.register(
    createView(
      "kanban" as ViewType,
      "Kanban",
      Kanban,
      PlaceholderComponent,
      {
        description: "Kanban board with drag-and-drop columns",
        defaultSettings: {
          swimlanes: false,
          wipLimit: 0,
        },
        supportedFeatures: {
          sorting: true,
          filtering: true,
          grouping: true,
          searching: true,
          selection: false,
          dragging: true,
          pagination: false,
          export: false,
        },
      }
    )
  );

  // CALENDAR VIEW
  viewRegistry.register(
    createView(
      "calendar" as ViewType,
      "Calendar",
      Calendar,
      PlaceholderComponent,
      {
        description: "Month/week/day calendar view",
        defaultSettings: {
          defaultView: "month",
          firstDayOfWeek: 1,
        },
        supportedFeatures: {
          sorting: false,
          filtering: true,
          grouping: false,
          searching: true,
          selection: true,
          dragging: true,
          pagination: false,
          export: true,
        },
      }
    )
  );

  // TIMELINE VIEW
  viewRegistry.register(
    createView(
      "timeline" as ViewType,
      "Timeline",
      Clock,
      PlaceholderComponent,
      {
        description: "Horizontal timeline view",
        defaultSettings: {
          timeScale: "month",
        },
        supportedFeatures: {
          sorting: false,
          filtering: true,
          grouping: true,
          searching: true,
          selection: true,
          dragging: true,
          pagination: false,
          export: true,
        },
      }
    )
  );

  // TREE VIEW
  viewRegistry.register(
    createView(
      "tree" as ViewType,
      "Tree",
      TreePine,
      PlaceholderComponent,
      {
        description: "Hierarchical tree structure",
        defaultSettings: {
          density: "comfortable",
        },
        supportedFeatures: {
          sorting: false,
          filtering: true,
          grouping: false,
          searching: true,
          selection: true,
          dragging: true,
          pagination: false,
          export: false,
        },
      }
    )
  );

  // MAP VIEW
  viewRegistry.register(
    createView(
      "map" as ViewType,
      "Map",
      Map,
      PlaceholderComponent,
      {
        description: "Geographic map view",
        defaultSettings: {},
        supportedFeatures: {
          sorting: false,
          filtering: true,
          grouping: true,
          searching: true,
          selection: true,
          dragging: false,
          pagination: false,
          export: false,
        },
      }
    )
  );

  // CHART VIEW
  viewRegistry.register(
    createView(
      "chart" as ViewType,
      "Chart",
      BarChart3,
      PlaceholderComponent,
      {
        description: "Data visualization charts",
        defaultSettings: {},
        supportedFeatures: {
          sorting: false,
          filtering: true,
          grouping: true,
          searching: false,
          selection: false,
          dragging: false,
          pagination: false,
          export: true,
        },
      }
    )
  );

  // FEED VIEW
  viewRegistry.register(
    createView(
      "feed" as ViewType,
      "Feed",
      Rss,
      PlaceholderComponent,
      {
        description: "Social media style feed",
        defaultSettings: {
          density: "comfortable",
        },
        supportedFeatures: {
          sorting: true,
          filtering: true,
          grouping: false,
          searching: true,
          selection: false,
          dragging: false,
          pagination: true,
          export: false,
        },
      }
    )
  );

  // INBOX VIEW
  viewRegistry.register(
    createView(
      "inbox" as ViewType,
      "Inbox",
      Inbox,
      PlaceholderComponent,
      {
        description: "Email/message inbox layout",
        defaultSettings: {
          density: "compact",
        },
        supportedFeatures: {
          sorting: true,
          filtering: true,
          grouping: true,
          searching: true,
          selection: true,
          dragging: false,
          pagination: true,
          export: false,
        },
      }
    )
  );

  // TILES VIEW
  viewRegistry.register(
    createView(
      "tiles" as ViewType,
      "Tiles",
      LayoutGrid,
      PlaceholderComponent,
      {
        description: "Compact tile grid",
        defaultSettings: {
          gridColumns: "auto",
          gap: 2,
          density: "compact",
        },
        supportedFeatures: {
          sorting: true,
          filtering: true,
          grouping: false,
          searching: true,
          selection: true,
          dragging: false,
          pagination: true,
          export: false,
        },
      }
    )
  );

  // MASONRY VIEW
  viewRegistry.register(
    createView(
      "masonry" as ViewType,
      "Masonry",
      FileStack,
      PlaceholderComponent,
      {
        description: "Pinterest-style masonry layout",
        defaultSettings: {
          gridColumns: "auto",
          gap: 4,
        },
        supportedFeatures: {
          sorting: true,
          filtering: true,
          grouping: false,
          searching: true,
          selection: true,
          dragging: false,
          pagination: true,
          export: false,
        },
      }
    )
  );
}

// Auto-register built-in views
registerBuiltInViews();
