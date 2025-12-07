"use client";

import type { Id } from "@convex/_generated/dataModel";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, FileText, Plus } from "lucide-react";
import { DocumentsView } from "../shared/components";
import { FeatureHeader } from "@/frontend/shared/ui/layout/header";
import { FeatureExportImport } from "@/frontend/shared/ui/data-export/FeatureHeaderActions";
import type { DocumentEditorMode } from "../shared";

interface DocumentsFeaturePageProps {
  workspaceId?: Id<"workspaces"> | null;
  editorMode?: DocumentEditorMode;
  initialTab?: "workspace" | "database";
  /** Hide header when used inside Knowledge feature */
  hideHeader?: boolean;
}

export default function DocumentsFeaturePage({
  workspaceId,
  editorMode = "block",
  hideHeader = false,
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
    <div className="flex flex-col h-full overflow-hidden">
      {/* Documents View */}
      <div className="flex-1 min-h-0">
        <DocumentsView workspaceId={workspaceId} editorMode={editorMode} />
      </div>
    </div>
  );
}
