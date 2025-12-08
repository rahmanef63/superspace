"use client"

import React from "react"
import { Users, Plus, Settings } from "lucide-react"
import { Id } from "@convex/_generated/dataModel"
import { FeatureHeader } from "@/frontend/shared/ui/layout/header"
import { PageContainer } from "@/frontend/shared/ui/layout/container"
import { useHr } from "../hooks/useHr"

interface HrPageProps {
  workspaceId?: Id<"workspaces"> | null
}

/**
 * HR Management Page Component
 * 
 * Pattern: Feature page with shared layout components
 * @see docs/guides/three-column-layout-usage.md for complex layouts
 * @see docs/00_BASE_KNOWLEDGE.md - Pattern 4: React Component with Convex
 */
export default function HrPage({ workspaceId }: HrPageProps) {
  // Use hook with workspaceId - this is the correct pattern
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

  if (isLoading) {
    return (
      <PageContainer centered>
        <div className="text-muted-foreground">Loading HR Management...</div>
      </PageContainer>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <FeatureHeader
        icon={Users}
        title="HR Management"
        subtitle="Manage employees, attendance, payroll, and recruitment"
        badge={{ text: "Beta", variant: "secondary" }}
        primaryAction={{
          label: "Add Employee",
          icon: Plus,
          onClick: () => {},
        }}
        secondaryActions={[
          {
            id: "settings",
            label: "Settings",
            icon: Settings,
            onClick: () => {},
          },
        ]}
      />

      <div className="flex-1 overflow-auto p-6">
        <div className="flex h-full items-center justify-center">
          <div className="text-center space-y-4">
            <Users className="h-16 w-16 mx-auto text-muted-foreground/30" />
            <div>
              <p className="text-lg font-medium">HR Management feature is under development</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Coming soon with employee management, attendance tracking, payroll, and recruitment
              </p>
            </div>
            <div className="rounded-lg border border-dashed p-8 text-center max-w-md mx-auto">
              <p className="text-muted-foreground">
                Start building your HR management feature here!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
