"use client"

import type { Id } from "@/convex/_generated/dataModel"
import { StarredView } from "./StarredView"

interface WAStarredPageProps {
  workspaceId?: Id<"workspaces"> | null
}

export default function WAStarredPage({ workspaceId }: WAStarredPageProps) {
  return (
    <div className="h-full">
      <StarredView />
    </div>
  )
}
