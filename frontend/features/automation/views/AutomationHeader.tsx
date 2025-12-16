"use client"

import React from "react"
import { Workflow, Plus, Play } from "lucide-react"
import { FeatureHeader, FeatureHeaderActions } from "@/frontend/shared/ui/layout/header"

interface AutomationHeaderProps {
  onCreateWorkflow?: () => void
  onRunAll?: () => void
}

/**
 * AutomationHeader Component
 * 
 * Consistent header for the Automation feature.
 * Uses FeatureHeaderActions for Settings and AI Assistant buttons.
 */
export function AutomationHeader({
  onCreateWorkflow,
  onRunAll,
}: AutomationHeaderProps) {
  return (
    <FeatureHeader
      icon={Workflow}
      title="Automation"
      subtitle="Automate workflows and processes with visual builders"
      primaryAction={{
        label: "New Workflow",
        icon: Plus,
        onClick: onCreateWorkflow ?? (() => { }),
      }}
      secondaryActions={[
        {
          id: "run-all",
          label: "Run All",
          icon: Play,
          onClick: onRunAll ?? (() => { }),
        },
      ]}
    >
      <FeatureHeaderActions
        featureSlug="automation"
        showSettings={true}
        showAgent={true}
      />
    </FeatureHeader>
  )
}

export default AutomationHeader

