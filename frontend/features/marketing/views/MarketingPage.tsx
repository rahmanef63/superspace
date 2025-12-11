"use client"

import React from "react"
import { Megaphone, Plus, Settings } from "lucide-react"
import { Id } from "@convex/_generated/dataModel"
import { FeatureHeader } from "@/frontend/shared/ui/layout/header"
import { PageContainer } from "@/frontend/shared/ui/layout/container"
import { useMarketing } from "../hooks/useMarketing"
import MarketingDashboard from "../components/MarketingDashboard"

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
      <PageContainer centered>
        <div className="text-center">
          <h2 className="text-xl font-semibold">No Workspace Selected</h2>
          <p className="mt-2 text-muted-foreground">
            Please select a workspace to view Marketing
          </p>
        </div>
      </PageContainer>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <FeatureHeader
        icon={Megaphone}
        title="Marketing"
        subtitle="Manage campaigns, ads, and digital assets"
        primaryAction={{
          label: "New Campaign",
          icon: Plus,
          onClick: () => { },
        }}
        secondaryActions={[
          {
            id: "settings",
            label: "Settings",
            icon: Settings,
            onClick: () => { },
          },
        ]}
      />

      <div className="flex-1 overflow-auto p-6">
        <MarketingDashboard data={data} isLoading={isLoading} />
      </div>
    </div>
  )
}
