/**
 * UniversalTimelineView Component
 * 
 * A comprehensive timeline/Gantt view for the Universal Database system that supports:
 * - Horizontal timeline visualization with date ranges
 * - Multiple zoom levels (day, week, month, quarter, year)
 * - Drag-and-drop for repositioning
 * - Resize handles for adjusting date ranges
 * - Color coding from status properties
 * - Row grouping and hierarchy
 * - Dependency arrows (future enhancement)
 * 
 * @version 2.0
 * @since Phase 4 - Task 4.6
 */

import React, { useMemo, useState, useRef, useCallback } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { 
  format, 
  startOfDay, 
  endOfDay, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth,
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  addMonths,
  subMonths,
  differenceInDays,
  addDays,
  isSameDay,
  isWithinInterval,
  min as minDate,
  max as maxDate,
} from 'date-fns';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
// @ts-ignore - Module resolution issue workaround
import { TimelineBar } from './timeline-bar';
import { cn } from '@/lib/utils';
import type { PropertyRowData, PropertyColumnConfig } from './table-columns';

export type TimelineZoomLevel = 'day' | 'week' | 'month' | 'quarter' | 'year';

export interface TimelineRange {
  start: Date;
  end: Date;
}

export interface TimelineRecord extends PropertyRowData {
  startDate?: Date;
  endDate?: Date;
  progress?: number;
}

export interface UniversalTimelineViewProps {
  /** Array of records to display */
  records: PropertyRowData[];
  
  /** Array of properties for the records */
  properties: PropertyColumnConfig[];
  
  /** Property key for start date */
  startDateProperty?: string;
  
  /** Property key for end date */
  endDateProperty?: string;
  
  /** Property key for progress (0-100) */
  progressProperty?: string;
  
  /** Callback when a record's dates are changed */
  onDateRangeChange?: (recordId: string, startDate: Date, endDate: Date) => void;
  
  /** Callback when a record is clicked */
  onRecordClick?: (record: PropertyRowData) => void;
  
  /** Initial zoom level */
  initialZoom?: TimelineZoomLevel;
  
  /** Optional CSS class name */
  className?: string;
}

export const UniversalTimelineView: React.FC<UniversalTimelineViewProps> = ({
  records,
  properties,
  startDateProperty = 'start_date',
  endDateProperty = 'end_date',
  progressProperty = 'progress',
  onDateRangeChange,
  onRecordClick,
  initialZoom = 'month',
  className,
}) => {
  const [zoomLevel, setZoomLevel] = useState<TimelineZoomLevel>(initialZoom);
  const [viewportStart, setViewportStart] = useState(() => startOfMonth(new Date()));
  const [draggedRecord, setDraggedRecord] = useState<TimelineRecord | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Find status property for color coding
  const statusProperty = useMemo(() => {
    return properties.find(prop => prop.type === 'status' || prop.type === 'select');
  }, [properties]);

  // Find title property (first title or text property)
  const titleProperty = useMemo(() => {
    return properties.find(prop => prop.type === 'title' || prop.type === 'rich_text') || properties[0];
  }, [properties]);

  // Convert records to timeline records with date ranges
  const timelineRecords = useMemo((): TimelineRecord[] => {
    const validRecords: TimelineRecord[] = [];
    
    for (const record of records) {
      // Extract start date
      const startValue = record.properties?.[startDateProperty];
      let startDate: Date | undefined;
      if (startValue) {
        if (typeof startValue === 'number') {
          startDate = new Date(startValue);
        } else if (typeof startValue === 'string') {
          startDate = new Date(startValue);
        } else if (startValue instanceof Date) {
          startDate = startValue;
        }
      }

      // Extract end date
      const endValue = record.properties?.[endDateProperty];
      let endDate: Date | undefined;
      if (endValue) {
        if (typeof endValue === 'number') {
          endDate = new Date(endValue);
        } else if (typeof endValue === 'string') {
          endDate = new Date(endValue);
        } else if (endValue instanceof Date) {
          endDate = endValue;
        }
      }

      // Extract progress
      const progressValue = record.properties?.[progressProperty];
      let progress: number | undefined;
      if (typeof progressValue === 'number') {
        progress = Math.max(0, Math.min(100, progressValue));
      }

      // Skip records without valid date ranges
      if (!startDate || !endDate || isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        continue;
      }

      // Ensure start is before end
      if (startDate > endDate) {
        [startDate, endDate] = [endDate, startDate];
      }

      validRecords.push({
        ...record,
        startDate,
        endDate,
        progress,
      });
    }

    return validRecords;
  }, [records, startDateProperty, endDateProperty, progressProperty]);

  // Calculate overall timeline range from all records
  const timelineRange = useMemo<TimelineRange>(() => {
    if (timelineRecords.length === 0) {
      const now = new Date();
      return {
        start: startOfMonth(now),
        end: endOfMonth(addMonths(now, 2)),
      };
    }

    const allDates = timelineRecords.flatMap(r => [r.startDate!, r.endDate!]);
    const earliest = minDate(allDates);
    const latest = maxDate(allDates);

    // Add padding
    return {
      start: startOfMonth(subMonths(earliest, 1)),
      end: endOfMonth(addMonths(latest, 1)),
    };
  }, [timelineRecords]);

  // Calculate viewport range based on zoom level
  const viewportRange = useMemo<TimelineRange>(() => {
    let end: Date;
    
    switch (zoomLevel) {
      case 'day':
        end = addDays(viewportStart, 30);
        break;
      case 'week':
        end = addMonths(viewportStart, 3);
        break;
      case 'month':
        end = addMonths(viewportStart, 6);
        break;
      case 'quarter':
        end = addMonths(viewportStart, 12);
        break;
      case 'year':
        end = addMonths(viewportStart, 24);
        break;
    }

    return { start: viewportStart, end };
  }, [viewportStart, zoomLevel]);

  // Generate timeline segments based on zoom level
  const timelineSegments = useMemo(() => {
    const { start, end } = viewportRange;

    switch (zoomLevel) {
      case 'day':
        return eachDayOfInterval({ start, end }).map(date => ({
          date,
          label: format(date, 'd'),
          sublabel: format(date, 'EEE'),
          isHeader: date.getDate() === 1,
        }));
      
      case 'week':
        return eachWeekOfInterval({ start, end }).map(date => ({
          date,
          label: format(date, 'w'),
          sublabel: format(date, 'MMM'),
          isHeader: date.getMonth() !== addDays(date, -7).getMonth(),
        }));
      
      case 'month':
      case 'quarter':
        return eachMonthOfInterval({ start, end }).map(date => ({
          date,
          label: format(date, 'MMM'),
          sublabel: format(date, 'yyyy'),
          isHeader: date.getMonth() === 0,
        }));
      
      case 'year':
        return eachMonthOfInterval({ start, end })
          .filter(date => date.getMonth() % 3 === 0)
          .map(date => ({
            date,
            label: format(date, 'QQQ'),
            sublabel: format(date, 'yyyy'),
            isHeader: date.getMonth() === 0,
          }));
    }
  }, [viewportRange, zoomLevel]);

  // Calculate pixel width for each time segment
  const segmentWidth = useMemo(() => {
    switch (zoomLevel) {
      case 'day': return 40;
      case 'week': return 60;
      case 'month': return 80;
      case 'quarter': return 100;
      case 'year': return 120;
    }
  }, [zoomLevel]);

  // Calculate total timeline width
  const timelineWidth = timelineSegments.length * segmentWidth;

  // Convert date to pixel position
  const dateToPixel = useCallback((date: Date): number => {
    const daysSinceStart = differenceInDays(date, viewportRange.start);
    const totalDays = differenceInDays(viewportRange.end, viewportRange.start);
    return (daysSinceStart / totalDays) * timelineWidth;
  }, [viewportRange, timelineWidth]);

  // Convert pixel position to date
  const pixelToDate = useCallback((pixel: number): Date => {
    const totalDays = differenceInDays(viewportRange.end, viewportRange.start);
    const dayOffset = (pixel / timelineWidth) * totalDays;
    return addDays(viewportRange.start, Math.round(dayOffset));
  }, [viewportRange, timelineWidth]);

  // Navigation functions
  const navigatePrevious = () => {
    switch (zoomLevel) {
      case 'day':
        setViewportStart(subMonths(viewportStart, 1));
        break;
      case 'week':
        setViewportStart(subMonths(viewportStart, 2));
        break;
      case 'month':
      case 'quarter':
        setViewportStart(subMonths(viewportStart, 3));
        break;
      case 'year':
        setViewportStart(subMonths(viewportStart, 6));
        break;
    }
  };

  const navigateNext = () => {
    switch (zoomLevel) {
      case 'day':
        setViewportStart(addMonths(viewportStart, 1));
        break;
      case 'week':
        setViewportStart(addMonths(viewportStart, 2));
        break;
      case 'month':
      case 'quarter':
        setViewportStart(addMonths(viewportStart, 3));
        break;
      case 'year':
        setViewportStart(addMonths(viewportStart, 6));
        break;
    }
  };

  const fitToView = () => {
    if (timelineRecords.length > 0) {
      setViewportStart(timelineRange.start);
    }
  };

  const zoomIn = () => {
    const levels: TimelineZoomLevel[] = ['year', 'quarter', 'month', 'week', 'day'];
    const currentIndex = levels.indexOf(zoomLevel);
    if (currentIndex < levels.length - 1) {
      setZoomLevel(levels[currentIndex + 1]);
    }
  };

  const zoomOut = () => {
    const levels: TimelineZoomLevel[] = ['day', 'week', 'month', 'quarter', 'year'];
    const currentIndex = levels.indexOf(zoomLevel);
    if (currentIndex < levels.length - 1) {
      setZoomLevel(levels[currentIndex + 1]);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (event: DragStartEvent) => {
    const recordId = event.active.id as string;
    const record = timelineRecords.find(r => r.id === recordId);
    if (record) {
      setDraggedRecord(record);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    
    if (delta.x !== 0 && onDateRangeChange && draggedRecord) {
      const recordId = active.id as string;
      const daysDelta = Math.round((delta.x / timelineWidth) * differenceInDays(viewportRange.end, viewportRange.start));
      
      const newStartDate = addDays(draggedRecord.startDate!, daysDelta);
      const newEndDate = addDays(draggedRecord.endDate!, daysDelta);
      
      onDateRangeChange(recordId, newStartDate, newEndDate);
    }

    setDraggedRecord(null);
  };

  // Get color for record
  const getRecordColor = (record: TimelineRecord): string => {
    if (statusProperty) {
      const statusValue = record.properties?.[statusProperty.key];
      if (typeof statusValue === 'object' && statusValue !== null && 'color' in statusValue) {
        return (statusValue as { color?: string }).color || '#6366f1';
      }
    }
    return '#6366f1';
  };

  // Get title for record
  const getRecordTitle = (record: TimelineRecord): string => {
    if (!titleProperty) return record.id;
    
    const titleValue = record.properties?.[titleProperty.key];
    if (typeof titleValue === 'string') {
      return titleValue;
    } else if (titleValue && typeof titleValue === 'object' && 'text' in titleValue) {
      return (titleValue as { text: string }).text;
    }
    return record.id;
  };

  if (timelineRecords.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-[400px]">
          <div className="text-center space-y-2">
            <Maximize2 className="h-12 w-12 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">
              No records with date ranges found. Add start and end date properties to use the timeline view.
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
            <CardTitle className="text-2xl">Timeline</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={navigatePrevious}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={fitToView}>
                <Maximize2 className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={navigateNext}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <Button variant="outline" size="sm" onClick={zoomOut} disabled={zoomLevel === 'year'}>
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Select value={zoomLevel} onValueChange={(value) => setZoomLevel(value as TimelineZoomLevel)}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Day</SelectItem>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                  <SelectItem value="quarter">Quarter</SelectItem>
                  <SelectItem value="year">Year</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={zoomIn} disabled={zoomLevel === 'day'}>
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex flex-col h-[600px]">
            {/* Timeline header */}
            <ScrollArea className="border-b" ref={scrollRef}>
              <div style={{ width: timelineWidth }} className="flex">
                {timelineSegments.map((segment, index) => (
                  <div
                    key={index}
                    style={{ width: segmentWidth }}
                    className={cn(
                      'flex-shrink-0 border-r border-border p-2 text-center',
                      segment.isHeader && 'bg-muted font-semibold'
                    )}
                  >
                    <div className="text-xs font-medium">{segment.label}</div>
                    <div className="text-[10px] text-muted-foreground">{segment.sublabel}</div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Timeline body */}
            <ScrollArea className="flex-1">
              <div style={{ width: timelineWidth, minHeight: timelineRecords.length * 60 }} className="relative">
                {/* Grid lines */}
                {timelineSegments.map((segment, index) => (
                  <div
                    key={index}
                    style={{
                      left: index * segmentWidth,
                      width: segmentWidth,
                    }}
                    className="absolute top-0 bottom-0 border-r border-border/50"
                  />
                ))}

                {/* Today indicator */}
                {isWithinInterval(new Date(), viewportRange) && (
                  <div
                    style={{
                      left: dateToPixel(new Date()),
                    }}
                    className="absolute top-0 bottom-0 w-0.5 bg-primary z-10"
                  >
                    <div className="absolute -top-1 -left-2 w-4 h-4 bg-primary rounded-full" />
                  </div>
                )}

                {/* Timeline bars */}
                {timelineRecords.map((record, index) => {
                  const left = dateToPixel(record.startDate!);
                  const right = dateToPixel(record.endDate!);
                  const width = right - left;
                  const top = index * 60 + 10;

                  return (
                    <TimelineBar
                      key={record.id}
                      record={record}
                      left={left}
                      width={width}
                      top={top}
                      color={getRecordColor(record)}
                      title={getRecordTitle(record)}
                      progress={record.progress}
                      onClick={() => onRecordClick?.(record)}
                      isDraggable={!!onDateRangeChange}
                    />
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
    </DndContext>
  );
};

export default UniversalTimelineView;
