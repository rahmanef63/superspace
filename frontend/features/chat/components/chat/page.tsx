"use client"

import type { Id } from "@/convex/_generated/dataModel"
import { useInitializeChat } from "../../shared/hooks"
import { ChatsView } from "./ChatsView"

interface ChatsPageProps {
  workspaceId?: Id<"workspaces"> | null
}

export default function ChatsPage({ workspaceId }: ChatsPageProps) {
  useInitializeChat(workspaceId ?? null)

  return <ChatsView />
}
