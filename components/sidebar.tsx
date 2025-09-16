"use client"

import { AppSidebar } from "@/app/dashboard/_components/app-sidebar"
import type { Id } from "@/convex/_generated/dataModel"

interface SidebarProps {
  workspaceId?: Id<"workspaces"> | null
  onWorkspaceChange?: (workspaceId: Id<"workspaces">) => void
  activeView?: string
  onViewChange?: (view: string) => void
  side?: "left" | "right"
  variant?: "sidebar" | "floating" | "inset"
  collapsible?: "offcanvas" | "icon" | "none"
}

export function Sidebar(props: SidebarProps) {
  return <AppSidebar {...props} />
}
