"use client"

import React, { useState } from "react"
import { Calendar as CalendarIcon, Plus, ChevronLeft, ChevronRight, Settings } from "lucide-react"
import { Id } from "@convex/_generated/dataModel"
import { useCalendar } from "../hooks/useCalendar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface CalendarPageProps {
  workspaceId?: Id<"workspaces"> | null
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

/**
 * Calendar Page Component
 */
export default function CalendarPage({ workspaceId }: CalendarPageProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const { isLoading, events } = useCalendar(workspaceId)

  if (!workspaceId) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">No Workspace Selected</h2>
          <p className="mt-2 text-muted-foreground">
            Please select a workspace to view calendar
          </p>
        </div>
      </div>
    )
  }

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const getDayEvents = (day: number) => {
    const dayStart = new Date(year, month, day).getTime()
    const dayEnd = dayStart + 24 * 60 * 60 * 1000
    return events.filter((e: any) => e.startDate >= dayStart && e.startDate < dayEnd)
  }

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b p-4">
        <div className="flex items-center gap-3">
          <CalendarIcon className="h-6 w-6 text-primary" />
          <div>
            <h1 className="text-xl font-bold">Calendar</h1>
            <p className="text-sm text-muted-foreground">
              Manage events and schedules
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            New Event
          </Button>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between border-b p-4">
        <Button variant="ghost" size="icon" onClick={prevMonth}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold">
          {MONTHS[month]} {year}
        </h2>
        <Button variant="ghost" size="icon" onClick={nextMonth}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-auto p-4">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-muted-foreground">Loading calendar...</p>
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1">
            {/* Day Headers */}
            {DAYS.map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                {day}
              </div>
            ))}

            {/* Empty cells before first day */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[100px] rounded-lg bg-muted/30" />
            ))}

            {/* Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const dayEvents = getDayEvents(day)
              const isToday = 
                new Date().getDate() === day && 
                new Date().getMonth() === month && 
                new Date().getFullYear() === year

              return (
                <Card 
                  key={day} 
                  className={`min-h-[100px] cursor-pointer hover:bg-accent ${isToday ? 'ring-2 ring-primary' : ''}`}
                >
                  <CardContent className="p-2">
                    <div className={`text-sm font-medium ${isToday ? 'text-primary' : ''}`}>
                      {day}
                    </div>
                    <div className="mt-1 space-y-1">
                      {dayEvents.slice(0, 3).map((event: any) => (
                        <Badge 
                          key={event._id} 
                          variant="secondary" 
                          className="w-full truncate text-xs"
                        >
                          {event.title}
                        </Badge>
                      ))}
                      {dayEvents.length > 3 && (
                        <span className="text-xs text-muted-foreground">
                          +{dayEvents.length - 3} more
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
