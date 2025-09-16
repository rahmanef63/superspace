import { useState } from "react";
import { Id } from "@convex/_generated/dataModel";
import { DocumentsView } from "./DocumentsView";
import { DocumentEditor } from "./DocumentEditor";
import { CreateDocumentModal } from "./CreateDocumentModal";

interface DocumentsManagerProps {
  workspaceId: Id<"workspaces">;
}

export function DocumentsManager({ workspaceId }: DocumentsManagerProps) {
  const [selectedDocumentId, setSelectedDocumentId] = useState<Id<"documents"> | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleDocumentSelect = (documentId: Id<"documents">) => {
    setSelectedDocumentId(documentId);
  };

  const handleBackToList = () => {
    setSelectedDocumentId(null);
  };

  const handleCreateDocument = () => {
    setShowCreateModal(true);
  };

  const handleDocumentCreated = (documentId: Id<"documents">) => {
    setSelectedDocumentId(documentId);
  };

  if (selectedDocumentId) {
    return (
      <DocumentEditor
        documentId={selectedDocumentId}
        onBack={handleBackToList}
      />
    );
  }

  return (
    <>
      <DocumentsView
        workspaceId={workspaceId}
        onDocumentSelect={handleDocumentSelect}
        onCreateDocument={handleCreateDocument}
      />

      <CreateDocumentModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        workspaceId={workspaceId}
        onDocumentCreated={handleDocumentCreated}
      />
    </>
  );
}
