"use client"

import type { Id } from "@convex/_generated/dataModel"
import StarredPage from "@/frontend/features/chat/components/starred/page"

export default function StarredFeaturePage({
  workspaceId,
}: {
  workspaceId?: Id<"workspaces"> | null
}) {
  return <StarredPage workspaceId={workspaceId} />
}
