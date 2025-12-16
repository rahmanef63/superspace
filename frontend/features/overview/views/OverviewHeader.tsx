"use client"

import React from "react"
import { Home, RefreshCcw } from "lucide-react"
import { FeatureHeader, FeatureHeaderActions } from "@/frontend/shared/ui/layout/header"
import { Button } from "@/components/ui/button"

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
    >
      {/* Custom Refresh button */}
      <Button
        variant="outline"
        size="sm"
        onClick={onRefresh}
        className="hidden sm:flex gap-1.5"
      >
        <RefreshCcw className="h-4 w-4" />
        <span className="hidden md:inline">Refresh</span>
      </Button>

      {/* AI Panel Toggle - only show if handler provided */}
      {onToggleAI && (
        <Button
          variant={isAIPanelOpen ? "default" : "outline"}
          size="sm"
          onClick={onToggleAI}
          className="hidden sm:flex gap-1.5"
        >
          <div className={`h-2 w-2 rounded-full ${isAIPanelOpen ? 'bg-white' : 'bg-green-500'}`} />
          <span className="hidden md:inline">{isAIPanelOpen ? "Close AI" : "Open AI"}</span>
        </Button>
      )}

      {/* Feature Settings & AI Chat (sheet-based) */}
      <FeatureHeaderActions
        featureSlug="overview"
        showSettings={true}
        showAgent={true}
      />
    </FeatureHeader>
  )
}

export default OverviewHeader

