"use client";

import React, { useMemo } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import type { ViewComponentProps } from "../types";
import { cn } from "@/lib/utils";

/**
 * Grid View Component
 * 
 * Displays data in a responsive grid of cards.
 * Supports selection, custom card renderers, and configurable grid columns.
 * 
 * @example
 * ```tsx
 * const config: ViewConfig = {
 *   id: "products-grid",
 *   title: "Products",
 *   fields: [
 *     { key: "title", label: "Title", type: "text" },
 *     { key: "price", label: "Price", type: "currency" },
 *     { key: "status", label: "Status", type: "badge" },
 *   ],
 *   settings: {
 *     gridColumns: 3,
 *     selectable: true,
 *     cardWidth: "auto",
 *   },
 * };
 * ```
 */
export function GridView<T extends Record<string, any>>({
  data,
  config,
  state,
  actions,
  className,
}: ViewComponentProps<T>) {
  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!state.searchQuery) return data;

    const query = state.searchQuery.toLowerCase();
    return data.filter((item) =>
      config.fields?.some((field) => {
        const value = item[field.id as keyof T];
        return value != null && String(value).toLowerCase().includes(query);
      })
    );
  }, [data, state.searchQuery, config.fields]);

  // Apply pagination
  const paginatedData = useMemo(() => {
    const start = (state.currentPage - 1) * state.pageSize;
    const end = start + state.pageSize;
    return filteredData.slice(start, end);
  }, [filteredData, state.currentPage, state.pageSize]);

  // Calculate grid columns
  const gridCols = config.settings?.gridColumns || "auto";
  const gridClass =
    gridCols === "auto"
      ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
      : `grid-cols-${gridCols}`;

  // Get unique ID for each item
  const getItemId = (item: T, index: number): string => {
    return String(item.id || item._id || index);
  };

  // Check if item is selected
  const isSelected = (item: T, index: number): boolean => {
    const id = getItemId(item, index);
    return state.selectedIds.has(id);
  };

  // Toggle item selection
  const toggleSelection = (item: T, index: number) => {
    const id = getItemId(item, index);
    if (isSelected(item, index)) {
      actions.deselectItem(id);
    } else {
      actions.selectItem(id);
    }
  };

  // Format field value
  const formatValue = (value: any, field: any) => {
    if (field.render) {
      return field.render(value, value);
    }

    switch (field.type) {
      case "date":
        return value ? new Date(value).toLocaleDateString() : "-";
      case "number":
        return typeof value === "number" ? value.toLocaleString() : "-";
      case "boolean":
        return value ? "Yes" : "No";
      default:
        return value != null ? String(value) : "-";
    }
  };

  // Handle card click - navigation or selection
  const handleCardClick = (item: T, index: number) => {
    if (config.onItemClick) {
      config.onItemClick(item);
    } else if (config.settings?.selectable) {
      toggleSelection(item, index);
    }
  };

  // Render custom card if provided
  if (config.renderCard) {
    return (
      <div className={cn("flex flex-col gap-4", className)}>
        <div className={cn("grid gap-4", gridClass)}>
          {paginatedData.map((item, index) => {
            const id = getItemId(item, index);
            const selected = isSelected(item, index);
            return (
              <div 
                key={id} 
                className={cn(
                  "relative cursor-pointer",
                  config.onItemClick && "hover:opacity-80 transition-opacity"
                )}
                onClick={() => handleCardClick(item, index)}
              >
                {config.settings?.selectable && (
                  <div className="absolute top-2 left-2 z-10">
                    <Checkbox
                      checked={selected}
                      onCheckedChange={(e) => {
                        e && toggleSelection(item, index);
                      }}
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`Select ${id}`}
                    />
                  </div>
                )}
                {config.renderCard?.(item, index)}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Default card rendering
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className={cn("grid gap-4", gridClass)}>
        {paginatedData.map((item, index) => {
          const id = getItemId(item, index);
          const selected = isSelected(item, index);

          // Get primary field (first field)
          const primaryField = config.fields?.[0];
          const primaryValue = primaryField
            ? item[primaryField.id as keyof T]
            : null;

          // Get other visible fields
          const otherFields = config.fields?.slice(1);

          return (
            <Card
              key={id}
              className={cn(
                "relative transition-colors cursor-pointer hover:bg-accent/50",
                selected && "ring-2 ring-primary"
              )}
              onClick={() => handleCardClick(item, index)}
            >
              {config.settings?.selectable && (
                <div className="absolute top-4 right-4 z-10">
                  <Checkbox
                    checked={selected}
                    onCheckedChange={() => toggleSelection(item, index)}
                    aria-label={`Select ${id}`}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              )}

              {primaryField && (
                <CardHeader>
                  <CardTitle className="text-base truncate pr-8">
                    {formatValue(primaryValue, primaryField)}
                  </CardTitle>
                </CardHeader>
              )}

              {otherFields && otherFields.length > 0 && (
                <CardContent className="space-y-2">
                  {otherFields.map((field) => (
                    <div key={String(field.id)} className="flex justify-between items-start gap-2 text-sm">
                      <span className="text-muted-foreground font-medium min-w-[80px]">
                        {field.label}:
                      </span>
                      <span className="text-right flex-1 truncate">
                        {formatValue(item[field.id as keyof T], field)}
                      </span>
                    </div>
                  ))}
                </CardContent>
              )}

              {config.actions && config.actions.length > 0 && (
                <CardFooter className="flex gap-2">
                  {config.actions.map((action) => (
                    <button
                      key={action.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        action.onClick?.(item);
                      }}
                      className="px-3 py-1 text-xs rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      {action.label}
                    </button>
                  ))}
                </CardFooter>
              )}
            </Card>
          );
        })}
      </div>

      {/* Empty state */}
      {paginatedData.length === 0 && (
        <div className="flex items-center justify-center py-12 text-center">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">No items found</p>
            {state.searchQuery && (
              <p className="text-xs text-muted-foreground">
                Try adjusting your search
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default GridView;
