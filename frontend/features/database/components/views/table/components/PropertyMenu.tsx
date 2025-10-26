"use client";

import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EllipsisVertical, Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import type { DatabaseField } from "../../../../types";

export interface PropertyMenuProps {
  field: DatabaseField;
  isVisible: boolean;
  onRename?: (fieldId: string, name: string) => Promise<void> | void;
  onToggleVisibility?: (fieldId: string, visible: boolean) => Promise<void> | void;
  onToggleRequired?: (fieldId: string, required: boolean) => Promise<void> | void;
  onDelete?: (fieldId: string) => Promise<void> | void;
}

export function PropertyMenu({
  field,
  isVisible,
  onRename,
  onToggleVisibility,
  onToggleRequired,
  onDelete,
}: PropertyMenuProps) {
  const fieldId = String(field._id);

  const handleRename = useCallback(() => {
    if (!onRename) return;
    const nextName = window.prompt("Rename property", field.name);
    if (!nextName) return;
    const trimmed = nextName.trim();
    if (!trimmed || trimmed === field.name) return;
    void onRename(fieldId, trimmed);
  }, [field.name, fieldId, onRename]);

  const handleToggleVisibility = useCallback(() => {
    if (!onToggleVisibility) return;
    void onToggleVisibility(fieldId, !isVisible);
  }, [fieldId, isVisible, onToggleVisibility]);

  const handleToggleRequired = useCallback(
    (value: boolean) => {
      if (!onToggleRequired) return;
      void onToggleRequired(fieldId, value);
    },
    [fieldId, onToggleRequired],
  );

  const handleDelete = useCallback(() => {
    if (!onDelete) return;
    const confirmed = window.confirm(
      `Delete property "${field.name}"? This will remove data stored in this column.`,
    );
    if (!confirmed) return;
    void onDelete(fieldId);
  }, [field.name, fieldId, onDelete]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          size="icon"
          variant="ghost"
          className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground"
        >
          <EllipsisVertical className="h-4 w-4" />
          <span className="sr-only">Open property menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>Property options</DropdownMenuLabel>
        <DropdownMenuItem onClick={handleRename} className="gap-2">
          <Pencil className="h-4 w-4" />
          Rename
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleToggleVisibility} className="gap-2">
          {isVisible ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
          {isVisible ? "Hide" : "Show"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuCheckboxItem
          checked={field.isRequired ?? false}
          onCheckedChange={(value) => handleToggleRequired(Boolean(value))}
        >
          Required
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleDelete}
          className="gap-2 text-destructive focus:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
          Delete property
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
