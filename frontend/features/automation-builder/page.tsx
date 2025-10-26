"use client";

import type { Id } from "@convex/_generated/dataModel";

export interface AutomationBuilderPageProps {
  workspaceId?: Id<"workspaces"> | null;
}

export default function AutomationBuilderPage({ workspaceId }: AutomationBuilderPageProps) {
  void workspaceId;

  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <div className="space-y-2 text-center">
        <h2 className="text-xl font-semibold">Automation Builder</h2>
        <p className="text-sm text-muted-foreground">Visual builder tooling will arrive in a future update.</p>
      </div>
    </div>
  );
}
