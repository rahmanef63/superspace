"use client"

import React, { useState, useMemo } from "react"
import { 
  Calendar as CalendarIcon, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Settings,
  Clock,
  MapPin,
  Users,
  Trash2,
  Edit,
  X,
  CalendarDays,
  List,
  LayoutGrid
} from "lucide-react"
import { Id } from "@convex/_generated/dataModel"
import { useCalendar } from "../hooks/useCalendar"
import { FeatureHeader } from "@/frontend/shared/ui/layout/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"

interface CalendarPageProps {
  workspaceId?: Id<"workspaces"> | null
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const EVENT_COLORS = [
  { name: "Blue", value: "blue", class: "bg-blue-500" },
  { name: "Green", value: "green", class: "bg-green-500" },
  { name: "Red", value: "red", class: "bg-red-500" },
  { name: "Purple", value: "purple", class: "bg-purple-500" },
  { name: "Orange", value: "orange", class: "bg-orange-500" },
  { name: "Yellow", value: "yellow", class: "bg-yellow-500" },
  { name: "Pink", value: "pink", class: "bg-pink-500" },
  { name: "Cyan", value: "cyan", class: "bg-cyan-500" },
]

const EVENT_TYPES = [
  { name: "Meeting", value: "meeting" },
  { name: "Task", value: "task" },
  { name: "Reminder", value: "reminder" },
  { name: "Event", value: "event" },
  { name: "Holiday", value: "holiday" },
]

interface EventFormData {
  title: string
  description: string
  startDate: string
  startTime: string
  endDate: string
  endTime: string
  allDay: boolean
  location: string
  color: string
  type: string
}

const defaultFormData: EventFormData = {
  title: "",
  description: "",
  startDate: new Date().toISOString().split("T")[0],
  startTime: "09:00",
  endDate: new Date().toISOString().split("T")[0],
  endTime: "10:00",
  allDay: false,
  location: "",
  color: "blue",
  type: "meeting",
}

/**
 * Calendar Page Component
 * Full calendar with event management
 */
export default function CalendarPage({ workspaceId }: CalendarPageProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<"month" | "week" | "list">("month")
  const { isLoading, events, createEvent, updateEvent, deleteEvent } = useCalendar(workspaceId)
  
  // Dialogs
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [viewEventDialogOpen, setViewEventDialogOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  const [formData, setFormData] = useState<EventFormData>(defaultFormData)
  const [isProcessing, setIsProcessing] = useState(false)

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
  const today = new Date()

  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, month, 0).getDate()

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1))
  const goToToday = () => setCurrentDate(new Date())

  const getColorClass = (color: string) => {
    return EVENT_COLORS.find(c => c.value === color)?.class || "bg-blue-500"
  }

  const getDayEvents = (day: number) => {
    const dayStart = new Date(year, month, day).setHours(0, 0, 0, 0)
    const dayEnd = new Date(year, month, day).setHours(23, 59, 59, 999)
    return events.filter((e: any) => {
      const eventStart = e.startsAt
      return eventStart >= dayStart && eventStart <= dayEnd
    })
  }

  const handleCreateEvent = async () => {
    if (!workspaceId || !formData.title.trim()) return
    setIsProcessing(true)

    try {
      const startDateTime = formData.allDay 
        ? new Date(formData.startDate).setHours(0, 0, 0, 0)
        : new Date(`${formData.startDate}T${formData.startTime}`).getTime()
      
      const endDateTime = formData.allDay
        ? new Date(formData.endDate).setHours(23, 59, 59, 999)
        : new Date(`${formData.endDate}T${formData.endTime}`).getTime()

      await createEvent({
        workspaceId,
        title: formData.title,
        description: formData.description || undefined,
        startsAt: startDateTime,
        endsAt: endDateTime,
        allDay: formData.allDay,
        location: formData.location || undefined,
      })

      setCreateDialogOpen(false)
      setFormData(defaultFormData)
    } catch (error) {
      console.error("Failed to create event:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleUpdateEvent = async () => {
    if (!workspaceId || !selectedEvent || !formData.title.trim()) return
    setIsProcessing(true)

    try {
      const startDateTime = formData.allDay 
        ? new Date(formData.startDate).setHours(0, 0, 0, 0)
        : new Date(`${formData.startDate}T${formData.startTime}`).getTime()
      
      const endDateTime = formData.allDay
        ? new Date(formData.endDate).setHours(23, 59, 59, 999)
        : new Date(`${formData.endDate}T${formData.endTime}`).getTime()

      await updateEvent({
        id: selectedEvent._id,
        patch: {
          title: formData.title,
          description: formData.description || null,
          startsAt: startDateTime,
          endsAt: endDateTime,
          allDay: formData.allDay,
          location: formData.location || null,
        },
      })

      setEditDialogOpen(false)
      setSelectedEvent(null)
      setFormData(defaultFormData)
    } catch (error) {
      console.error("Failed to update event:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDeleteEvent = async (eventId: Id<"calendar">) => {
    if (!workspaceId) return
    setIsProcessing(true)

    try {
      await deleteEvent({ id: eventId })
      setViewEventDialogOpen(false)
      setSelectedEvent(null)
    } catch (error) {
      console.error("Failed to delete event:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  const openEventDialog = (event: any) => {
    setSelectedEvent(event)
    setViewEventDialogOpen(true)
  }

  const openEditDialog = (event: any) => {
    setSelectedEvent(event)
    const startDate = new Date(event.startsAt)
    const endDate = new Date(event.endsAt)
    
    setFormData({
      title: event.title || "",
      description: event.description || "",
      startDate: startDate.toISOString().split("T")[0],
      startTime: startDate.toTimeString().slice(0, 5),
      endDate: endDate.toISOString().split("T")[0],
      endTime: endDate.toTimeString().slice(0, 5),
      allDay: event.allDay || false,
      location: event.location || "",
      color: event.color || "blue",
      type: event.type || "meeting",
    })
    setViewEventDialogOpen(false)
    setEditDialogOpen(true)
  }

  const openCreateDialogForDate = (day: number) => {
    const date = new Date(year, month, day)
    setFormData({
      ...defaultFormData,
      startDate: date.toISOString().split("T")[0],
      endDate: date.toISOString().split("T")[0],
    })
    setCreateDialogOpen(true)
  }

  const formatEventTime = (timestamp: number, allDay?: boolean) => {
    if (allDay) return "All day"
    return new Date(timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  // Upcoming events for sidebar
  const upcomingEvents = useMemo(() => {
    const now = Date.now()
    return events
      .filter((e: any) => e.startsAt >= now)
      .sort((a: any, b: any) => a.startsAt - b.startsAt)
      .slice(0, 5)
  }, [events])

  return (
    <div className="flex h-full flex-col">
      <FeatureHeader
        icon={CalendarIcon}
        title="Calendar"
        subtitle={`${events.length} events`}
        primaryAction={{
          label: "New Event",
          icon: Plus,
          onClick: () => setCreateDialogOpen(true)
        }}
        secondaryActions={
          <div className="flex items-center rounded-md border">
            <Button 
              variant={view === "month" ? "secondary" : "ghost"} 
              size="sm"
              onClick={() => setView("month")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button 
              variant={view === "week" ? "secondary" : "ghost"} 
              size="sm"
              onClick={() => setView("week")}
            >
              <CalendarDays className="h-4 w-4" />
            </Button>
            <Button 
              variant={view === "list" ? "secondary" : "ghost"} 
              size="sm"
              onClick={() => setView("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        }
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Main Calendar */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Calendar Navigation */}
          <div className="flex items-center justify-between border-b p-4">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={goToToday}>
                Today
              </Button>
              <Button variant="ghost" size="icon" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            <h2 className="text-lg font-semibold">
              {MONTHS[month]} {year}
            </h2>
            <div className="w-32" /> {/* Spacer for centering */}
          </div>

          {/* Calendar Grid */}
          <div className="flex-1 overflow-auto p-4">
            {isLoading ? (
              <div className="flex h-full items-center justify-center">
                <p className="text-muted-foreground">Loading calendar...</p>
              </div>
            ) : view === "list" ? (
              /* List View */
              <div className="space-y-2">
                {events.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="font-medium">No events</h3>
                      <p className="text-sm text-muted-foreground">Create your first event to get started</p>
                    </CardContent>
                  </Card>
                ) : (
                  events
                    .sort((a: any, b: any) => (a.startDate || a.startTime) - (b.startDate || b.startTime))
                    .map((event: any) => (
                      <Card 
                        key={event._id} 
                        className="cursor-pointer hover:bg-accent transition-colors"
                        onClick={() => openEventDialog(event)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className={`w-1 h-12 rounded-full ${getColorClass(event.color)}`} />
                            <div className="flex-1">
                              <h4 className="font-medium">{event.title}</h4>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {new Date(event.startsAt).toLocaleDateString()} 
                                  {!event.allDay && ` at ${formatEventTime(event.startsAt)}`}
                                </span>
                                {event.location && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {event.location}
                                  </span>
                                )}
                              </div>
                            </div>
                            <Badge variant="secondary">{event.type || "event"}</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                )}
              </div>
            ) : (
              /* Month View */
              <div className="grid grid-cols-7 gap-1 h-full">
                {/* Day Headers */}
                {DAYS.map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}

                {/* Previous month days */}
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                  <div key={`prev-${i}`} className="min-h-[100px] rounded-lg bg-muted/20 p-2">
                    <span className="text-sm text-muted-foreground/50">
                      {daysInPrevMonth - firstDayOfMonth + i + 1}
                    </span>
                  </div>
                ))}

                {/* Current month days */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1
                  const dayEvents = getDayEvents(day)
                  const isToday = 
                    today.getDate() === day && 
                    today.getMonth() === month && 
                    today.getFullYear() === year

                  return (
                    <div 
                      key={day} 
                      className={`min-h-[100px] rounded-lg border bg-card p-2 cursor-pointer hover:bg-accent/50 transition-colors ${
                        isToday ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => openCreateDialogForDate(day)}
                    >
                      <div className={`text-sm font-medium mb-1 ${isToday ? 'text-primary' : ''}`}>
                        {day}
                      </div>
                      <div className="space-y-1">
                        {dayEvents.slice(0, 3).map((event: any) => (
                          <div 
                            key={event._id} 
                            className={`px-1.5 py-0.5 rounded text-xs text-white truncate ${getColorClass(event.color)}`}
                            onClick={(e) => {
                              e.stopPropagation()
                              openEventDialog(event)
                            }}
                          >
                            {event.allDay ? "" : formatEventTime(event.startsAt, event.allDay) + " "}{event.title}
                          </div>
                        ))}
                        {dayEvents.length > 3 && (
                          <span className="text-xs text-muted-foreground">
                            +{dayEvents.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 border-l p-4 hidden lg:block overflow-auto">
          <h3 className="font-semibold mb-4">Upcoming Events</h3>
          {upcomingEvents.length === 0 ? (
            <p className="text-sm text-muted-foreground">No upcoming events</p>
          ) : (
            <div className="space-y-3">
              {upcomingEvents.map((event: any) => (
                <Card 
                  key={event._id} 
                  className="cursor-pointer hover:bg-accent"
                  onClick={() => openEventDialog(event)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start gap-2">
                      <div className={`w-1 h-full min-h-[40px] rounded-full ${getColorClass(event.color)}`} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{event.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(event.startsAt).toLocaleDateString(undefined, {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric'
                          })}
                          {!event.allDay && ` • ${formatEventTime(event.startsAt)}`}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Quick Stats */}
          <div className="mt-6">
            <h3 className="font-semibold mb-4">This Month</h3>
            <div className="grid grid-cols-2 gap-2">
              <Card>
                <CardContent className="p-3 text-center">
                  <p className="text-2xl font-bold">{events.length}</p>
                  <p className="text-xs text-muted-foreground">Total Events</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-3 text-center">
                  <p className="text-2xl font-bold">
                    {events.filter((e: any) => e.type === "meeting").length}
                  </p>
                  <p className="text-xs text-muted-foreground">Meetings</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Create Event Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Event</DialogTitle>
            <DialogDescription>
              Add a new event to your calendar
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Event title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={formData.allDay}
                onCheckedChange={(checked) => setFormData({ ...formData, allDay: checked })}
              />
              <Label>All day</Label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              {!formData.allDay && (
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <Input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
              {!formData.allDay && (
                <div className="space-y-2">
                  <Label>End Time</Label>
                  <Input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                placeholder="Add location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Color</Label>
                <Select
                  value={formData.color}
                  onValueChange={(value) => setFormData({ ...formData, color: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_COLORS.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${color.class}`} />
                          {color.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Add description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateEvent} disabled={isProcessing || !formData.title.trim()}>
              {isProcessing ? "Creating..." : "Create Event"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Event Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
            <DialogDescription>
              Update event details
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                placeholder="Event title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={formData.allDay}
                onCheckedChange={(checked) => setFormData({ ...formData, allDay: checked })}
              />
              <Label>All day</Label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              {!formData.allDay && (
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <Input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
              {!formData.allDay && (
                <div className="space-y-2">
                  <Label>End Time</Label>
                  <Input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                placeholder="Add location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Color</Label>
                <Select
                  value={formData.color}
                  onValueChange={(value) => setFormData({ ...formData, color: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_COLORS.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${color.class}`} />
                          {color.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Add description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateEvent} disabled={isProcessing || !formData.title.trim()}>
              {isProcessing ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Event Dialog */}
      <Dialog open={viewEventDialogOpen} onOpenChange={setViewEventDialogOpen}>
        <DialogContent className="max-w-md">
          {selectedEvent && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getColorClass(selectedEvent.color)}`} />
                    <DialogTitle>{selectedEvent.title}</DialogTitle>
                  </div>
                  <Badge variant="secondary">{selectedEvent.type || "event"}</Badge>
                </div>
              </DialogHeader>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p>
                      {new Date(selectedEvent.startsAt).toLocaleDateString(undefined, {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                    {!selectedEvent.allDay && (
                      <p className="text-muted-foreground">
                        {formatEventTime(selectedEvent.startsAt)} - {formatEventTime(selectedEvent.endsAt)}
                      </p>
                    )}
                    {selectedEvent.allDay && (
                      <p className="text-muted-foreground">All day</p>
                    )}
                  </div>
                </div>

                {selectedEvent.location && (
                  <div className="flex items-center gap-3 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedEvent.location}</span>
                  </div>
                )}

                {selectedEvent.description && (
                  <div className="text-sm">
                    <p className="text-muted-foreground whitespace-pre-wrap">{selectedEvent.description}</p>
                  </div>
                )}
              </div>

              <DialogFooter className="flex-row justify-between sm:justify-between">
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => handleDeleteEvent(selectedEvent._id)}
                  disabled={isProcessing}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setViewEventDialogOpen(false)}>
                    Close
                  </Button>
                  <Button onClick={() => openEditDialog(selectedEvent)}>
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </div>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
