"use client";

import { useState } from "react";
import type { Id } from "@convex/_generated/dataModel";
import { FileText, Loader2 } from "lucide-react";
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

export interface CreateDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: Id<"workspaces">;
  onCreated?: (documentId: Id<"documents">) => void;
  defaultVisibility?: "public" | "private";
}

export function CreateDocumentDialog({
  open,
  onOpenChange,
  workspaceId,
  onCreated,
  defaultVisibility = "private",
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
      });

      onCreated?.(documentId);
      handleClose(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Create New Document
          </DialogTitle>
          <DialogDescription>
            Spin up a collaborative document for your workspace.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="document-title">Document title *</Label>
            <Input
              id="document-title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Daily standup notes"
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
              placeholder="Jot down a quick agenda or leave empty to start fresh."
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
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={isSubmitting || !title.trim()}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Create document
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
