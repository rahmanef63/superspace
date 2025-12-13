import React, { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar as CalendarIcon } from 'lucide-react';
import { SharedCalendar } from '@/frontend/shared/components/calendar/SharedCalendar';
import { CalendarEvent, CalendarViewMode } from '@/frontend/shared/components/calendar/types';
import type { PropertyRowData, PropertyColumnConfig } from './table-columns';
// @ts-ignore - Module resolution issue workaround
import { CalendarEventCard } from './calendar-event-card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export interface UniversalCalendarViewProps {

  /** Array of records to display */
  records: PropertyRowData[];

  /** Array of properties for the records */
  properties: PropertyColumnConfig[];

  /** The property to use for calendar dates (defaults to 'date' type) */
  dateProperty?: string;

  /** Callback when a record's date is changed via drag-drop */
  onDateChange?: (recordId: string, newDate: Date, propertyKey: string) => void;

  /** Callback when a record is clicked */
  onRecordClick?: (record: PropertyRowData) => void;

  /** Callback to add a new record on a specific date */
  onAddRecord?: (date: Date, propertyKey: string) => void;

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
  const [hasInitializedDate, setHasInitializedDate] = useState(false);

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

  /* Fix lint error by checking correct type literal */
  const titleProperty = useMemo(() => {
    return properties.find(prop => prop.type === 'title' || (prop.type as string) === 'rich_text') || properties[0];
  }, [properties]);

  // Convert records to calendar events
  const events: CalendarEvent[] = useMemo(() => {
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
      if (statusProperty) {
        const statusValue = record.properties?.[statusProperty.key];
        if (typeof statusValue === 'object' && statusValue !== null && 'color' in statusValue) {
          color = (statusValue as { color?: string }).color;
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
        title,
        startsAt: date,
        color,
        originalData: record
      });
    }

    return calendarEvents;
  }, [records, selectedDateProperty, statusProperty, titleProperty]);

  // Initialize currentDate to first event's date when events are loaded
  React.useEffect(() => {
    if (!hasInitializedDate && events.length > 0) {
      setCurrentDate(events[0].startsAt);
      setHasInitializedDate(true);
    }
  }, [events, hasInitializedDate]);


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

  const handleEventDrop = (event: CalendarEvent, newDate: Date) => {
    onDateChange?.(event.id, newDate, selectedDateProperty);
  }

  const handleEventClick = (event: CalendarEvent) => {
    onRecordClick?.(event.originalData);
  }

  // Use the existing CalendarEventCard for rendering
  const renderEvent = (event: CalendarEvent) => {
    // Reconstitute the pseudo-event object expected by CalendarEventCard if needed, 
    // or map props. The card likely expects { id, title, color, date ... }
    // Let's create a compatible object or pass originalData if compatible.
    // Looking at previous implementation, it constructed a custom object.

    const cardEvent = {
      id: event.id,
      title: event.title,
      color: event.color,
      date: event.startsAt,
      record: event.originalData,
      status: (event.originalData as any).status // rudimentary status access
    };

    return (
      <CalendarEventCard
        event={cardEvent}
        onClick={() => onRecordClick?.(event.originalData)}
      />
    )
  }

  // Construct custom controls
  const customControls = useMemo(() => {
    if (dateProperties.length <= 1) return null;
    return (
      <Select value={selectedDateProperty} onValueChange={setSelectedDateProperty}>
        <SelectTrigger className="w-[180px] h-8 text-xs">
          <SelectValue placeholder="Date Property" />
        </SelectTrigger>
        <SelectContent>
          {dateProperties.map(prop => (
            <SelectItem key={prop.key} value={prop.key}>
              {prop.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    )
  }, [dateProperties, selectedDateProperty]);

  return (
    <div className={className}>
      <SharedCalendar
        month={currentDate}
        events={events}
        onMonthChange={setCurrentDate}
        date={currentDate}
        onDateSelect={(d) => d && setCurrentDate(d)}
        onEventDrop={onDateChange ? handleEventDrop : undefined}
        onEventClick={handleEventClick}
        onAddEventClick={onAddRecord ? (d) => onAddRecord(d || new Date(), selectedDateProperty) : undefined}
        renderEvent={renderEvent}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        customControls={customControls}
      />
    </div>
  );
};

export default UniversalCalendarView;
