"use client"

import type { Id } from "@/convex/_generated/dataModel"
import { PageContainer } from "@/frontend/shared/ui/components/pages/PageContainer"
import { OverviewView } from "./OverviewView"
import { MainWorkspaceOverview } from "./MainWorkspaceOverview"
import { useWorkspaceContext } from "@/frontend/shared/foundation/provider/WorkspaceProvider"

interface OverviewPageProps {
  workspaceId?: Id<"workspaces"> | null
}

export default function OverviewPage({ workspaceId }: OverviewPageProps) {
  const { isMainWorkspace, workspaceId: contextWorkspaceId } = useWorkspaceContext()
  const activeWorkspaceId = workspaceId ?? contextWorkspaceId

  return (
    <PageContainer maxWidth="full" padding={true}>
      {isMainWorkspace && activeWorkspaceId ? (
        <MainWorkspaceOverview workspaceId={activeWorkspaceId} />
      ) : (
        <OverviewView workspaceId={activeWorkspaceId} />
      )}
    </PageContainer>
  )
}
