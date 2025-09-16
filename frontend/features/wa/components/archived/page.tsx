"use client"

import type { Id } from "@/convex/_generated/dataModel"
import { ArchivedView } from "./ArchivedView"

interface WAArchivedPageProps {
  workspaceId?: Id<"workspaces"> | null
}

export default function WAArchivedPage({ workspaceId }: WAArchivedPageProps) {
  return (
    <div className="h-full">
      <ArchivedView />
    </div>
  )
}
