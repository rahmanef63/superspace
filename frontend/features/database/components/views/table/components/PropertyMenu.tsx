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
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  EllipsisVertical,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  Copy,
  ArrowUpAZ,
  ArrowDownZA,
  Filter as FilterIcon,
  Calculator,
  ArrowLeft,
  ArrowRight,
  ArrowBigLeft,
  ArrowBigRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { DatabaseField } from "../../../../types";
import type { Property } from "@/frontend/shared/foundation/types/universal-database";

export interface PropertyMenuProps {
  field: DatabaseField | Property;
  isVisible?: boolean;
  
  // Common Actions
  onRename?: (fieldId: string, name: string) => Promise<void> | void;
  onDuplicate?: (fieldId: string) => Promise<void> | void;
  onToggleVisibility?: (fieldId: string, visible: boolean) => Promise<void> | void;
  onToggleRequired?: (fieldId: string, required: boolean) => Promise<void> | void;
  onDelete?: (fieldId: string) => Promise<void> | void;
  
  // Column Actions
  onInsertLeft?: (fieldId: string) => Promise<void> | void;
  onInsertRight?: (fieldId: string) => Promise<void> | void;
  onMoveLeft?: (fieldId: string) => Promise<void> | void;
  onMoveRight?: (fieldId: string) => Promise<void> | void;
  
  // Data Actions
  onSort?: (fieldId: string, direction: 'asc' | 'desc') => Promise<void> | void;
  onFilter?: (fieldId: string) => Promise<void> | void;
  onCalculate?: (fieldId: string, aggregation: string) => Promise<void> | void;
}

/**
 * Comprehensive Property Menu (Notion-style)
 * 
 * Features:
 * - Edit: Rename, Duplicate
 * - Data: Sort, Filter, Calculate
 * - Column: Insert, Move
 * - Settings: Required, Hide
 * - Danger: Delete
 */
export function PropertyMenu({
  field,
  isVisible = true,
  onRename,
  onDuplicate,
  onToggleVisibility,
  onToggleRequired,
  onDelete,
  onInsertLeft,
  onInsertRight,
  onMoveLeft,
  onMoveRight,
  onSort,
  onFilter,
  onCalculate,
}: PropertyMenuProps) {
  const fieldId = 'key' in field ? field.key : String(field._id);
  const fieldName = field.name;
  const isRequired = field.isRequired ?? false;

  const handleRename = useCallback(() => {
    if (!onRename) return;
    const nextName = window.prompt("Rename property", fieldName);
    if (!nextName) return;
    const trimmed = nextName.trim();
    if (!trimmed || trimmed === fieldName) return;
    void onRename(fieldId, trimmed);
  }, [fieldName, fieldId, onRename]);

  const handleDuplicate = useCallback(() => {
    if (!onDuplicate) return;
    void onDuplicate(fieldId);
  }, [fieldId, onDuplicate]);

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
      `Delete property "${fieldName}"? This will remove data stored in this column.`,
    );
    if (!confirmed) return;
    void onDelete(fieldId);
  }, [fieldName, fieldId, onDelete]);

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
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="truncate">{fieldName}</DropdownMenuLabel>
        
        {/* Edit Actions */}
        {(onRename || onDuplicate) && (
          <>
            {onRename && (
              <DropdownMenuItem onClick={handleRename} className="gap-2">
                <Pencil className="h-4 w-4" />
                <span>Rename</span>
                <span className="ml-auto text-xs text-muted-foreground">⌘R</span>
              </DropdownMenuItem>
            )}
            {onDuplicate && (
              <DropdownMenuItem onClick={handleDuplicate} className="gap-2">
                <Copy className="h-4 w-4" />
                <span>Duplicate</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
          </>
        )}
        
        {/* Data Actions */}
        {(onSort || onFilter || onCalculate) && (
          <>
            {onSort && (
              <>
                <DropdownMenuItem onClick={() => onSort(fieldId, 'asc')} className="gap-2">
                  <ArrowUpAZ className="h-4 w-4" />
                  <span>Sort ascending</span>
                  <span className="ml-auto text-xs text-muted-foreground">A → Z</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onSort(fieldId, 'desc')} className="gap-2">
                  <ArrowDownZA className="h-4 w-4" />
                  <span>Sort descending</span>
                  <span className="ml-auto text-xs text-muted-foreground">Z → A</span>
                </DropdownMenuItem>
              </>
            )}
            {onFilter && (
              <DropdownMenuItem onClick={() => onFilter(fieldId)} className="gap-2">
                <FilterIcon className="h-4 w-4" />
                <span>Filter</span>
              </DropdownMenuItem>
            )}
            {onCalculate && (
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="gap-2">
                  <Calculator className="h-4 w-4" />
                  <span>Calculate</span>
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => onCalculate(fieldId, 'count')}>
                    Count all
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onCalculate(fieldId, 'count-values')}>
                    Count values
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onCalculate(fieldId, 'count-unique')}>
                    Count unique values
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onCalculate(fieldId, 'count-empty')}>
                    Count empty
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onCalculate(fieldId, 'percent-empty')}>
                    Percent empty
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            )}
            <DropdownMenuSeparator />
          </>
        )}
        
        {/* Column Management */}
        {(onInsertLeft || onInsertRight || onMoveLeft || onMoveRight) && (
          <>
            {onInsertLeft && (
              <DropdownMenuItem onClick={() => onInsertLeft(fieldId)} className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                <span>Insert left</span>
              </DropdownMenuItem>
            )}
            {onInsertRight && (
              <DropdownMenuItem onClick={() => onInsertRight(fieldId)} className="gap-2">
                <ArrowRight className="h-4 w-4" />
                <span>Insert right</span>
              </DropdownMenuItem>
            )}
            {onMoveLeft && (
              <DropdownMenuItem onClick={() => onMoveLeft(fieldId)} className="gap-2">
                <ArrowBigLeft className="h-4 w-4" />
                <span>Move left</span>
              </DropdownMenuItem>
            )}
            {onMoveRight && (
              <DropdownMenuItem onClick={() => onMoveRight(fieldId)} className="gap-2">
                <ArrowBigRight className="h-4 w-4" />
                <span>Move right</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
          </>
        )}
        
        {/* Settings */}
        {onToggleRequired && (
          <>
            <DropdownMenuCheckboxItem
              checked={isRequired}
              onCheckedChange={(value) => handleToggleRequired(Boolean(value))}
            >
              Required
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
          </>
        )}
        
        {/* Danger Zone */}
        {onToggleVisibility && (
          <DropdownMenuItem onClick={handleToggleVisibility} className="gap-2">
            {isVisible ? (
              <>
                <EyeOff className="h-4 w-4" />
                <span>Hide in view</span>
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                <span>Show in view</span>
              </>
            )}
          </DropdownMenuItem>
        )}
        {onDelete && (
          <DropdownMenuItem
            onClick={handleDelete}
            className="gap-2 text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete property</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
