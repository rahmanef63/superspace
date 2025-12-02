/**
 * Workspace Dialogs
 * 
 * Create, Edit, and Delete confirmation dialogs
 */

"use client"

import * as React from "react"
import { Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { InlineColorPicker } from "./ColorPicker"
import { IconPicker, DynamicIcon } from "./IconPicker"
import { WORKSPACE_TYPE_OPTIONS } from "../constants"
import type { WorkspaceStoreItem, WorkspaceType } from "../types"

// ============================================================================
// Create Workspace Dialog
// ============================================================================

interface CreateWorkspaceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: {
    name: string
    description?: string
    type: WorkspaceType
    icon?: string
    color?: string
    parentId?: string
  }) => Promise<void>
  parentWorkspace?: WorkspaceStoreItem | null
}

export function CreateWorkspaceDialog({
  open,
  onOpenChange,
  onSubmit,
  parentWorkspace,
}: CreateWorkspaceDialogProps) {
  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [type, setType] = React.useState<WorkspaceType>("group")
  const [icon, setIcon] = React.useState("Folder")
  const [color, setColor] = React.useState("#3B82F6")
  const [loading, setLoading] = React.useState(false)
  const [showIconPicker, setShowIconPicker] = React.useState(false)
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    
    setLoading(true)
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim() || undefined,
        type,
        icon,
        color,
        parentId: parentWorkspace?.id,
      })
      // Reset form
      setName("")
      setDescription("")
      setType("group")
      setIcon("Folder")
      setColor("#3B82F6")
      onOpenChange(false)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {parentWorkspace
                ? `Create Child Workspace in ${parentWorkspace.name}`
                : "Create Workspace"
              }
            </DialogTitle>
            <DialogDescription>
              Create a new workspace to organize your work.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Workspace name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
                rows={2}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as WorkspaceType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WORKSPACE_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-4">
              <div className="space-y-2">
                <Label>Icon</Label>
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 w-12"
                  onClick={() => setShowIconPicker(true)}
                >
                  <DynamicIcon name={icon} className="h-6 w-6" />
                </Button>
              </div>
              
              <div className="flex-1 space-y-2">
                <Label>Color</Label>
                <InlineColorPicker value={color} onChange={setColor} showCustom />
              </div>
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !name.trim()}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <IconPicker
        icon={icon}
        onIconChange={setIcon}
        onClose={() => setShowIconPicker(false)}
        asDialog
        open={showIconPicker}
        onOpenChange={setShowIconPicker}
      />
    </>
  )
}

// ============================================================================
// Edit Workspace Dialog
// ============================================================================

interface EditWorkspaceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workspace: WorkspaceStoreItem | null
  onSubmit: (data: {
    name: string
    description?: string
    type: WorkspaceType
    icon?: string
    color?: string
  }) => Promise<void>
}

export function EditWorkspaceDialog({
  open,
  onOpenChange,
  workspace,
  onSubmit,
}: EditWorkspaceDialogProps) {
  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [type, setType] = React.useState<WorkspaceType>("group")
  const [icon, setIcon] = React.useState("Folder")
  const [color, setColor] = React.useState("#3B82F6")
  const [loading, setLoading] = React.useState(false)
  const [showIconPicker, setShowIconPicker] = React.useState(false)
  
  // Sync with workspace prop
  React.useEffect(() => {
    if (workspace) {
      setName(workspace.name)
      setDescription(workspace.description || "")
      setType(workspace.type)
      setIcon(workspace.icon || "Folder")
      setColor(workspace.color || "#3B82F6")
    }
  }, [workspace])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    
    setLoading(true)
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim() || undefined,
        type,
        icon,
        color,
      })
      onOpenChange(false)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Workspace</DialogTitle>
            <DialogDescription>
              Update workspace details.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name *</Label>
              <Input
                id="edit-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Workspace name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description"
                rows={2}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-type">Type</Label>
              <Select value={type} onValueChange={(v) => setType(v as WorkspaceType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WORKSPACE_TYPE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex gap-4">
              <div className="space-y-2">
                <Label>Icon</Label>
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 w-12"
                  onClick={() => setShowIconPicker(true)}
                >
                  <DynamicIcon name={icon} className="h-6 w-6" />
                </Button>
              </div>
              
              <div className="flex-1 space-y-2">
                <Label>Color</Label>
                <InlineColorPicker value={color} onChange={setColor} showCustom />
              </div>
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading || !name.trim()}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <IconPicker
        icon={icon}
        onIconChange={setIcon}
        onClose={() => setShowIconPicker(false)}
        asDialog
        open={showIconPicker}
        onOpenChange={setShowIconPicker}
      />
    </>
  )
}

// ============================================================================
// Delete Confirmation Dialog
// ============================================================================

interface DeleteWorkspaceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workspace: WorkspaceStoreItem | null
  onConfirm: () => Promise<void>
  hasChildren?: boolean
}

export function DeleteWorkspaceDialog({
  open,
  onOpenChange,
  workspace,
  onConfirm,
  hasChildren = false,
}: DeleteWorkspaceDialogProps) {
  const [loading, setLoading] = React.useState(false)
  
  const handleConfirm = async () => {
    setLoading(true)
    try {
      await onConfirm()
      onOpenChange(false)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Workspace</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{workspace?.name}</strong>?
            {hasChildren && (
              <span className="mt-2 block text-destructive">
                This workspace has child workspaces. Deleting it will orphan
                those children or move them to the parent level.
              </span>
            )}
            <span className="mt-2 block">
              This action cannot be undone.
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// ============================================================================
// Move Workspace Dialog
// ============================================================================

interface MoveWorkspaceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workspace: WorkspaceStoreItem | null
  availableTargets: WorkspaceStoreItem[]
  onSubmit: (targetParentId: string | null) => Promise<void>
}

export function MoveWorkspaceDialog({
  open,
  onOpenChange,
  workspace,
  availableTargets,
  onSubmit,
}: MoveWorkspaceDialogProps) {
  const [targetId, setTargetId] = React.useState<string>("root")
  const [loading, setLoading] = React.useState(false)
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubmit(targetId === "root" ? null : targetId)
      onOpenChange(false)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Move Workspace</DialogTitle>
          <DialogDescription>
            Move <strong>{workspace?.name}</strong> to a new parent.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="target-parent">New Parent</Label>
            <Select value={targetId} onValueChange={setTargetId}>
              <SelectTrigger>
                <SelectValue placeholder="Select parent..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="root">
                  (Root Level - No Parent)
                </SelectItem>
                {availableTargets.map((target) => (
                  <SelectItem key={target.id} value={target.id}>
                    {target.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Move
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
