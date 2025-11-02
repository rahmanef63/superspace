"use client";

import { useState } from "react";
import type { Id } from "@convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, FileText, Tag, User, X } from "lucide-react";
import { formatRelativeTime } from "../utils";

export interface DocumentInspectorProps {
  document: {
    _id: Id<"documents">;
    title: string;
    isPublic: boolean;
    createdAt: number;
    updatedAt: number;
    tags?: string[];
    owner?: {
      name?: string;
      email?: string;
    };
    wordCount?: number;
  };
  onTagAdd?: (tag: string) => void;
  onTagRemove?: (tag: string) => void;
  onClose?: () => void;
  isMobile?: boolean;
}

export function DocumentInspector({
  document,
  onTagAdd,
  onTagRemove,
  onClose,
  isMobile = false,
}: DocumentInspectorProps) {
  const [newTag, setNewTag] = useState("");
  const tags = document.tags || [];

  const handleAddTag = () => {
    const trimmedTag = newTag.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      onTagAdd?.(trimmedTag);
      setNewTag("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className={`flex flex-col h-full ${isMobile ? "p-4" : "p-6"} bg-background border-l overflow-y-auto`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Inspector
        </h2>
        {isMobile && onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Tags Section */}
      <div className="space-y-3 mb-6">
        <Label className="flex items-center gap-2 text-sm font-semibold">
          <Tag className="h-4 w-4" />
          Tags
        </Label>

        {/* Tag Input */}
        <div className="flex gap-2">
          <Input
            placeholder="Add tag..."
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
          />
          <Button size="sm" onClick={handleAddTag} disabled={!newTag.trim()}>
            Add
          </Button>
        </div>

        {/* Tags List */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="flex items-center gap-1 pl-2 pr-1"
              >
                {tag}
                {onTagRemove && (
                  <button
                    onClick={() => onTagRemove(tag)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </Badge>
            ))}
          </div>
        )}

        {tags.length === 0 && (
          <p className="text-sm text-muted-foreground">No tags yet</p>
        )}
      </div>

      <Separator className="my-4" />

      {/* Document Details */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold">Details</h3>

        {/* Visibility */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Visibility</span>
          <Badge variant={document.isPublic ? "default" : "secondary"}>
            {document.isPublic ? "Public" : "Private"}
          </Badge>
        </div>

        {/* Owner */}
        {document.owner && (
          <div className="flex items-start gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-muted-foreground text-xs">Owner</p>
              <p className="font-medium truncate">{document.owner.name || "Unknown"}</p>
              {document.owner.email && (
                <p className="text-xs text-muted-foreground truncate">{document.owner.email}</p>
              )}
            </div>
          </div>
        )}

        {/* Created */}
        <div className="flex items-start gap-2 text-sm">
          <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
          <div className="flex-1">
            <p className="text-muted-foreground text-xs">Created</p>
            <p className="font-medium">{formatRelativeTime(document.createdAt)}</p>
          </div>
        </div>

        {/* Modified */}
        <div className="flex items-start gap-2 text-sm">
          <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
          <div className="flex-1">
            <p className="text-muted-foreground text-xs">Modified</p>
            <p className="font-medium">{formatRelativeTime(document.updatedAt)}</p>
          </div>
        </div>

        {/* Word Count */}
        {document.wordCount !== undefined && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Word count</span>
            <span className="font-medium">{document.wordCount.toLocaleString()}</span>
          </div>
        )}
      </div>
    </div>
  );
}
