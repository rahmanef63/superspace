"use client";

import { LayoutGrid, List, Table as TableIcon, Search } from "lucide-react";
import type { ViewToolbarProps } from "./types";

export function ViewToolbar({ mode, setMode, query, setQuery, className }: ViewToolbarProps) {
  return (
    <div className={["flex items-center gap-3", className].filter(Boolean).join(" ")}> 
      <div className="relative max-w-sm w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search..."
          className="w-full pl-9 pr-3 py-2 border rounded-lg text-sm"
        />
      </div>
      <div className="ml-auto flex items-center gap-1">
        <button
          className={`px-2.5 py-1.5 rounded ${mode === "table" ? "bg-gray-900 text-primary" : "hover:bg-gray-100"}`}
          title="Table view"
          onClick={() => setMode("table")}
        >
          <TableIcon className="w-4 h-4" />
        </button>
        <button
          className={`px-2.5 py-1.5 rounded ${mode === "card" ? "bg-gray-900 text-primary" : "hover:bg-gray-100"}`}
          title="Card view"
          onClick={() => setMode("card")}
        >
          <LayoutGrid className="w-4 h-4" />
        </button>
        <button
          className={`px-2.5 py-1.5 rounded ${mode === "details" ? "bg-gray-900 text-primary" : "hover:bg-gray-100"}`}
          title="Details view"
          onClick={() => setMode("details")}
        >
          <List className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
