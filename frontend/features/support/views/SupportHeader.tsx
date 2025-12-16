"use client"

import React from "react"
import { Headphones, Plus, BarChart3 } from "lucide-react"
import { FeatureHeader, FeatureHeaderActions } from "@/frontend/shared/ui/layout/header"

interface SupportHeaderProps {
  onCreateTicket?: () => void
  onViewReports?: () => void
}

/**
 * SupportHeader Component
 * 
 * Consistent header for the Support feature.
 * Uses FeatureHeaderActions for Settings and AI Assistant buttons.
 */
export function SupportHeader({
  onCreateTicket,
  onViewReports,
}: SupportHeaderProps) {
  return (
    <FeatureHeader
      icon={Headphones}
      title="Support"
      subtitle="Customer support and helpdesk ticketing system"
      primaryAction={{
        label: "New Ticket",
        icon: Plus,
        onClick: onCreateTicket ?? (() => { }),
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
        featureSlug="support"
        showSettings={true}
        showAgent={true}
      />
    </FeatureHeader>
  )
}

export default SupportHeader

