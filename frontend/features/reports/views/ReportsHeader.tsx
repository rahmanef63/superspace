"use client"

import React from "react"
import { BarChart, Plus, Settings, Download } from "lucide-react"
import { FeatureHeader } from "@/frontend/shared/ui/layout/header"

import type { Id } from "@convex/_generated/dataModel"

interface ReportsHeaderProps {
  workspaceId?: Id<"workspaces"> | null
  onCreateReport?: () => void
  onExport?: () => void
  onSettings?: () => void
}

/**
 * ReportsHeader Component
 * 
 * Consistent header for the Reports feature.
 */
export function ReportsHeader({
  workspaceId,
  onCreateReport,
  onExport,
  onSettings,
}: ReportsHeaderProps) {
  return (
    <FeatureHeader
      icon={BarChart}
      title="Reports"
      subtitle="Analytics and reporting dashboard"
      primaryAction={{
        label: "New Report",
        icon: Plus,
        onClick: onCreateReport ?? (() => { }),
      }}
      secondaryActions={[
        {
          id: "export",
          label: "Export",
          icon: Download,
          onClick: onExport ?? (() => { }),
        },
        {
          id: "settings",
          label: "Settings",
          icon: Settings,
          onClick: onSettings ?? (() => { }),
        },
      ]}
    />
  )
}

export default ReportsHeader
