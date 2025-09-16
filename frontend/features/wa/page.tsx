"use client"

import type { Id } from "@convex/_generated/dataModel";
import Message from "./Message";

export interface MessagePageProps {
  workspaceId?: Id<"workspaces"> | null;
}

export default function MessagePage({ workspaceId }: MessagePageProps) {
  return <Message workspaceId={workspaceId ?? null} />;
}
