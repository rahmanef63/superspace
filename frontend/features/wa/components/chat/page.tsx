"use client"

import type { Id } from "@/convex/_generated/dataModel"
import { ChatsView } from "./ChatsView"

interface WAChatsPageProps {
  workspaceId?: Id<"workspaces"> | null
}

export default function WAChatsPage({ workspaceId }: WAChatsPageProps) {
  return (
    <div className="h-full">
      <ChatsView />
    </div>
  )
}
