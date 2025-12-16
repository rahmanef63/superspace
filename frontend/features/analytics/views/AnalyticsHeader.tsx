"use client"

import React from "react"
import { BarChart3, Plus, Download } from "lucide-react"
import { FeatureHeader, FeatureHeaderActions } from "@/frontend/shared/ui/layout/header"

interface AnalyticsHeaderProps {
  onCreateReport?: () => void
  onExport?: () => void
}

/**
 * AnalyticsHeader Component
 * 
 * Consistent header for the Analytics feature.
 * Uses FeatureHeaderActions for Settings and AI Assistant buttons.
 */
export function AnalyticsHeader({
  onCreateReport,
  onExport,
}: AnalyticsHeaderProps) {
  return (
    <FeatureHeader
      icon={BarChart3}
      title="Analytics"
      subtitle="Monitor your business performance with real-time analytics"
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
      ]}
    >
      <FeatureHeaderActions
        featureSlug="analytics"
        showSettings={true}
        showAgent={true}
      />
    </FeatureHeader>
  )
}

export default AnalyticsHeader

