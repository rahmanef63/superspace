"use client"

import type { Id } from "@convex/_generated/dataModel";
import { Overview } from "./Overview";

export interface OverviewPageProps {
  workspaceId?: Id<"workspaces"> | null;
}

export default function OverviewPage({ workspaceId }: OverviewPageProps) {
  return <Overview workspaceId={workspaceId as Id<"workspaces">} />;
}
