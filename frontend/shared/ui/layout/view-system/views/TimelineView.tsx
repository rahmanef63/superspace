/**
 * Timeline View Component
 * 
 * Vertical timeline for chronological data.
 * Supports different layouts and time groupings.
 */

"use client"

import React, { useMemo } from "react"
import { Clock, Circle, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { ViewComponentProps } from "../types"

interface TimelineItem {
  id?: string
  _id?: string
  date?: string | Date
  createdAt?: string | Date
  timestamp?: string | Date
  title?: string
  name?: string
  description?: string
  type?: string
  status?: string
  icon?: React.ReactNode
  color?: string
  [key: string]: any
}

type TimeGrouping = "none" | "day" | "week" | "month" | "year"

export function TimelineView<T extends TimelineItem>({
  data,
  config,
  state,
  actions,
  className,
}: ViewComponentProps<T>) {
  // Get date field from config or fallback
  const dateField = config.fields?.find(f => f.type === "date")?.id || "date"

  // Get grouping from settings
  const grouping: TimeGrouping = (config.settings as any)?.timelineGrouping || "day"

  // Parse date from item
  const getItemDate = (item: T): Date => {
    const value = item[dateField] || item.date || item.createdAt || item.timestamp
    return value ? new Date(value) : new Date()
  }

  // Get title from item
  const getItemTitle = (item: T): string => {
    return item.title || item.name || "Untitled"
  }

  // Get description from item
  const getItemDescription = (item: T): string | undefined => {
    return item.description
  }

  // Get unique ID for each item
  const getItemId = (item: T, index: number): string => {
    return String(item.id || item._id || index)
  }

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!state.searchQuery) return data

    const query = state.searchQuery.toLowerCase()
    return data.filter((item) => {
      const title = getItemTitle(item)
      const description = getItemDescription(item)
      return (
        title.toLowerCase().includes(query) ||
        (description && description.toLowerCase().includes(query))
      )
    })
  }, [data, state.searchQuery])

  // Sort data by date (newest first by default)
  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      const dateA = getItemDate(a).getTime()
      const dateB = getItemDate(b).getTime()
      return state.sort?.direction === "asc" ? dateA - dateB : dateB - dateA
    })
  }, [filteredData, state.sort])

  // Group data by time period
  const groupedData = useMemo(() => {
    if (grouping === "none") {
      return [{ key: "all", label: "", items: sortedData }]
    }

    const groups = new Map<string, { label: string; items: T[] }>()

    sortedData.forEach((item) => {
      const date = getItemDate(item)
      let key: string
      let label: string

      switch (grouping) {
        case "day":
          key = date.toISOString().split("T")[0]
          label = date.toLocaleDateString(undefined, { 
            weekday: "long", 
            year: "numeric", 
            month: "long", 
            day: "numeric" 
          })
          break
        case "week":
          const startOfWeek = new Date(date)
          startOfWeek.setDate(date.getDate() - date.getDay())
          key = startOfWeek.toISOString().split("T")[0]
          label = `Week of ${startOfWeek.toLocaleDateString(undefined, { 
            month: "short", 
            day: "numeric" 
          })}`
          break
        case "month":
          key = `${date.getFullYear()}-${date.getMonth()}`
          label = date.toLocaleDateString(undefined, { 
            year: "numeric", 
            month: "long" 
          })
          break
        case "year":
          key = String(date.getFullYear())
          label = String(date.getFullYear())
          break
        default:
          key = "all"
          label = ""
      }

      if (!groups.has(key)) {
        groups.set(key, { label, items: [] })
      }
      groups.get(key)!.items.push(item)
    })

    return Array.from(groups.entries()).map(([key, value]) => ({
      key,
      ...value,
    }))
  }, [sortedData, grouping])

  // Format time for item
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString(undefined, { 
      hour: "2-digit", 
      minute: "2-digit" 
    })
  }

  // Format relative time
  const formatRelativeTime = (date: Date): string => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 7) {
      return date.toLocaleDateString()
    } else if (days > 0) {
      return `${days}d ago`
    } else if (hours > 0) {
      return `${hours}h ago`
    } else if (minutes > 0) {
      return `${minutes}m ago`
    } else {
      return "Just now"
    }
  }

  // Get color for item
  const getItemColor = (item: T): string => {
    if (item.color) return item.color
    if (item.status) {
      const statusColors: Record<string, string> = {
        completed: "text-green-500",
        success: "text-green-500",
        pending: "text-yellow-500",
        warning: "text-yellow-500",
        error: "text-red-500",
        failed: "text-red-500",
        info: "text-blue-500",
        default: "text-muted-foreground",
      }
      return statusColors[item.status.toLowerCase()] || statusColors.default
    }
    return "text-primary"
  }

  if (sortedData.length === 0) {
    return (
      <div className={cn("flex flex-col items-center justify-center py-12 gap-4", className)}>
        <Clock className="h-12 w-12 text-muted-foreground/50" />
        <p className="text-sm text-muted-foreground">No timeline items found</p>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col gap-6 p-4", className)}>
      {groupedData.map((group) => (
        <div key={group.key} className="space-y-4">
          {/* Group header */}
          {group.label && (
            <div className="flex items-center gap-2 sticky top-0 bg-background py-2 z-10">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">
                {group.label}
              </span>
              <Badge variant="secondary" className="text-xs">
                {group.items.length}
              </Badge>
            </div>
          )}

          {/* Timeline items */}
          <div className="relative pl-6 border-l-2 border-border ml-2 space-y-4">
            {group.items.map((item, index) => {
              const id = getItemId(item, index)
              const date = getItemDate(item)
              const selected = state.selectedIds.has(id)

              return (
                <div
                  key={id}
                  className="relative"
                >
                  {/* Timeline dot */}
                  <div 
                    className={cn(
                      "absolute -left-[25px] w-4 h-4 rounded-full border-2 bg-background flex items-center justify-center",
                      getItemColor(item).includes("green") && "border-green-500",
                      getItemColor(item).includes("yellow") && "border-yellow-500",
                      getItemColor(item).includes("red") && "border-red-500",
                      getItemColor(item).includes("blue") && "border-blue-500",
                      !getItemColor(item).includes("text-") && "border-primary"
                    )}
                  >
                    <Circle className={cn("h-2 w-2 fill-current", getItemColor(item))} />
                  </div>

                  {/* Item card */}
                  <Card 
                    className={cn(
                      "cursor-pointer transition-all hover:shadow-md",
                      selected && "ring-2 ring-primary"
                    )}
                    onClick={() => {
                      if (config.settings?.selectable) {
                        if (selected) {
                          actions.deselectItem(id)
                        } else {
                          actions.selectItem(id)
                        }
                      } else {
                        config.onItemClick?.(item)
                      }
                    }}
                  >
                    <CardHeader className="py-3 px-4">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-sm font-medium">
                          {getItemTitle(item)}
                        </CardTitle>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                          <Clock className="h-3 w-3" />
                          <span>{formatTime(date)}</span>
                          <span className="text-muted-foreground/50">•</span>
                          <span>{formatRelativeTime(date)}</span>
                        </div>
                      </div>
                    </CardHeader>
                    
                    {(getItemDescription(item) || (config.fields && config.fields.length > 0)) && (
                      <CardContent className="py-2 px-4 pt-0">
                        {getItemDescription(item) && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {getItemDescription(item)}
                          </p>
                        )}
                        
                        {/* Additional fields */}
                        <div className="flex flex-wrap gap-2">
                          {config.fields?.filter(f => !f.hidden && f.id !== "title" && f.id !== "description" && f.id !== dateField)
                            .slice(0, 3)
                            .map((field) => {
                              const value = item[field.id as keyof T]
                              if (value == null) return null
                              return (
                                <Badge key={field.id} variant="outline" className="text-xs">
                                  {field.label}: {String(value)}
                                </Badge>
                              )
                            })}
                        </div>
                      </CardContent>
                    )}
                  </Card>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

export default TimelineView
