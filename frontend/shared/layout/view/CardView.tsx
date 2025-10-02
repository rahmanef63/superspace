"use client";

import type { Column, RowAction, ViewConfig } from "./types";

function resolveValue<T>(column: Column<T>, row: T) {
  if (column.cell) return column.cell(row);
  if (typeof column.accessor === "function") return column.accessor(row);
  if (column.accessor) return (row as any)[column.accessor as string];
  return null;
}

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

  const getPrimary = (row: T) => {
    if (card?.title) return card.title(row);
    const first = visibleColumns[0];
    return first ? resolveValue(first, row) : null;
  };

  return (
    <div
      className="grid gap-4"
      style={{ gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}
    >
      {data.map((row) => {
        const id = String(getId(row));
        return (
          <div
            key={id}
            className="flex h-full flex-col overflow-hidden rounded-xl border border-gray-200/80 bg-background shadow-sm"
          >
            <div className="flex items-start gap-3 border-b border-gray-200/70 p-4">
              {card?.avatar && <div className="shrink-0">{card.avatar(row)}</div>}
              <div className="min-w-0 flex-1 space-y-1">
                <div className="truncate font-semibold text-gray-900">{getPrimary(row)}</div>
                {card?.subtitle && (
                  <div className="truncate text-sm text-muted-foreground">{card.subtitle(row)}</div>
                )}
              </div>
              {card?.extra && <div className="ml-auto text-sm text-muted-foreground">{card.extra(row)}</div>}
            </div>

            {visibleColumns.length > 1 && (
              <div className="p-4 text-sm text-gray-700">
                <dl className="space-y-3">
                  {visibleColumns.slice(1).map((c) => (
                    <div
                      key={c.id}
                      className="grid grid-cols-[auto,1fr] items-start gap-x-3 gap-y-1"
                    >
                      <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        {c.header}
                      </dt>
                      <dd className="text-gray-900">{resolveValue(c, row)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {actions && actions.length > 0 && (
              <div className="flex flex-wrap items-center justify-end gap-2 border-t border-gray-200/70 bg-gray-50 p-3">
                {actions.map((a) => {
                  const visible = a.visible ? a.visible(row) : true;
                  if (!visible) return null;
                  const hasIcon = Boolean(a.icon);
                  const hasLabel = Boolean(a.label);
                  return (
                    <button
                      key={a.id}
                      onClick={() => a.onClick(row)}
                      className="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-3 py-1 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-100"
                      title={a.label}
                    >
                      {hasIcon && <span className="text-gray-600">{a.icon}</span>}
                      {hasLabel && <span>{a.label}</span>}
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
