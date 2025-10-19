"use client"

import type { Id } from "@/convex/_generated/dataModel"
import { useInitializeChat } from "../../shared/hooks"
import { ProfileView } from "./ProfileView"

interface WAProfilePageProps {
  workspaceId?: Id<"workspaces"> | null
}

export default function WAProfilePage({ workspaceId }: WAProfilePageProps) {
  useInitializeChat(workspaceId ?? null)

  return (
    <div className="h-full">
      <ProfileView />
    </div>
  )
}
