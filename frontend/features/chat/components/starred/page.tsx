"use client"

import type { Id } from "@/convex/_generated/dataModel"
import { useInitializeChat } from "../../shared/hooks"
import { StarredView } from "./StarredView"

interface WAStarredPageProps {
  workspaceId?: Id<"workspaces"> | null
}

export default function WAStarredPage({ workspaceId }: WAStarredPageProps) {
  useInitializeChat(workspaceId ?? null)

  return (
    <div className="h-full">
      <StarredView />
    </div>
  )
}
