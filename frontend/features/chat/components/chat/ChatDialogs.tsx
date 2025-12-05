/**
 * Chat Dialogs
 * Wrapper around shared ConversationDialogs for Chat-specific usage
 * @module features/chat
 */

"use client"

import * as React from "react"
import {
  EditConversationDialog,
  DeleteConversationDialog,
  LeaveConversationDialog,
  type ConversationItem,
} from "@/frontend/shared/communications/conversation"
import type { Chat } from "@/frontend/features/chat/shared/types/core"

// ============================================================================
// Helper: Convert Chat to ConversationItem
// ============================================================================

function chatToConversationItem(chat: Chat | null): ConversationItem | null {
  if (!chat) return null
  return {
    id: chat.id,
    name: chat.name,
    description: chat.description,
    avatar: chat.avatar,
    timestamp: chat.timestamp,
    isPinned: chat.isPinned,
    isFavorite: chat.isFavorite,
    isMuted: chat.isMuted,
    isArchived: chat.isArchived,
    tags: chat.tags,
    unreadCount: chat.unreadCount,
  }
}

// ============================================================================
// Edit Chat Dialog
// ============================================================================

export interface EditChatDialogProps {
  chat: Chat | null
  isOpen: boolean
  onClose: () => void
  onSave: (chatId: string, data: { name?: string; description?: string }) => Promise<void>
  isLoading?: boolean
}

export function EditChatDialog({
  chat,
  isOpen,
  onClose,
  onSave,
  isLoading = false,
}: EditChatDialogProps) {
  return (
    <EditConversationDialog
      item={chatToConversationItem(chat)}
      isOpen={isOpen}
      onClose={onClose}
      onSave={onSave}
      isLoading={isLoading}
      context="chat"
      showDescription={true}
      showAvatar={true}
    />
  )
}

// ============================================================================
// Leave Chat Confirmation Dialog
// ============================================================================

export interface LeaveChatDialogProps {
  chat: Chat | null
  isOpen: boolean
  onClose: () => void
  onConfirm: (chatId: string) => Promise<void>
  isLoading?: boolean
}

export function LeaveChatDialog({
  chat,
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: LeaveChatDialogProps) {
  return (
    <LeaveConversationDialog
      item={chatToConversationItem(chat)}
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      isLoading={isLoading}
      context="chat"
    />
  )
}

// ============================================================================
// Delete Chat Confirmation Dialog
// ============================================================================

export interface DeleteChatDialogProps {
  chat: Chat | null
  isOpen: boolean
  onClose: () => void
  onConfirm: (chatId: string) => Promise<void>
  isLoading?: boolean
}

export function DeleteChatDialog({
  chat,
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: DeleteChatDialogProps) {
  return (
    <DeleteConversationDialog
      item={chatToConversationItem(chat)}
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      isLoading={isLoading}
      context="chat"
    />
  )
}
