"use client"

import React from "react"
import { Home, RefreshCcw } from "lucide-react"
import { FeatureHeader, FeatureHeaderActions } from "@/frontend/shared/ui/layout/header"

interface OverviewHeaderProps {
  onRefresh?: () => void
  onToggleAI?: () => void
  isAIPanelOpen?: boolean
}

/**
 * OverviewHeader Component
 * 
 * Consistent header for the Overview feature.
 * Uses FeatureHeaderActions for Settings and AI Assistant buttons.
 */
export function OverviewHeader({
  onRefresh,
  onToggleAI,
  isAIPanelOpen = false,
}: OverviewHeaderProps) {
  return (
    <FeatureHeader
      icon={Home}
      title="Overview"
      subtitle="Dashboard overview with analytics and insights"
      secondaryActions={[
        {
          id: "refresh",
          label: "Refresh",
          icon: RefreshCcw,
          onClick: onRefresh ?? (() => { }),
        },
        {
          id: "toggle-ai",
          label: isAIPanelOpen ? "Close AI" : "Open Assistant",
          icon: React.forwardRef((props, ref) => (
            <div className="relative flex items-center justify-center">
              <div className={`h-2 w-2 rounded-full ${isAIPanelOpen ? 'bg-green-500' : 'bg-transparent border border-current'}`} />
            </div>
          )),
          onClick: onToggleAI ?? (() => { }),
        }
      ]}
    >
      {/* Feature Settings & AI Assistant */}
      <FeatureHeaderActions
        featureSlug="overview"
        showSettings={true}
        showAgent={true}
      />
    </FeatureHeader>
  )
}

export default OverviewHeader

