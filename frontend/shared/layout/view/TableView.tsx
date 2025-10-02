"use client";

import type { ReactNode } from "react";
import type { Column, RowAction } from "./types";

function resolveValue<T>(column: Column<T>, row: T) {
  if (column.cell) return column.cell(row);
  if (typeof column.accessor === "function") return column.accessor(row);
  if (column.accessor) return (row as any)[column.accessor as string];
  return null;
}

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
  const hasActions = Boolean(actions?.length);

  const renderActions = (row: T) => {
    if (!actions || actions.length === 0) return null;
    return actions.map((action) => {
      const visible = action.visible ? action.visible(row) : true;
      if (!visible) return null;
      const hasIcon = Boolean(action.icon);
      const hasLabel = Boolean(action.label);
      return (
        <button
          key={action.id}
          onClick={() => action.onClick(row)}
          className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted"
          title={action.label}
        >
          {hasIcon && <span className="text-muted-foreground">{action.icon}</span>}
          {hasLabel && <span>{action.label}</span>}
        </button>
      );
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-3 sm:hidden">
        {data.map((row) => (
          <div
            key={String(getId(row))}
            className="rounded-lg border border-border bg-background p-4 shadow-sm"
          >
            <dl className="space-y-2 text-sm text-foreground">
              {columns.map((column) => (
                <div key={column.id} className="flex items-start gap-3">
                  <dt className="min-w-[120px] text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {column.header as ReactNode}
                  </dt>
                  <dd className="flex-1 text-foreground">{resolveValue(column, row)}</dd>
                </div>
              ))}
            </dl>
            {hasActions && <div className="mt-3 flex flex-wrap gap-2">{renderActions(row)}</div>}
          </div>
        ))}
      </div>

      <div className="hidden overflow-x-auto sm:block">
        <table className="min-w-full divide-y divide-muted">
          <thead >
            <tr>
              {columns.map((c) => (
                <th
                  key={c.id}
                  className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide"
                  style={c.width ? { width: c.width } : undefined}
                >
                  {c.header as ReactNode}
                </th>
              ))}
              {hasActions && (
                <th className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wide">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-muted bg-background">
            {data.map((row) => (
              <tr key={String(getId(row))} className="hover:bg-muted text-background">
                {columns.map((c) => (
                  <td
                    key={c.id}
                    className={`px-4 py-2 text-md text-foreground ${c.className || ""}`.trim()}
                  >
                    {resolveValue(c, row) as ReactNode}
                  </td>
                ))}
                {hasActions && (
                  <td className="px-4 py-2 text-sm text-right">
                    <div className="inline-flex flex-wrap items-center justify-end gap-2">
                      {renderActions(row)}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
