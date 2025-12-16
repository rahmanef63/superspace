"use client"

import React from "react"
import { CheckSquare, Plus, Filter } from "lucide-react"
import { FeatureHeader, FeatureHeaderActions } from "@/frontend/shared/ui/layout/header"

interface TasksHeaderProps {
  onCreateTask?: () => void
  onFilter?: () => void
}

/**
 * TasksHeader Component
 * 
 * Consistent header for the Tasks feature.
 * Uses FeatureHeaderActions for Settings and AI Assistant buttons.
 */
export function TasksHeader({
  onCreateTask,
  onFilter,
}: TasksHeaderProps) {
  return (
    <FeatureHeader
      icon={CheckSquare}
      title="Tasks"
      subtitle="Task management and tracking"
      primaryAction={{
        label: "New Task",
        icon: Plus,
        onClick: onCreateTask ?? (() => { }),
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
        featureSlug="tasks"
        showSettings={true}
        showAgent={true}
      />
    </FeatureHeader>
  )
}

export default TasksHeader

