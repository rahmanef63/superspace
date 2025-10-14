"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useBlockNoteSync } from "@convex-dev/prosemirror-sync/blocknote";
import { BlockNoteEditor, BlockNoteSchema } from "@blocknote/core";
import { BlockNoteView } from "@blocknote/mantine";
import { ArrowLeft, ArrowLeftIcon, Edit3, Globe, Lock, Save } from "lucide-react";
import { toast } from "sonner";
import type { Id } from "@convex/_generated/dataModel";
import { api } from "@convex/_generated/api";
import {
  useDocumentById,
  useMenuPresenceUserId,
  useToggleDocumentPublic,
  useUpdateDocumentTitle,
} from "../../../api/documents";
import { DocumentPresenceIndicator } from "../DocumentPresenceIndicator";
import { formatRelativeTime } from "../../utils";
import { cn } from "@/lib/utils";

import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";

export interface BlockNoteDocumentEditorProps {
  documentId: Id<"documents">;
  onBack?: () => void;
  className?: string;
}

export function BlockNoteDocumentEditor({ documentId, onBack, className }: BlockNoteDocumentEditorProps) {
  const { theme, resolvedTheme } = useTheme();
  const document = useDocumentById(documentId);
  const updateTitle = useUpdateDocumentTitle();
  const togglePublic = useToggleDocumentPublic();
  const userId = useMenuPresenceUserId();

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState("");

  // Determine the effective theme for BlockNote (only supports 'light' or 'dark')
  const blockNoteTheme = (resolvedTheme === "dark" ? "dark" : "light") as "light" | "dark";

  const sync = useBlockNoteSync<BlockNoteEditor>(
    api.menu.page.prosemirror,
    documentId,
    BlockNoteSchema.create()
  );

  useEffect(() => {
    if (document) {
      setTitleValue(document.title);
    }
  }, [document]);

  const handleSaveTitle = async () => {
    if (!titleValue.trim() || !document) return;

    try {
      await updateTitle({ id: documentId, title: titleValue.trim() });
      setIsEditingTitle(false);
      toast.success("Title updated");
    } catch (error) {
      toast.error("Failed to update title");
      setTitleValue(document.title);
    }
  };

  const handleTogglePublic = async () => {
    try {
      await togglePublic({ id: documentId });
      toast.success(document?.isPublic ? "Document made private" : "Document made public");
    } catch (error) {
      toast.error("Failed to update document visibility");
    }
  };

  if (!document) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading document...</p>
        </div>
      </div>
    );
  }

  const canEdit = userId === document.createdBy;

  return (
    <div className={cn("h-full flex flex-col  bg-background", className)}>
      <div className="border-b border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3 flex-1">
            {onBack && (
              <button
                onClick={onBack}
                className="text-xl text-muted-foreground hover:text-foreground"
              >
                <ArrowLeftIcon className="w-4 h-4" />
              </button>
            )}

            {isEditingTitle ? (
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="text"
                  value={titleValue}
                  onChange={(e) => setTitleValue(e.target.value)}
                  onBlur={handleSaveTitle}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSaveTitle();
                    } else if (e.key === "Escape") {
                      setTitleValue(document.title);
                      setIsEditingTitle(false);
                    }
                  }}
                  className="text-2xl font-bold text-foreground bg-transparent border-none outline-none flex-1"
                  autoFocus
                />
                <button
                  onClick={handleSaveTitle}
                  className="p-1 text-primary hover:text-primary/80"
                >
                  <Save className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 flex-1">
                <h1 className="text-2xl font-bold text-foreground">{document.title}</h1>
                {canEdit && (
                  <button
                    onClick={() => setIsEditingTitle(true)}
                    className="p-1 text-muted-foreground hover:text-foreground"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {userId && documentId && (
              <DocumentPresenceIndicator roomId={documentId} userId={userId} />
            )}

            {canEdit && (
              <button
                onClick={handleTogglePublic}
                className={cn("flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors", document.isPublic ? "bg-accent text-accent-foreground hover:bg-accent/90" : "bg-muted text-foreground hover:bg-muted/80")}
              >
                {document.isPublic ? (
                  <>
                    <Globe className="w-4 h-4" />
                    Public
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    Private
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          Last modified: {formatRelativeTime(document.lastModified ?? document._creationTime)}
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="h-full p-6">
          {sync.isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
                <p className="text-gray-500">Loading editor...</p>
              </div>
            </div>
          ) : sync.editor ? (
            <div className="h-full">
              {(() => {
                try {
                  return (
                    <BlockNoteView
                      editor={sync.editor}
                      theme={blockNoteTheme}
                      className="h-full"
                    />
                  );
                } catch (error) {
                  console.error("BlockNoteView error:", error);
                  return (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center text-red-600">
                        <p>Error loading editor</p>
                        <p className="text-sm text-muted-foreground">Check console for details</p>
                      </div>
                    </div>
                  );
                }
              })()}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <button
                onClick={() => sync.create({ type: "doc", content: [] })}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Initialize Document
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


