"use client"

import type { Id } from "@convex/_generated/dataModel";
import { MemberManagementPanel } from "./components/MemberManagementPanel";

export interface MembersPageProps {
  workspaceId?: Id<"workspaces"> | null;
}

export default function MembersPage({ workspaceId }: MembersPageProps) {
  return <MemberManagementPanel workspaceId={workspaceId as Id<"workspaces">} />;
}
