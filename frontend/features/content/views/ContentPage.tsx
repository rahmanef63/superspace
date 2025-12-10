"use client"

import React from "react"
import { FileText, Plus, Settings } from "lucide-react"
import { Id } from "@convex/_generated/dataModel"
import { FeatureHeader } from "@/frontend/shared/ui/layout/header"
import { PageContainer } from "@/frontend/shared/ui/layout/container"
import { useContent } from "../hooks/useContent"
import ContentDashboard from "../components/ContentDashboard"

interface ContentPageProps {
  workspaceId?: Id<"workspaces"> | null
}

/**
 * Content Page Component
 * 
 * Pattern: Feature page with shared layout components
 * Uses ContentDashboard for presentation
 */
export default function ContentPage({ workspaceId }: ContentPageProps) {
  const { isLoading, data } = useContent(workspaceId)

  if (!workspaceId) {
    return (
      <PageContainer centered>
        <div className="text-center">
          <h2 className="text-xl font-semibold">No Workspace Selected</h2>
          <p className="mt-2 text-muted-foreground">
            Please select a workspace to view Content
          </p>
        </div>
      </PageContainer>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <FeatureHeader
        icon={FileText}
        title="Content Management"
        subtitle="Manage articles, pages, and digital assets"
        badge={{ text: "Beta", variant: "secondary" }}
        primaryAction={{
          label: "Create Content",
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
        <ContentDashboard data={data} isLoading={isLoading} />
      </div>
    </div>
  )
}
