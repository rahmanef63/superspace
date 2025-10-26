"use client";

import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Trash2 } from "lucide-react";

export interface RowActionsProps {
  rowId: string;
  onDelete?: (rowId: string) => Promise<void> | void;
}

export function RowActions({ rowId, onDelete }: RowActionsProps) {
  const [open, setOpen] = useState(false);

  const handleDelete = useCallback(() => {
    if (!onDelete) return;
    const confirmed = window.confirm("Delete this row? This cannot be undone.");
    if (!confirmed) return;
    void onDelete(rowId);
    setOpen(false);
  }, [onDelete, rowId]);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={handleDelete}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete row
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
