"use client"

import React from "react"
import { BarChart3, Plus, Settings, Download } from "lucide-react"
import { FeatureHeader } from "@/frontend/shared/ui/layout/header"

interface AnalyticsHeaderProps {
  onCreateReport?: () => void
  onExport?: () => void
  onSettings?: () => void
}

/**
 * AnalyticsHeader Component
 * 
 * Consistent header for the Analytics feature.
 */
export function AnalyticsHeader({
  onCreateReport,
  onExport,
  onSettings,
}: AnalyticsHeaderProps) {
  return (
    <FeatureHeader
      icon={BarChart3}
      title="Analytics"
      subtitle="Monitor your business performance with real-time analytics"
      primaryAction={{
        label: "New Report",
        icon: Plus,
        onClick: onCreateReport ?? (() => {}),
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

export default AnalyticsHeader
