"use client";

import type { Id } from "@convex/_generated/dataModel";
import type { DocumentEditorMode } from "../../types";
import { BlockNoteDocumentEditor } from "./BlockNoteDocumentEditor";
import { TiptapDocumentEditor } from "./TiptapDocumentEditor";

export interface DocumentEditorProps {
  documentId: Id<"documents">;
  mode?: DocumentEditorMode;
  onBack?: () => void;
  className?: string;
}

export function DocumentEditor({ mode = "block", ...props }: DocumentEditorProps) {
  if (mode === "tiptap") {
    return <TiptapDocumentEditor {...props} />;
  }

  return <BlockNoteDocumentEditor {...props} />;
}

export { BlockNoteDocumentEditor, TiptapDocumentEditor };
