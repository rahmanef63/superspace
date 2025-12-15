"use client"

import React from "react"
import { Package, Plus, Settings, BarChart3 } from "lucide-react"
import { FeatureHeader } from "@/frontend/shared/ui/layout/header"

interface InventoryHeaderProps {
  onAddProduct?: () => void
  onViewReports?: () => void
  onSettings?: () => void
}

/**
 * InventoryHeader Component
 * 
 * Consistent header for the Inventory Management feature.
 */
export function InventoryHeader({
  onAddProduct,
  onViewReports,
  onSettings,
}: InventoryHeaderProps) {
  return (
    <FeatureHeader
      icon={Package}
      title="Inventory Management"
      subtitle="Comprehensive inventory management with multi-warehouse support"
      primaryAction={{
        label: "Add Product",
        icon: Plus,
        onClick: onAddProduct ?? (() => {}),
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

export default InventoryHeader
