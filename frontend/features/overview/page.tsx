"use client"

import type { Id } from "@/convex/_generated/dataModel"
import { PageContainer } from "@/frontend/shared/ui/components/pages/PageContainer"
import { OverviewView } from "./OverviewView"

interface OverviewPageProps {
  workspaceId?: Id<"workspaces"> | null
}

export default function OverviewPage({ workspaceId }: OverviewPageProps) {
  return (
    <PageContainer maxWidth="full" padding={true}>
      <OverviewView workspaceId={workspaceId} />
    </PageContainer>
  )
}
