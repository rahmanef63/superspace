"use client";

import { useEffect, useState } from "react";
import type { Id } from "@convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { MoreVertical } from "lucide-react";
import type { DocumentEditorMode } from "../types";
import { BlockNoteDocumentEditor } from "./editor/BlockNoteDocumentEditor";
import { TiptapDocumentEditor } from "./editor/TiptapDocumentEditor";
import { DocumentInspector } from "./DocumentInspector";
import { useDocumentById } from "../../api/documents";

export interface DocumentDetailViewProps {
  documentId: Id<"documents">;
  mode?: DocumentEditorMode;
  onBack?: () => void;
  className?: string;
}

export function DocumentDetailView({ documentId, mode = "block", onBack, className }: DocumentDetailViewProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const document = useDocumentById(documentId);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // Use 1024px for desktop inspector threshold
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleTagAdd = async (tag: string) => {
    // TODO: Implement tag add mutation
  };

  const handleTagRemove = async (tag: string) => {
    // TODO: Implement tag remove mutation
  };

  const EditorComponent = mode === "tiptap" ? TiptapDocumentEditor : BlockNoteDocumentEditor;

  // Mobile: Editor with kebab menu for inspector drawer
  if (isMobile) {
    return (
      <div className="h-full relative">
        <EditorComponent
          documentId={documentId}
          onBack={onBack}
          className={className}
        />

        {/* Floating Kebab Menu Button */}
        {document && (
          <Sheet open={inspectorOpen} onOpenChange={setInspectorOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="fixed bottom-6 right-6 h-12 w-12 rounded-full shadow-lg z-50"
              >
                <MoreVertical className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh]">
              <DocumentInspector
                document={{
                  _id: document._id,
                  title: document.title,
                  isPublic: document.isPublic,
                  createdAt: document._creationTime,
                  updatedAt: document.lastModified || document._creationTime,
                  tags: document.tags,
                  owner: document.author ? {
                    name: document.author.name || undefined,
                    email: undefined,
                  } : undefined,
                }}
                onTagAdd={handleTagAdd}
                onTagRemove={handleTagRemove}
                onClose={() => setInspectorOpen(false)}
                isMobile={true}
              />
            </SheetContent>
          </Sheet>
        )}
      </div>
    );
  }

  // Desktop: Split view (Editor + Inspector)
  return (
    <div className="flex h-full">
      {/* Editor - Takes 60-70% */}
      <div className="flex-1 min-w-0">
        <EditorComponent
          documentId={documentId}
          onBack={onBack}
          className={className}
        />
      </div>

      {/* Inspector - Takes 30-40%, fixed width */}
      {document && (
        <div className="w-80 flex-shrink-0">
          <DocumentInspector
            document={{
              _id: document._id,
              title: document.title,
              isPublic: document.isPublic,
              createdAt: document._creationTime,
              updatedAt: document.lastModified || document._creationTime,
              tags: document.tags,
              owner: document.author ? {
                name: document.author.name || undefined,
                email: undefined,
              } : undefined,
            }}
            onTagAdd={handleTagAdd}
            onTagRemove={handleTagRemove}
            isMobile={false}
          />
        </div>
      )}
    </div>
  );
}

// Legacy export for backwards compatibility
export const DocumentEditor = DocumentDetailView;
export type DocumentEditorProps = DocumentDetailViewProps;

export { BlockNoteDocumentEditor, TiptapDocumentEditor };
