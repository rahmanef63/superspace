"use client"

import type { Id } from "@/convex/_generated/dataModel"
import { useInitializeChat } from "@/frontend/features/chat/shared/hooks"
import { AIView } from "./AIView"

interface AIPageProps {
  workspaceId?: Id<"workspaces"> | null
}

export default function WAAIPage({ workspaceId }: AIPageProps) {
  useInitializeChat(workspaceId ?? null)

  return (
    <div className="h-full">
      <AIView />
    </div>
  )
}
