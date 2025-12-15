"use client"

import React from "react"
import { Home, Settings, RefreshCw } from "lucide-react"
import { FeatureHeader } from "@/frontend/shared/ui/layout/header"

interface OverviewHeaderProps {
  onRefresh?: () => void
  onSettings?: () => void
}

/**
 * OverviewHeader Component
 * 
 * Consistent header for the Overview feature.
 */
export function OverviewHeader({
  onRefresh,
  onSettings,
}: OverviewHeaderProps) {
  return (
    <FeatureHeader
      icon={Home}
      title="Overview"
      subtitle="Dashboard overview with analytics and insights"
      secondaryActions={[
        {
          id: "refresh",
          label: "Refresh",
          icon: RefreshCw,
          onClick: onRefresh ?? (() => {}),
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

export default OverviewHeader
