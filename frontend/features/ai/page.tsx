"use client"

import type { Id } from "@/convex/_generated/dataModel"
import { useInitializeChat } from "@/frontend/features/chat/shared/hooks"
import { AIView } from "./AIView"

interface WAAIPageProps {
  workspaceId?: Id<"workspaces"> | null
}

export default function WAAIPage({ workspaceId }: WAAIPageProps) {
  useInitializeChat(workspaceId ?? null)

  return (
    <div className="h-full">
      <AIView />
    </div>
  )
}
