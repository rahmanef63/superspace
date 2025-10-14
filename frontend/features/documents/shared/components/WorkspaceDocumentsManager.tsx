"use client";

import { useCallback } from "react";
import type { Id } from "@convex/_generated/dataModel";
import { toast } from "sonner";
import { DocumentsBrowser } from "./DocumentsBrowser";
import { CreateDocumentDialog } from "./CreateDocumentDialog";
import { DocumentEditor } from "./editor";
import { useDeleteDocument } from "../../api/documents";
import { useDocumentsManager } from "../hooks";
import type { DocumentsManagerHook } from "../hooks/useDocumentsManager";
import type { DocumentEditorMode } from "../types";

export interface WorkspaceDocumentsManagerViewProps {
  manager: DocumentsManagerHook;
  editorMode?: DocumentEditorMode;
  storageKey?: string;
  workspaceId: Id<"workspaces">;
}

export function WorkspaceDocumentsManagerView({
  manager,
  editorMode = "block",
  storageKey,
  workspaceId,
}: WorkspaceDocumentsManagerViewProps) {
  const deleteDocument = useDeleteDocument();

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

  return (
    <div className="h-full">
      {manager.state.selectedDocumentId ? (
        <DocumentEditor
          documentId={manager.state.selectedDocumentId}
          mode={editorMode}
          onBack={() => manager.selectDocument(null)}
        />
      ) : (
        <DocumentsBrowser
          documents={manager.documents}
          filteredDocuments={manager.filteredDocuments}
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
        workspaceId={workspaceId}
      />
      )}

      <CreateDocumentDialog
        open={manager.state.createOpen}
        onOpenChange={manager.toggleCreateDialog}
        workspaceId={workspaceId}
        onCreated={(documentId) => {
          manager.toggleCreateDialog(false);
          manager.selectDocument(documentId);
        }}
      />
    </div>
  );
}

export interface WorkspaceDocumentsManagerProps {
  workspaceId: Id<"workspaces">;
  editorMode?: DocumentEditorMode;
  storageKey?: string;
  initialDocumentId?: Id<"documents"> | null;
}

export function WorkspaceDocumentsManager({
  workspaceId,
  editorMode = "block",
  storageKey,
  initialDocumentId = null,
}: WorkspaceDocumentsManagerProps) {
  const manager = useDocumentsManager({ workspaceId, initialDocumentId, editorMode });

  return (
    <WorkspaceDocumentsManagerView
      manager={manager}
      editorMode={editorMode}
      storageKey={storageKey}
      workspaceId={workspaceId}
    />
  );
}
