"use client"

import type { Id } from "@/convex/_generated/dataModel"
import { TooltipProvider } from "@/components/ui/tooltip";
import WAChatsPage from "./components/chat/page";

interface MessageProps {
  workspaceId?: Id<"workspaces"> | null;
}

const Message = ({ workspaceId }: MessageProps) => {
  return (
    <TooltipProvider>
      <WAChatsPage workspaceId={workspaceId ?? null} />
    </TooltipProvider>
  );
};

export default Message;
