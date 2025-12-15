/**
 * Universal Calendar View
 *
 * Refactored to use the shared Calendar component.
 */

import React, { useMemo, useState } from "react";
import {
  CalendarProvider,
  CalendarHeader,
  CalendarBody,
  CalendarDatePagination,
  CalendarMonthPicker,
  CalendarYearPicker,
  CalendarDatePicker,
  CalendarItem,
  type Feature,
} from "@/frontend/shared/components/views/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Settings2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PropertyRowData, PropertyColumnConfig } from "./table-columns";
import { getPropertyConfig } from "./table-columns";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { BoardCard } from "./board-card"; // Reusing card display for hover

export interface UniversalCalendarViewProps {
  /** Calendar data rows */
  data: PropertyRowData[];

  /** Property column configurations */
  properties: PropertyColumnConfig[];

  /** Property key to use for date */
  dateProperty?: string;

  /** Property key to use as title */
  titleProperty?: string;

  /** Callback when event is clicked */
  onEventClick?: (eventId: string) => void;

  /** Callback when date property changes */
  onDatePropertyChange?: (propertyKey: string) => void;

  /** Custom CSS class */
  className?: string;

  /** Callback to add a new row */
  onAddRow?: (data?: Partial<Record<string, any>>) => Promise<void>;
}

export function UniversalCalendarView({
  data,
  properties,
  dateProperty,
  titleProperty,
  onEventClick,
  onDatePropertyChange,
  className,
  onAddRow,
}: UniversalCalendarViewProps) {
  // Get date properties to select from
  const dateProperties = useMemo(
    () => properties.filter((p) => p.type === "date"),
    [properties]
  );

  // Default to first date property if none selected
  const activeDateProperty = dateProperty || dateProperties[0]?.key;

  // Find status property for coloring
  const statusProperty = useMemo(
    () => properties.find((p) => p.type === "status" || p.type === "select"),
    [properties]
  );

  // Transform data to Calendar Feature format
  const features = useMemo<Feature[]>(() => {
    if (!activeDateProperty || !data) return [];

    return data
      .map((row) => {
        const dateValue = row.properties[activeDateProperty];
        let startDate: Date | undefined;
        let endDate: Date | undefined;

        if (!dateValue) return null;

        if (typeof dateValue === "number" || typeof dateValue === "string") {
          startDate = new Date(dateValue);
          endDate = new Date(dateValue); // Default to single day
        } else if (dateValue instanceof Date) {
          startDate = dateValue;
          endDate = dateValue;
        }
        // TODO: Handle range dates if custom property structure supports it
        // For now assuming single date or standard simple date

        if (!startDate || isNaN(startDate.getTime())) return null;

        // Get title
        let title = row.id;
        if (titleProperty) {
          const tVal = row.properties[titleProperty];
          if (typeof tVal === "string") title = tVal;
          else if (tVal && typeof tVal === "object" && "text" in tVal) title = (tVal as { text: string }).text;
        } else {
          // Fallback to first title property
          const firstTitleProp = properties.find(p => p.type === 'title');
          if (firstTitleProp) {
            const tVal = row.properties[firstTitleProp.key];
            if (typeof tVal === "string") title = tVal;
            else if (tVal && typeof tVal === "object" && "text" in tVal) title = (tVal as { text: string }).text;
          }
        }

        // Get status color
        let color = "#3b82f6"; // Default blue
        let statusName = "No Status";
        if (statusProperty) {
          const sVal = row.properties[statusProperty.key];
          if (sVal && typeof sVal === "object" && "color" in sVal) {
            color = (sVal as { color?: string }).color || color;
            statusName = (sVal as { name?: string }).name || statusName;
          } else if (typeof sVal === "string") {
            statusName = sVal;
          }
        }

        return {
          id: row.id,
          name: title,
          startAt: startDate,
          endAt: endDate,
          status: {
            id: statusName,
            name: statusName,
            color,
          },
          originalData: row, // Keep original for hover card
        };
      })
      .filter((f): f is Feature & { originalData: PropertyRowData } => f !== null);
  }, [data, activeDateProperty, statusProperty, properties, titleProperty]);

  if (!activeDateProperty && dateProperties.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-muted-foreground">
        No date properties found in this database. Add a date property to use the Calendar view.
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-2 p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Date:</span>
            <Select
              value={activeDateProperty}
              onValueChange={onDatePropertyChange}
              disabled={!onDatePropertyChange || dateProperties.length <= 1}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select date property" />
              </SelectTrigger>
              <SelectContent>
                {dateProperties.map((prop) => (
                  <SelectItem key={prop.key} value={prop.key}>
                    {prop.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button size="sm" onClick={() => onAddRow?.()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        </div>

        <Button variant="outline" size="sm">
          <Settings2 className="h-4 w-4 mr-2" />
          View settings
        </Button>
      </div>

      <div className="flex-1 overflow-hidden p-4">
        <CalendarProvider className="h-full border rounded-md bg-background shadow-sm">
          <div className="flex items-center justify-between border-b p-3">
            <CalendarDatePicker>
              <CalendarMonthPicker />
              <CalendarYearPicker start={2020} end={2030} />
            </CalendarDatePicker>
            <CalendarDatePagination />
          </div>
          <CalendarHeader />
          <CalendarBody features={features}>
            {({ feature }) => (
              <HoverCard>
                <HoverCardTrigger asChild>
                  <div
                    className="cursor-pointer"
                    onClick={(e) => {
                      // e.stopPropagation(); // Might interfere with HoverCard?
                      onEventClick?.(feature.id);
                    }}
                  >
                    <CalendarItem feature={feature} className="p-1 rounded-sm hover:bg-muted/50 text-xs transition-colors cursor-pointer" />
                  </div>
                </HoverCardTrigger>
                <HoverCardContent className="w-80 p-0" align="start">
                  {/* We reuse BoardCard's rendering logic or simpler card */}
                  <div className="p-4">
                    <h4 className="font-semibold text-sm mb-2">{feature.name}</h4>
                    <div className="text-xs text-muted-foreground mb-3">
                      {feature.startAt.toLocaleDateString()}
                    </div>
                    {/* Simple rendering of properties */}
                    <div className="space-y-1">
                      {(feature as any).originalData && properties.slice(0, 3).map((prop) => {
                        if (prop.key === (feature as any).originalData.id) return null; // Skip if title handled?
                        const val = (feature as any).originalData.properties[prop.key];
                        if (!val) return null;
                        return (
                          <div key={prop.key} className="flex gap-2 text-xs">
                            <span className="text-muted-foreground w-20 truncate">{prop.name}:</span>
                            <span className="truncate flex-1">
                              {typeof val === 'object' && 'name' in val ? (val as any).name : String(val)}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
            )}
          </CalendarBody>
        </CalendarProvider>
      </div>
    </div>
  );
}

export default UniversalCalendarView;
