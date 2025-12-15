"use client"

import React from "react"
import { Headphones, Plus, Settings, BarChart3 } from "lucide-react"
import { FeatureHeader } from "@/frontend/shared/ui/layout/header"

interface SupportHeaderProps {
  onCreateTicket?: () => void
  onViewReports?: () => void
  onSettings?: () => void
}

/**
 * SupportHeader Component
 * 
 * Consistent header for the Support feature.
 */
export function SupportHeader({
  onCreateTicket,
  onViewReports,
  onSettings,
}: SupportHeaderProps) {
  return (
    <FeatureHeader
      icon={Headphones}
      title="Support"
      subtitle="Customer support and helpdesk ticketing system"
      primaryAction={{
        label: "New Ticket",
        icon: Plus,
        onClick: onCreateTicket ?? (() => {}),
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

export default SupportHeader
