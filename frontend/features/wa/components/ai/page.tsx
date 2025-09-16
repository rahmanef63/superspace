"use client"

import type { Id } from "@/convex/_generated/dataModel"
import { useInitializeWhatsApp } from "../../shared/hooks"
import { AIView } from "./AIView"

interface WAAIPageProps {
  workspaceId?: Id<"workspaces"> | null
}

export default function WAAIPage({ workspaceId }: WAAIPageProps) {
  useInitializeWhatsApp(workspaceId ?? null)

  return (
    <div className="h-full">
      <AIView />
    </div>
  )
}
