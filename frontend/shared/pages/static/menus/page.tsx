"use client"

import type { Id } from "@convex/_generated/dataModel";
import { MenuStore } from "./components/MenuStore";

export interface MenusPageProps {
  workspaceId?: Id<"workspaces"> | null;
}

export default function MenusPage({ workspaceId }: MenusPageProps) {
  return <MenuStore workspaceId={workspaceId as Id<"workspaces">} />;
}
