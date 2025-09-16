"use client"

import type { Id } from "@convex/_generated/dataModel";
import { CanvasBuilder } from "./components/CanvasBuilder";

export interface CanvasPageProps {
  workspaceId?: Id<"workspaces"> | null;
}

export default function CanvasPage({ workspaceId }: CanvasPageProps) {
  return <CanvasBuilder workspaceId={workspaceId as Id<"workspaces">} />;
}
