"use client"

import type { Id } from "@/convex/_generated/dataModel"
import { TooltipProvider } from "@/components/ui/tooltip";
import ChatsPage from "./components/chat/page";

interface MessageProps {
  workspaceId?: Id<"workspaces"> | null;
}

const Message = ({ workspaceId }: MessageProps) => {
  return (
    <TooltipProvider>
      <ChatsPage workspaceId={workspaceId ?? null} />
    </TooltipProvider>
  );
};

export default Message;
