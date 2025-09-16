import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { TiptapEditor } from "./TiptapEditor";
import { CommentsPanel } from "../../../shared/components/comments/components/CommentsPanel";
import { useState } from "react";

interface DocumentEditorProps {
  documentId: Id<"documents">;
  onBack: () => void;
}

export function DocumentEditor({ documentId, onBack }: DocumentEditorProps) {
  const document = useQuery(api.menu.page.documents.getDocument, { documentId });
  const updateDocument = useMutation(api.menu.page.documents.updateDocument);
  const [showComments, setShowComments] = useState(false);

  if (!document) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleContentChange = async (content: string) => {
    await updateDocument({
      documentId,
      title: document.title,
      content,
    });
  };

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b bg-background px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              ← Back
            </button>
            <h1 className="text-xl font-semibold">{document.title}</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowComments(!showComments)}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Comments
            </button>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 overflow-auto">
          <TiptapEditor
            content={document.content || ""}
            onChange={handleContentChange}
            documentId={documentId}
          />
        </div>
      </div>

      {/* Comments Panel */}
      {showComments && (
        <div className="w-80 border-l bg-gray-50">
          <CommentsPanel documentId={documentId} />
        </div>
      )}
    </div>
  );
}
