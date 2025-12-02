"use client";

import type { Id } from "@convex/_generated/dataModel";
import { PageContainer } from "@/frontend/shared/ui/components/pages/PageContainer";
import { KnowledgeViewTabs } from "./shared/components/KnowledgeViewTabs";

export interface KnowledgePageProps {
  workspaceId?: Id<"workspaces"> | null;
}

export default function KnowledgePage({ workspaceId }: KnowledgePageProps) {
  return (
    <PageContainer maxWidth="full" padding={false} className="h-full">
      <KnowledgeViewTabs workspaceId={workspaceId ?? null} />
    </PageContainer>
  );
}
