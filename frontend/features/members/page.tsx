"use client"

import type { Id } from "@convex/_generated/dataModel";
import { PageContainer } from "@/frontend/shared/ui/layout/container";
import { MemberManagementPanel } from "./components/MemberManagementPanel";

export interface MembersPageProps {
  workspaceId?: Id<"workspaces"> | null;
}

export default function MembersPage({ workspaceId }: MembersPageProps) {
  return (
    <PageContainer maxWidth="full" padding={true}>
      <MemberManagementPanel workspaceId={workspaceId as Id<"workspaces">} />
    </PageContainer>
  );
}
