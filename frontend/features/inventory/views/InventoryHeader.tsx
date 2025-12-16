"use client"

import React from "react"
import { Package, Plus, BarChart3 } from "lucide-react"
import { FeatureHeader, FeatureHeaderActions } from "@/frontend/shared/ui/layout/header"

interface InventoryHeaderProps {
  onAddProduct?: () => void
  onViewReports?: () => void
}

/**
 * InventoryHeader Component
 * 
 * Consistent header for the Inventory Management feature.
 * Uses FeatureHeaderActions for Settings and AI Assistant buttons.
 */
export function InventoryHeader({
  onAddProduct,
  onViewReports,
}: InventoryHeaderProps) {
  return (
    <FeatureHeader
      icon={Package}
      title="Inventory Management"
      subtitle="Comprehensive inventory management with multi-warehouse support"
      primaryAction={{
        label: "Add Product",
        icon: Plus,
        onClick: onAddProduct ?? (() => { }),
      }}
      secondaryActions={[
        {
          id: "reports",
          label: "Reports",
          icon: BarChart3,
          onClick: onViewReports ?? (() => { }),
        },
      ]}
    >
      <FeatureHeaderActions
        featureSlug="inventory"
        showSettings={true}
        showAgent={true}
      />
    </FeatureHeader>
  )
}

export default InventoryHeader

