"use client";

import { GripVertical } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Column } from "@tanstack/react-table";
import type { DatabaseFeature } from "../../../../types";
import { PropertyMenu } from "../../../PropertyMenu/PropertyMenu";
import type { PropertyMenuProps } from "../../../PropertyMenu/types";
import { cn } from "@/lib/utils";

export interface SortableHeaderProps {
  column: Column<DatabaseFeature, unknown>;
  field: PropertyMenuProps['field'];
  isVisible?: boolean;
  isRequired?: boolean;
  disableDrag?: boolean;
  id: string;
  
  // PropertyMenu handlers - all optional, pass what you have
  onRename?: (fieldId: string, name: string) => Promise<void> | void;
  onDuplicate?: (fieldId: string) => Promise<void> | void;
  onChangeType?: (fieldId: string, newType: any) => Promise<void> | void;
  onSort?: (fieldId: string, direction: 'asc' | 'desc') => void;
  onFilter?: (fieldId: string) => void;
  onCalculate?: (fieldId: string, calcType: string) => void;
  onWrap?: (fieldId: string) => void;
  onSetFormat?: (fieldId: string, format: string) => Promise<void> | void;
  onShowAs?: (fieldId: string, displayType: string) => Promise<void> | void;
  onDateFormat?: (fieldId: string, format: string) => Promise<void> | void;
  onTimeFormat?: (fieldId: string, format: string) => Promise<void> | void;
  onEditOptions?: (fieldId: string) => void;
  onManageColors?: (fieldId: string) => void;
  onNotifications?: (fieldId: string) => void;
  onShowPageIcon?: (fieldId: string) => void;
  onInsertLeft?: (fieldId: string) => Promise<void> | void;
  onInsertRight?: (fieldId: string) => Promise<void> | void;
  onMoveLeft?: (fieldId: string) => Promise<void> | void;
  onMoveRight?: (fieldId: string) => Promise<void> | void;
  onToggleRequired?: (fieldId: string, required: boolean) => Promise<void> | void;
  onHide?: (fieldId: string) => Promise<void> | void;
  onDelete?: (fieldId: string) => Promise<void> | void;
}

export function SortableHeader({
  id,
  column,
  field,
  isVisible,
  isRequired,
  disableDrag,
  // Pass all PropertyMenu handlers
  onRename,
  onDuplicate,
  onChangeType,
  onSort,
  onFilter,
  onCalculate,
  onWrap,
  onSetFormat,
  onShowAs,
  onDateFormat,
  onTimeFormat,
  onEditOptions,
  onManageColors,
  onNotifications,
  onShowPageIcon,
  onInsertLeft,
  onInsertRight,
  onMoveLeft,
  onMoveRight,
  onToggleRequired,
  onHide,
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
        isRequired={isRequired}
        onRename={onRename}
        onDuplicate={onDuplicate}
        onChangeType={onChangeType}
        onSort={onSort}
        onFilter={onFilter}
        onCalculate={onCalculate}
        onWrap={onWrap}
        onSetFormat={onSetFormat}
        onShowAs={onShowAs}
        onDateFormat={onDateFormat}
        onTimeFormat={onTimeFormat}
        onEditOptions={onEditOptions}
        onManageColors={onManageColors}
        onNotifications={onNotifications}
        onShowPageIcon={onShowPageIcon}
        onInsertLeft={onInsertLeft}
        onInsertRight={onInsertRight}
        onMoveLeft={onMoveLeft}
        onMoveRight={onMoveRight}
        onToggleRequired={onToggleRequired}
        onHide={onHide}
        onDelete={onDelete}
      />
    </div>
  );
}
