/**
 * Refactored Message component using shared/chat
 * @module features/chat/components/RefactoredMessage
 */

"use client";

import type { Id } from "@/convex/_generated/dataModel";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WorkspaceChatContainer } from "./WorkspaceChatContainer";

interface RefactoredMessageProps {
  workspaceId?: Id<"workspaces"> | null;
  roomId?: string;
}

/**
 * Main message page - now using shared chat module
 */
export default function RefactoredMessage({ workspaceId, roomId }: RefactoredMessageProps) {
  return (
    <TooltipProvider>
      <div className="h-full w-full">
        <WorkspaceChatContainer
          workspaceId={workspaceId ?? null}
          roomId={roomId}
          variant="full"
        />
      </div>
    </TooltipProvider>
  );
}
