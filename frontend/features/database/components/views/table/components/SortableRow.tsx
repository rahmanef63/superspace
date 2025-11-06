"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Row } from "@tanstack/react-table";
import { TableRow as TableRowRaw, TableCell as TableCellRaw } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { flexRender } from "@tanstack/react-table";

interface SortableRowProps<TData> {
  row: Row<TData>;
  className?: string;
}

export function SortableRow<TData>({ row, className }: SortableRowProps<TData>) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: row.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TableRowRaw
      ref={setNodeRef}
      style={style}
      className={cn(
        className,
        isDragging && "opacity-50",
      )}
      data-state={row.getIsSelected() && "selected"}
    >
      {row.getVisibleCells().map((cell) => {
        // Special handling for drag handle cell
        if (cell.column.id === "drag") {
          return (
            <TableCellRaw key={cell.id}>
              <div
                {...attributes}
                {...listeners}
                className="flex h-full items-center justify-center"
              >
                <button
                  type="button"
                  className="cursor-grab rounded p-1 text-muted-foreground opacity-0 transition group-hover:opacity-100 hover:bg-muted hover:text-foreground active:cursor-grabbing"
                  aria-label="Drag to reorder"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </button>
              </div>
            </TableCellRaw>
          );
        }

        return (
          <TableCellRaw key={cell.id}>
            {flexRender(cell.column.columnDef.cell, cell.getContext())}
          </TableCellRaw>
        );
      })}
    </TableRowRaw>
  );
}
