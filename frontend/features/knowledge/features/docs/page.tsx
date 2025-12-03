"use client";

import type { Id } from "@convex/_generated/dataModel";
import { PageContainer } from "@/frontend/shared/ui/layout/container";
import { DocumentsView } from "@/frontend/features/documents/shared/components";
import type { DocumentEditorMode } from "@/frontend/features/documents/shared/types";

export interface DocsPageProps {
  workspaceId?: Id<"workspaces"> | null;
  editorMode?: DocumentEditorMode;
}

/**
 * DocsPage - Regular Documents
 * 
 * Uses DocumentsView with category="document" to filter and create
 * regular documents (notes, meeting notes, files, etc.)
 */
export default function DocsPage({ workspaceId, editorMode = "block" }: DocsPageProps) {
  if (!workspaceId) {
    return (
      <PageContainer maxWidth="full" padding={true} className="h-full">
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">
            Please select a workspace to view documents.
          </p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="full" padding={false} className="h-full">
      <DocumentsView 
        workspaceId={workspaceId} 
        editorMode={editorMode}
        storageKey="knowledge-docs"
        category="document"
      />
    </PageContainer>
  );
}
