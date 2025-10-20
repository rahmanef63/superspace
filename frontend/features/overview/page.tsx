"use client"

import type { Id } from "@/convex/_generated/dataModel"
import { OverviewView } from "./OverviewView"

interface OverviewPageProps {
  workspaceId?: Id<"workspaces"> | null
}

export default function OverviewPage({ workspaceId }: OverviewPageProps) {
  return (
    <div className="h-full">
      <OverviewView workspaceId={workspaceId} />
    </div>
  )
}
