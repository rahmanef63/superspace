"use client"

import React from "react"
import { Home, RefreshCcw } from "lucide-react"
import { FeatureHeader, FeatureHeaderActions } from "@/frontend/shared/ui/layout/header"

interface OverviewHeaderProps {
  onRefresh?: () => void
}

/**
 * OverviewHeader Component
 * 
 * Consistent header for the Overview feature.
 * Uses FeatureHeaderActions for Settings and AI Assistant buttons.
 */
export function OverviewHeader({
  onRefresh,
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
          icon: RefreshCcw,
          onClick: onRefresh ?? (() => {}),
        },
      ]}
    >
      {/* Feature Settings & AI Assistant */}
      <FeatureHeaderActions 
        featureSlug="overview"
        showSettings={true}
        showAgent={true}
      />
    </FeatureHeader>
  )
}

export default OverviewHeader
