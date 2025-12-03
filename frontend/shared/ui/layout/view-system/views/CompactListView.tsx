/**
 * Compact List View Component
 * 
 * Dense list view with minimal visual overhead.
 * Optimized for displaying many items at once.
 */

"use client"

import React, { useMemo } from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import type { ViewComponentProps } from "../types"

export function CompactListView<T extends Record<string, any>>({
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
  const toggleSelection = (item: T, index: number) => {
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
        return value ? <Check className="h-3 w-3" /> : null
      default:
        return value != null ? String(value) : "-"
    }
  }

  // Get visible fields (first 4)
  const visibleFields = config.fields?.filter(f => !f.hidden).slice(0, 4) || []

  if (sortedData.length === 0) {
    return (
      <div className={cn("flex items-center justify-center py-8", className)}>
        <p className="text-sm text-muted-foreground">No items found</p>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col text-sm", className)}>
      {/* Header row */}
      <div className="flex items-center gap-2 px-2 py-1 bg-muted/50 text-xs text-muted-foreground font-medium sticky top-0">
        {config.settings?.selectable && (
          <div className="w-6" />
        )}
        {visibleFields.map((field) => (
          <div
            key={field.id}
            className="flex-1 min-w-0 truncate"
          >
            {field.label}
          </div>
        ))}
      </div>

      {/* Data rows */}
      {sortedData.map((item, index) => {
        const id = getItemId(item, index)
        const selected = isSelected(item, index)

        return (
          <div
            key={id}
            className={cn(
              "flex items-center gap-2 px-2 py-1 hover:bg-accent/50 transition-colors cursor-pointer border-b border-border/50",
              selected && "bg-accent"
            )}
            onClick={() => {
              if (config.settings?.selectable) {
                toggleSelection(item, index)
              } else {
                config.onItemClick?.(item)
              }
            }}
          >
            {/* Selection checkbox */}
            {config.settings?.selectable && (
              <Checkbox
                checked={selected}
                onCheckedChange={() => toggleSelection(item, index)}
                onClick={(e) => e.stopPropagation()}
                className="h-4 w-4"
              />
            )}

            {/* Field values */}
            {visibleFields.map((field) => (
              <div
                key={field.id}
                className="flex-1 min-w-0 truncate"
              >
                {formatValue(item[field.id as keyof T], field)}
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}

export default CompactListView
