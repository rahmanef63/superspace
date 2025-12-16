"use client"

import React from "react"
import { Calendar, Plus, Filter } from "lucide-react"
import { FeatureHeader, FeatureHeaderActions } from "@/frontend/shared/ui/layout/header"

interface CalendarHeaderProps {
  onCreateEvent?: () => void
  onFilter?: () => void
}

/**
 * CalendarHeader Component
 * 
 * Consistent header for the Calendar feature.
 * Uses FeatureHeaderActions for Settings and AI Assistant buttons.
 */
export function CalendarHeader({
  onCreateEvent,
  onFilter,
}: CalendarHeaderProps) {
  return (
    <FeatureHeader
      icon={Calendar}
      title="Calendar"
      subtitle="Team calendar with event management and scheduling"
      primaryAction={{
        label: "New Event",
        icon: Plus,
        onClick: onCreateEvent ?? (() => { }),
      }}
      secondaryActions={[
        {
          id: "filter",
          label: "Filter",
          icon: Filter,
          onClick: onFilter ?? (() => { }),
        },
      ]}
    >
      {/* Feature Settings & AI Assistant */}
      <FeatureHeaderActions
        featureSlug="calendar"
        showSettings={true}
        showAgent={true}
      />
    </FeatureHeader>
  )
}

export default CalendarHeader

