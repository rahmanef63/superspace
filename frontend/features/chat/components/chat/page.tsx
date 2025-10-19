"use client"

import type { Id } from "@/convex/_generated/dataModel"
import { useInitializeChat } from "../../shared/hooks"
import { ChatsView } from "./ChatsView"

interface ChatsPageProps {
  workspaceId?: Id<"workspaces"> | null
}

export default function ChatsPage({ workspaceId }: ChatsPageProps) {
  useInitializeChat(workspaceId ?? null)

  return (
    <div className="h-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <ChatsView />
    </div>
  )
}
