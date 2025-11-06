/**
 * UniversalCalendarView Component
 * 
 * A comprehensive calendar view for the Universal Database system that supports:
 * - Multiple view modes (month, week, day)
 * - All date property types (date, created_time, last_edited_time)
 * - Drag-and-drop rescheduling with @dnd-kit
 * - Color coding from status properties
 * - Event filtering and navigation
 * 
 * @version 2.0
 * @since Phase 4 - Task 4.5
 */

import React, { useMemo, useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
// @ts-ignore - Module resolution issue workaround
import { CalendarEventCard } from './calendar-event-card';
import { cn } from '@/lib/utils';
import type { PropertyRowData, PropertyColumnConfig } from './table-columns';

export type CalendarViewMode = 'month' | 'week' | 'day';

export interface CalendarEvent {
  id: string;
  record: PropertyRowData;
  date: Date;
  color?: string;
  title: string;
  status?: string;
}

export interface UniversalCalendarViewProps {
  /** Array of records to display */
  records: PropertyRowData[];
  
  /** Array of properties for the records */
  properties: PropertyColumnConfig[];
  
  /** The property to use for calendar dates (defaults to 'date' type) */
  dateProperty?: string;
  
  /** Callback when a record's date is changed via drag-drop */
  onDateChange?: (recordId: string, newDate: Date) => void;
  
  /** Callback when a record is clicked */
  onRecordClick?: (record: PropertyRowData) => void;
  
  /** Callback to add a new record on a specific date */
  onAddRecord?: (date: Date) => void;
  
  /** Optional CSS class name */
  className?: string;
}

export const UniversalCalendarView: React.FC<UniversalCalendarViewProps> = ({
  records,
  properties,
  dateProperty,
  onDateChange,
  onRecordClick,
  onAddRecord,
  className,
}) => {
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateProperty, setSelectedDateProperty] = useState<string>(dateProperty || '');
  const [draggedEvent, setDraggedEvent] = useState<CalendarEvent | null>(null);
  const [hasInitializedDate, setHasInitializedDate] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Find all date-type properties
  const dateProperties = useMemo(() => {
    return properties.filter(prop => 
      prop.type === 'date' || 
      prop.type === 'created_time' || 
      prop.type === 'last_edited_time'
    );
  }, [properties]);

  // Auto-select first date property if none selected
  React.useEffect(() => {
    if (!selectedDateProperty && dateProperties.length > 0) {
      setSelectedDateProperty(dateProperties[0].key);
    }
  }, [selectedDateProperty, dateProperties]);

  // Find status property for color coding
  const statusProperty = useMemo(() => {
    return properties.find(prop => prop.type === 'status' || prop.type === 'select');
  }, [properties]);

  // Find title property (first title or text property)
  const titleProperty = useMemo(() => {
    return properties.find(prop => prop.type === 'title' || prop.type === 'rich_text') || properties[0];
  }, [properties]);

  // Convert records to calendar events
  const events = useMemo(() => {
    if (!selectedDateProperty) return [];

    const calendarEvents: CalendarEvent[] = [];

    for (const record of records) {
      const dateValue = record.properties?.[selectedDateProperty];
      if (!dateValue) continue;

      // Parse date from various formats
      let date: Date;
      if (typeof dateValue === 'number') {
        date = new Date(dateValue);
      } else if (typeof dateValue === 'string') {
        date = new Date(dateValue);
      } else if (dateValue instanceof Date) {
        date = dateValue;
      } else {
        continue;
      }

      if (isNaN(date.getTime())) continue;

      // Get color from status property
      let color: string | undefined;
      let status: string | undefined;
      if (statusProperty) {
        const statusValue = record.properties?.[statusProperty.key];
        if (typeof statusValue === 'object' && statusValue !== null && 'color' in statusValue) {
          color = (statusValue as { color?: string }).color;
        }
        if (typeof statusValue === 'object' && statusValue !== null && 'label' in statusValue) {
          status = (statusValue as { label?: string }).label;
        } else if (typeof statusValue === 'string') {
          status = statusValue;
        }
      }

      // Get title from title property
      let title = 'Untitled';
      if (titleProperty) {
        const titleValue = record.properties?.[titleProperty.key];
        if (typeof titleValue === 'string') {
          title = titleValue;
        } else if (titleValue && typeof titleValue === 'object' && 'text' in titleValue) {
          title = (titleValue as { text: string }).text;
        }
      }

      calendarEvents.push({
        id: record.id,
        record,
        date,
        color,
        title,
        status,
      });
    }

    return calendarEvents;
  }, [records, selectedDateProperty, statusProperty, titleProperty]);

  // Initialize currentDate to first event's date when events are loaded
  React.useEffect(() => {
    if (!hasInitializedDate && events.length > 0) {
      setCurrentDate(events[0].date);
      setHasInitializedDate(true);
    }
  }, [events, hasInitializedDate]);

  // Calculate visible date range based on view mode
  const visibleRange = useMemo(() => {
    let start: Date;
    let end: Date;

    switch (viewMode) {
      case 'month':
        start = startOfWeek(startOfMonth(currentDate));
        end = endOfWeek(endOfMonth(currentDate));
        break;
      case 'week':
        start = startOfWeek(currentDate);
        end = endOfWeek(currentDate);
        break;
      case 'day':
        start = currentDate;
        end = currentDate;
        break;
    }

    return { start, end };
  }, [currentDate, viewMode]);

  // Get all days in the visible range
  const visibleDays = useMemo(() => {
    return eachDayOfInterval({ start: visibleRange.start, end: visibleRange.end });
  }, [visibleRange]);

  // Group events by day
  const eventsByDay = useMemo(() => {
    const grouped = new Map<string, CalendarEvent[]>();
    
    events.forEach(event => {
      const dayKey = format(event.date, 'yyyy-MM-dd');
      if (!grouped.has(dayKey)) {
        grouped.set(dayKey, []);
      }
      grouped.get(dayKey)!.push(event);
    });

    return grouped;
  }, [events]);

  // Navigation functions
  const navigatePrevious = () => {
    switch (viewMode) {
      case 'month':
        setCurrentDate(subMonths(currentDate, 1));
        break;
      case 'week':
        setCurrentDate(subWeeks(currentDate, 1));
        break;
      case 'day':
        setCurrentDate(subDays(currentDate, 1));
        break;
    }
  };

  const navigateNext = () => {
    switch (viewMode) {
      case 'month':
        setCurrentDate(addMonths(currentDate, 1));
        break;
      case 'week':
        setCurrentDate(addWeeks(currentDate, 1));
        break;
      case 'day':
        setCurrentDate(addDays(currentDate, 1));
        break;
    }
  };

  const navigateToday = () => {
    setCurrentDate(new Date());
  };

  // Drag and drop handlers
  const handleDragStart = (event: DragStartEvent) => {
    const eventId = event.active.id as string;
    const calendarEvent = events.find(e => e.id === eventId);
    if (calendarEvent) {
      setDraggedEvent(calendarEvent);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && onDateChange) {
      const eventId = active.id as string;
      const targetDate = over.id as string; // Format: 'yyyy-MM-dd'
      
      const [year, month, day] = targetDate.split('-').map(Number);
      const newDate = new Date(year, month - 1, day);
      
      onDateChange(eventId, newDate);
    }

    setDraggedEvent(null);
  };

  // Get title for current view
  const getViewTitle = () => {
    switch (viewMode) {
      case 'month':
        return format(currentDate, 'MMMM yyyy');
      case 'week':
        const weekStart = startOfWeek(currentDate);
        const weekEnd = endOfWeek(currentDate);
        return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
      case 'day':
        return format(currentDate, 'EEEE, MMMM d, yyyy');
    }
  };

  // Render day cell
  const renderDayCell = (day: Date) => {
    const dayKey = format(day, 'yyyy-MM-dd');
    const dayEvents = eventsByDay.get(dayKey) || [];
    const isCurrentMonth = isSameMonth(day, currentDate);
    const isCurrentDay = isToday(day);

    return (
      <div
        key={dayKey}
        id={dayKey}
        className={cn(
          'min-h-[100px] border border-border bg-background p-2',
          viewMode === 'month' && !isCurrentMonth && 'bg-muted/50 text-muted-foreground',
          isCurrentDay && 'bg-accent/10'
        )}
      >
        <div className="flex items-center justify-between mb-2">
          <span className={cn(
            'text-sm font-medium',
            isCurrentDay && 'text-primary'
          )}>
            {viewMode === 'month' ? format(day, 'd') : format(day, 'EEE d')}
          </span>
          {onAddRecord && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => onAddRecord(day)}
            >
              <Plus className="h-3 w-3" />
            </Button>
          )}
        </div>
        <ScrollArea className="h-[calc(100%-32px)]">
          <div className="space-y-1">
            {dayEvents.map(event => (
              <CalendarEventCard
                key={event.id}
                event={event}
                onClick={() => onRecordClick?.(event.record)}
                isDraggable={!!onDateChange}
              />
            ))}
          </div>
        </ScrollArea>
      </div>
    );
  };

  if (dateProperties.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-[400px]">
          <div className="text-center space-y-2">
            <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">
              No date properties found. Add a date, created_time, or last_edited_time property to use the calendar view.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <CardTitle className="text-2xl">{getViewTitle()}</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={navigatePrevious}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={navigateToday}>
                  Today
                </Button>
                <Button variant="outline" size="sm" onClick={navigateNext}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {dateProperties.length > 1 && (
                <Select value={selectedDateProperty} onValueChange={setSelectedDateProperty}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select date property" />
                  </SelectTrigger>
                  <SelectContent>
                    {dateProperties.map(prop => (
                      <SelectItem key={prop.key} value={prop.key}>
                        {prop.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <Select value={viewMode} onValueChange={(value) => setViewMode(value as CalendarViewMode)}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Month</SelectItem>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="day">Day</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {viewMode === 'month' && (
            <div className="grid grid-cols-7 gap-0">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground border border-border bg-muted">
                  {day}
                </div>
              ))}
              {visibleDays.map(renderDayCell)}
            </div>
          )}
          {viewMode === 'week' && (
            <div className="grid grid-cols-7 gap-0">
              {visibleDays.map(renderDayCell)}
            </div>
          )}
          {viewMode === 'day' && (
            <div className="grid grid-cols-1 gap-0">
              {renderDayCell(currentDate)}
            </div>
          )}
        </CardContent>
      </Card>

      <DragOverlay>
        {draggedEvent && (
          <CalendarEventCard
            event={draggedEvent}
            isDraggable={false}
            className="opacity-80 cursor-grabbing"
          />
        )}
      </DragOverlay>
    </DndContext>
  );
};

export default UniversalCalendarView;
