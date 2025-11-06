"use client";

import React, { useMemo } from 'react';
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
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { PropertyMenuProps, PropertyMenuItem } from './types';
import { getCommonMenuItems, getFieldId } from './utils';

/**
 * Property Menu Component (Notion-style)
 * 
 * Provides comprehensive property management menu with:
 * - Common actions (rename, duplicate, hide, delete)
 * - Data operations (sort, filter, calculate)
 * - Column management (insert, move)
 * - Type-specific extensions
 * 
 * @example
 * ```tsx
 * <PropertyMenu
 *   field={field}
 *   onRename={handleRename}
 *   onDelete={handleDelete}
 *   onSort={handleSort}
 *   extension={numberPropertyMenuExtension}
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
  onEditOptions,
  onSetFormat,
  extension,
  children,
  align = 'start',
  side = 'bottom',
}: PropertyMenuProps) {
  const fieldId = getFieldId(field);

  // Build menu items
  const menuItems = useMemo(() => {
    const commonItems = getCommonMenuItems({
      field,
      isVisible,
      isRequired,
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
    });

    // Add type-specific items from extension
    let extensionItems: PropertyMenuItem[] = [];
    if (extension) {
      extensionItems = extension.getMenuItems({
        field,
        onAction: (action, payload) => {
          if (action === 'editOptions' && onEditOptions) {
            onEditOptions(fieldId);
          } else if (action === 'setFormat' && onSetFormat) {
            onSetFormat(fieldId, String(payload));
          }
        },
      });
    }

    // Merge items: extension items go after edit section, before data actions
    if (extensionItems.length > 0) {
      const editSectionEnd = commonItems.findIndex(
        (item) => item.id === 'separator-2'
      );
      if (editSectionEnd > 0) {
        return [
          ...commonItems.slice(0, editSectionEnd),
          ...extensionItems,
          { id: 'separator-extension', label: '', separator: true },
          ...commonItems.slice(editSectionEnd),
        ];
      }
      return [...extensionItems, { id: 'separator-extension', label: '', separator: true }, ...commonItems];
    }

    return commonItems;
  }, [
    field,
    isVisible,
    isRequired,
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
    onEditOptions,
    onSetFormat,
    extension,
    fieldId,
  ]);

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
          <DropdownMenuSubContent>
            {item.submenu.map((subItem, subIndex) =>
              renderMenuItem(subItem, subIndex)
            )}
          </DropdownMenuSubContent>
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
    <DropdownMenu>
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
  );
}
