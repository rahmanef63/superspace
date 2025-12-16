"use client"

import React from "react"
import { Users, Plus, Download } from "lucide-react"
import { FeatureHeader, FeatureHeaderActions } from "@/frontend/shared/ui/layout/header"

interface CrmHeaderProps {
  onAddContact?: () => void
  onExport?: () => void
}

/**
 * CrmHeader Component
 * 
 * Consistent header for the CRM feature.
 * Uses FeatureHeaderActions for Settings and AI Assistant buttons.
 */
export function CrmHeader({
  onAddContact,
  onExport,
}: CrmHeaderProps) {
  return (
    <FeatureHeader
      icon={Users}
      title="CRM & Sales"
      subtitle="Customer Relationship Management with contacts, leads, opportunities, and sales pipeline"
      primaryAction={{
        label: "Add Contact",
        icon: Plus,
        onClick: onAddContact ?? (() => { }),
      }}
      secondaryActions={[
        {
          id: "export",
          label: "Export",
          icon: Download,
          onClick: onExport ?? (() => { }),
        },
      ]}
    >
      {/* Feature Settings & AI Assistant */}
      <FeatureHeaderActions
        featureSlug="crm"
        showSettings={true}
        showAgent={true}
      />
    </FeatureHeader>
  )
}

export default CrmHeader

