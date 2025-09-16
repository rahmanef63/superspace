import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";

interface SearchModalProps {
  workspaceId: Id<"workspaces">;
  isOpen: boolean;
  onClose: () => void;
  onSelectDocument: (documentId: Id<"documents">) => void;
}

export function SearchModal({ workspaceId, isOpen, onClose, onSelectDocument }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const searchResults = useQuery(
    api.menu.page.documents.searchDocuments,
    query.trim() ? { workspaceId, query } : "skip"
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-background rounded-lg w-full max-w-2xl mx-4 max-h-96 flex flex-col">
        <div className="p-4 border-b">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search documents..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
        </div>
        
        <div className="flex-1 overflow-auto p-4">
          {query.trim() && searchResults ? (
            <div className="space-y-2">
              {searchResults.map((doc) => (
                <button
                  key={doc._id}
                  onClick={() => {
                    onSelectDocument(doc._id);
                    onClose();
                  }}
                  className="w-full text-left p-3 hover:bg-gray-100 rounded-md"
                >
                  <div className="font-medium">{doc.title}</div>
                  <div className="text-sm text-gray-600">
                    Created {new Date(doc._creationTime).toLocaleDateString()}
                  </div>
                </button>
              ))}
              {searchResults.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  No documents found
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              Start typing to search documents
            </div>
          )}
        </div>
        
        <div className="p-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
