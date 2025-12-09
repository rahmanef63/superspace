"use client"

import type { Id } from "@/convex/_generated/dataModel"
import { TooltipProvider } from "@/components/ui/tooltip";
import ChatsPage from "../components/chat/page";

interface ChatPageProps {
  workspaceId?: Id<"workspaces"> | null;
}

/**
 * Chat Page Component
 * 
 * Main view component for the Chat feature
 * @see docs/guides/FEATURE_CREATION_TEMPLATE.md
 */
export default function ChatPage({ workspaceId }: ChatPageProps) {
  return (
    <TooltipProvider>
      <ChatsPage workspaceId={workspaceId ?? null} />
    </TooltipProvider>
  );
}
