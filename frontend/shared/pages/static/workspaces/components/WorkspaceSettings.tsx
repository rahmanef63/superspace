"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { useState } from "react";
import { Save, Trash2, RefreshCw } from "lucide-react";
import type { WorkspaceSettingsProps } from "./types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";

export function WorkspaceSettings({ workspaceId }: WorkspaceSettingsProps) {
  const workspace = useQuery(api.workspace.workspaces.getWorkspace, { workspaceId });
  const updateWorkspace = useMutation(api.workspace.workspaces.updateWorkspace);
  const deleteWorkspace = useMutation(api.workspace.workspaces.deleteWorkspace as any);
  const resetWorkspace = useMutation(api.workspace.workspaces.resetWorkspace as any);
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: workspace?.name || "",
    description: workspace?.description || "",
    isPublic: workspace?.isPublic || false,
  });
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [resetMode, setResetMode] = useState<'replaceMenus'|'clean'>('replaceMenus');
  const [isActing, setIsActing] = useState(false);

  const handleSave = async () => {
    if (!workspace) return;
    
    await updateWorkspace({
      workspaceId,
      name: formData.name,
      description: formData.description,
      isPublic: formData.isPublic,
    });
  };

  const handleDelete = async () => {
    if (!workspace) return;
    const ok = window.confirm('Delete this workspace? This cannot be undone.');
    if (!ok) return;
    setIsActing(true);
    try {
      await deleteWorkspace({ workspaceId });
      router.replace('/dashboard?deleted=1');
    } finally {
      setIsActing(false);
    }
  };

  const handleResetConfirm = async () => {
    setIsActing(true);
    try {
      await resetWorkspace({ workspaceId, mode: resetMode });
      setShowResetDialog(false);
    } finally {
      setIsActing(false);
    }
  }

  if (!workspace) return <div>Loading...</div>;

  return (
    <div className="flex-col justify-center items-center mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Workspace Settings</h1>
        <p className="text-muted-foreground">Manage your workspace configuration</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ws-name">Workspace Name</Label>
            <Input
              id="ws-name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="ws-desc">Description</Label>
            <Textarea
              id="ws-desc"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-between py-1">
            <div className="space-y-0.5">
              <Label htmlFor="ws-public">Make workspace public</Label>
              <p className="text-xs text-muted-foreground">Allow anyone with the link to view.</p>
            </div>
            <Switch
              id="ws-public"
              checked={formData.isPublic}
              onCheckedChange={(checked) => setFormData({ ...formData, isPublic: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-3">
        <Button onClick={handleSave} className="gap-2">
          <Save className="w-4 h-4" />
          Save Changes
        </Button>

        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" className="gap-2" onClick={() => setShowResetDialog(true)}>
            <RefreshCw className="w-4 h-4" />
            Reset Workspace
          </Button>
          <Button type="button" variant="ghost" disabled={isActing} onClick={handleDelete} className="gap-2 text-destructive hover:text-destructive">
            <Trash2 className="w-4 h-4" />
            Delete Workspace
          </Button>
        </div>
      </div>

      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Workspace</DialogTitle>
            <DialogDescription>
              Choose how you want to re-initialize this workspace's menus.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <RadioGroup value={resetMode} onValueChange={(v) => setResetMode(v as any)}>
              <div className="flex items-start gap-3">
                <RadioGroupItem value="replaceMenus" id="replaceMenus" />
                <div>
                  <Label htmlFor="replaceMenus">Replace menus</Label>
                  <p className="text-xs text-muted-foreground">Delete current default set items and reinstall default menus.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <RadioGroupItem value="clean" id="clean" />
                <div>
                  <Label htmlFor="clean">Clean reinit</Label>
                  <p className="text-xs text-muted-foreground">Remove all workspace-owned menu sets and items, then reinstall defaults in a fresh set.</p>
                </div>
              </div>
            </RadioGroup>
            <Separator />
            <div className="flex items-center justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setShowResetDialog(false)}>Cancel</Button>
              <Button type="button" onClick={handleResetConfirm} disabled={isActing}>
                {isActing ? 'Resetting...' : 'Confirm Reset'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
