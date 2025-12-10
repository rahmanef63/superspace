"use client"

import type { Id } from "@/convex/_generated/dataModel"
import { StatusView } from "./StatusView"

interface StatusPageProps {
  workspaceId?: Id<"workspaces"> | null
}

export default function StatusPage({ workspaceId }: StatusPageProps) {
  return (
    <div className="h-full">
      <StatusView />
    </div>
  )
}
