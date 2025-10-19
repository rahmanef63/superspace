"use client"

import type { Id } from "@convex/_generated/dataModel"
import ArchivedPage from "@/frontend/features/chat/components/archived/page"

export default function ArchivedFeaturePage({
  workspaceId,
}: {
  workspaceId?: Id<"workspaces"> | null
}) {
  return <ArchivedPage workspaceId={workspaceId} />
}
