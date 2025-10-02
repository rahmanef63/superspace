"use client";

import type { Id } from "@convex/_generated/dataModel";
import { DocumentsPageManagementView } from "@/frontend/features/documents/views/page-management";

export interface PagesPageProps {
  workspaceId?: Id<"workspaces"> | null;
}

export default function PagesPage({ workspaceId }: PagesPageProps) {
  if (!workspaceId) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">No workspace selected</p>
      </div>
    );
  }

  return (
    <DocumentsPageManagementView
      workspaceId={workspaceId}
      editorMode="block"
      storageKey={`pages.view.${workspaceId}`}
    />
  );
}
