"use client"

import type { Id } from "@convex/_generated/dataModel"
import { StatusView } from "@/frontend/features/status/StatusView"

export default function StatusPage({
  workspaceId,
}: {
  workspaceId?: Id<"workspaces"> | null
}) {
  return <StatusView />
}
