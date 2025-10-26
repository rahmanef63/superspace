"use client";

import { GripVertical } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Column } from "@tanstack/react-table";
import type { DatabaseFeature } from "../../../../types";
import { PropertyMenu, type PropertyMenuProps } from "./PropertyMenu";
import { cn } from "@/lib/utils";

export interface SortableHeaderProps
  extends Pick<
    PropertyMenuProps,
    "field" | "isVisible" | "onRename" | "onToggleVisibility" | "onToggleRequired" | "onDelete"
  > {
  column: Column<DatabaseFeature, unknown>;
  disableDrag?: boolean;
  id: string;
}

export function SortableHeader({
  id,
  column,
  field,
  isVisible,
  disableDrag,
  onRename,
  onToggleVisibility,
  onToggleRequired,
  onDelete,
}: SortableHeaderProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({
      id,
      disabled: disableDrag,
    });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex h-full select-none items-center gap-2 rounded-md bg-background px-2 py-1 text-xs font-medium uppercase text-muted-foreground",
        isDragging && "ring-2 ring-ring",
      )}
    >
      <button
        type="button"
        className={cn(
          "flex h-7 w-7 items-center justify-center rounded-md border border-transparent text-muted-foreground transition",
          !disableDrag && "cursor-grab active:cursor-grabbing",
          isDragging && "border-border bg-muted",
        )}
        {...listeners}
        {...attributes}
        aria-label={`Drag to reposition ${field.name}`}
        tabIndex={-1}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <div className="flex flex-1 items-center gap-2">
        <span className="truncate text-xs font-semibold text-foreground">
          {field.name}
        </span>
        {field.isRequired ? (
          <span className="text-[10px] font-semibold uppercase text-primary">Required</span>
        ) : null}
      </div>
      <PropertyMenu
        field={field}
        isVisible={isVisible}
        onRename={onRename}
        onToggleVisibility={onToggleVisibility}
        onToggleRequired={onToggleRequired}
        onDelete={onDelete}
      />
    </div>
  );
}
