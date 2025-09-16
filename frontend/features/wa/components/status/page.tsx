"use client"

import type { Id } from "@/convex/_generated/dataModel"
import { useInitializeWhatsApp } from "../../shared/hooks"
import { StatusView } from "./StatusView"

interface WAStatusPageProps {
  workspaceId?: Id<"workspaces"> | null
}

export default function WAStatusPage({ workspaceId }: WAStatusPageProps) {
  useInitializeWhatsApp(workspaceId ?? null)

  return (
    <div className="h-full">
      <StatusView />
    </div>
  )
}
