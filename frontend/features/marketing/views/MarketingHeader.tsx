"use client"

import React from "react"
import { Megaphone, Plus, Target } from "lucide-react"
import { FeatureHeader, FeatureHeaderActions } from "@/frontend/shared/ui/layout/header"

interface MarketingHeaderProps {
  onCreateCampaign?: () => void
  onViewAnalytics?: () => void
}

/**
 * MarketingHeader Component
 * 
 * Consistent header for the Marketing feature.
 * Uses FeatureHeaderActions for Settings and AI Assistant buttons.
 */
export function MarketingHeader({
  onCreateCampaign,
  onViewAnalytics,
}: MarketingHeaderProps) {
  return (
    <FeatureHeader
      icon={Megaphone}
      title="Marketing"
      subtitle="Marketing automation and campaign management"
      primaryAction={{
        label: "New Campaign",
        icon: Plus,
        onClick: onCreateCampaign ?? (() => { }),
      }}
      secondaryActions={[
        {
          id: "analytics",
          label: "Analytics",
          icon: Target,
          onClick: onViewAnalytics ?? (() => { }),
        },
      ]}
    >
      <FeatureHeaderActions
        featureSlug="marketing"
        showSettings={true}
        showAgent={true}
      />
    </FeatureHeader>
  )
}

export default MarketingHeader

