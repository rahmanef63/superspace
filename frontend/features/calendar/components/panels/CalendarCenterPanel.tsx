"use client"

import React from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"

// Color mapping from hex to Tailwind classes
const getColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
        '#3b82f6': "border-blue-500 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/30",
        '#22c55e': "border-green-500 text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-950/30",
        '#ef4444': "border-red-500 text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/30",
        '#a855f7': "border-purple-500 text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/30",
        '#f97316': "border-orange-500 text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-950/30",
        '#eab308': "border-yellow-500 text-yellow-700 dark:text-yellow-300 bg-yellow-50 dark:bg-yellow-950/30",
        '#ec4899': "border-pink-500 text-pink-700 dark:text-pink-300 bg-pink-50 dark:bg-pink-950/30",
        '#6b7280': "border-gray-500 text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-950/30",
    }
    return colorMap[color] || "border-blue-500 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/30"
}

interface CalendarCenterPanelProps {
    date: Date | undefined
    setDate: (date: Date | undefined) => void
    filteredEvents: any[]
    handleCreateClick: (date?: Date) => void
    month?: Date
    onMonthChange?: (date: Date) => void
}

export function CalendarCenterPanel({
    date,
    setDate,
    filteredEvents,
    handleCreateClick,
    month,
    onMonthChange
}: CalendarCenterPanelProps) {

    // Custom Day Component
    const CustomDayContent = (props: any) => {
        const { date: d, activeModifiers } = props;
        if (!d) return null;

        const dayEvents = filteredEvents
            .filter((e: any) => new Date(e.startsAt).toDateString() === d.toDateString())
            .sort((a: any, b: any) => a.startsAt - b.startsAt);
        
        const maxVisibleEvents = 3;
        const hiddenEventsCount = dayEvents.length - maxVisibleEvents;

        return (
            <div className="w-full h-full p-1 sm:p-2 relative group flex flex-col items-start text-left">
                <div className="flex justify-between w-full items-start">
                    <span className={cn(
                        "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full transition-colors",
                        activeModifiers.today 
                            ? "bg-primary text-primary-foreground" 
                            : "text-muted-foreground group-hover:text-foreground"
                    )}>
                        {d.getDate()}
                    </span>
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity -mr-1 -mt-1 hover:bg-primary/10 hover:text-primary"
                        onClick={(e) => { e.stopPropagation(); handleCreateClick(d); }}
                    >
                        <Plus className="h-3 w-3" />
                    </Button>
                </div>
                
                <div className="w-full flex flex-col gap-1 mt-1 overflow-hidden">
                    {dayEvents.slice(0, maxVisibleEvents).map((e: any, i: number) => (
                        <div 
                            key={i} 
                            className={cn(
                                "w-full px-1.5 py-0.5 rounded text-[10px] truncate font-medium border-l-2 bg-muted/50 hover:bg-muted transition-colors cursor-pointer",
                                getColorClasses(e.color)
                            )}
                            title={e.title}
                        >
                            {e.title}
                        </div>
                    ))}
                    {hiddenEventsCount > 0 && (
                        <span className="text-[10px] text-muted-foreground pl-1 font-medium">
                            +{hiddenEventsCount} more
                        </span>
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col bg-background p-4">
            <Card className="flex-1 shadow-sm border rounded-xl overflow-hidden flex flex-col bg-card">
                <div className="w-full flex-1 overflow-auto">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        month={month}
                        onMonthChange={onMonthChange}
                        className="w-full h-full p-0"
                        classNames={{
                            months: "flex flex-col w-full h-full",
                            month: "w-full h-full flex flex-col",
                            caption: "flex justify-between items-center px-4 py-3 border-b",
                            caption_label: "text-lg font-semibold",
                            nav: "flex items-center gap-1",
                            nav_button: "h-8 w-8 bg-transparent p-0 opacity-70 hover:opacity-100 inline-flex items-center justify-center rounded-md hover:bg-muted",
                            table: "w-full flex-1 border-collapse h-full table-fixed",
                            head_row: "flex w-full border-b",
                            head_cell: "text-muted-foreground font-medium text-xs h-10 flex-1 flex items-center justify-center uppercase tracking-wider bg-muted/20",
                            row: "flex w-full flex-1",
                            cell: cn(
                                "h-full w-full p-0 relative border-b border-r first:border-l focus-within:relative focus-within:z-20",
                                "[&:has([aria-selected])]:bg-accent/5"
                            ),
                            day: cn(
                                "h-full w-full p-0 font-normal aria-selected:opacity-100 flex flex-col items-start justify-start hover:bg-accent/20 transition-colors"
                            ),
                            day_selected: "bg-accent/20",
                            day_today: "",
                            day_outside: "text-muted-foreground/30 bg-muted/5",
                        }}
                        components={{
                            DayContent: CustomDayContent
                        } as any}
                    />
                </div>
            </Card>
        </div>
    )
}
