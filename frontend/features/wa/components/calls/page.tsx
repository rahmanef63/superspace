"use client"

import type { Id } from "@/convex/_generated/dataModel"
import { useInitializeWhatsApp } from "../../shared/hooks"
import { CallsView } from "./CallsView"

interface WACallsPageProps {
  workspaceId?: Id<"workspaces"> | null
}

export default function WACallsPage({ workspaceId }: WACallsPageProps) {
  useInitializeWhatsApp(workspaceId ?? null)

  return (
    <div className="h-full">
      <CallsView />
    </div>
  )
}
