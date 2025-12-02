"use client";

import type { Id } from "@convex/_generated/dataModel";
import { PageContainer } from "@/frontend/shared/ui/components/pages/PageContainer";
import { DocumentsView } from "@/frontend/features/documents/shared/components";
import type { DocumentEditorMode } from "@/frontend/features/documents/shared/types";

export interface ArticlesPageProps {
  workspaceId?: Id<"workspaces"> | null;
  editorMode?: DocumentEditorMode;
}

/**
 * ArticlesPage - Knowledge Base Articles
 * 
 * Uses DocumentsView with category="article" to filter and create
 * knowledge base articles specifically intended for:
 * - AI consumption and context
 * - Team documentation
 * - Structured guides and tutorials
 */
export default function ArticlesPage({ workspaceId, editorMode = "block" }: ArticlesPageProps) {
  if (!workspaceId) {
    return (
      <PageContainer maxWidth="full" padding={true} className="h-full">
        <div className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">
            Please select a workspace to view knowledge base articles.
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
        storageKey="knowledge-articles"
        category="article"
      />
    </PageContainer>
  );
}
