"use client"

import React from "react"
import { Id } from "@convex/_generated/dataModel"
import { FeatureLayout } from "@/frontend/shared/ui/layout/feature-layout"
import { usePos } from "../hooks/usePos"
import PosDashboard from "../components/PosDashboard"
import { PosHeader } from "./PosHeader"

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
      <FeatureLayout featureId="pos" centered>
        <div className="text-center">
          <h2 className="text-xl font-semibold">No Workspace Selected</h2>
          <p className="mt-2 text-muted-foreground">
            Please select a workspace to view POS
          </p>
        </div>
      </FeatureLayout>
    )
  }

  return (
    <FeatureLayout featureId="pos" padding={false}>
      <div className="flex h-full flex-col">
        <PosHeader />

        <div className="flex-1 overflow-auto p-6">
          <PosDashboard data={data} isLoading={isLoading} />
        </div>
      </div>
    </FeatureLayout>
  )
}
