"use client";

import { LayoutGrid, List, Table as TableIcon, Search } from "lucide-react";
import type { ViewToolbarProps } from "./types";

const modes = [
  { id: "table" as const, icon: TableIcon, label: "Table view" },
  { id: "card" as const, icon: LayoutGrid, label: "Card view" },
  { id: "details" as const, icon: List, label: "Details view" },
];

export function ViewToolbar({
  mode,
  setMode,
  query,
  setQuery,
  searchable = true,
  className,
}: ViewToolbarProps) {
  return (
    <div
      className={["flex flex-wrap items-center gap-3 sm:gap-4", className]
        .filter(Boolean)
        .join(" ")}
    >
      {searchable && (
        <div className="relative min-w-[200px] flex-1 max-w-xl">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            className="w-full rounded-lg border border-input bg-background py-2 pl-9 pr-3 text-sm text-foreground shadow-sm focus:border-ring focus:outline-none"
          />
        </div>
      )}
      <div
        className={`flex items-center justify-end gap-2 ${
          searchable ? "w-full sm:w-auto" : "w-full"
        }`}
      >
        {modes.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            type="button"
            onClick={() => setMode(id)}
            className={`inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm font-medium transition ${
              mode === id
                ? "border-primary bg-primary text-primary-foreground shadow"
                : "border-border bg-background text-muted-foreground hover:bg-muted"
            }`}
            aria-pressed={mode === id}
            title={label}
          >
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
