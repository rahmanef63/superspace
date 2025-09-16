"use client"

import type { Id } from "@/convex/_generated/dataModel"
import { ProfileView } from "../../views/ProfileView"

interface WAProfilePageProps {
  workspaceId?: Id<"workspaces"> | null
}

export default function WAProfilePage({ workspaceId }: WAProfilePageProps) {
  return (
    <div className="h-full">
      <ProfileView />
    </div>
  )
}
