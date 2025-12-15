"use client"

import React from "react"
import { Workflow, Plus, Settings, Play } from "lucide-react"
import { FeatureHeader } from "@/frontend/shared/ui/layout/header"

interface AutomationHeaderProps {
  onCreateWorkflow?: () => void
  onRunAll?: () => void
  onSettings?: () => void
}

/**
 * AutomationHeader Component
 * 
 * Consistent header for the Automation feature.
 */
export function AutomationHeader({
  onCreateWorkflow,
  onRunAll,
  onSettings,
}: AutomationHeaderProps) {
  return (
    <FeatureHeader
      icon={Workflow}
      title="Automation"
      subtitle="Automate workflows and processes with visual builders"
      primaryAction={{
        label: "New Workflow",
        icon: Plus,
        onClick: onCreateWorkflow ?? (() => {}),
      }}
      secondaryActions={[
        {
          id: "run-all",
          label: "Run All",
          icon: Play,
          onClick: onRunAll ?? (() => {}),
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

export default AutomationHeader
