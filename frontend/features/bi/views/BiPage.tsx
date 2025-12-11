"use client"

import React from "react"
import { LineChart, Plus } from "lucide-react"
import { Id } from "@convex/_generated/dataModel"
import { useBi } from "../hooks/useBi"
import { FeatureHeader } from "@/frontend/shared/ui/layout/header"
import { BiDashboard } from "../components/BiDashboard"
import { Button } from "@/components/ui/button"

interface BiPageProps {
  workspaceId?: Id<"workspaces"> | null
}

/**
 * BI Page Component
 */
export default function BiPage({ workspaceId }: BiPageProps) {
  const data = useBi(workspaceId)

  if (!workspaceId) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">No Workspace Selected</h2>
          <p className="mt-2 text-muted-foreground">
            Please select a workspace to use BI
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <FeatureHeader
        icon={LineChart}
        title="Business Intelligence"
        subtitle="Analytics and insights"
        primaryAction={{
          label: "New Dashboard",
          icon: Plus,
          onClick: () => { }
        }}
      />

      <div className="flex-1 overflow-auto p-4">
        <BiDashboard data={data} />
      </div>
    </div>
  )
}
