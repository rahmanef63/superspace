import type { Id } from "@convex/_generated/dataModel";
import { CreateDocumentDialog } from "../shared";

interface CreateDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: Id<"workspaces">;
  onDocumentCreated: (documentId: Id<"documents">) => void;
}

export function CreateDocumentModal({
  isOpen,
  onClose,
  workspaceId,
  onDocumentCreated,
}: CreateDocumentModalProps) {
  return (
    <CreateDocumentDialog
      open={isOpen}
      onOpenChange={(next) => {
        if (!next) {
          onClose();
        }
      }}
      workspaceId={workspaceId}
      onCreated={onDocumentCreated}
    />
  );
}
