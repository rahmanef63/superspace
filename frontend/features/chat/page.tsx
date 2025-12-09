"use client"

import type { Id } from "@convex/_generated/dataModel";
import { PageContainer } from "@/frontend/shared/ui/layout/container";
import ChatPage from "./views/ChatPage";

export interface MessagePageProps {
  workspaceId?: Id<"workspaces"> | null;
}

export default function MessagePage({ workspaceId }: MessagePageProps) {
  return (
    <PageContainer maxWidth="full" padding={false} fullHeight>
      <ChatPage workspaceId={workspaceId ?? null} />
    </PageContainer>
  );
}
