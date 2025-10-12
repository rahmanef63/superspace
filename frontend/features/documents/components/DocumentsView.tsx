"use client";

import type { Id } from "@convex/_generated/dataModel";
import { toast } from "sonner";
import { DocumentsBrowser } from "../shared";
import { useDocumentsManager } from "../shared";
import { useDeleteDocument } from "../shared";

interface DocumentsViewProps {
  workspaceId: Id<"workspaces">;
  onDocumentSelect: (documentId: Id<"documents">) => void;
  onCreateDocument?: () => void;
  storageKey?: string;
}

export function DocumentsView({
  workspaceId,
  onDocumentSelect,
  onCreateDocument,
  storageKey,
}: DocumentsViewProps) {
  const manager = useDocumentsManager({ workspaceId });
  const deleteDocument = useDeleteDocument();

  return (
    <DocumentsBrowser
      documents={manager.documents}
      filteredDocuments={manager.filteredDocuments}
      isLoading={manager.isLoading}
      onSelect={(documentId) => {
        manager.selectDocument(documentId);
        if (documentId) {
          onDocumentSelect(documentId);
        }
      }}
      onCreate={onCreateDocument}
      selectedDocumentId={manager.state.selectedDocumentId}
      search={manager.search}
      onSearch={manager.setSearch}
  visibility={manager.visibility}
  onVisibilityChange={manager.setVisibility}
  stats={manager.stats}
  storageKey={storageKey}
  workspaceId={workspaceId}
  onDelete={async (doc) => {
        const confirmed = window.confirm(`Delete "${doc.title || "Untitled"}"?`);
        if (!confirmed) return;

        try {
          await deleteDocument({ id: doc._id });
          toast.success("Document deleted");
        } catch (error) {
          console.error(error);
          toast.error("Failed to delete document");
        }
      }}
    />
  );
}
