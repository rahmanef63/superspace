"use client"

import type { Id } from "@/convex/_generated/dataModel"
import { useInitializeWhatsApp } from "../../shared/hooks"
import { ChatsView } from "./ChatsView"

interface WAChatsPageProps {
  workspaceId?: Id<"workspaces"> | null
}

export default function WAChatsPage({ workspaceId }: WAChatsPageProps) {
  useInitializeWhatsApp(workspaceId ?? null)

  return (
    <div className="h-full">
      <ChatsView />
    </div>
  )
}
