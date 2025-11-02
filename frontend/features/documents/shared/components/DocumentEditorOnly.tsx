"use client";

import type { Id } from "@convex/_generated/dataModel";
import type { DocumentEditorMode } from "../types";
import { BlockNoteDocumentEditor } from "./editor/BlockNoteDocumentEditor";
import { TiptapDocumentEditor } from "./editor/TiptapDocumentEditor";

export interface DocumentEditorOnlyProps {
  documentId: Id<"documents">;
  mode?: DocumentEditorMode;
  onBack?: () => void;
  className?: string;
}

/**
 * DocumentEditorOnly - Pure editor component without inspector
 * 
 * Used in 3-column layout where inspector is separate.
 * Does NOT include inspector panel - just the editor.
 */
export function DocumentEditorOnly({ 
  documentId, 
  mode = "block", 
  onBack, 
  className 
}: DocumentEditorOnlyProps) {
  const EditorComponent = mode === "tiptap" ? TiptapDocumentEditor : BlockNoteDocumentEditor;

  return (
    <EditorComponent
      documentId={documentId}
      onBack={onBack}
      className={className}
    />
  );
}
