"use client"

import type { Id } from "@/convex/_generated/dataModel"
import { CallsView } from "../../views/CallsView"

interface WACallsPageProps {
  workspaceId?: Id<"workspaces"> | null
}

export default function WACallsPage({ workspaceId }: WACallsPageProps) {
  return (
    <div className="h-full">
      <CallsView />
    </div>
  )
}
