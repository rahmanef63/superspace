"use client"

import React from "react"
import { CheckSquare, Plus, Settings, Filter } from "lucide-react"
import { FeatureHeader } from "@/frontend/shared/ui/layout/header"

interface TasksHeaderProps {
  onCreateTask?: () => void
  onFilter?: () => void
  onSettings?: () => void
}

/**
 * TasksHeader Component
 * 
 * Consistent header for the Tasks feature.
 */
export function TasksHeader({
  onCreateTask,
  onFilter,
  onSettings,
}: TasksHeaderProps) {
  return (
    <FeatureHeader
      icon={CheckSquare}
      title="Tasks"
      subtitle="Task management and tracking"
      primaryAction={{
        label: "New Task",
        icon: Plus,
        onClick: onCreateTask ?? (() => {}),
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

export default TasksHeader
