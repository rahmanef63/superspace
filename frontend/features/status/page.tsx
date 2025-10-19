"use client"

import type { Id } from "@/convex/_generated/dataModel"
import { useInitializeChat } from "@/frontend/features/chat/shared/hooks"
import { StatusView } from "./StatusView"

interface StatusPageProps {
  workspaceId?: Id<"workspaces"> | null
}

export default function StatusPage({ workspaceId }: StatusPageProps) {
  useInitializeChat(workspaceId ?? null)

  return (
    <div className="h-full">
      <StatusView />
    </div>
  )
}
