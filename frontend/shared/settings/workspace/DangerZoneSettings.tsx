"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useState } from "react";
import { Trash2, RefreshCw, Loader2, AlertCircle } from "lucide-react";
import type { Id } from "@convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

export interface DangerZoneSettingsProps {
  workspaceId: Id<"workspaces">;
}

export function DangerZoneSettings({ workspaceId }: DangerZoneSettingsProps) {
  const workspace = useQuery(api.workspace.workspaces.getWorkspace, { workspaceId });
  const deleteWorkspace = useMutation(api.workspace.workspaces.deleteWorkspace as any);
  const resetWorkspace = useMutation(api.workspace.workspaces.resetWorkspace as any);
  const router = useRouter();
  const { toast } = useToast();

  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [resetMode, setResetMode] = useState<'replaceMenus'|'clean'>('replaceMenus');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleDelete = async () => {
    if (!workspace) return;

    setIsDeleting(true);
    try {
      await deleteWorkspace({ workspaceId });
      toast({
        title: "Workspace deleted",
        description: "Your workspace has been permanently deleted",
      });
      router.replace('/dashboard?deleted=1');
    } catch (error) {
      toast({
        title: "Error deleting workspace",
        description: "Failed to delete workspace. Please try again.",
        variant: "destructive",
      });
      setIsDeleting(false);
    }
  };

  const handleResetConfirm = async () => {
    setIsResetting(true);
    try {
      await resetWorkspace({ workspaceId, mode: resetMode });
      setShowResetDialog(false);
      toast({
        title: "Workspace reset",
        description: "Your workspace has been reset successfully",
      });
    } catch (error) {
      toast({
        title: "Error resetting workspace",
        description: "Failed to reset workspace. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  }

  if (!workspace) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Danger Zone Card */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible actions that affect your workspace
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border border-muted p-4">
            <div className="space-y-0.5">
              <h3 className="font-medium">Reset Workspace</h3>
              <p className="text-sm text-muted-foreground">
                Re-initialize workspace menus to default settings
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              className="gap-2"
              onClick={() => setShowResetDialog(true)}
              disabled={isDeleting || isResetting}
            >
              <RefreshCw className="w-4 h-4" />
              Reset
            </Button>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-destructive/50 bg-destructive/5 p-4">
            <div className="space-y-0.5">
              <h3 className="font-medium text-destructive">Delete Workspace</h3>
              <p className="text-sm text-muted-foreground">
                Permanently delete this workspace and all its data
              </p>
            </div>
            <Button
              type="button"
              variant="destructive"
              className="gap-2"
              onClick={() => setShowDeleteDialog(true)}
              disabled={isDeleting || isResetting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Delete
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reset Dialog */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RefreshCw className="w-5 h-5" />
              Reset Workspace
            </DialogTitle>
            <DialogDescription>
              Choose how you want to re-initialize this workspace's menus. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <RadioGroup value={resetMode} onValueChange={(v) => setResetMode(v as any)} disabled={isResetting}>
              <div className="flex items-start gap-3 rounded-lg border p-4 cursor-pointer hover:bg-accent/50 transition-colors">
                <RadioGroupItem value="replaceMenus" id="replaceMenus" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="replaceMenus" className="font-medium cursor-pointer">
                    Replace menus
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Delete current default set items and reinstall default menus.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg border p-4 cursor-pointer hover:bg-accent/50 transition-colors">
                <RadioGroupItem value="clean" id="clean" className="mt-1" />
                <div className="flex-1">
                  <Label htmlFor="clean" className="font-medium cursor-pointer">
                    Clean reinit
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Remove all workspace-owned menu sets and items, then reinstall defaults in a fresh set.
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowResetDialog(false)}
              disabled={isResetting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleResetConfirm}
              disabled={isResetting}
              className="gap-2"
            >
              {isResetting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Resetting...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4" />
                  Confirm Reset
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="w-5 h-5" />
              Are you absolutely sure?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                This action cannot be undone. This will permanently delete the workspace{" "}
                <span className="font-semibold text-foreground">"{workspace.name}"</span> and remove all associated data.
              </p>
              <p className="text-destructive font-medium">
                All pages, documents, and settings will be lost forever.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 gap-2"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Delete Workspace
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
