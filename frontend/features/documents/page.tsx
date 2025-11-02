"use client";

import type { Id } from "@convex/_generated/dataModel";
import { PageContainer } from "@/frontend/shared/ui/components/pages/PageContainer";
import DocumentsFeaturePage from "./view/page";

export interface DocumentsPageProps {
  workspaceId?: Id<"workspaces"> | null;
}

export default function DocumentsPage({ workspaceId }: DocumentsPageProps) {
  return (
    <PageContainer maxWidth="full" padding={false} className="h-full">
      <DocumentsFeaturePage workspaceId={workspaceId ?? null} />
    </PageContainer>
  );
}
