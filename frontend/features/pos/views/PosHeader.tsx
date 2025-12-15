"use client"

import React from "react"
import { ShoppingCart, Plus, Settings, BarChart3 } from "lucide-react"
import { FeatureHeader } from "@/frontend/shared/ui/layout/header"

interface PosHeaderProps {
  onNewSale?: () => void
  onViewReports?: () => void
  onSettings?: () => void
}

/**
 * PosHeader Component
 * 
 * Consistent header for the POS feature.
 */
export function PosHeader({
  onNewSale,
  onViewReports,
  onSettings,
}: PosHeaderProps) {
  return (
    <FeatureHeader
      icon={ShoppingCart}
      title="POS"
      subtitle="Point of Sale and retail management"
      primaryAction={{
        label: "New Sale",
        icon: Plus,
        onClick: onNewSale ?? (() => {}),
      }}
      secondaryActions={[
        {
          id: "reports",
          label: "Reports",
          icon: BarChart3,
          onClick: onViewReports ?? (() => {}),
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

export default PosHeader
