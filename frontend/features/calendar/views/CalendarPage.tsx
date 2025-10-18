"use client"

import React, { useState } from "react"
import { useCalendar } from "../hooks/useCalendar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, ChevronLeft, ChevronRight, Clock, MapPin, Users, Plus } from "lucide-react"
import FeatureBadge from "@/frontend/shared/components/FeatureBadge"
import FeatureNotReady from "@/frontend/shared/components/FeatureNotReady"

/**
 * Calendar Page Component
 * Team calendar with event management
 */
export default function CalendarPage() {
  const { isLoading, error } = useCalendar()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month')

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading calendar...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-destructive">Error: {error.message}</div>
      </div>
    )
  }

  // Mock events for demo
  const mockEvents = [
    {
      id: "1",
      title: "Team Standup",
      date: new Date(),
      time: "9:00 AM",
      duration: "30 min",
      location: "Conference Room A",
      attendees: 5,
      color: "bg-blue-500"
    },
    {
      id: "2",
      title: "Product Review",
      date: new Date(),
      time: "2:00 PM",
      duration: "1 hour",
      location: "Virtual",
      attendees: 8,
      color: "bg-green-500"
    },
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b bg-background p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Calendar className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Calendar</h1>
              <p className="text-sm text-muted-foreground">
                Team calendar with event management
              </p>
            </div>
          </div>
          <FeatureBadge status="development" />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                const newDate = new Date(currentDate)
                newDate.setMonth(newDate.getMonth() - 1)
                setCurrentDate(newDate)
              }}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-semibold min-w-[200px] text-center">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                const newDate = new Date(currentDate)
                newDate.setMonth(newDate.getMonth() + 1)
                setCurrentDate(newDate)
              }}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => setCurrentDate(new Date())}
            >
              Today
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex gap-1 border rounded-md p-1">
              <Button
                variant={viewMode === 'month' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('month')}
              >
                Month
              </Button>
              <Button
                variant={viewMode === 'week' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('week')}
              >
                Week
              </Button>
              <Button
                variant={viewMode === 'day' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('day')}
              >
                Day
              </Button>
            </div>
            <Button disabled>
              <Plus className="mr-2 h-4 w-4" />
              New Event
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <FeatureNotReady
          featureName="Calendar"
          featureSlug="calendar"
          status="development"
          message="The calendar feature is currently in development. Coming soon with event creation and management, team calendar sharing, meeting scheduling, calendar integrations, recurring events, and event reminders and notifications."
          expectedRelease="Q1 2025"
        />

        {/* Preview UI */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4">Preview: Upcoming Events</h3>
          <div className="grid gap-4">
            {mockEvents.map((event) => (
              <Card key={event.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-1 h-full ${event.color} rounded-full`} />
                    <div className="flex-1">
                      <h4 className="font-semibold mb-2">{event.title}</h4>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {event.time} ({event.duration})
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {event.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {event.attendees} attendees
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="opacity-50">
                      Preview
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
