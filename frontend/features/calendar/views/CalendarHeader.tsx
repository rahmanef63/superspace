"use client"

import React from "react"
import { Calendar, Plus, Settings, Filter } from "lucide-react"
import { FeatureHeader } from "@/frontend/shared/ui/layout/header"

interface CalendarHeaderProps {
  onCreateEvent?: () => void
  onFilter?: () => void
  onSettings?: () => void
}

/**
 * CalendarHeader Component
 * 
 * Consistent header for the Calendar feature.
 */
export function CalendarHeader({
  onCreateEvent,
  onFilter,
  onSettings,
}: CalendarHeaderProps) {
  return (
    <FeatureHeader
      icon={Calendar}
      title="Calendar"
      subtitle="Team calendar with event management and scheduling"
      primaryAction={{
        label: "New Event",
        icon: Plus,
        onClick: onCreateEvent ?? (() => {}),
      }}
      secondaryActions={[
        {
          id: "filter",
          label: "Filter",
          icon: Filter,
          onClick: onFilter ?? (() => {}),
        },
        {
          id: "settings",
          label: "Settings",
          icon: Settings,
          onClick: onSettings ?? (() => {}),
        },
      ]}
    />
  )
}

export default CalendarHeader
