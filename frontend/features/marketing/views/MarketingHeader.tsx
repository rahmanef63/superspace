"use client"

import React from "react"
import { Megaphone, Plus, Settings, Target } from "lucide-react"
import { FeatureHeader } from "@/frontend/shared/ui/layout/header"

interface MarketingHeaderProps {
  onCreateCampaign?: () => void
  onViewAnalytics?: () => void
  onSettings?: () => void
}

/**
 * MarketingHeader Component
 * 
 * Consistent header for the Marketing feature.
 */
export function MarketingHeader({
  onCreateCampaign,
  onViewAnalytics,
  onSettings,
}: MarketingHeaderProps) {
  return (
    <FeatureHeader
      icon={Megaphone}
      title="Marketing"
      subtitle="Marketing automation and campaign management"
      primaryAction={{
        label: "New Campaign",
        icon: Plus,
        onClick: onCreateCampaign ?? (() => {}),
      }}
      secondaryActions={[
        {
          id: "analytics",
          label: "Analytics",
          icon: Target,
          onClick: onViewAnalytics ?? (() => {}),
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

export default MarketingHeader
