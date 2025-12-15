"use client"

import React from "react"
import { CheckCircle, Plus, Settings, Filter } from "lucide-react"
import { FeatureHeader } from "@/frontend/shared/ui/layout/header"

interface ApprovalsHeaderProps {
  onCreateApproval?: () => void
  onFilter?: () => void
  onSettings?: () => void
}

/**
 * ApprovalsHeader Component
 * 
 * Consistent header for the Approvals feature.
 */
export function ApprovalsHeader({
  onCreateApproval,
  onFilter,
  onSettings,
}: ApprovalsHeaderProps) {
  return (
    <FeatureHeader
      icon={CheckCircle}
      title="Approvals"
      subtitle="Approval workflows and request management"
      primaryAction={{
        label: "New Request",
        icon: Plus,
        onClick: onCreateApproval ?? (() => {}),
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

export default ApprovalsHeader
