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
    if (!q) return data;
    if (config.searchFn) return data.filter((row) => config.searchFn!(row, q));
    // default: scan string-like values of row
    return data.filter((row: any) => {
      try {
        const vals = Object.values(row ?? {});
        return vals.some((v) => {
          if (v == null) return false;
          const s = typeof v === "string" ? v : typeof v === "number" ? String(v) : undefined;
          return s ? s.toLowerCase().includes(q) : false;
        });
      } catch {
        return false;
      }
    });
  }, [data, query, config]);

  const content = (() => {
    if (!filtered || filtered.length === 0) {
      return (
        <div className="p-8 text-center text-sm text-gray-500">{emptyState || "No data"}</div>
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

  return (
    <div className={className}>
      <div className="p-4 bg-background border border-gray-200 rounded-lg mb-3">
        <ViewToolbar mode={mode} setMode={setMode} query={searchable ? query : ""} setQuery={searchable ? setQuery : () => {}} />
      </div>
      {content}
    </div>
  );
}
