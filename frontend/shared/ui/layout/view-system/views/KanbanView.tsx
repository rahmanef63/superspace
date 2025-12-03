/**
 * Kanban View Component
 * 
 * Displays data in a Kanban board with drag-and-drop columns.
 * Supports grouping, WIP limits, and swimlanes.
 */

"use client"

import React, { useMemo, useState } from "react"
import { Plus, MoreHorizontal, GripVertical } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { ViewComponentProps, ViewGroup } from "../types"

interface KanbanColumn<T> {
  id: string
  label: string
  color?: string
  items: T[]
  count: number
}

export function KanbanView<T extends Record<string, any>>({
  data,
  config,
  state,
  actions,
  className,
}: ViewComponentProps<T>) {
  const [draggedItem, setDraggedItem] = useState<T | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)

  // Group data into columns
  const columns = useMemo<KanbanColumn<T>[]>(() => {
    // Use groups from config or groupBy field
    const groups = config.groups || []
    const groupBy = state.groupBy || (groups[0]?.accessor as string)

    if (!groupBy || groups.length === 0) {
      // No grouping - show all items in one column
      return [{
        id: "all",
        label: "All Items",
        items: data,
        count: data.length,
      }]
    }

    // Group items by the groupBy field
    const groupedItems: Record<string, T[]> = {}
    
    // Initialize all groups (even empty ones)
    groups.forEach(group => {
      groupedItems[group.id] = []
    })

    // Distribute items to groups
    data.forEach(item => {
      const groupValue = typeof groupBy === "function"
        ? (groupBy as (item: T) => string)(item)
        : String(item[groupBy as keyof T] || "uncategorized")
      
      if (groupedItems[groupValue]) {
        groupedItems[groupValue].push(item)
      } else {
        // Create an "uncategorized" group if item doesn't match any group
        if (!groupedItems["uncategorized"]) {
          groupedItems["uncategorized"] = []
        }
        groupedItems["uncategorized"].push(item)
      }
    })

    // Convert to columns array
    return groups.map(group => ({
      id: group.id,
      label: group.label,
      color: group.color,
      items: groupedItems[group.id] || [],
      count: groupedItems[group.id]?.length || 0,
    }))
  }, [data, config.groups, state.groupBy])

  // Get unique ID for each item
  const getItemId = (item: T): string => {
    return String(item.id || item._id || JSON.stringify(item).slice(0, 20))
  }

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, item: T) => {
    setDraggedItem(item)
    e.dataTransfer.effectAllowed = "move"
    e.dataTransfer.setData("text/plain", getItemId(item))
  }

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDragOverColumn(columnId)
  }

  const handleDragLeave = () => {
    setDragOverColumn(null)
  }

  const handleDrop = async (e: React.DragEvent, columnId: string) => {
    e.preventDefault()
    setDragOverColumn(null)

    if (draggedItem && config.onItemDrag) {
      await config.onItemDrag(draggedItem, columnId)
    }

    setDraggedItem(null)
  }

  // Format field value
  const formatValue = (value: any, field: any) => {
    if (field?.render) {
      return field.render(value, value)
    }
    return value != null ? String(value) : "-"
  }

  // Get card content fields
  const getCardFields = () => {
    return config.fields?.filter(f => !f.hidden).slice(0, 3) || []
  }

  // Render card
  const renderCard = (item: T, index: number) => {
    if (config.renderCard) {
      return config.renderCard(item, index)
    }

    const cardFields = getCardFields()
    const primaryField = cardFields[0]
    const secondaryFields = cardFields.slice(1)

    return (
      <Card
        key={getItemId(item)}
        className={cn(
          "cursor-grab active:cursor-grabbing transition-shadow hover:shadow-md",
          draggedItem === item && "opacity-50"
        )}
        draggable={config.settings?.draggable !== false}
        onDragStart={(e) => handleDragStart(e, item)}
        onClick={() => config.onItemClick?.(item)}
      >
        <CardContent className="p-3 space-y-2">
          {/* Primary field (title) */}
          {primaryField && (
            <div className="font-medium text-sm">
              {formatValue(item[primaryField.id as keyof T], primaryField)}
            </div>
          )}

          {/* Secondary fields */}
          {secondaryFields.map(field => (
            <div key={field.id} className="text-xs text-muted-foreground">
              {formatValue(item[field.id as keyof T], field)}
            </div>
          ))}

          {/* Row actions */}
          {config.rowActions && config.rowActions.length > 0 && (
            <div className="flex justify-end pt-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {config.rowActions.map((action) => {
                    const Icon = action.icon
                    return (
                      <DropdownMenuItem
                        key={action.id}
                        onClick={(e) => {
                          e.stopPropagation()
                          action.onClick(item)
                        }}
                      >
                        {Icon && <Icon className="mr-2 h-4 w-4" />}
                        {action.label}
                      </DropdownMenuItem>
                    )
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn("flex h-full", className)}>
      <ScrollArea className="flex-1">
        <div className="flex gap-4 p-4 min-w-max">
          {columns.map((column) => {
            const wipLimit = config.settings?.wipLimit
            const isOverLimit = wipLimit && wipLimit > 0 && column.count > wipLimit

            return (
              <div
                key={column.id}
                className={cn(
                  "flex flex-col w-72 bg-muted/50 rounded-lg",
                  dragOverColumn === column.id && "ring-2 ring-primary ring-offset-2"
                )}
                onDragOver={(e) => handleDragOver(e, column.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                {/* Column header */}
                <div className="flex items-center justify-between p-3 border-b">
                  <div className="flex items-center gap-2">
                    {column.color && (
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: column.color }}
                      />
                    )}
                    <span className="font-medium text-sm">{column.label}</span>
                    <Badge
                      variant={isOverLimit ? "destructive" : "secondary"}
                      className="h-5 px-1.5"
                    >
                      {column.count}
                      {wipLimit && wipLimit > 0 && `/${wipLimit}`}
                    </Badge>
                  </div>
                  {config.onCreate && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => config.onCreate?.()}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Column content */}
                <ScrollArea className="flex-1 p-2">
                  <div className="space-y-2">
                    {column.items.map((item, index) => renderCard(item, index))}
                  </div>
                </ScrollArea>
              </div>
            )
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  )
}

export default KanbanView
