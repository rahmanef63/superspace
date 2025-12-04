/**
 * ViewSwitcher Compatibility Layer
 * 
 * This is a temporary compatibility wrapper to support legacy ViewSwitcher API
 * while gradually migrating to the new ViewProvider/ViewRenderer system.
 * 
 * @deprecated Use ViewProvider and ViewRenderer instead
 * TODO: Migrate all usages to the new view system
 */

import { useState, useMemo, useEffect } from "react";
import type { ReactNode } from "react";
import { ViewProvider } from "./provider";
import { ViewRenderer } from "./renderer";
import { ViewType, type ViewConfig, type ViewColumn, type ViewAction } from "./types";

/**
 * Legacy ViewSwitcher Config Structure
 * This matches the old API that components are currently using
 */
export interface LegacyViewConfig<T = any> {
  getId: (item: T) => string;
  columns?: Array<{
    id: string;
    header: string;
    accessor?: (item: T) => any;
    cell?: (item: T) => ReactNode;
    hideOnCard?: boolean;
  }>;
  actions?: Array<{
    id: string;
    label: string;
    icon?: ReactNode;
    onClick: (item: T) => void | Promise<void>;
  }>;
  card?: {
    title: (item: T) => any;
    subtitle?: (item: T) => any;
    avatar?: (item: T) => ReactNode;
    extra?: (item: T) => ReactNode;
  };
  details?: {
    fields: Array<{
      label: string;
      value: (item: T) => any;
    }>;
  };
  searchFn?: (item: T, query: string) => boolean;
  /** Called when an item is clicked (for navigation/opening) */
  onOpen?: (item: T) => void;
}

/**
 * Legacy ViewSwitcher Props
 */
export interface ViewSwitcherProps<T = any> {
  storageKey?: string;
  initialMode?: string;
  mode?: string;
  onModeChange?: (mode: string) => void;
  data: T[];
  config: LegacyViewConfig<T>;
  searchable?: boolean;
  showToolbar?: boolean;
  emptyState?: ReactNode | string;
}

/**
 * Convert legacy config to new ViewConfig
 */
function convertLegacyConfig<T>(
  legacyConfig: LegacyViewConfig<T>,
  currentType: ViewType
): ViewConfig<T> {
  const columns: ViewColumn<T>[] = legacyConfig.columns?.map((col) => ({
    id: col.id,
    label: col.header,
    accessor: col.accessor,
    render: col.cell
      ? (item: T, value: any) => col.cell!(item)
      : undefined,
    hidden: col.hideOnCard && currentType !== ViewType.TABLE,
  })) || [];

  const rowActions: ViewAction<T>[] = legacyConfig.actions?.map((action) => ({
    id: action.id,
    label: action.label,
    icon: action.icon as any,
    onClick: action.onClick,
  })) || [];

  return {
    id: "legacy-view",
    type: currentType,
    label: "View",
    columns,
    rowActions,
    onItemClick: legacyConfig.onOpen,
    renderCard: legacyConfig.card
      ? (item: T) => (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              {legacyConfig.card?.avatar?.(item)}
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{legacyConfig.card?.title(item)}</div>
                {legacyConfig.card?.subtitle && (
                  <div className="text-sm text-muted-foreground truncate">
                    {legacyConfig.card?.subtitle(item)}
                  </div>
                )}
              </div>
            </div>
            {legacyConfig.card?.extra && (
              <div>{legacyConfig.card?.extra(item)}</div>
            )}
          </div>
        )
      : undefined,
  };
}

/**
 * Legacy ViewSwitcher Component (Compatibility Layer)
 * 
 * @deprecated Use ViewProvider and ViewRenderer instead
 */
export function ViewSwitcher<T = any>({
  storageKey,
  initialMode = "card",
  mode: controlledMode,
  onModeChange,
  data,
  config,
  searchable = false,
  showToolbar = true,
  emptyState,
}: ViewSwitcherProps<T>) {
  // Map legacy mode to ViewType
  const modeToType: Record<string, ViewType> = {
    table: ViewType.TABLE,
    list: ViewType.LIST,
    card: ViewType.GRID,
    grid: ViewType.GRID,
    details: ViewType.LIST,
    compact: ViewType.COMPACT_LIST,
  };

  const [internalMode, setInternalMode] = useState(initialMode);
  const currentMode = controlledMode || internalMode;
  const currentType = modeToType[currentMode] || ViewType.GRID;

  useEffect(() => {
    if (controlledMode) {
      setInternalMode(controlledMode);
    }
  }, [controlledMode]);

  const handleModeChange = (newMode: string) => {
    setInternalMode(newMode);
    onModeChange?.(newMode);
  };

  // Convert legacy config to new format
  const viewConfig = useMemo(
    () => convertLegacyConfig(config, currentType),
    [config, currentType]
  );

  // Handle search
  const [searchQuery, setSearchQuery] = useState("");
  const filteredData = useMemo(() => {
    if (!searchable || !searchQuery || !config.searchFn) {
      return data;
    }
    const query = searchQuery.toLowerCase();
    return data.filter((item) => config.searchFn!(item, query));
  }, [data, searchQuery, searchable, config.searchFn]);

  const emptyStateNode =
    typeof emptyState === "string" ? (
      <div className="flex h-full items-center justify-center p-6 text-muted-foreground">
        {emptyState}
      </div>
    ) : (
      emptyState
    );

  return (
    <ViewProvider
      config={viewConfig}
      data={filteredData}
      initialView={currentType}
      storageKey={storageKey}
    >
      {filteredData.length === 0 && emptyStateNode ? (
        emptyStateNode
      ) : (
        <ViewRenderer />
      )}
    </ViewProvider>
  );
}

// Re-export the type for compatibility
export type { LegacyViewConfig as ViewConfig };
