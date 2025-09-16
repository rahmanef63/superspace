"use client";

import type { Column, RowAction, ViewConfig } from "./types";

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
    value: (row: T) =>
      c.cell ? c.cell(row) : typeof c.accessor === "function" ? c.accessor(row) : c.accessor ? (row as any)[c.accessor as string] : null,
  }));
  const fields = details?.fields ?? defaultFields;

  return (
    <div className="divide-y divide-gray-200 bg-background rounded-lg border">
      {data.map((row) => (
        <div key={String(getId(row))} className="p-4">
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
            {fields.map((f, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <dt className="text-gray-500 min-w-[140px]">{f.label}</dt>
                <dd className="flex-1 text-gray-900">{f.value(row)}</dd>
              </div>
            ))}
          </dl>
          {actions && actions.length > 0 && (
            <div className="pt-3 mt-3 border-t flex items-center gap-2">
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
          )}
        </div>
      ))}
    </div>
  );
}
