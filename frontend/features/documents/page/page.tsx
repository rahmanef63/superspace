"use client";

import type { Id } from "@convex/_generated/dataModel";
import { WorkspaceDocumentsManager } from "../shared/components/WorkspaceDocumentsManager";
import type { DocumentEditorMode } from "../shared";

interface DocumentsFeaturePageProps {
  workspaceId?: Id<"workspaces"> | null;
  editorMode?: DocumentEditorMode;
  initialTab?: "workspace" | "database";
}

export default function DocumentsFeaturePage({
  workspaceId,
  editorMode = "block",
}: DocumentsFeaturePageProps) {
  if (!workspaceId) {
    return (
      <div className="flex h-full items-center justify-center">
        Connect this view to a workspace to start managing documents.
      </div>
    );
  }

  return (
        <WorkspaceDocumentsManager workspaceId={workspaceId} editorMode={editorMode} />
  );
}
