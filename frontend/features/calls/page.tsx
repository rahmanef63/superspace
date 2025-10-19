"use client"

import type { Id } from "@/convex/_generated/dataModel"
import { useInitializeChat } from "../chat/shared/hooks"
import { CallsView } from "./CallsView"

interface WACallsPageProps {
  workspaceId?: Id<"workspaces"> | null
}

export default function WACallsPage({ workspaceId }: WACallsPageProps) {
  useInitializeChat(workspaceId ?? null)

  return (
    <div className="h-full">
      <CallsView />
    </div>
  )
}
