"use client";

import { useState } from "react";
import type { Id } from "@convex/_generated/dataModel";
import { FileText, BookOpen, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useCreateDocument } from "../../api";
import { ensureTitle } from "../utils";
import type { DocumentCategory } from "../types";
import { getCategoryTag } from "../types";

export interface CreateDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: Id<"workspaces">;
  onCreated?: (documentId: Id<"documents">) => void;
  defaultVisibility?: "public" | "private";
  /** Document category - affects how the document is categorized */
  category?: DocumentCategory;
}

export function CreateDocumentDialog({
  open,
  onOpenChange,
  workspaceId,
  onCreated,
  defaultVisibility = "private",
  category = "document",
}: CreateDocumentDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createDocument = useCreateDocument();

  const reset = () => {
    setTitle("");
    setDescription("");
  };

  const handleClose = (nextOpen: boolean) => {
    if (!isSubmitting) {
      onOpenChange(nextOpen);
      if (!nextOpen) {
        reset();
      }
    }
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
    event.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const documentId = await createDocument({
        workspaceId,
        title: ensureTitle(title),
        isPublic: defaultVisibility === "public",
        content: description.trim() ? description.trim() : undefined,
        metadata: {
          tags: [getCategoryTag(category)],
        },
      });

      onCreated?.(documentId);
      handleClose(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isArticle = category === "article";
  const Icon = isArticle ? BookOpen : FileText;
  const typeLabel = isArticle ? "Article" : "Document";

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="w-5 h-5 text-primary" />
            Create New {typeLabel}
          </DialogTitle>
          <DialogDescription>
            {isArticle
              ? "Create a knowledge base article for AI context and team documentation."
              : "Spin up a collaborative document for your workspace."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="document-title">{typeLabel} title *</Label>
            <Input
              id="document-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder={isArticle ? "Getting Started Guide" : "Daily standup notes"}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="document-description">Initial content (optional)</Label>
            <Textarea
              id="document-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder={
                isArticle
                  ? "Start with an overview of what this article covers..."
                  : "Jot down a quick agenda or leave empty to start fresh."
              }
              rows={4}
              disabled={isSubmitting}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => handleClose(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting || !title.trim()}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating
                </>
              ) : (
                <>
                  <Icon className="w-4 h-4 mr-2" />
                  Create {typeLabel.toLowerCase()}
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
