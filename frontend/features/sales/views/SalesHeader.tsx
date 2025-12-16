"use client"

import React from "react"
import { DollarSign, Plus, TrendingUp } from "lucide-react"
import { FeatureHeader, FeatureHeaderActions } from "@/frontend/shared/ui/layout/header"

interface SalesHeaderProps {
  onNewDeal?: () => void
  onViewPipeline?: () => void
}

/**
 * SalesHeader Component
 * 
 * Consistent header for the Sales feature.
 * Uses FeatureHeaderActions for Settings and AI Assistant buttons.
 */
export function SalesHeader({
  onNewDeal,
  onViewPipeline,
}: SalesHeaderProps) {
  return (
    <FeatureHeader
      icon={DollarSign}
      title="Sales"
      subtitle="Sales management and pipeline tracking"
      primaryAction={{
        label: "New Deal",
        icon: Plus,
        onClick: onNewDeal ?? (() => { }),
      }}
      secondaryActions={[
        {
          id: "pipeline",
          label: "Pipeline",
          icon: TrendingUp,
          onClick: onViewPipeline ?? (() => { }),
        },
      ]}
    >
      <FeatureHeaderActions
        featureSlug="sales"
        showSettings={true}
        showAgent={true}
      />
    </FeatureHeader>
  )
}

export default SalesHeader

