/**
 * Calendar View Component
 * 
 * Calendar view for date-based data.
 * Supports month, week, and day views.
 */

"use client"

import React, { useMemo, useState, useCallback } from "react"
import { 
  ChevronLeft, 
  ChevronRight, 
  CalendarIcon,
  CalendarDays,
  CalendarRange,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import type { ViewComponentProps } from "../types"

type CalendarViewMode = "month" | "week" | "day"

interface CalendarItem {
  id?: string
  _id?: string
  date?: string | Date
  startDate?: string | Date
  endDate?: string | Date
  title?: string
  name?: string
  color?: string
  [key: string]: any
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]

export function CalendarView<T extends CalendarItem>({
  data,
  config,
  state,
  actions,
  className,
}: ViewComponentProps<T>) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<CalendarViewMode>("month")

  // Get date field from config or fallback
  const dateField = config.fields?.find(f => f.type === "date")?.id || "date"

  // Parse date from item
  const getItemDate = useCallback((item: T): Date | null => {
    const value = item[dateField] || item.date || item.startDate
    if (!value) return null
    const date = new Date(value)
    return isNaN(date.getTime()) ? null : date
  }, [dateField])

  // Get title from item
  const getItemTitle = (item: T): string => {
    const titleField = config.fields?.find(f => f.id === "title" || f.id === "name")?.id
    return item[titleField || "title"] || item.title || item.name || "Untitled"
  }

  // Get unique ID for each item
  const getItemId = (item: T): string => {
    return String(item.id || item._id || Math.random())
  }

  // Filter and group data by date
  const groupedData = useMemo(() => {
    const groups = new Map<string, T[]>()
    
    data.forEach((item) => {
      const date = getItemDate(item)
      if (date) {
        const key = date.toISOString().split("T")[0]
        if (!groups.has(key)) {
          groups.set(key, [])
        }
        groups.get(key)!.push(item)
      }
    })
    
    return groups
  }, [data, getItemDate])

  // Get days for current month view
  const monthDays = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    
    const days: Date[] = []
    
    // Add days from previous month to fill the first week
    const firstDayOfWeek = firstDay.getDay()
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      days.push(new Date(year, month, -i))
    }
    
    // Add all days of current month
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i))
    }
    
    // Add days from next month to complete the last week
    const remaining = 42 - days.length // 6 weeks max
    for (let i = 1; i <= remaining; i++) {
      days.push(new Date(year, month + 1, i))
    }
    
    return days
  }, [currentDate])

  // Get days for week view
  const weekDays = useMemo(() => {
    const days: Date[] = []
    const startOfWeek = new Date(currentDate)
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      days.push(day)
    }
    
    return days
  }, [currentDate])

  // Navigate
  const navigate = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    
    if (viewMode === "month") {
      newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1))
    } else if (viewMode === "week") {
      newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7))
    } else {
      newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1))
    }
    
    setCurrentDate(newDate)
  }

  // Go to today
  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // Check if date is today
  const isToday = (date: Date): boolean => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  // Check if date is in current month
  const isCurrentMonth = (date: Date): boolean => {
    return date.getMonth() === currentDate.getMonth()
  }

  // Get events for a specific date
  const getEventsForDate = (date: Date): T[] => {
    const key = date.toISOString().split("T")[0]
    return groupedData.get(key) || []
  }

  // Render event badge
  const renderEventBadge = (item: T) => {
    return (
      <Popover key={getItemId(item)}>
        <PopoverTrigger asChild>
          <Badge 
            variant="secondary"
            className={cn(
              "text-xs truncate max-w-full cursor-pointer hover:bg-primary/80",
              item.color && `bg-${item.color}-500`
            )}
            style={item.color ? { backgroundColor: item.color } : undefined}
          >
            {getItemTitle(item)}
          </Badge>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-2">
            <h4 className="font-medium">{getItemTitle(item)}</h4>
            {config.fields?.filter(f => !f.hidden).slice(0, 5).map((field) => {
              const value = item[field.id as keyof T]
              if (value == null) return null
              return (
                <div key={field.id} className="text-sm">
                  <span className="text-muted-foreground">{field.label}:</span>{" "}
                  <span>
                    {field.type === "date" 
                      ? new Date(value as string).toLocaleString()
                      : String(value)
                    }
                  </span>
                </div>
              )
            })}
          </div>
        </PopoverContent>
      </Popover>
    )
  }

  // Render day cell
  const renderDayCell = (date: Date, isCompact = false) => {
    const events = getEventsForDate(date)
    const today = isToday(date)
    const inMonth = isCurrentMonth(date)
    
    return (
      <div
        key={date.toISOString()}
        className={cn(
          "border-r border-b p-1 min-h-[80px]",
          !inMonth && "bg-muted/30",
          today && "bg-primary/5"
        )}
      >
        <div className={cn(
          "text-sm font-medium mb-1",
          today && "text-primary",
          !inMonth && "text-muted-foreground"
        )}>
          {today ? (
            <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 inline-flex items-center justify-center">
              {date.getDate()}
            </span>
          ) : (
            date.getDate()
          )}
        </div>
        <div className="space-y-0.5">
          {events.slice(0, isCompact ? 2 : 3).map(renderEventBadge)}
          {events.length > (isCompact ? 2 : 3) && (
            <span className="text-xs text-muted-foreground">
              +{events.length - (isCompact ? 2 : 3)} more
            </span>
          )}
        </div>
      </div>
    )
  }

  // Render header title
  const getHeaderTitle = () => {
    if (viewMode === "month") {
      return `${MONTHS[currentDate.getMonth()]} ${currentDate.getFullYear()}`
    } else if (viewMode === "week") {
      const start = weekDays[0]
      const end = weekDays[6]
      if (start.getMonth() === end.getMonth()) {
        return `${MONTHS[start.getMonth()]} ${start.getDate()} - ${end.getDate()}, ${start.getFullYear()}`
      }
      return `${MONTHS[start.getMonth()]} ${start.getDate()} - ${MONTHS[end.getMonth()]} ${end.getDate()}, ${start.getFullYear()}`
    } else {
      return currentDate.toLocaleDateString(undefined, { 
        weekday: "long", 
        year: "numeric", 
        month: "long", 
        day: "numeric" 
      })
    }
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={() => navigate("prev")}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => navigate("next")}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <h2 className="text-lg font-semibold">{getHeaderTitle()}</h2>
        </div>

        <div className="flex items-center gap-1 border rounded-md p-1">
          <Button
            variant={viewMode === "month" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("month")}
          >
            <CalendarIcon className="h-4 w-4 mr-1" />
            Month
          </Button>
          <Button
            variant={viewMode === "week" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("week")}
          >
            <CalendarRange className="h-4 w-4 mr-1" />
            Week
          </Button>
          <Button
            variant={viewMode === "day" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("day")}
          >
            <CalendarDays className="h-4 w-4 mr-1" />
            Day
          </Button>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="flex-1 overflow-auto">
        {viewMode === "month" && (
          <div className="grid grid-cols-7">
            {/* Day headers */}
            {DAYS.map((day) => (
              <div
                key={day}
                className="text-center text-sm font-medium text-muted-foreground p-2 border-b border-r"
              >
                {day}
              </div>
            ))}
            {/* Day cells */}
            {monthDays.map((date) => renderDayCell(date))}
          </div>
        )}

        {viewMode === "week" && (
          <div className="grid grid-cols-7 h-full">
            {/* Day headers */}
            {weekDays.map((date) => (
              <div
                key={date.toISOString()}
                className={cn(
                  "text-center p-2 border-b border-r",
                  isToday(date) && "bg-primary/5"
                )}
              >
                <div className="text-sm text-muted-foreground">
                  {DAYS[date.getDay()]}
                </div>
                <div className={cn(
                  "text-lg font-semibold",
                  isToday(date) && "text-primary"
                )}>
                  {date.getDate()}
                </div>
              </div>
            ))}
            {/* Day columns with events */}
            {weekDays.map((date) => {
              const events = getEventsForDate(date)
              return (
                <div
                  key={`events-${date.toISOString()}`}
                  className={cn(
                    "border-r p-2 min-h-[400px]",
                    isToday(date) && "bg-primary/5"
                  )}
                >
                  <div className="space-y-1">
                    {events.map(renderEventBadge)}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {viewMode === "day" && (
          <div className="p-4">
            <div className="space-y-2">
              {getEventsForDate(currentDate).length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No events for this day
                </p>
              ) : (
                getEventsForDate(currentDate).map((item) => (
                  <div
                    key={getItemId(item)}
                    className="p-3 border rounded-lg hover:bg-accent/50 cursor-pointer"
                    onClick={() => config.onItemClick?.(item)}
                  >
                    <h4 className="font-medium">{getItemTitle(item)}</h4>
                    {config.fields?.filter(f => !f.hidden).slice(0, 3).map((field) => {
                      const value = item[field.id as keyof T]
                      if (value == null) return null
                      return (
                        <div key={field.id} className="text-sm text-muted-foreground">
                          {field.label}: {String(value)}
                        </div>
                      )
                    })}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CalendarView
