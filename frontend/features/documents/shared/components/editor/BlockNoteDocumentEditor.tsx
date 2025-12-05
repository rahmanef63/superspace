"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useBlockNoteSync } from "@convex-dev/prosemirror-sync/blocknote";
import { BlockNoteEditor, BlockNoteSchema } from "@blocknote/core";
import { BlockNoteView } from "@blocknote/mantine";
import { ArrowLeftIcon, Globe, Lock } from "lucide-react";
import { Switch } from "@/components/ui/switch";
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

// Note: @blocknote/core/fonts/inter.css is not available in package
// Fonts are included in @blocknote/mantine/style.css
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

  const [titleValue, setTitleValue] = useState("");
  const [isTitleFocused, setIsTitleFocused] = useState(false);

  // Determine the effective theme for BlockNote (only supports 'light' or 'dark')
  const blockNoteTheme = (resolvedTheme === "dark" ? "dark" : "light") as "light" | "dark";

  const sync = useBlockNoteSync<BlockNoteEditor>(
    (api as any)["features/docs/prosemirror"],
    documentId,
    BlockNoteSchema.create()
  );

  // Auto-initialize document if not exists
  useEffect(() => {
    if (!sync.isLoading && !sync.editor && document) {
      // Document exists but prosemirror doc doesn't - auto-initialize
      sync.create({ type: "doc", content: [] });
    }
  }, [sync.isLoading, sync.editor, sync, document]);

  useEffect(() => {
    if (document) {
      setTitleValue(document.title);
    }
  }, [document]);

  const handleSaveTitle = async () => {
    if (!document) return;
    
    const trimmedTitle = titleValue.trim();
    if (!trimmedTitle || trimmedTitle === document.title) {
      setTitleValue(document.title);
      return;
    }

    try {
      await updateTitle({ id: documentId, title: trimmedTitle });
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

            <input
              type="text"
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              onFocus={() => setIsTitleFocused(true)}
              onBlur={() => {
                setIsTitleFocused(false);
                handleSaveTitle();
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.currentTarget.blur();
                } else if (e.key === "Escape") {
                  setTitleValue(document.title);
                  e.currentTarget.blur();
                }
              }}
              disabled={!canEdit}
              className={cn(
                "text-xl font-semibold bg-transparent border-none outline-none flex-1 min-w-0",
                "focus:ring-0 focus:outline-none",
                canEdit && "hover:bg-muted/50 focus:bg-muted/50 rounded px-2 py-1 -ml-2",
                !canEdit && "cursor-default"
              )}
              placeholder="Untitled"
            />
          </div>

          <div className="flex items-center gap-4">
            {userId && documentId && (
              <DocumentPresenceIndicator roomId={documentId} userId={userId} />
            )}

            {canEdit && (
              <div className="flex items-center gap-2">
                <Switch
                  checked={document.isPublic}
                  onCheckedChange={handleTogglePublic}
                  className="data-[state=checked]:bg-primary"
                />
                <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                  {document.isPublic ? (
                    <><Globe className="w-3.5 h-3.5" /> Public</>
                  ) : (
                    <><Lock className="w-3.5 h-3.5" /> Private</>
                  )}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          Last modified {formatRelativeTime(document.lastModified ?? document._creationTime)}
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
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" />
                <p className="text-gray-500">Initializing document...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


