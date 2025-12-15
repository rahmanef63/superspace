"use client"

import React from "react"
import { Plug, Plus, Settings, RefreshCw } from "lucide-react"
import { FeatureHeader } from "@/frontend/shared/ui/layout/header"

interface IntegrationsHeaderProps {
  onAddIntegration?: () => void
  onRefreshAll?: () => void
  onSettings?: () => void
}

/**
 * IntegrationsHeader Component
 * 
 * Consistent header for the Integrations feature.
 */
export function IntegrationsHeader({
  onAddIntegration,
  onRefreshAll,
  onSettings,
}: IntegrationsHeaderProps) {
  return (
    <FeatureHeader
      icon={Plug}
      title="Integrations"
      subtitle="Connect with third-party services and APIs"
      primaryAction={{
        label: "Add Integration",
        icon: Plus,
        onClick: onAddIntegration ?? (() => {}),
      }}
      secondaryActions={[
        {
          id: "refresh",
          label: "Refresh All",
          icon: RefreshCw,
          onClick: onRefreshAll ?? (() => {}),
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

export default IntegrationsHeader
