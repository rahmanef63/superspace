"use client"

import type { Id } from "@convex/_generated/dataModel"
import ChatsPage from "@/frontend/features/chat/components/chat/page"

export default function ChatsFeaturePage({
  workspaceId,
}: {
  workspaceId?: Id<"workspaces"> | null
}) {
  return <ChatsPage workspaceId={workspaceId} />
}
