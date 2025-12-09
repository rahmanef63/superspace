"use client";

import type { Id } from "@convex/_generated/dataModel";
import { AutomationPage } from "./pages/AutomationPage";
import { Zap } from "lucide-react";

export interface AutomationFeaturePageProps {
  workspaceId?: Id<"workspaces"> | null;
}

export default function AutomationFeaturePage({ workspaceId }: AutomationFeaturePageProps) {
  // No workspace state
  if (!workspaceId) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold">No Workspace Selected</h2>
          <p className="mt-2 text-muted-foreground">
            Please select a workspace to use automation builder
          </p>
        </div>
      </div>
    );
  }

  return <AutomationPage workspaceId={workspaceId} />;
}
