"use client"

import type { Id } from "@/convex/_generated/dataModel"
import { useInitializeWhatsApp } from "../../shared/hooks"
import { SettingsView } from "./SettingsView"

interface WASettingsPageProps {
  workspaceId?: Id<"workspaces"> | null
}

export default function WASettingsPage({ workspaceId }: WASettingsPageProps) {
  useInitializeWhatsApp(workspaceId ?? null)

  return (
    <div className="h-full">
      <SettingsView />
    </div>
  )
}
