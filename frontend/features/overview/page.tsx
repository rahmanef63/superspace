"use client"

import type { Id } from "@/convex/_generated/dataModel"
import { FeatureLayout } from "@/frontend/shared/ui/layout/feature-layout"
import { OverviewViewBlocks } from "./OverviewViewBlocks"
import { MainWorkspaceOverview } from "./MainWorkspaceOverview"
import { useWorkspaceContext } from "@/frontend/shared/foundation/provider/WorkspaceProvider"

interface OverviewPageProps {
  workspaceId?: Id<"workspaces"> | null
}

export default function OverviewPage({ workspaceId }: OverviewPageProps) {
  const { isMainWorkspace, workspaceId: contextWorkspaceId } = useWorkspaceContext()
  const activeWorkspaceId = workspaceId ?? contextWorkspaceId

  return (
    <FeatureLayout featureId="overview" maxWidth="full" padding={true}>
      {isMainWorkspace && activeWorkspaceId ? (
        <MainWorkspaceOverview workspaceId={activeWorkspaceId} />
      ) : (
        <OverviewViewBlocks workspaceId={activeWorkspaceId} />
      )}
    </FeatureLayout>
  )
}
