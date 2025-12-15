"use client"

import React from "react"
import { LineChart, Plus, Settings, Download } from "lucide-react"
import { FeatureHeader } from "@/frontend/shared/ui/layout/header"

interface BiHeaderProps {
  onCreateDashboard?: () => void
  onExport?: () => void
  onSettings?: () => void
}

/**
 * BiHeader Component
 * 
 * Consistent header for the Business Intelligence feature.
 */
export function BiHeader({
  onCreateDashboard,
  onExport,
  onSettings,
}: BiHeaderProps) {
  return (
    <FeatureHeader
      icon={LineChart}
      title="Business Intelligence"
      subtitle="Advanced analytics and business intelligence"
      primaryAction={{
        label: "New Dashboard",
        icon: Plus,
        onClick: onCreateDashboard ?? (() => {}),
      }}
      secondaryActions={[
        {
          id: "export",
          label: "Export",
          icon: Download,
          onClick: onExport ?? (() => {}),
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

export default BiHeader
