"use client";

import type { Id } from "@convex/_generated/dataModel";
import { AutomationPage } from "./pages/AutomationPage";

export interface AutomationFeaturePageProps {
  workspaceId?: Id<"workspaces"> | null;
}

export default function AutomationFeaturePage({ workspaceId }: AutomationFeaturePageProps) {
  void workspaceId;

  return <AutomationPage />;
}
