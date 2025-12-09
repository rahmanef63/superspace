"use client"

import type { Id } from "@/convex/_generated/dataModel"
import { ArchivedView } from "./ArchivedView"

export default function ArchivedPage({
  workspaceId,
}: {
  workspaceId?: Id<"workspaces"> | null
}) {
  return <ArchivedView workspaceId={workspaceId} />
}
