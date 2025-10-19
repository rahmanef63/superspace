"use client"

import type { Id } from "@convex/_generated/dataModel"
import AIPage from "@/frontend/features/ai/page"

export default function ChatAIPage({
  workspaceId,
}: {
  workspaceId?: Id<"workspaces"> | null
}) {
  return <AIPage workspaceId={workspaceId} />
}
