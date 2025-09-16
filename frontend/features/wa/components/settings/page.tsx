"use client"

import type { Id } from "@/convex/_generated/dataModel"
import { SettingsView } from "./SettingsView"

interface WASettingsPageProps {
  workspaceId?: Id<"workspaces"> | null
}

export default function WASettingsPage({ workspaceId }: WASettingsPageProps) {
  return (
    <div className="h-full">
      <SettingsView />
    </div>
  )
}
