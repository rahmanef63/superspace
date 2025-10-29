"use client";

import { useEffect, useMemo, useState } from "react";
import type { Id } from "@convex/_generated/dataModel";
import { CommentsPanel } from "@/frontend/shared/communications/comments/components/CommentsPanel";
import {
  useDocumentById,
  useMenuPresenceUserId,
  useUpdateDocument,
} from "../../../api/documents";
import { TiptapCanvas } from "./TiptapCanvas";
import { DocumentPresenceIndicator } from "../DocumentPresenceIndicator";
import { formatRelativeTime, getCharacterCount, getWordCount, ensureTitle } from "../../utils";
import { cn } from "@/lib/utils";

export interface TiptapDocumentEditorProps {
  documentId: Id<"documents">;
  onBack?: () => void;
  className?: string;
}

export function TiptapDocumentEditor({ documentId, onBack, className }: TiptapDocumentEditorProps) {
  const document = useDocumentById(documentId);
  const updateDocument = useUpdateDocument();
  const userId = useMenuPresenceUserId();

  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    if (document) {
      setContent(document.content || "");
      setTitle(document.title);
      setIsPublic(document.isPublic);
      setHasUnsavedChanges(false);
    }
  }, [document]);

  const handleSave = async () => {
    if (!hasUnsavedChanges) return;

    try {
      await updateDocument({
        id: documentId,
        title: ensureTitle(title),
        content,
        isPublic,
      });
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error("Failed to save document", error);
    }
  };

  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const timer = setTimeout(() => {
      handleSave();
    }, 2000);

    return () => clearTimeout(timer);
  }, [content, title, isPublic, hasUnsavedChanges]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleSave();
      }
    };

    window.document.addEventListener("keydown", handler);
    return () => window.document.removeEventListener("keydown", handler);
  }, [handleSave]);

  const stats = useMemo(() => ({
    words: getWordCount(content),
    characters: getCharacterCount(content),
  }), [content]);

  if (!document) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-500">Loading document...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex h-full bg-white", className)}>
      <div className="flex-1 flex flex-col">
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              {onBack && (
                <button
                  onClick={onBack}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  {"<- Back"}
                </button>
              )}

              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setHasUnsavedChanges(true);
                }}
                className="flex-1 text-2xl font-semibold text-gray-900 bg-transparent border-none outline-none"
                placeholder="Untitled"
              />

              <button
                onClick={() => {
                  setIsPublic((prev) => !prev);
                  setHasUnsavedChanges(true);
                }}
                className={cn("flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors", isPublic ? "bg-green-50 text-green-700 hover:bg-green-100" : "bg-gray-50 text-gray-700 hover:bg-gray-100")}
              >
                {isPublic ? "Public" : "Private"}
              </button>

              <button
                className={cn("flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors", hasUnsavedChanges ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-gray-100 text-gray-400 cursor-not-allowed")}
                disabled={!hasUnsavedChanges}
              >
                {hasUnsavedChanges ? "Save" : "Saved"}
              </button>
            </div>

            {userId && (
              <DocumentPresenceIndicator roomId={documentId} userId={userId} showLabel={false} />
            )}
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <TiptapCanvas
            documentId={documentId}
            content={content}
            onChange={(value) => {
              setContent(value);
              setHasUnsavedChanges(true);
            }}
          />
        </div>

        <div className="border-t border-gray-200 px-6 py-2 bg-gray-50">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div>
              {stats.characters} characters • {stats.words} words
            </div>
            <div className="flex items-center gap-4">
              {hasUnsavedChanges && <span className="text-orange-600">Unsaved changes</span>}
              <button
                onClick={() => setShowComments((prev) => !prev)}
                className="text-blue-600 hover:text-blue-700"
              >
                {showComments ? "Hide comments" : "Show comments"}
              </button>
              <span>Last modified: {formatRelativeTime(document.lastModified ?? document._creationTime)}</span>
            </div>
          </div>
        </div>
      </div>

      {showComments && (
        <div className="w-80 border-l bg-gray-50">
          <CommentsPanel documentId={documentId} />
        </div>
      )}
    </div>
  );
}



