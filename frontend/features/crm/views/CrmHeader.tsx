"use client"

import React from "react"
import { Users, Plus, Settings, Download } from "lucide-react"
import { FeatureHeader } from "@/frontend/shared/ui/layout/header"

interface CrmHeaderProps {
  onAddContact?: () => void
  onExport?: () => void
  onSettings?: () => void
}

/**
 * CrmHeader Component
 * 
 * Consistent header for the CRM feature.
 */
export function CrmHeader({
  onAddContact,
  onExport,
  onSettings,
}: CrmHeaderProps) {
  return (
    <FeatureHeader
      icon={Users}
      title="CRM & Sales"
      subtitle="Customer Relationship Management with contacts, leads, opportunities, and sales pipeline"
      primaryAction={{
        label: "Add Contact",
        icon: Plus,
        onClick: onAddContact ?? (() => {}),
      }}
      secondaryActions={[
        {
          id: "export",
          label: "Export",
          icon: Download,
          onClick: onExport ?? (() => {}),
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

export default CrmHeader
