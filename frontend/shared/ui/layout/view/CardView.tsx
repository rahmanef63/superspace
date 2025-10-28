"use client";

import type { Column, RowAction, ViewConfig } from "./types";
import { RowActions } from "./RowActions";

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
            className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-background shadow-sm"
          >
            <div className="flex items-start gap-3 border-b border-border p-4">
              {card?.avatar && <div className="shrink-0">{card.avatar(row)}</div>}
              <div className="min-w-0 flex-1 space-y-1">
                <div className="truncate font-semibold text-foreground">{getPrimary(row)}</div>
                {card?.subtitle && (
                  <div className="truncate text-sm text-muted-foreground">{card.subtitle(row)}</div>
                )}
              </div>
              {card?.extra && <div className="ml-auto text-sm text-muted-foreground">{card.extra(row)}</div>}
            </div>

            {visibleColumns.length > 1 && (
              <div className="p-4 text-sm text-foreground">
                <dl className="space-y-3">
                  {visibleColumns.slice(1).map((c) => (
                    <div
                      key={c.id}
                      className="grid grid-cols-[auto,1fr] items-start gap-x-3 gap-y-1"
                    >
                      <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {c.header}
                      </dt>
                      <dd className="text-foreground">{resolveValue(c, row)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {actions && actions.length > 0 && (
              <RowActions
                actions={actions}
                row={row}
                className="justify-end border-t border-border bg-muted p-3"
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
