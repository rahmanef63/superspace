"use client";

import type { Id } from "@convex/_generated/dataModel";
import { DocumentsDbManagementView } from "@/frontend/features/documents/views/db-management";

export interface DatabasesPageProps {
  workspaceId?: Id<"workspaces"> | null;
}

export default function DatabasesPage({ workspaceId }: DatabasesPageProps) {
  if (!workspaceId) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No workspace selected</p>
      </div>
    );
  }

  return (
    <DocumentsDbManagementView
      workspaceId={workspaceId}
      storageKey={`databases.view.${workspaceId}`}
    />
  );
}
