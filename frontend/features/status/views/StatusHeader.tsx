"use client"

import React from "react"
import { Camera, Plus, Settings } from "lucide-react"
import { FeatureHeader } from "@/frontend/shared/ui/layout/header"

interface StatusHeaderProps {
  onCreateStatus?: () => void
  onSettings?: () => void
}

/**
 * StatusHeader Component
 * 
 * Consistent header for the Status feature.
 */
export function StatusHeader({
  onCreateStatus,
  onSettings,
}: StatusHeaderProps) {
  return (
    <FeatureHeader
      icon={Camera}
      title="Status"
      subtitle="Share status updates with your team"
      primaryAction={{
        label: "New Status",
        icon: Plus,
        onClick: onCreateStatus ?? (() => {}),
      }}
      secondaryActions={[
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

export default StatusHeader
