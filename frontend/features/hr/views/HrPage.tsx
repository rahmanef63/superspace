"use client"

import React from "react"
import { Users, Plus, Settings } from "lucide-react"
import { Id } from "@convex/_generated/dataModel"
import { FeatureHeader } from "@/frontend/shared/ui/layout/header"
import { PageContainer } from "@/frontend/shared/ui/layout/container"
import { useHr } from "../hooks/useHr"
import HrDashboard from "../components/HrDashboard"

interface HrPageProps {
  workspaceId?: Id<"workspaces"> | null
}

/**
 * HR Management Page Component
 * 
 * Pattern: Feature page with shared layout components
 * Uses HrDashboard for presentation
 */
export default function HrPage({ workspaceId }: HrPageProps) {
  const { isLoading, data } = useHr(workspaceId)

  if (!workspaceId) {
    return (
      <PageContainer centered>
        <div className="text-center">
          <h2 className="text-xl font-semibold">No Workspace Selected</h2>
          <p className="mt-2 text-muted-foreground">
            Please select a workspace to view HR Management
          </p>
        </div>
      </PageContainer>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <FeatureHeader
        icon={Users}
        title="HR Management"
        subtitle="Manage employees, attendance, payroll, and recruitment"
        primaryAction={{
          label: "Add Employee",
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
        <HrDashboard data={data} isLoading={isLoading} />
      </div>
    </div>
  )
}
