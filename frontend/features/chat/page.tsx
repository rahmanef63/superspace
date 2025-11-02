"use client"

import type { Id } from "@convex/_generated/dataModel";
import { PageContainer } from "@/frontend/shared/ui/components/pages/PageContainer";
import Message from "./Message";

export interface MessagePageProps {
  workspaceId?: Id<"workspaces"> | null;
}

export default function MessagePage({ workspaceId }: MessagePageProps) {
  return (
    <PageContainer maxWidth="full" padding={false}>
      <Message workspaceId={workspaceId ?? null} />
    </PageContainer>
  );
}
