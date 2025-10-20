"use client"

import type { Id } from "@/convex/_generated/dataModel"
import { useInitializeChat } from "../../shared/hooks"
import { ArchivedView } from "./ArchivedView"

interface WAArchivedPageProps {
  workspaceId?: Id<"workspaces"> | null
}

export default function WAArchivedPage({ workspaceId }: WAArchivedPageProps) {
  useInitializeChat(workspaceId ?? null)

  return (
    <div className="h-full">
      <ArchivedView />
    </div>
  )
}
