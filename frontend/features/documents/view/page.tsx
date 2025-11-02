"use client";

import type { Id } from "@convex/_generated/dataModel";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { DocumentsView } from "../shared/components";
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
      <div className="flex h-full items-center justify-center p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No workspace selected. Please select a workspace to manage documents.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="h-full">
      <DocumentsView workspaceId={workspaceId} editorMode={editorMode} />
    </div>
  );
}
