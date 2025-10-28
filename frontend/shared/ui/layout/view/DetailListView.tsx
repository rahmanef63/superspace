"use client";

import type { Column, RowAction, ViewConfig } from "./types";
import { RowActions } from "./RowActions";

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
            <RowActions
              actions={actions}
              row={row}
              className="mt-4 border-t border-border pt-3"
            />
          )}
        </div>
      ))}
    </div>
  );
}
