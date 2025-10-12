"use client";

import type { ReactNode } from "react";
import type { RowAction } from "./types";

interface RowActionsProps<T> {
  actions?: Array<RowAction<T>>;
  row: T;
  className?: string;
  buttonClassName?: string;
  emptyState?: ReactNode;
}

/**
 * Shared renderer for row-level actions used by table, detail, and card views.
 * Avoids duplicating button markup and visibility checks across view components.
 */
export function RowActions<T>({
  actions,
  row,
  className,
  buttonClassName,
  emptyState = null,
}: RowActionsProps<T>) {
  if (!actions || actions.length === 0) {
    return emptyState;
  }

  const visibleActions = actions.filter((action) => {
    try {
      return action.visible ? action.visible(row) : true;
    } catch {
      return false;
    }
  });

  if (visibleActions.length === 0) {
    return emptyState;
  }

  const containerClass = ["flex flex-wrap items-center gap-2", className]
    .filter(Boolean)
    .join(" ");

  const baseButtonClass =
    "inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1 text-sm font-medium text-foreground shadow-sm transition hover:bg-muted";

  return (
    <div className={containerClass}>
      {visibleActions.map((action) => {
        const hasIcon = Boolean(action.icon);
        const hasLabel = Boolean(action.label);
        return (
          <button
            key={action.id}
            onClick={() => action.onClick(row)}
            className={[baseButtonClass, buttonClassName].filter(Boolean).join(" ")}
            title={action.label}
            type="button"
          >
            {hasIcon && <span className="text-muted-foreground">{action.icon}</span>}
            {hasLabel && <span>{action.label}</span>}
          </button>
        );
      })}
    </div>
  );
}

