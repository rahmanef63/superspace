"use client"

import React, { useMemo, useState } from "react"
import type { Id } from "@convex/_generated/dataModel"
import { toast } from "sonner"
import {
  Calendar as CalendarIcon,
  CalendarDays,
  Clock,
  MapPin,
  Plus,
  Trash2,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import FeatureBadge from "@/frontend/shared/components/FeatureBadge"
import { useCalendar } from "../hooks/useCalendar"
import type { CalendarEvent } from "../types"

interface CalendarPageProps {
  workspaceId?: Id<"workspaces"> | null
}

const rangeFilters = ["upcoming", "today", "past", "all"] as const
type RangeFilter = (typeof rangeFilters)[number]

const formatRange = (event: CalendarEvent) => {
  const start = new Date(event.startsAt)
  const end = event.endsAt != null ? new Date(event.endsAt) : null
  const dateFormatter = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" })
  const timeFormatter = new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" })

  if (event.allDay) {
    if (!end || start.toDateString() === end.toDateString()) {
      return `${dateFormatter.format(start)} - All day`
    }
    return `${dateFormatter.format(start)} -> ${dateFormatter.format(end)} (All day)`
  }

  if (!end) {
    return `${dateFormatter.format(start)} ${timeFormatter.format(start)}`
  }

  const sameDay = start.toDateString() === end.toDateString()
  if (sameDay) {
    return `${dateFormatter.format(start)} ${timeFormatter.format(start)} - ${timeFormatter.format(end)}`
  }

  return `${dateFormatter.format(start)} ${timeFormatter.format(start)} -> ${dateFormatter.format(end)} ${timeFormatter.format(end)}`
}

const NEW_EVENT_DEFAULT = {
  title: "",
  description: "",
  location: "",
  startsAt: "",
  endsAt: "",
  allDay: false,
}

export default function CalendarPage({ workspaceId }: CalendarPageProps) {
  const [filter, setFilter] = useState<RangeFilter>("upcoming")
  const [form, setForm] = useState(NEW_EVENT_DEFAULT)

  const {
    events,
    stats,
    isLoading,
    error,
    isCreating,
    isRemoving,
    createEvent,
    deleteEvent,
  } = useCalendar(workspaceId)

  const now = Date.now()
  const startOfDay = new Date()
  startOfDay.setHours(0, 0, 0, 0)
  const endOfDay = startOfDay.getTime() + 86_400_000 - 1
  const start = startOfDay.getTime()

  const filteredEvents = useMemo(() => {
    return events
      .filter((event) => {
        const eventStart = event.startsAt
        const eventEnd = event.endsAt ?? eventStart

        switch (filter) {
          case "today":
            return eventEnd >= start && eventStart <= endOfDay
          case "past":
            return eventEnd < start
          case "upcoming":
            return eventStart > endOfDay
          default:
            return true
        }
      })
      .sort((a, b) => a.startsAt - b.startsAt)
  }, [events, filter, endOfDay, start])

  if (!workspaceId) {
    return (
      <div className="flex h-full items-center justify-center p-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold">No Workspace Selected</h2>
          <p className="mt-2 text-muted-foreground">
            Select a workspace to access the shared calendar.
          </p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground">Loading calendar...</div>
      </div>
    )
  }

  const handleCreateEvent = async () => {
    const title = form.title.trim()
    if (!title) {
      toast.error("Event title is required")
      return
    }
    if (!form.startsAt) {
      toast.error("Start date and time are required")
      return
    }

    const startTimestamp = new Date(form.startsAt).getTime()
    const endTimestamp = form.endsAt ? new Date(form.endsAt).getTime() : null

    try {
      await createEvent({
        title,
        description: form.description.trim() || undefined,
        location: form.location.trim() || undefined,
        startsAt: startTimestamp,
        endsAt: endTimestamp ?? undefined,
        allDay: form.allDay,
      })
      toast.success("Event scheduled")
      setForm(NEW_EVENT_DEFAULT)
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to create event")
    }
  }

  const handleDeleteEvent = async (event: CalendarEvent) => {
    const confirmed = window.confirm(`Delete "${event.title}"?`)
    if (!confirmed) return

    try {
      await deleteEvent(event.id)
      toast.success("Event removed")
    } catch (err: any) {
      toast.error(err?.message ?? "Failed to delete event")
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b bg-background p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CalendarDays className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold">Calendar</h1>
              <p className="text-sm text-muted-foreground">
                Organise meetings, launches, and shared milestones for your workspace.
              </p>
            </div>
          </div>
          <FeatureBadge status="beta" />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {rangeFilters.map((option) => (
              <Button
                key={option}
                variant={filter === option ? "secondary" : "outline"}
                size="sm"
                onClick={() => setFilter(option)}
              >
                {option === "all" ? "All" : option === "past" ? "Past" : option === "today" ? "Today" : "Upcoming"}
              </Button>
            ))}
          </div>
          <Button onClick={handleCreateEvent} disabled={isCreating}>
            <Plus className="mr-2 h-4 w-4" />
            {isCreating ? "Scheduling..." : "Schedule Event"}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {error ? (
          <Alert variant="destructive" className="mb-6">
            <AlertTitle>Something went wrong</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        ) : null}

        <div className="grid gap-4 pb-6 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold text-emerald-500">{stats.today}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Upcoming
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-semibold text-blue-500">{stats.upcoming}</div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Schedule an event</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label htmlFor="event-title">Title</Label>
              <Input
                id="event-title"
                value={form.title}
                onChange={(event) => setForm((prev) => ({ ...prev, title: event.target.value }))}
                placeholder="e.g. Product launch rehearsal"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="event-description">Description</Label>
              <Textarea
                id="event-description"
                rows={3}
                value={form.description}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, description: event.target.value }))
                }
                placeholder="Add agenda, participants, or preparation notes"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="event-starts">Starts at</Label>
              <Input
                id="event-starts"
                type="datetime-local"
                value={form.startsAt}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, startsAt: event.target.value }))
                }
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="event-ends">Ends at</Label>
              <Input
                id="event-ends"
                type="datetime-local"
                value={form.endsAt}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, endsAt: event.target.value }))
                }
                disabled={form.allDay}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="event-location">Location</Label>
              <Input
                id="event-location"
                value={form.location}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, location: event.target.value }))
                }
                placeholder="Conference room, Zoom link, etc."
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="event-all-day"
                checked={form.allDay}
                onCheckedChange={(checked) =>
                  setForm((prev) => ({ ...prev, allDay: checked, endsAt: checked ? "" : prev.endsAt }))
                }
              />
              <Label htmlFor="event-all-day">All day event</Label>
            </div>
          </CardContent>
        </Card>

        {filteredEvents.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground">
            <h3 className="text-lg font-semibold text-foreground">No events in this view</h3>
            <p className="mt-2 text-sm">
              Try a different filter or create a new event to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredEvents.map((event) => {
              const eventEnd = event.endsAt ?? event.startsAt
              const isPast = eventEnd < now
              const isToday = eventEnd >= start && event.startsAt <= endOfDay

              return (
                <Card key={event.id} className={isPast ? "opacity-70" : undefined}>
                  <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex flex-1 gap-4">
                      <div className="mt-1 h-10 w-1 rounded bg-primary/60" />
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-base font-semibold">{event.title}</h4>
                          {isToday ? <Badge className="bg-emerald-500/10 text-emerald-600">Today</Badge> : null}
                          {isPast ? <Badge variant="outline">Past</Badge> : null}
                          {event.allDay ? <Badge variant="secondary">All day</Badge> : null}
                        </div>
                        {event.description ? (
                          <p className="text-sm text-muted-foreground">{event.description}</p>
                        ) : null}
                        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <CalendarIcon className="h-4 w-4" />
                            {formatRange(event)}
                          </span>
                          {event.location ? (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {event.location}
                            </span>
                          ) : null}
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            Updated {new Date(event.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteEvent(event)}
                        disabled={isRemoving}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete event</span>
                      </Button>
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


