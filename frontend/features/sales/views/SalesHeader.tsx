"use client"

import React from "react"
import { DollarSign, Plus, Settings, TrendingUp } from "lucide-react"
import { FeatureHeader } from "@/frontend/shared/ui/layout/header"

interface SalesHeaderProps {
  onNewDeal?: () => void
  onViewPipeline?: () => void
  onSettings?: () => void
}

/**
 * SalesHeader Component
 * 
 * Consistent header for the Sales feature.
 */
export function SalesHeader({
  onNewDeal,
  onViewPipeline,
  onSettings,
}: SalesHeaderProps) {
  return (
    <FeatureHeader
      icon={DollarSign}
      title="Sales"
      subtitle="Sales management and pipeline tracking"
      primaryAction={{
        label: "New Deal",
        icon: Plus,
        onClick: onNewDeal ?? (() => {}),
      }}
      secondaryActions={[
        {
          id: "pipeline",
          label: "Pipeline",
          icon: TrendingUp,
          onClick: onViewPipeline ?? (() => {}),
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

export default SalesHeader
