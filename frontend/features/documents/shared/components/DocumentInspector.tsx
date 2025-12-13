"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { Id } from "@convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, FileText, Link2, Link2Off, Tag, User, X } from "lucide-react";
import { formatRelativeTime } from "../utils";
import { useWorkspaceContext } from "@/frontend/shared/foundation/provider/WorkspaceProvider";
import { toast } from "sonner";

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
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState<string>("");
  const [selectedRowId, setSelectedRowId] = useState<string>("");
  const [isLinking, setIsLinking] = useState(false);
  const tags = document.tags || [];
  const { workspaceId } = useWorkspaceContext();

  const linkedRows = useQuery(
    (api.features.database.queries as any).getRowsLinkedToDoc,
    { docId: document._id },
  ) as Array<{
    rowId: Id<"dbRows">;
    tableId: Id<"dbTables">;
    tableName: string;
    rowTitle: string;
  }> | undefined;

  const tables = useQuery(
    (api.features.database.queries as any).list,
    workspaceId ? { workspaceId } : "skip",
  ) as Array<{ _id: Id<"dbTables">; name: string }> | undefined;

  const tableFields = useQuery(
    (api.features.database.queries as any).listFields,
    selectedTableId ? { tableId: selectedTableId as Id<"dbTables"> } : "skip",
  ) as Array<{ _id: Id<"dbFields">; name: string; type: string; isPrimary?: boolean; position?: number }> | undefined;

  const tableRows = useQuery(
    (api.features.database.queries as any).listRows,
    selectedTableId ? { tableId: selectedTableId as Id<"dbTables">, limit: 500 } : "skip",
  ) as Array<{ _id: Id<"dbRows">; data: Record<string, unknown> }> | undefined;

  const linkDocToRow = useMutation((api.features.database.mutations as any).linkDocToRow);
  const unlinkDocFromRow = useMutation((api.features.database.mutations as any).unlinkDocFromRow);

  const pickTitleFieldId = useMemo(() => {
    if (!tableFields || tableFields.length === 0) return null;
    const sorted = [...tableFields].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
    const primary = sorted.find((field) => Boolean(field.isPrimary));
    if (primary) return String(primary._id);
    const byName = sorted.find((field) => {
      const name = field.name.trim().toLowerCase();
      return name === "name" || name === "title";
    });
    if (byName) return String(byName._id);
    const firstText = sorted.find((field) => field.type === "text");
    if (firstText) return String(firstText._id);
    return String(sorted[0]._id);
  }, [tableFields]);

  const rowChoices = useMemo(() => {
    if (!tableRows) return [];

    const toTitleText = (value: unknown) => {
      if (value === null || value === undefined) return null;
      if (typeof value === "string") return value.trim() || null;
      if (typeof value === "number") return String(value);
      if (typeof value === "boolean") return value ? "True" : "False";
      if (typeof value === "object") {
        if ("title" in value && typeof (value as any).title === "string") {
          return (value as any).title.trim() || null;
        }
        if ("name" in value && typeof (value as any).name === "string") {
          return (value as any).name.trim() || null;
        }
      }
      return String(value);
    };

    return tableRows.map((row) => {
      const titleValue = pickTitleFieldId ? row.data?.[pickTitleFieldId] : undefined;
      return {
        id: String(row._id),
        title: toTitleText(titleValue) ?? `Row ${String(row._id)}`,
      };
    });
  }, [pickTitleFieldId, tableRows]);

  const sortedLinkedRows = useMemo(() => {
    const items = linkedRows ?? [];
    return [...items].sort((a, b) => {
      if (a.tableName !== b.tableName) return a.tableName.localeCompare(b.tableName);
      return a.rowTitle.localeCompare(b.rowTitle);
    });
  }, [linkedRows]);

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

  const handleLinkRow = async () => {
    if (!selectedRowId) return;
    setIsLinking(true);
    try {
      await linkDocToRow({
        rowId: selectedRowId as Id<"dbRows">,
        docId: document._id,
      });
      setLinkDialogOpen(false);
      setSelectedTableId("");
      setSelectedRowId("");
      toast.success("Linked to database row.");
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Failed to link database row.");
    } finally {
      setIsLinking(false);
    }
  };

  const handleUnlinkRow = async (rowId: Id<"dbRows">) => {
    setIsLinking(true);
    try {
      await unlinkDocFromRow({ rowId, docId: document._id });
      toast.success("Unlinked database row.");
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Failed to unlink database row.");
    } finally {
      setIsLinking(false);
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

      <Separator className="my-4" />

      {/* Backlinks / Related Items */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2 text-sm font-semibold">
            <Link2 className="h-4 w-4" />
            Related items
          </Label>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="h-8"
            onClick={() => setLinkDialogOpen(true)}
            disabled={!workspaceId}
          >
            Link
          </Button>
        </div>

        {linkedRows === undefined ? (
          <p className="text-sm text-muted-foreground">Loading related items...</p>
        ) : sortedLinkedRows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No related database rows.</p>
        ) : (
          <div className="space-y-2">
            {sortedLinkedRows.map((link) => (
              <div
                key={`${String(link.tableId)}:${String(link.rowId)}`}
                className="flex items-center justify-between gap-2 rounded-md border p-2"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{link.rowTitle}</p>
                  <p className="text-xs text-muted-foreground truncate">{link.tableName}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button asChild variant="ghost" size="sm" className="h-7 px-2">
                    <Link href={`/dashboard/database?tableId=${encodeURIComponent(String(link.tableId))}`}>
                      Open
                    </Link>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleUnlinkRow(link.rowId)}
                    disabled={isLinking}
                    title="Unlink"
                  >
                    <Link2Off className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Dialog
        open={linkDialogOpen}
        onOpenChange={(nextOpen) => {
          setLinkDialogOpen(nextOpen);
          if (!nextOpen) {
            setSelectedTableId("");
            setSelectedRowId("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link database row</DialogTitle>
            <DialogDescription>
              Choose a database and a row to link to this document.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Database</Label>
              <Select
                value={selectedTableId}
                onValueChange={(value) => {
                  setSelectedTableId(value);
                  setSelectedRowId("");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder={tables === undefined ? "Loading..." : "Select a database"} />
                </SelectTrigger>
                <SelectContent>
                  {(tables ?? []).map((table) => (
                    <SelectItem key={String(table._id)} value={String(table._id)}>
                      {table.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedTableId ? (
              <div className="space-y-1.5">
                <Label>Row</Label>
                <Command>
                  <CommandInput placeholder="Search rows..." />
                  <CommandList className="max-h-[240px]">
                    <CommandEmpty>No rows found.</CommandEmpty>
                    <CommandGroup>
                      {rowChoices.map((choice) => (
                        <CommandItem
                          key={choice.id}
                          value={choice.title}
                          onSelect={() => setSelectedRowId(choice.id)}
                        >
                          <div className="flex items-center justify-between w-full gap-2">
                            <span className="truncate">{choice.title}</span>
                            {selectedRowId === choice.id ? (
                              <Badge variant="secondary" className="text-[10px]">
                                Selected
                              </Badge>
                            ) : null}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </div>
            ) : null}
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setLinkDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleLinkRow} disabled={!selectedRowId || isLinking}>
              Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
