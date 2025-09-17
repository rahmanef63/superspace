import type { Id } from "@convex/_generated/dataModel";
import type { DocumentEditorMode } from "../shared";
import { WorkspaceDocumentsManager } from "../shared";

interface DocumentsManagerProps {
  workspaceId: Id<"workspaces">;
  editorMode?: DocumentEditorMode;
  storageKey?: string;
}

export function DocumentsManager({ workspaceId, editorMode = "block", storageKey }: DocumentsManagerProps) {
  return (
    <WorkspaceDocumentsManager
      workspaceId={workspaceId}
      editorMode={editorMode}
      storageKey={storageKey}
    />
  );
}
