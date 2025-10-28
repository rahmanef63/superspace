import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Doc, Id } from "@convex/_generated/dataModel";
import { useState } from "react";

type CommentWithUser = Doc<"comments"> & {
  user: { name?: string; email?: string; image?: string } | null;
};

interface CommentsPanelProps {
  documentId: Id<"documents">;
}

export function CommentsPanel({ documentId }: CommentsPanelProps) {
  const comments = useQuery(api.workspace.comments.getDocumentComments, { documentId });
  const addComment = useMutation(api.workspace.comments.addComment);
  const [newComment, setNewComment] = useState("");

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    
    await addComment({
      documentId,
      content: newComment,
    });
    setNewComment("");
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h3 className="font-semibold">Comments</h3>
      </div>
      
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {comments?.map((comment: CommentWithUser) => (
          <div key={comment._id} className="bg-background p-3 rounded-lg border">
            <div className="text-sm text-gray-600 mb-1">
              User • {new Date(comment._creationTime).toLocaleDateString()}
            </div>
            <div className="text-sm">{comment.content}</div>
          </div>
        ))}
      </div>
      
      <div className="p-4 border-t">
        <div className="space-y-2">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="w-full p-2 text-sm border rounded-md resize-none"
            rows={3}
          />
          <button
            onClick={handleAddComment}
            disabled={!newComment.trim()}
            className="w-full px-3 py-2 text-sm bg-blue-600 text-primary rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            Add Comment
          </button>
        </div>
      </div>
    </div>
  );
}
