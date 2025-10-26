"use client";

import type { Id } from "@convex/_generated/dataModel";

export interface WorkspaceSettingsPageProps {
  workspaceId?: Id<"workspaces"> | null;
}

export default function WorkspaceSettingsPage({ workspaceId }: WorkspaceSettingsPageProps) {
  void workspaceId;

  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <div className="space-y-2 text-center">
        <h2 className="text-xl font-semibold">Workspace Settings</h2>
        <p className="text-sm text-muted-foreground">Configuration options will be built out here soon.</p>
      </div>
    </div>
  );
}
