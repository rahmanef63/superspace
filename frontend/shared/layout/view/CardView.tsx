"use client";

import type { Column, RowAction, ViewConfig } from "./types";

export function CardView<T>({
  data,
  columns,
  actions,
  getId,
  card,
}: {
  data: T[];
  columns: Array<Column<T>>;
  actions?: Array<RowAction<T>>;
  getId: (row: T) => string | number;
  card?: ViewConfig<T>["card"];
}) {
  const visibleColumns = columns.filter((c) => !c.hideOnCard);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {data.map((row) => {
        const id = String(getId(row));
        return (
          <div key={id} className="border rounded-lg bg-background">
            <div className="p-4 flex items-center gap-3 border-b">
              {card?.avatar && <div className="shrink-0">{card.avatar(row)}</div>}
              <div className="min-w-0">
                <div className="font-semibold truncate">{card?.title ? card.title(row) : (visibleColumns[0]?.cell ? visibleColumns[0].cell(row) : typeof visibleColumns[0]?.accessor === "function" ? visibleColumns[0]?.accessor?.(row) : visibleColumns[0] && (row as any)[visibleColumns[0].accessor as string])}</div>
                {card?.subtitle && <div className="text-xs text-gray-500 truncate">{card.subtitle(row)}</div>}
              </div>
              {card?.extra && <div className="ml-auto">{card.extra(row)}</div>}
            </div>
            <div className="p-4 text-sm text-gray-700">
              <dl className="grid grid-cols-1 gap-2">
                {visibleColumns.slice(1).map((c) => {
                  const val = c.cell
                    ? c.cell(row)
                    : typeof c.accessor === "function"
                    ? c.accessor(row)
                    : c.accessor
                    ? (row as any)[c.accessor as string]
                    : null;
                  return (
                    <div key={c.id} className="flex items-start gap-2">
                      <dt className="text-gray-500 min-w-[120px]">{c.header}</dt>
                      <dd className="flex-1">{val}</dd>
                    </div>
                  );
                })}
              </dl>
            </div>
            {actions && actions.length > 0 && (
              <div className="p-3 border-t flex items-center justify-end gap-2">
                {actions.map((a) => {
                  const visible = a.visible ? a.visible(row) : true;
                  if (!visible) return null;
                  return (
                    <button
                      key={a.id}
                      onClick={() => a.onClick(row)}
                      className="px-2 py-1 rounded border hover:bg-gray-100 text-gray-700 text-sm"
                      title={a.label}
                    >
                      {a.icon || a.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
