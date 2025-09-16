"use client"

import type { Id } from "@/convex/_generated/dataModel"
import { AIView } from "../../views/AIView"

interface WAAIPageProps {
  workspaceId?: Id<"workspaces"> | null
}

export default function WAAIPage({ workspaceId }: WAAIPageProps) {
  return (
    <div className="h-full">
      <AIView />
    </div>
  )
}
