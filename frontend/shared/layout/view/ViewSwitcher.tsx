"use client";

import { useMemo, useState } from "react";
import { CardView } from "./CardView";
import { DetailListView } from "./DetailListView";
import { TableView } from "./TableView";
import { ViewToolbar } from "./ViewToolbar";
import { useViewMode } from "./useViewMode";
import type { ViewConfig, ViewMode } from "./types";

export function ViewSwitcher<T>({
  storageKey = "view-mode",
  initialMode = "table",
  mode: controlledMode,
  onModeChange,
  data,
  config,
  searchable = true,
  className,
  emptyState,
}: {
  storageKey?: string;
  initialMode?: ViewMode;
  mode?: ViewMode;
  onModeChange?: (m: ViewMode) => void;
  data: T[];
  config: ViewConfig<T>;
  searchable?: boolean;
  className?: string;
  emptyState?: React.ReactNode;
}) {
  const [uncontrolledMode, setUncontrolledMode] = useViewMode(storageKey, initialMode);
  const mode = controlledMode ?? uncontrolledMode;
  const setMode = (m: ViewMode) => {
    if (onModeChange) onModeChange(m);
    else setUncontrolledMode(m);
  };

  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q || !searchable) return data;
    if (config.searchFn) return data.filter((row) => config.searchFn!(row, q));
    return data.filter((row: any) => {
      try {
        const values = Object.values(row ?? {});
        return values.some((value) => {
          if (value == null) return false;
          const str = typeof value === "string" ? value : typeof value === "number" ? String(value) : undefined;
          return str ? str.toLowerCase().includes(q) : false;
        });
      } catch {
        return false;
      }
    });
  }, [data, query, config, searchable]);

  const content = (() => {
    if (!filtered || filtered.length === 0) {
      return (
        <div className="rounded-lg border border-dashed border-gray-200 bg-background p-8 text-center text-sm text-gray-500">
          {emptyState || "No data"}
        </div>
      );
    }

    switch (mode) {
      case "card":
        return (
          <CardView
            data={filtered}
            columns={config.columns}
            actions={config.actions}
            getId={config.getId}
            card={config.card}
          />
        );
      case "details":
        return (
          <DetailListView
            data={filtered}
            columns={config.columns}
            actions={config.actions}
            getId={config.getId}
            details={config.details}
          />
        );
      case "table":
      default:
        return (
          <TableView
            data={filtered}
            columns={config.columns}
            actions={config.actions}
            getId={config.getId}
          />
        );
    }
  })();

  const searchValue = searchable ? query : "";
  const handleQueryChange = searchable ? setQuery : () => {};

  return (
    <div className={["space-y-4", className].filter(Boolean).join(" ")}>
      <div className="rounded-lg border border-gray-200 bg-background p-4">
        <ViewToolbar
          mode={mode}
          setMode={setMode}
          query={searchValue}
          setQuery={handleQueryChange}
          searchable={searchable}
        />
      </div>
      {content}
    </div>
  );
}
