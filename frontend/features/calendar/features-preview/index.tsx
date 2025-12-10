/**
 * Calendar Feature Preview
 * 
 * Real UI preview showing the calendar interface with mock events
 */

"use client"

import * as React from 'react'
import { useState, useMemo } from 'react'
import { Calendar, ChevronLeft, ChevronRight, Clock, MapPin, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { defineFeaturePreview } from '@/frontend/shared/preview'
import type { FeaturePreviewProps } from '@/frontend/shared/preview'

// Event type definitions
interface CalendarEvent {
    id: string
    title: string
    startsAt: number
    endsAt: number
    allDay?: boolean
    type: 'meeting' | 'task' | 'reminder' | 'event'
    color: string
    location?: string
    description?: string
}

interface CalendarMockData {
    events: CalendarEvent[]
    eventTypes: Array<{ value: string; name: string }>
}

// Color mapping
const colorClasses: Record<string, string> = {
    '#3b82f6': 'border-blue-500 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300',
    '#22c55e': 'border-green-500 bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300',
    '#ef4444': 'border-red-500 bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300',
    '#a855f7': 'border-purple-500 bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-300',
    '#f97316': 'border-orange-500 bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300',
}

const dotColors: Record<string, string> = {
    '#3b82f6': 'bg-blue-500',
    '#22c55e': 'bg-green-500',
    '#ef4444': 'bg-red-500',
    '#a855f7': 'bg-purple-500',
    '#f97316': 'bg-orange-500',
}

function formatEventTime(start: number, end: number, allDay?: boolean): string {
    if (allDay) return 'All day'
    const startDate = new Date(start)
    const endDate = new Date(end)
    const options: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit' }
    return `${startDate.toLocaleTimeString([], options)} - ${endDate.toLocaleTimeString([], options)}`
}

function CalendarPreview({ mockData, compact, interactive }: FeaturePreviewProps) {
    const data = mockData.data as unknown as CalendarMockData
    const [selectedDate, setSelectedDate] = useState<Date>(new Date())
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date())
    const [selectedTypes, setSelectedTypes] = useState<string[]>(
        data.eventTypes.map(t => t.value)
    )

    // Filter events by selected types
    const filteredEvents = useMemo(() => {
        return data.events.filter(e => selectedTypes.includes(e.type))
    }, [data.events, selectedTypes])

    // Get events for selected date
    const selectedDateEvents = useMemo(() => {
        const startOfDay = new Date(selectedDate)
        startOfDay.setHours(0, 0, 0, 0)
        const endOfDay = new Date(selectedDate)
        endOfDay.setHours(23, 59, 59, 999)
        return filteredEvents
            .filter(e => e.startsAt >= startOfDay.getTime() && e.startsAt <= endOfDay.getTime())
            .sort((a, b) => a.startsAt - b.startsAt)
    }, [selectedDate, filteredEvents])

    // Get dates with events for mini calendar
    const datesWithEvents = useMemo(() => {
        return filteredEvents.map(e => new Date(e.startsAt))
    }, [filteredEvents])

    const handleTypeToggle = (type: string) => {
        setSelectedTypes(prev =>
            prev.includes(type)
                ? prev.filter(t => t !== type)
                : [...prev, type]
        )
    }

    if (compact) {
        return (
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Calendar</span>
                    </div>
                    <Badge variant="secondary">{data.events.length} events</Badge>
                </div>
                <div className="space-y-2">
                    {data.events.slice(0, 3).map(event => (
                        <div
                            key={event.id}
                            className={cn(
                                "flex items-center gap-2 p-2 rounded-md border-l-2",
                                colorClasses[event.color] || colorClasses['#3b82f6']
                            )}
                        >
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium truncate">{event.title}</p>
                                <p className="text-[10px] text-muted-foreground">
                                    {formatEventTime(event.startsAt, event.endsAt, event.allDay)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <div className="flex h-full border rounded-xl overflow-hidden bg-background">
            {/* Left Sidebar - Mini Calendar & Filters */}
            <div className="w-64 border-r bg-muted/30 p-4 space-y-4 hidden md:block">
                {/* Mini Calendar */}
                <Card className="border-none shadow-sm">
                    <CardContent className="p-2">
                        <CalendarComponent
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) => date && setSelectedDate(date)}
                            className="rounded-md"
                            classNames={{
                                day_selected: "bg-primary text-primary-foreground",
                                day_today: "bg-accent text-accent-foreground font-medium",
                            }}
                            modifiers={{ hasEvent: datesWithEvents }}
                            modifiersClassNames={{
                                hasEvent: "font-bold text-primary underline decoration-primary/50 decoration-2 underline-offset-2"
                            }}
                        />
                    </CardContent>
                </Card>

                {/* Event Type Filters */}
                <div className="space-y-3">
                    <h3 className="font-semibold text-xs text-muted-foreground uppercase tracking-wider px-1">
                        Event Types
                    </h3>
                    <div className="space-y-2">
                        {data.eventTypes.map(type => (
                            <div key={type.value} className="flex items-center space-x-2">
                                <Checkbox
                                    id={`filter-${type.value}`}
                                    checked={selectedTypes.includes(type.value)}
                                    onCheckedChange={() => interactive && handleTypeToggle(type.value)}
                                    disabled={!interactive}
                                />
                                <Label
                                    htmlFor={`filter-${type.value}`}
                                    className="text-sm cursor-pointer capitalize"
                                >
                                    {type.name}
                                </Label>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Calendar Area */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b bg-card">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                disabled={!interactive}
                                onClick={() => {
                                    const prev = new Date(currentMonth)
                                    prev.setMonth(prev.getMonth() - 1)
                                    setCurrentMonth(prev)
                                }}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-3 text-xs font-medium"
                                disabled={!interactive}
                                onClick={() => {
                                    setCurrentMonth(new Date())
                                    setSelectedDate(new Date())
                                }}
                            >
                                Today
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                disabled={!interactive}
                                onClick={() => {
                                    const next = new Date(currentMonth)
                                    next.setMonth(next.getMonth() + 1)
                                    setCurrentMonth(next)
                                }}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-primary" />
                            <span className="font-semibold text-lg">
                                {currentMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                            </span>
                        </div>
                    </div>
                    <Button size="sm" className="gap-1" disabled={!interactive}>
                        <Plus className="h-4 w-4" />
                        New Event
                    </Button>
                </div>

                {/* Calendar Grid (simplified preview) */}
                <div className="flex-1 p-4 overflow-auto">
                    <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
                        {/* Weekday headers */}
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="bg-muted p-2 text-center text-xs font-medium text-muted-foreground">
                                {day}
                            </div>
                        ))}
                        {/* Calendar days (show current week + context) */}
                        {Array.from({ length: 35 }, (_, i) => {
                            const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
                            const startDay = firstDay.getDay()
                            const dayNumber = i - startDay + 1
                            const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), dayNumber)
                            const isCurrentMonth = date.getMonth() === currentMonth.getMonth()
                            const isToday = date.toDateString() === new Date().toDateString()
                            const isSelected = date.toDateString() === selectedDate.toDateString()

                            const dayEvents = filteredEvents.filter(e =>
                                new Date(e.startsAt).toDateString() === date.toDateString()
                            ).slice(0, 2)

                            return (
                                <div
                                    key={i}
                                    className={cn(
                                        "bg-card min-h-[80px] p-1 cursor-pointer hover:bg-accent/20 transition-colors",
                                        !isCurrentMonth && "bg-muted/50 text-muted-foreground",
                                        isSelected && "ring-2 ring-primary ring-inset"
                                    )}
                                    onClick={() => interactive && setSelectedDate(date)}
                                >
                                    <span className={cn(
                                        "text-sm w-6 h-6 flex items-center justify-center rounded-full",
                                        isToday && "bg-primary text-primary-foreground font-medium"
                                    )}>
                                        {date.getDate()}
                                    </span>
                                    <div className="mt-1 space-y-0.5">
                                        {dayEvents.map(event => (
                                            <div
                                                key={event.id}
                                                className={cn(
                                                    "text-[10px] px-1 py-0.5 rounded truncate border-l-2",
                                                    colorClasses[event.color] || colorClasses['#3b82f6']
                                                )}
                                            >
                                                {event.title}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* Right Sidebar - Selected Date Events */}
            <div className="w-72 border-l bg-muted/20 hidden lg:flex flex-col">
                <div className="p-4 border-b">
                    <h3 className="font-semibold">
                        {selectedDate.toLocaleDateString(undefined, {
                            weekday: 'long',
                            month: 'short',
                            day: 'numeric'
                        })}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                        {selectedDateEvents.length} event{selectedDateEvents.length !== 1 ? 's' : ''}
                    </p>
                </div>
                <ScrollArea className="flex-1 p-4">
                    {selectedDateEvents.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground text-sm">
                            No events scheduled
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {selectedDateEvents.map(event => (
                                <Card
                                    key={event.id}
                                    className={cn(
                                        "border-l-4 cursor-pointer hover:shadow-md transition-shadow",
                                        `border-l-[${event.color}]`
                                    )}
                                    style={{ borderLeftColor: event.color }}
                                >
                                    <CardContent className="p-3">
                                        <h4 className="font-medium text-sm">{event.title}</h4>
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                            <Clock className="h-3 w-3" />
                                            {formatEventTime(event.startsAt, event.endsAt, event.allDay)}
                                        </div>
                                        {event.location && (
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                                <MapPin className="h-3 w-3" />
                                                {event.location}
                                            </div>
                                        )}
                                        <Badge variant="secondary" className="mt-2 text-xs capitalize">
                                            {event.type}
                                        </Badge>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </div>
        </div>
    )
}

// Generate mock events for the current month
const generateMockEvents = (): CalendarEvent[] => {
    const now = new Date()
    const events: CalendarEvent[] = [
        {
            id: '1',
            title: 'Team Standup',
            startsAt: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0).getTime(),
            endsAt: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 30).getTime(),
            type: 'meeting',
            color: '#3b82f6',
            location: 'Zoom'
        },
        {
            id: '2',
            title: 'Project Review',
            startsAt: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 14, 0).getTime(),
            endsAt: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 15, 0).getTime(),
            type: 'meeting',
            color: '#22c55e',
            location: 'Conference Room A'
        },
        {
            id: '3',
            title: 'Sprint Planning',
            startsAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 10, 0).getTime(),
            endsAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 12, 0).getTime(),
            type: 'meeting',
            color: '#a855f7',
            location: 'Main Office'
        },
        {
            id: '4',
            title: 'Submit Monthly Report',
            startsAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 0, 0).getTime(),
            endsAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 23, 59).getTime(),
            type: 'task',
            color: '#f97316',
            allDay: true
        },
        {
            id: '5',
            title: 'Client Call - TechCorp',
            startsAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3, 15, 0).getTime(),
            endsAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3, 16, 0).getTime(),
            type: 'meeting',
            color: '#3b82f6',
            location: 'Google Meet'
        },
        {
            id: '6',
            title: 'Team Lunch',
            startsAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 4, 12, 0).getTime(),
            endsAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 4, 13, 30).getTime(),
            type: 'event',
            color: '#22c55e',
            location: 'Downtown Cafe'
        },
        {
            id: '7',
            title: 'Quarterly Review',
            startsAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7, 9, 0).getTime(),
            endsAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7, 11, 0).getTime(),
            type: 'meeting',
            color: '#ef4444',
            location: 'Board Room'
        },
        {
            id: '8',
            title: 'Renew Software License',
            startsAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 10, 0, 0).getTime(),
            endsAt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 10, 23, 59).getTime(),
            type: 'reminder',
            color: '#f97316',
            allDay: true
        },
    ]
    return events
}

// Register the preview
export default defineFeaturePreview({
    featureId: 'calendar',
    name: 'Calendar',
    description: 'Team calendar with event management and scheduling',
    component: CalendarPreview,
    category: 'productivity',
    tags: ['calendar', 'events', 'scheduling', 'meetings'],
    mockDataSets: [
        {
            id: 'default',
            name: 'Team Calendar',
            description: 'Calendar with team events and meetings',
            data: {
                eventTypes: [
                    { value: 'meeting', name: 'Meeting' },
                    { value: 'task', name: 'Task' },
                    { value: 'reminder', name: 'Reminder' },
                    { value: 'event', name: 'Event' },
                ],
                events: generateMockEvents(),
            },
        },
    ],
})
