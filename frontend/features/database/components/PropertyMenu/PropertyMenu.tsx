"use client";

import React, { useMemo, useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import type { PropertyMenuProps, PropertyMenuItem } from './types';
import { getFieldId } from './utils';
import { buildPropertyMenu, type PropertyMenuCallbacks } from './menu-builder';
import { RenamePropertyDialog, DeletePropertyDialog, ChangePropertyTypeDialog } from './dialogs';

/**
 * Property Menu Component (Notion-style)
 * 
 * Automatically builds comprehensive property management menu based on property type using registry system:
 * - Base actions (15 common actions for all properties)
 * - Type-specific items (from property type config)
 * - Overrides (customize base items per type)
 * - Hidden/disabled rules (per property type)
 * 
 * Registry system eliminates need for manual extension prop - just pass property and callbacks.
 * 
 * @example
 * ```tsx
 * <PropertyMenu
 *   field={field}
 *   onRename={() => handleRename(field.id)}
 *   onDelete={() => handleDelete(field.id)}
 *   onSort={(direction) => handleSort(field.id, direction)}
 * >
 *   <Button variant="ghost" size="sm">
 *     <MoreHorizontal className="h-4 w-4" />
 *   </Button>
 * </PropertyMenu>
 * ```
 */
export function PropertyMenu({
  field,
  isVisible = true,
  isRequired = false,
  onRename,
  onDuplicate,
  onChangeType,
  onHide,
  onDelete,
  onToggleRequired,
  onInsertLeft,
  onInsertRight,
  onMoveLeft,
  onMoveRight,
  onSort,
  onFilter,
  onCalculate,
  onWrap,
  onEditOptions,
  onManageColors,
  onSetFormat,
  onShowAs,
  onDateFormat,
  onTimeFormat,
  onNotifications,
  onShowPageIcon,
  children,
  align = 'start',
  side = 'bottom',
  open,
  onOpenChange,
}: PropertyMenuProps) {
  const fieldId = getFieldId(field);
  const fieldName = field.name;
  const { toast } = useToast();
  
  // Dialog states
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [changeTypeDialogOpen, setChangeTypeDialogOpen] = useState(false);

  // Build menu items using registry system
  const menuItems = useMemo(() => {
    // Create callbacks object with toast notifications and error handling
    const callbacks: PropertyMenuCallbacks = {
      onRename: onRename ? () => {
        setRenameDialogOpen(true);
      } : undefined,

      onDuplicate: onDuplicate ? async () => {
        try {
          await onDuplicate(fieldId);
          // Success - no toast needed, user can see the duplicated property
        } catch (error) {
          toast({
            variant: "destructive",
            title: "Failed to duplicate property",
            description: error instanceof Error ? error.message : "Unknown error",
          });
        }
      } : undefined,

      onChangeType: onChangeType ? () => {
        setChangeTypeDialogOpen(true);
      } : undefined,

      onHide: onHide ? async () => {
        try {
          await onHide(fieldId);
          // Success - no toast needed, user can see property is hidden
        } catch (error) {
          toast({
            variant: "destructive",
            title: "Failed to hide property",
            description: error instanceof Error ? error.message : "Unknown error",
          });
        }
      } : undefined,

      onDelete: onDelete ? () => {
        setDeleteDialogOpen(true);
      } : undefined,

      onToggleRequired: onToggleRequired ? async () => {
        try {
          await onToggleRequired(fieldId, !isRequired);
          // Success - no toast needed, user can see the change
        } catch (error) {
          toast({
            variant: "destructive",
            title: "Failed to toggle required",
            description: error instanceof Error ? error.message : "Unknown error",
          });
        }
      } : undefined,

      onInsertLeft: onInsertLeft ? async () => {
        try {
          await onInsertLeft(fieldId);
          // Success - no toast needed
        } catch (error) {
          toast({
            variant: "destructive",
            title: "Failed to insert property",
            description: error instanceof Error ? error.message : "Unknown error",
          });
        }
      } : undefined,

      onInsertRight: onInsertRight ? async () => {
        try {
          await onInsertRight(fieldId);
          // Success - no toast needed
        } catch (error) {
          toast({
            variant: "destructive",
            title: "Failed to insert property",
            description: error instanceof Error ? error.message : "Unknown error",
          });
        }
      } : undefined,

      onMoveLeft: onMoveLeft ? async () => {
        try {
          await onMoveLeft(fieldId);
          // Success - no toast needed
        } catch (error) {
          toast({
            variant: "destructive",
            title: "Failed to move property",
            description: error instanceof Error ? error.message : "Unknown error",
          });
        }
      } : undefined,

      onMoveRight: onMoveRight ? async () => {
        try {
          await onMoveRight(fieldId);
          // Success - no toast needed
        } catch (error) {
          toast({
            variant: "destructive",
            title: "Failed to move property",
            description: error instanceof Error ? error.message : "Unknown error",
          });
        }
      } : undefined,

      onSort: onSort ? (direction: 'asc' | 'desc') => {
        try {
          onSort(fieldId, direction);
          // Success - no toast needed
        } catch (error) {
          toast({
            variant: "destructive",
            title: "Failed to apply sort",
            description: error instanceof Error ? error.message : "Unknown error",
          });
        }
      } : undefined,

      onFilter: onFilter ? () => {
        try {
          onFilter(fieldId);
          // No toast - filter modal will provide feedback
        } catch (error) {
          toast({
            variant: "destructive",
            title: "Failed to open filter",
            description: error instanceof Error ? error.message : "Unknown error",
          });
        }
      } : undefined,

      onCalculate: onCalculate ? (aggregation: string) => {
        try {
          onCalculate(fieldId, aggregation);
          // Success - no toast needed
        } catch (error) {
          toast({
            variant: "destructive",
            title: "Failed to apply calculation",
            description: error instanceof Error ? error.message : "Unknown error",
          });
        }
      } : undefined,

      onWrap: onWrap ? () => {
        try {
          onWrap(fieldId);
          // Success - no toast needed
        } catch (error) {
          toast({
            variant: "destructive",
            title: "Failed to toggle wrapping",
            description: error instanceof Error ? error.message : "Unknown error",
          });
        }
      } : undefined,

      onEditOptions: onEditOptions ? () => {
        try {
          onEditOptions(fieldId);
          // Options editor modal will provide feedback
        } catch (error) {
          toast({
            variant: "destructive",
            title: "Failed to open options editor",
            description: error instanceof Error ? error.message : "Unknown error",
          });
        }
      } : undefined,

      onManageColors: onManageColors ? () => {
        try {
          onManageColors(fieldId);
          // Color manager modal will provide feedback
        } catch (error) {
          toast({
            variant: "destructive",
            title: "Failed to open color manager",
            description: error instanceof Error ? error.message : "Unknown error",
          });
        }
      } : undefined,

      onSetFormat: onSetFormat ? async (format: string) => {
        try {
          await onSetFormat(fieldId, format);
          // Success - no toast needed
        } catch (error) {
          toast({
            variant: "destructive",
            title: "Failed to update format",
            description: error instanceof Error ? error.message : "Unknown error",
          });
        }
      } : undefined,

      onShowAs: onShowAs ? async (display: string) => {
        try {
          await onShowAs(fieldId, display);
          // Success - no toast needed
        } catch (error) {
          toast({
            variant: "destructive",
            title: "Failed to update display",
            description: error instanceof Error ? error.message : "Unknown error",
          });
        }
      } : undefined,

      onDateFormat: onDateFormat ? async (format: string) => {
        try {
          await onDateFormat(fieldId, format);
          // Success - no toast needed
        } catch (error) {
          toast({
            variant: "destructive",
            title: "Failed to update date format",
            description: error instanceof Error ? error.message : "Unknown error",
          });
        }
      } : undefined,

      onTimeFormat: onTimeFormat ? async (format: string) => {
        try {
          await onTimeFormat(fieldId, format);
          // Success - no toast needed
        } catch (error) {
          toast({
            variant: "destructive",
            title: "Failed to update time format",
            description: error instanceof Error ? error.message : "Unknown error",
          });
        }
      } : undefined,

      onNotifications: onNotifications ? () => {
        try {
          onNotifications(fieldId);
          // Notification modal will provide feedback
        } catch (error) {
          toast({
            variant: "destructive",
            title: "Failed to open notifications",
            description: error instanceof Error ? error.message : "Unknown error",
          });
        }
      } : undefined,

      onShowPageIcon: onShowPageIcon ? () => {
        try {
          onShowPageIcon(fieldId);
          toast({
            title: "Page icon toggled",
            description: `Page icon visibility updated for "${fieldName}"`,
          });
        } catch (error) {
          toast({
            variant: "destructive",
            title: "Failed to toggle page icon",
            description: error instanceof Error ? error.message : "Unknown error",
          });
        }
      } : undefined,
    };

    // Build menu using registry system
    return buildPropertyMenu(field, callbacks);
  }, [
    field,
    fieldId,
    fieldName,
    isRequired,
    toast,
    onRename,
    onDuplicate,
    onHide,
    onDelete,
    onToggleRequired,
    onInsertLeft,
    onInsertRight,
    onMoveLeft,
    onMoveRight,
    onSort,
    onFilter,
    onCalculate,
    onWrap,
    onEditOptions,
    onManageColors,
    onSetFormat,
    onShowAs,
    onDateFormat,
    onTimeFormat,
    onNotifications,
    onShowPageIcon,
  ]);
  
  // Handle rename confirmation
  const handleRenameConfirm = async (newName: string) => {
    if (!onRename) return;
    
    try {
      await onRename(fieldId, newName);
      // Success - no toast needed
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to rename property",
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };
  
  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!onDelete) return;
    
    try {
      await onDelete(fieldId);
      // Success - no toast needed
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to delete property",
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };
  
  // Handle change type confirmation
  const handleChangeTypeConfirm = async (newType: any) => {
    if (!onChangeType) return;
    
    try {
      await onChangeType(fieldId, newType);
      // Success - no toast needed
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to change property type",
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  // Render menu item
  const renderMenuItem = (item: PropertyMenuItem, index: number) => {
    // Separator
    if (item.separator) {
      return <DropdownMenuSeparator key={item.id} />;
    }

    // Submenu
    if (item.submenu && item.submenu.length > 0) {
      return (
        <DropdownMenuSub key={item.id}>
          <DropdownMenuSubTrigger className="flex items-center gap-2">
            {item.icon && <item.icon className="h-4 w-4" />}
            <span>{item.label}</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuPortal>
            <DropdownMenuSubContent>
              {item.submenu.map((subItem, subIndex) =>
                renderMenuItem(subItem, subIndex)
              )}
            </DropdownMenuSubContent>
          </DropdownMenuPortal>
        </DropdownMenuSub>
      );
    }

    // Regular item
    return (
      <DropdownMenuItem
        key={item.id}
        onClick={item.onClick}
        disabled={item.disabled}
        className={cn(
          'flex items-center justify-between gap-2',
          item.variant === 'danger' &&
            'text-destructive focus:text-destructive'
        )}
      >
        <div className="flex items-center gap-2">
          {item.icon && <item.icon className="h-4 w-4" />}
          <span>{item.label}</span>
        </div>
        {item.shortcut && (
          <span className="text-xs text-muted-foreground">
            {item.shortcut}
          </span>
        )}
      </DropdownMenuItem>
    );
  };

  return (
    <>
      <DropdownMenu open={open} onOpenChange={onOpenChange}>
        <DropdownMenuTrigger asChild>
          {children || (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              aria-label="Property menu"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent align={align} side={side} className="w-56">
          <DropdownMenuLabel className="flex items-center gap-2">
            <span className="truncate font-medium">{field.name}</span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {menuItems.map((item, index) => renderMenuItem(item, index))}
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Rename Dialog */}
      <RenamePropertyDialog
        open={renameDialogOpen}
        onOpenChange={setRenameDialogOpen}
        currentName={fieldName}
        onConfirm={handleRenameConfirm}
      />
      
      {/* Delete Dialog */}
      <DeletePropertyDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        propertyName={fieldName}
        onConfirm={handleDeleteConfirm}
      />
      
      {/* Change Type Dialog */}
      <ChangePropertyTypeDialog
        open={changeTypeDialogOpen}
        onOpenChange={setChangeTypeDialogOpen}
        propertyName={fieldName}
        currentType={field.type as any}
        onConfirm={handleChangeTypeConfirm}
      />
    </>
  );
}
