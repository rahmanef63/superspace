"use client";

import type { Id } from "@convex/_generated/dataModel";
import AnalyticsFeature from "./index";

export interface AnalyticsPageProps {
  workspaceId?: Id<"workspaces"> | null;
}

export default function AnalyticsPage({ workspaceId }: AnalyticsPageProps) {
  void workspaceId;

  return <AnalyticsFeature />;
}
