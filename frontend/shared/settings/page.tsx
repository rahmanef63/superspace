"use client"

import type { Id } from "@/convex/_generated/dataModel"
import { useInitializeChat } from "@/frontend/features/chat/shared/hooks"
import { SettingsView } from "./SettingsView"

interface WASettingsPageProps {
  workspaceId?: Id<"workspaces"> | null
}

export default function WASettingsPage({ workspaceId }: WASettingsPageProps) {
  useInitializeChat(workspaceId ?? null)

  return (
    <div className="h-full">
      <SettingsView />
    </div>
  )
}
