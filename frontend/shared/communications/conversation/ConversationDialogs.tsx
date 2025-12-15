/**
 * Shared Dialogs for Conversations
 * Used by Chat, AI, and other conversation-like features
 * @module shared/communications/conversation
 */

"use client"

import * as React from "react"
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Camera } from "lucide-react"
import type { ConversationItem, ConversationContext, ConversationLabels } from "./types"
import { getLabels } from "./types"

// ============================================================================
// Utility Functions
// ============================================================================

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

// ============================================================================
// Edit/Rename Dialog
// ============================================================================

export interface EditConversationDialogProps<T extends ConversationItem = ConversationItem> {
  /** The conversation item to edit */
  item: T | null
  /** Whether the dialog is open */
  isOpen: boolean
  /** Callback when dialog is closed */
  onClose: () => void
  /** Callback when changes are saved */
  onSave: (id: string, data: { name?: string; description?: string }) => Promise<void>
  /** Whether save is in progress */
  isLoading?: boolean
  /** Context for label customization */
  context?: ConversationContext
  /** Custom labels override */
  labels?: Partial<ConversationLabels>
  /** Whether to show description field */
  showDescription?: boolean
  /** Whether to show avatar */
  showAvatar?: boolean
  /** Whether to allow avatar upload (future feature) */
  allowAvatarUpload?: boolean
}

export function EditConversationDialog<T extends ConversationItem = ConversationItem>({
  item,
  isOpen,
  onClose,
  onSave,
  isLoading = false,
  context = 'chat',
  labels: customLabels,
  showDescription = true,
  showAvatar = true,
  allowAvatarUpload = false,
}: EditConversationDialogProps<T>) {
  const labels = getLabels(context, customLabels)
  const [name, setName] = React.useState("")
  const [description, setDescription] = React.useState("")

  // Reset form when dialog opens with new item
  React.useEffect(() => {
    if (item && isOpen) {
      setName(item.name || "")
      setDescription(item.description || "")
    }
  }, [item, isOpen])

  const handleSave = async () => {
    if (!item) return
    await onSave(item.id, { 
      name: name.trim() || undefined, 
      description: showDescription ? (description.trim() || undefined) : undefined 
    })
    onClose()
  }

  const handleClose = () => {
    setName("")
    setDescription("")
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{labels.editTitle || labels.editLabel || `Edit ${labels.itemType}`}</DialogTitle>
          <DialogDescription>
            {labels.editDescription || `Update the ${labels.itemType?.toLowerCase()} details.`}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Avatar Preview */}
          {showAvatar && (
            <div className="flex justify-center">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={item?.avatar} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xl font-medium">
                    {getInitials(name || item?.name || "?")}
                  </AvatarFallback>
                </Avatar>
                {allowAvatarUpload && (
                  <Button
                    size="icon"
                    variant="secondary"
                    className="absolute bottom-0 right-0 h-7 w-7 rounded-full"
                    disabled
                    title="Upload custom avatar"
                  >
                    <Camera className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Name Input */}
          <div className="grid gap-2">
            <Label htmlFor="item-name">Name</Label>
            <Input
              id="item-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={`${labels.itemType} name...`}
              disabled={isLoading}
            />
          </div>

          {/* Description Input */}
          {showDescription && (
            <div className="grid gap-2">
              <Label htmlFor="item-description">Description (optional)</Label>
              <Textarea
                id="item-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description..."
                rows={3}
                disabled={isLoading}
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading || !name.trim()}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ============================================================================
// Delete Confirmation Dialog
// ============================================================================

export interface DeleteConversationDialogProps<T extends ConversationItem = ConversationItem> {
  /** The conversation item to delete */
  item: T | null
  /** Whether the dialog is open */
  isOpen: boolean
  /** Callback when dialog is closed */
  onClose: () => void
  /** Callback when deletion is confirmed */
  onConfirm: (id: string) => Promise<void>
  /** Whether deletion is in progress */
  isLoading?: boolean
  /** Context for label customization */
  context?: ConversationContext
  /** Custom labels override */
  labels?: Partial<ConversationLabels>
}

export function DeleteConversationDialog<T extends ConversationItem = ConversationItem>({
  item,
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  context = 'chat',
  labels: customLabels,
}: DeleteConversationDialogProps<T>) {
  const labels = getLabels(context, customLabels)

  const handleConfirm = async () => {
    if (!item) return
    await onConfirm(item.id)
    onClose()
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {labels.deleteTitle || `Delete ${labels.itemType}?`}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {labels.deleteDescription || 
              `This action cannot be undone. This will permanently delete "${item?.name}".`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// ============================================================================
// Leave Confirmation Dialog
// ============================================================================

export interface LeaveConversationDialogProps<T extends ConversationItem = ConversationItem> {
  /** The conversation item to leave */
  item: T | null
  /** Whether the dialog is open */
  isOpen: boolean
  /** Callback when dialog is closed */
  onClose: () => void
  /** Callback when leaving is confirmed */
  onConfirm: (id: string) => Promise<void>
  /** Whether leaving is in progress */
  isLoading?: boolean
  /** Context for label customization */
  context?: ConversationContext
  /** Custom labels override */
  labels?: Partial<ConversationLabels>
}

export function LeaveConversationDialog<T extends ConversationItem = ConversationItem>({
  item,
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  context = 'chat',
  labels: customLabels,
}: LeaveConversationDialogProps<T>) {
  const labels = getLabels(context, customLabels)

  const handleConfirm = async () => {
    if (!item) return
    await onConfirm(item.id)
    onClose()
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {labels.leaveTitle || 'Leave Conversation?'}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {labels.leaveDescription || 
              `Are you sure you want to leave "${item?.name}"? You won't be able to see new messages unless you're added back.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Leave
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// ============================================================================
// Archive Confirmation Dialog (Optional - for features that need confirmation)
// ============================================================================

export interface ArchiveConversationDialogProps<T extends ConversationItem = ConversationItem> {
  /** The conversation item to archive */
  item: T | null
  /** Whether the dialog is open */
  isOpen: boolean
  /** Callback when dialog is closed */
  onClose: () => void
  /** Callback when archive is confirmed */
  onConfirm: (id: string, isArchived: boolean) => Promise<void>
  /** Whether archive is in progress */
  isLoading?: boolean
  /** Context for label customization */
  context?: ConversationContext
  /** Custom labels override */
  labels?: Partial<ConversationLabels>
}

export function ArchiveConversationDialog<T extends ConversationItem = ConversationItem>({
  item,
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  context = 'chat',
  labels: customLabels,
}: ArchiveConversationDialogProps<T>) {
  const labels = getLabels(context, customLabels)
  const isCurrentlyArchived = item?.isArchived || false

  const handleConfirm = async () => {
    if (!item) return
    await onConfirm(item.id, !isCurrentlyArchived)
    onClose()
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isCurrentlyArchived 
              ? `Unarchive ${labels.itemType}?` 
              : `Archive ${labels.itemType}?`}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {isCurrentlyArchived
              ? `This will move "${item?.name}" back to your active ${labels.itemTypePlural?.toLowerCase()}.`
              : `This will move "${item?.name}" to your archived ${labels.itemTypePlural?.toLowerCase()}.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isCurrentlyArchived ? 'Unarchive' : 'Archive'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

export default {
  EditConversationDialog,
  DeleteConversationDialog,
  LeaveConversationDialog,
  ArchiveConversationDialog,
}
