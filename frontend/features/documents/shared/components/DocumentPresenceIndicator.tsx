"use client";

import usePresence from "@convex-dev/presence/react";
import FacePile from "@convex-dev/presence/facepile";
import { api } from "@convex/_generated/api";
import { cn } from "@/lib/utils";

export interface DocumentPresenceIndicatorProps {
  roomId: string;
  userId: string;
  showLabel?: boolean;
  className?: string;
}

export function DocumentPresenceIndicator({
  roomId,
  userId,
  showLabel = true,
  className,
}: DocumentPresenceIndicatorProps) {
  // Don't render if we don't have valid room or user data
  if (!roomId || !userId) {
    return null;
  }

  let presenceState: Array<{
    userId: string;
    online: boolean;
    lastDisconnected: number;
    name?: string;
    image?: string;
  }> = [];

  try {
    presenceState = usePresence((api as any)["features/docs/presence"], roomId, userId) ?? [];
  } catch (error) {
    console.error("Error in presence hook:", error);
    presenceState = [];
  }

  const audience = presenceState.length;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {showLabel && (
        <span className="text-sm text-muted-foreground">
          {audience > 0
            ? `${audience} user${audience === 1 ? "" : "s"} online`
            : "You're alone"}
        </span>
      )}
      <FacePile presenceState={presenceState} />
    </div>
  );
}
