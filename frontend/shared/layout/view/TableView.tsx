"use client";

import type { ReactNode } from "react";
import type { Column, RowAction } from "./types";

export function TableView<T>({
  data,
  columns,
  actions,
  getId,
}: {
  data: T[];
  columns: Array<Column<T>>;
  actions?: Array<RowAction<T>>;
  getId: (row: T) => string | number;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((c) => (
              <th
                key={c.id}
                className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                style={c.width ? { width: c.width } : undefined}
              >
                {c.header as ReactNode}
              </th>
            ))}
            {actions && actions.length > 0 && (
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            )}
          </tr>
        </thead>
        <tbody className="bg-background divide-y divide-gray-200">
          {data.map((row) => (
            <tr key={String(getId(row))} className="hover:bg-gray-50">
              {columns.map((c) => {
                const content = c.cell
                  ? c.cell(row)
                  : typeof c.accessor === "function"
                  ? c.accessor(row)
                  : c.accessor
                  ? // @ts-ignore — index access allowed via accessor
                    (row as any)[c.accessor as string]
                  : null;
                return (
                  <td key={c.id} className={`px-4 py-2 text-sm text-gray-700 ${c.className || ""}`.trim()}>
                    {content as ReactNode}
                  </td>
                );
              })}
              {actions && actions.length > 0 && (
                <td className="px-4 py-2 text-sm text-right">
                  <div className="inline-flex items-center gap-2">
                    {actions.map((a) => {
                      const visible = a.visible ? a.visible(row) : true;
                      if (!visible) return null;
                      return (
                        <button
                          key={a.id}
                          onClick={() => a.onClick(row)}
                          className="px-2 py-1 rounded border hover:bg-gray-100 text-gray-700"
                          title={a.label}
                        >
                          {a.icon || a.label}
                        </button>
                      );
                    })}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
