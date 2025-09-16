"use client"

import type { Id } from "@convex/_generated/dataModel";
import { InvitationManagement } from "./components/InvitationManagement";

export interface InvitationsPageProps {
  workspaceId?: Id<"workspaces"> | null;
}

export default function InvitationsPage({ workspaceId }: InvitationsPageProps) {
  return <InvitationManagement workspaceId={workspaceId as Id<"workspaces">} />;
}
