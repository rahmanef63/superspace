"use client";

import {
  CalendarProvider,
  CalendarDate,
  CalendarDatePicker,
  CalendarYearPicker,
  CalendarMonthPicker,
  CalendarDatePagination,
  CalendarHeader,
  CalendarBody,
  CalendarItem,
} from "@/components/kibo-ui/calendar";
import type { DatabaseFeature } from "../../types";

interface CalendarFeature extends DatabaseFeature {
  startAt: Date;
}

export interface DatabaseCalendarViewProps {
  features: DatabaseFeature[];
  years: {
    earliest: number;
    latest: number;
  };
}

export function DatabaseCalendarView({
  features,
  years,
}: DatabaseCalendarViewProps) {
  const calendarFeatures: CalendarFeature[] = features
    .filter((feature): feature is CalendarFeature => Boolean(feature.startAt))
    .map((feature) => ({
      ...feature,
      startAt: feature.startAt!,
    }));

  return (
    <CalendarProvider>
      <CalendarDate>
        <CalendarDatePicker>
          <CalendarMonthPicker />
          <CalendarYearPicker start={years.earliest} end={years.latest} />
        </CalendarDatePicker>
        <CalendarDatePagination />
      </CalendarDate>
      <CalendarHeader />
      <CalendarBody features={calendarFeatures}>
        {({ feature }) => (
          <CalendarItem feature={feature} key={feature.id}>
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium">{feature.name}</span>
              {feature.status ? (
                <span className="text-xs text-muted-foreground">
                  {feature.status.name}
                </span>
              ) : null}
            </div>
          </CalendarItem>
        )}
      </CalendarBody>
    </CalendarProvider>
  );
}
