"use client";

import { useEffect, useMemo, useState } from "react";
import { Globe, Lock, ArrowLeft } from "lucide-react";
import type { Id } from "@convex/_generated/dataModel";
import { Switch } from "@/components/ui/switch";
import { CommentsPanel } from "@/frontend/shared/communications";
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
    <div className={cn("flex h-full bg-background", className)}>
      <div className="flex-1 flex flex-col">
        <div className="border-b border-border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1">
              {onBack && (
                <button
                  onClick={onBack}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}

              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setHasUnsavedChanges(true);
                }}
                className={cn(
                  "flex-1 text-xl font-semibold bg-transparent border-none outline-none",
                  "hover:bg-muted/50 focus:bg-muted/50 rounded px-2 py-1 -ml-2"
                )}
                placeholder="Untitled"
              />
            </div>

            <div className="flex items-center gap-4">
              {userId && (
                <DocumentPresenceIndicator roomId={documentId} userId={userId} />
              )}

              <div className="flex items-center gap-2">
                <Switch
                  checked={isPublic}
                  onCheckedChange={(checked) => {
                    setIsPublic(checked);
                    setHasUnsavedChanges(true);
                  }}
                  className="data-[state=checked]:bg-primary"
                />
                <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                  {isPublic ? (
                    <><Globe className="w-3.5 h-3.5" /> Public</>
                  ) : (
                    <><Lock className="w-3.5 h-3.5" /> Private</>
                  )}
                </span>
              </div>

              <button
                onClick={handleSave}
                className={cn(
                  "px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
                  hasUnsavedChanges 
                    ? "bg-primary text-primary-foreground hover:bg-primary/90" 
                    : "bg-muted text-muted-foreground cursor-not-allowed"
                )}
                disabled={!hasUnsavedChanges}
              >
                {hasUnsavedChanges ? "Save" : "Saved"}
              </button>
            </div>
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

        <div className="border-t border-border px-6 py-2 bg-muted/30">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div>
              {stats.characters} characters • {stats.words} words
            </div>
            <div className="flex items-center gap-4">
              {hasUnsavedChanges && <span className="text-amber-600">Unsaved changes</span>}
              <button
                onClick={() => setShowComments((prev) => !prev)}
                className="text-primary hover:text-primary/80"
              >
                {showComments ? "Hide comments" : "Show comments"}
              </button>
              <span>Last modified {formatRelativeTime(document.lastModified ?? document._creationTime)}</span>
            </div>
          </div>
        </div>
      </div>

      {showComments && (
        <div className="w-80 border-l border-border bg-muted/30">
          <CommentsPanel documentId={documentId} />
        </div>
      )}
    </div>
  );
}



