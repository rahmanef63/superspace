"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import type { Id } from "@convex/_generated/dataModel";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { IconPicker } from "@/frontend/shared/ui";
import { useDatabaseMutations } from "../hooks/useDatabase";

export interface CreateDatabaseDialogProps {
  workspaceId: Id<"workspaces">;
  trigger?: ReactNode;
  onCreated?: (tableId: Id<"dbTables">) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function CreateDatabaseDialog({
  workspaceId,
  trigger,
  onCreated,
  open,
  onOpenChange,
}: CreateDatabaseDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("Database");
  const [color, setColor] = useState("default");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { createTable } = useDatabaseMutations();

  const resolvedOpen = open ?? internalOpen;

  const updateOpenState = (next: boolean) => {
    if (onOpenChange) {
      onOpenChange(next);
    } else {
      setInternalOpen(next);
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setIcon("Database");
    setColor("default");
    setError(null);
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Store icon as JSON string to preserve both icon name and color
      const iconData = JSON.stringify({ name: icon, color });

      const tableId = await createTable({
        workspaceId,
        name: name.trim(),
        description: description.trim() || undefined,
        icon: iconData,
      });

      resetForm();
      updateOpenState(false);

      if (onCreated && tableId) {
        onCreated(tableId as Id<"dbTables">);
      }
    } catch (err) {
      let message =
        err instanceof Error ? err.message : "Failed to create database";
      if (message.toLowerCase().includes("unauthorized")) {
        message =
          "You don't have permission to create databases in this workspace. Ask a workspace admin to grant access.";
      } else if (message.toLowerCase().includes("not authenticated")) {
        message = "You need to be signed in to create a database.";
      }
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {trigger ? (
        <span onClick={() => updateOpenState(true)}>{trigger}</span>
      ) : null}
      <Dialog open={resolvedOpen} onOpenChange={updateOpenState}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create database</DialogTitle>
            <DialogDescription>
              Spin up a new workspace database for teams, projects, or
              experiments.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Name
              </label>
              <Input
                autoFocus
                placeholder="Product roadmap"
                value={name}
                onChange={(event) => setName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && name.trim()) {
                    event.preventDefault();
                    void handleSubmit();
                  }
                }}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Icon & Color
              </label>
              <div className="mt-2">
                <IconPicker
                  icon={icon}
                  color={color}
                  onIconChange={setIcon}
                  onColorChange={setColor}
                  showColor={true}
                  showBackground={false}
                  className="w-full"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Description{" "}
                <span className="text-xs text-muted-foreground">(optional)</span>
              </label>
              <Textarea
                rows={3}
                placeholder="How will this database help your team?"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </div>

            {error ? (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            ) : null}
          </div>

          <DialogFooter className="gap-2 sm:justify-end">
            <Button
              variant="ghost"
              onClick={() => {
                resetForm();
                updateOpenState(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => void handleSubmit()}
              disabled={!name.trim() || isSubmitting}
            >
              {isSubmitting ? "Creating…" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
