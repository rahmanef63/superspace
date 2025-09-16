"use client"

import type { Id } from "@/convex/_generated/dataModel"
import { useInitializeWhatsApp } from "../../shared/hooks"
import { ProfileView } from "./ProfileView"

interface WAProfilePageProps {
  workspaceId?: Id<"workspaces"> | null
}

export default function WAProfilePage({ workspaceId }: WAProfilePageProps) {
  useInitializeWhatsApp(workspaceId ?? null)

  return (
    <div className="h-full">
      <ProfileView />
    </div>
  )
}
