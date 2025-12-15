"use client"

import React from "react"
import { Id } from "@convex/_generated/dataModel"
import { FeatureLayout } from "@/frontend/shared/ui/layout/feature-layout"
import { useMarketing } from "../hooks/useMarketing"
import MarketingDashboard from "../components/MarketingDashboard"
import { MarketingHeader } from "./MarketingHeader"

interface MarketingPageProps {
  workspaceId?: Id<"workspaces"> | null
}

/**
 * Marketing Page Component
 * 
 * Pattern: Feature page with shared layout components
 * Uses MarketingDashboard for presentation
 */
export default function MarketingPage({ workspaceId }: MarketingPageProps) {
  const { isLoading, data } = useMarketing(workspaceId)

  if (!workspaceId) {
    return (
      <FeatureLayout featureId="marketing" centered>
        <div className="text-center">
          <h2 className="text-xl font-semibold">No Workspace Selected</h2>
          <p className="mt-2 text-muted-foreground">
            Please select a workspace to view Marketing
          </p>
        </div>
      </FeatureLayout>
    )
  }

  return (
    <FeatureLayout featureId="marketing" padding={false}>
      <div className="flex h-full flex-col">
        <MarketingHeader />

        <div className="flex-1 overflow-auto p-6">
          <MarketingDashboard data={data} isLoading={isLoading} />
        </div>
      </div>
    </FeatureLayout>
  )
}
