"use client";

import { useCallback, useState, useEffect, useMemo } from "react";
import type { Id } from "@convex/_generated/dataModel";
import { toast } from "sonner";
import { DocumentsListView } from "./DocumentsListView";
import { CreateDocumentDialog } from "./CreateDocumentDialog";
import { DocumentDetailView } from "./DocumentDetailView";
import { DocumentsThreeColumnLayout } from "./DocumentsThreeColumnLayout";
import { useDeleteDocument } from "../../api/documents";
import { useDocumentsManager } from "../hooks";
import type { DocumentsManagerHook } from "../hooks/useDocumentsManager";
import type { DocumentCategory, DocumentEditorMode, DocumentRecord, DocumentSortOptions } from "../types";
import { sortDocuments } from "../utils";

export interface DocumentsViewProps {
  manager: DocumentsManagerHook;
  editorMode?: DocumentEditorMode;
  storageKey?: string;
  workspaceId: Id<"workspaces">;
  category?: DocumentCategory;
}

export function DocumentsViewContent({
  manager,
  editorMode = "block",
  storageKey,
  workspaceId,
  category,
}: DocumentsViewProps) {
  const deleteDocument = useDeleteDocument();
  const [isMobile, setIsMobile] = useState(false);
  const [sortOptions, setSortOptions] = useState<DocumentSortOptions>({
    field: "modified",
    order: "desc",
  });

  useEffect(() => {
    const checkMobile = () => {
      const newIsMobile = window.innerWidth < 768;
      // Only update state if value actually changed
      setIsMobile(prev => prev !== newIsMobile ? newIsMobile : prev);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleDelete = useCallback(
    async (document: { _id: Id<"documents">; title: string }) => {
      const confirmed = window.confirm(`Delete "${document.title}"?`);
      if (!confirmed) return;

      try {
        await deleteDocument({ id: document._id });
        toast.success("Document deleted");
      } catch (error) {
        console.error(error);
        toast.error("Failed to delete document");
      }
    },
    [deleteDocument]
  );

  const handlePin = useCallback(
    async (document: DocumentRecord) => {
      // TODO: Implement togglePin mutation
      console.log("Toggle pin for document:", document._id);
      toast.info(`Pin/Unpin feature coming soon for "${document.title}"`);
    },
    []
  );

  const handleStar = useCallback(
    async (document: DocumentRecord) => {
      // TODO: Implement toggleStar mutation
      console.log("Toggle star for document:", document._id);
      toast.info(`Star/Unstar feature coming soon for "${document.title}"`);
    },
    []
  );

  const handleSortChange = useCallback((newSortOptions: DocumentSortOptions) => {
    setSortOptions(newSortOptions);
  }, []);

  // Apply sorting to filtered documents
  const sortedDocuments = useMemo(
    () => sortDocuments(manager.filteredDocuments, sortOptions),
    [manager.filteredDocuments, sortOptions]
  );

  // Mobile: Show only list OR detail
  if (isMobile) {
    if (manager.state.selectedDocumentId) {
      return (
        <div className="h-full">
          <DocumentDetailView
            documentId={manager.state.selectedDocumentId}
            mode={editorMode}
            onBack={() => manager.selectDocument(null)}
          />
        </div>
      );
    }

    return (
      <div className="h-full">
        <DocumentsListView
          documents={manager.documents}
          filteredDocuments={sortedDocuments}
          isLoading={manager.isLoading}
          onSelect={manager.selectDocument}
          onCreate={manager.openCreateDialog}
          selectedDocumentId={manager.state.selectedDocumentId}
          search={manager.search}
          onSearch={manager.setSearch}
          visibility={manager.visibility}
          onVisibilityChange={manager.setVisibility}
          stats={manager.stats}
          storageKey={storageKey}
          onDelete={handleDelete}
          onPin={handlePin}
          onStar={handleStar}
          sortOptions={sortOptions}
          onSortChange={handleSortChange}
          workspaceId={workspaceId}
          isMobile={true}
        />

        <CreateDocumentDialog
          open={manager.state.createOpen}
          onOpenChange={manager.toggleCreateDialog}
          workspaceId={workspaceId}
          category={category}
          onCreated={(documentId) => {
            manager.toggleCreateDialog(false);
            manager.selectDocument(documentId);
          }}
        />
      </div>
    );
  }

  // Desktop: Show 3-column layout (Sidebar | Editor | Inspector)
  return (
    <DocumentsThreeColumnLayout
      manager={manager}
      workspaceId={workspaceId}
      editorMode={editorMode}
      storageKey={storageKey}
      onDelete={handleDelete}
      onPin={handlePin}
      onStar={handleStar}
      sortOptions={sortOptions}
      onSortChange={handleSortChange}
      sortedDocuments={sortedDocuments}
      category={category}
    />
  );
}

export interface DocumentsViewWrapperProps {
  workspaceId: Id<"workspaces">;
  editorMode?: DocumentEditorMode;
  storageKey?: string;
  initialDocumentId?: Id<"documents"> | null;
  /** Filter documents by category (article or document) */
  category?: DocumentCategory;
}

export function DocumentsView({
  workspaceId,
  editorMode = "block",
  storageKey,
  initialDocumentId = null,
  category,
}: DocumentsViewWrapperProps) {
  const manager = useDocumentsManager({ workspaceId, initialDocumentId, editorMode, category });

  return (
    <DocumentsViewContent
      manager={manager}
      editorMode={editorMode}
      storageKey={storageKey}
      workspaceId={workspaceId}
      category={category}
    />
  );
}

// Legacy export names for backwards compatibility
export const WorkspaceDocumentsManager = DocumentsView;
export type WorkspaceDocumentsManagerProps = DocumentsViewWrapperProps;
