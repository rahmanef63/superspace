"use client"

import React, { useState, useMemo } from "react"
import { Id } from "@convex/_generated/dataModel"
import { useCalendar } from "../hooks/useCalendar"
import { EventFormDialog } from "../components/EventFormDialog"
import { EVENT_TYPES } from "../constants"
import { CalendarSidebar } from "../components/CalendarSidebar"
// Shared Layout
import { FeatureThreeColumnLayout } from "@/frontend/shared/ui/layout/container/three-column/FeatureThreeColumnLayout"
// Refactored Panels
import { CalendarLeftPanel } from "../components/panels/CalendarLeftPanel"
import { CalendarCenterPanel } from "../components/panels/CalendarCenterPanel"

interface CalendarPageProps {
  workspaceId?: Id<"workspaces"> | null
}

export default function CalendarPage({ workspaceId }: CalendarPageProps) {
  // State
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date())
  const [eventFormOpen, setEventFormOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedTypes, setSelectedTypes] = useState<string[]>(EVENT_TYPES.map(t => t.value))

  // Hooks
  const { isLoading, events, createEvent, updateEvent, deleteEvent } = useCalendar(workspaceId)

  // Derived Logic
  const filteredEvents = useMemo(() => {
    return events.filter((e: any) => selectedTypes.includes(e.type || 'meeting'))
  }, [events, selectedTypes])

  const selectedDateEvents = useMemo(() => {
    if (!date) return []
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)
    return filteredEvents.filter((e: any) => e.startsAt >= startOfDay.getTime() && e.startsAt <= endOfDay.getTime())
  }, [date, filteredEvents])

  const datesWithEvents = useMemo(() => {
    return filteredEvents.map((e: any) => new Date(e.startsAt))
  }, [filteredEvents])

  // Handlers
  const handleDateSelect = (newDate: Date | undefined) => {
    setDate(newDate)
    if (newDate) setCurrentMonth(newDate)
  }
  const handleEventClick = (event: any) => { setSelectedEvent(event); setEventFormOpen(true) }
  const handleCreateClick = (initialDate?: Date) => {
    setDate(initialDate || date);
    setSelectedEvent(null);
    setEventFormOpen(true)
  }
  const handleTypeToggle = (type: string) => {
    setSelectedTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type])
  }

  const handleSubmit = async (formData: any) => {
    if (!workspaceId) return
    setIsProcessing(true)
    try {
      const startDateTime = formData.allDay
        ? new Date(formData.startDate).setHours(0, 0, 0, 0)
        : new Date(`${formData.startDate}T${formData.startTime}`).getTime()

      const endTimeStr = formData.hasEndTime ? formData.endTime : formData.startTime;
      const endDateTime = formData.allDay
        ? new Date(formData.endDate).setHours(23, 59, 59, 999)
        : new Date(`${formData.endDate}T${endTimeStr}`).getTime()

      const payload = {
        title: formData.title,
        description: formData.description || undefined,
        startsAt: startDateTime,
        endsAt: endDateTime,
        allDay: formData.allDay,
        location: formData.location || undefined,
        type: formData.type,
        color: formData.color,
      }

      if (selectedEvent) {
        await updateEvent({ id: selectedEvent._id, patch: payload })
      } else {
        await createEvent({ workspaceId, ...payload })
      }
      setEventFormOpen(false); setSelectedEvent(null)
    } catch (error) { console.error("Failed to save event:", error) }
    finally { setIsProcessing(false) }
  }

  if (!workspaceId) return <div className="p-8 text-center">Select workspace</div>

  return (
    <>
      <FeatureThreeColumnLayout
        // Left Panel
        sidebarTitle="Filters"
        sidebarContent={
          <CalendarLeftPanel
            date={date}
            setDate={handleDateSelect}
            datesWithEvents={datesWithEvents}
            selectedTypes={selectedTypes}
            handleTypeToggle={handleTypeToggle}
            events={events}
            onEventClick={handleEventClick}
          />
        }
        sidebarStats={`${events.length}`}

        // Center Panel
        mainContent={
          <CalendarCenterPanel
            date={date}
            setDate={handleDateSelect}
            filteredEvents={filteredEvents}
            handleCreateClick={handleCreateClick}
            month={currentMonth}
            onMonthChange={setCurrentMonth}
          />
        }
        mainHeader={null}

        // Right Panel
        inspector={
          <div className="h-full flex flex-col">
            <CalendarSidebar
              events={date ? selectedDateEvents : filteredEvents}
              onEventClick={handleEventClick}
              title={date ? `Schedule: ${date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}` : "All Upcoming"}
            />
            {/* Placeholder */}
            {(!date || selectedDateEvents.length === 0) && filteredEvents.length === 0 && (
              <div className="p-8 text-center text-muted-foreground text-sm">
                You don't have plan yet, <button className="text-primary underline" onClick={() => handleCreateClick()}>add here</button>
              </div>
            )}
          </div>
        }
      />

      <EventFormDialog
        open={eventFormOpen}
        onOpenChange={setEventFormOpen}
        initialDate={date}
        event={selectedEvent}
        onSubmit={handleSubmit}
        isProcessing={isProcessing}
      />
    </>
  )
}
