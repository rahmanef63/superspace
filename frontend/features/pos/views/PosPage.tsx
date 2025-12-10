"use client"

import React from "react"
import { ShoppingCart, Plus, Settings } from "lucide-react"
import { Id } from "@convex/_generated/dataModel"
import { FeatureHeader } from "@/frontend/shared/ui/layout/header"
import { PageContainer } from "@/frontend/shared/ui/layout/container"
import { usePos } from "../hooks/usePos"
import PosDashboard from "../components/PosDashboard"

interface PosPageProps {
  workspaceId?: Id<"workspaces"> | null
}

/**
 * POS Page Component
 * 
 * Pattern: Feature page with shared layout components
 * Uses PosDashboard for presentation
 */
export default function PosPage({ workspaceId }: PosPageProps) {
  const { isLoading, data } = usePos(workspaceId)

  if (!workspaceId) {
    return (
      <PageContainer centered>
        <div className="text-center">
          <h2 className="text-xl font-semibold">No Workspace Selected</h2>
          <p className="mt-2 text-muted-foreground">
            Please select a workspace to view POS
          </p>
        </div>
      </PageContainer>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <FeatureHeader
        icon={ShoppingCart}
        title="Point of Sale"
        subtitle="Retail management and sales terminal"
        badge={{ text: "Beta", variant: "secondary" }}
        primaryAction={{
          label: "New Sale",
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
        <PosDashboard data={data} isLoading={isLoading} />
      </div>
    </div>
  )
}
