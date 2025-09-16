"use client"

import type { Id } from "@/convex/_generated/dataModel"
import { StatusView } from "./StatusView"

interface WAStatusPageProps {
  workspaceId?: Id<"workspaces"> | null
}

export default function WAStatusPage({ workspaceId }: WAStatusPageProps) {
  return (
    <div className="h-full">
      <StatusView />
    </div>
  )
}
