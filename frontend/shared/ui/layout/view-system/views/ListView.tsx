/**
 * List View Component
 * 
 * Displays data in a vertical list with dividers.
 * Supports selection, grouping, and custom item renderers.
 */

"use client"

import React, { useMemo } from "react"
import { ChevronRight, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"
import type { ViewComponentProps } from "../types"

export function ListView<T extends Record<string, any>>({
  data,
  config,
  state,
  actions,
  className,
}: ViewComponentProps<T>) {
  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!state.searchQuery) return data

    const query = state.searchQuery.toLowerCase()
    return data.filter((item) =>
      config.fields?.some((field) => {
        const value = item[field.id as keyof T]
        return value != null && String(value).toLowerCase().includes(query)
      })
    )
  }, [data, state.searchQuery, config.fields])

  // Apply sorting
  const sortedData = useMemo(() => {
    if (!state.sort) return filteredData

    return [...filteredData].sort((a, b) => {
      const aValue = a[state.sort!.field as keyof T]
      const bValue = b[state.sort!.field as keyof T]
      
      if (aValue == null) return 1
      if (bValue == null) return -1
      
      const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      return state.sort!.direction === "asc" ? comparison : -comparison
    })
  }, [filteredData, state.sort])

  // Get unique ID for each item
  const getItemId = (item: T, index: number): string => {
    return String(item.id || item._id || index)
  }

  // Check if item is selected
  const isSelected = (item: T, index: number): boolean => {
    const id = getItemId(item, index)
    return state.selectedIds.has(id)
  }

  // Toggle item selection
  const toggleSelection = (item: T, index: number, e?: React.MouseEvent) => {
    e?.stopPropagation()
    const id = getItemId(item, index)
    if (isSelected(item, index)) {
      actions.deselectItem(id)
    } else {
      actions.selectItem(id)
    }
  }

  // Format field value
  const formatValue = (value: any, field: any) => {
    if (field.render) {
      return field.render(value, value)
    }

    switch (field.type) {
      case "date":
        return value ? new Date(value).toLocaleDateString() : "-"
      case "number":
        return typeof value === "number" ? value.toLocaleString() : "-"
      case "boolean":
        return value ? "Yes" : "No"
      default:
        return value != null ? String(value) : "-"
    }
  }

  // Get density classes
  const getDensityClasses = () => {
    switch (config.settings?.density) {
      case "compact":
        return "py-2 px-3"
      case "spacious":
        return "py-4 px-4"
      default:
        return "py-3 px-4"
    }
  }

  // Custom row render
  if (config.renderRow) {
    return (
      <div className={cn("flex flex-col divide-y", className)}>
        {sortedData.map((item, index) => {
          const id = getItemId(item, index)
          const selected = isSelected(item, index)

          return (
            <div
              key={id}
              className={cn(
                "relative",
                selected && "bg-accent/50"
              )}
            >
              {config.settings?.selectable && (
                <div className="absolute left-2 top-1/2 -translate-y-1/2 z-10">
                  <Checkbox
                    checked={selected}
                    onCheckedChange={() => toggleSelection(item, index)}
                    aria-label={`Select ${id}`}
                  />
                </div>
              )}
              <div className={config.settings?.selectable ? "pl-10" : ""}>
                {config.renderRow!(item, index)}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // Default list rendering
  return (
    <div className={cn("flex flex-col", className)}>
      {sortedData.length === 0 ? (
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
      ) : (
        <div className="divide-y">
          {sortedData.map((item, index) => {
            const id = getItemId(item, index)
            const selected = isSelected(item, index)
            const primaryField = config.fields?.[0]
            const secondaryField = config.fields?.[1]
            const otherFields = config.fields?.slice(2)

            return (
              <div
                key={id}
                className={cn(
                  "flex items-center gap-3 hover:bg-accent/50 transition-colors cursor-pointer",
                  getDensityClasses(),
                  selected && "bg-accent"
                )}
                onClick={() => config.onItemClick?.(item)}
              >
                {/* Selection checkbox */}
                {config.settings?.selectable && (
                  <Checkbox
                    checked={selected}
                    onCheckedChange={() => toggleSelection(item, index)}
                    onClick={(e) => e.stopPropagation()}
                    aria-label={`Select ${id}`}
                  />
                )}

                {/* Main content */}
                <div className="flex-1 min-w-0">
                  {primaryField && (
                    <div className="font-medium truncate">
                      {formatValue(item[primaryField.id as keyof T], primaryField)}
                    </div>
                  )}
                  {secondaryField && (
                    <div className="text-sm text-muted-foreground truncate">
                      {formatValue(item[secondaryField.id as keyof T], secondaryField)}
                    </div>
                  )}
                </div>

                {/* Meta fields */}
                {otherFields && otherFields.length > 0 && (
                  <div className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
                    {otherFields.slice(0, 2).map((field) => (
                      <div key={field.id} className="truncate max-w-[120px]">
                        {formatValue(item[field.id as keyof T], field)}
                      </div>
                    ))}
                  </div>
                )}

                {/* Row actions */}
                {config.rowActions && config.rowActions.length > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {config.rowActions.map((action) => {
                        const Icon = action.icon
                        const isDisabled = typeof action.disabled === "function"
                          ? action.disabled(item)
                          : action.disabled

                        return (
                          <DropdownMenuItem
                            key={action.id}
                            onClick={(e) => {
                              e.stopPropagation()
                              action.onClick(item)
                            }}
                            disabled={isDisabled}
                          >
                            {Icon && <Icon className="mr-2 h-4 w-4" />}
                            {action.label}
                          </DropdownMenuItem>
                        )
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                {/* Chevron for navigation hint */}
                {config.onItemClick && !config.rowActions?.length && (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ListView
