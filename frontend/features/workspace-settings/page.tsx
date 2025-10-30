"use client";

import { SettingsView } from "@/frontend/shared/settings";
import type { Id } from "@convex/_generated/dataModel";

export interface WorkspaceSettingsPageProps {
  workspaceId?: Id<"workspaces"> | null;
}

export default function WorkspaceSettingsPage({ workspaceId }: WorkspaceSettingsPageProps) {
  void workspaceId;

  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <SettingsView />
    </div>
  );
}
