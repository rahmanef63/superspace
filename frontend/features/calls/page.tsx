"use client"

import type { Id } from "@/convex/_generated/dataModel"
import { PageContainer } from "@/frontend/shared/ui/layout/container"
import { useInitializeChat } from "../chat/shared/hooks"
import { CallsView } from "./CallsView"

interface WACallsPageProps {
  workspaceId?: Id<"workspaces"> | null
}

export default function WACallsPage({ workspaceId }: WACallsPageProps) {
  useInitializeChat(workspaceId ?? null)

  return (
    <PageContainer padding={false} maxWidth="full" fullHeight>
      <CallsView />
    </PageContainer>
  )
}
