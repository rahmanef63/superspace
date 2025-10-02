"use client";

import type { Column, RowAction, ViewConfig } from "./types";

function resolveValue<T>(column: Column<T>, row: T) {
  if (column.cell) return column.cell(row);
  if (typeof column.accessor === "function") return column.accessor(row);
  if (column.accessor) return (row as any)[column.accessor as string];
  return null;
}

export function DetailListView<T>({
  data,
  columns,
  actions,
  getId,
  details,
}: {
  data: T[];
  columns: Array<Column<T>>;
  actions?: Array<RowAction<T>>;
  getId: (row: T) => string | number;
  details?: ViewConfig<T>["details"];
}) {
  const defaultFields = columns.map((c) => ({
    label: c.header,
    value: (row: T) => resolveValue(c, row),
  }));
  const fields = details?.fields ?? defaultFields;

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

  if (data.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-background p-6 text-center text-sm text-muted-foreground">
        No data
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-background">
      {data.map((row, index) => (
        <div
          key={String(getId(row))}
          className={`p-4 sm:p-5 ${index !== 0 ? "border-t border-border" : ""}`.trim()}
        >
          <dl className="grid grid-cols-1 gap-x-6 gap-y-3 md:grid-cols-2">
            {fields.map((field, idx) => (
              <div key={idx} className="flex items-start gap-3 text-sm">
                <dt className="min-w-[120px] text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {field.label}
                </dt>
                <dd className="flex-1 text-foreground">{field.value(row)}</dd>
              </div>
            ))}
          </dl>
          {actions && actions.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-3">
              {renderActions(row)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
