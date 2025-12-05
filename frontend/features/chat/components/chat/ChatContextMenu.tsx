/**
 * Chat Context Menu
 * Wrapper around shared ConversationContextMenu for Chat-specific usage
 * @module features/chat
 */

"use client"

import * as React from "react"
import { 
  ConversationContextMenu, 
  type ConversationItem,
  type ConversationCallbacks 
} from "@/frontend/shared/communications/conversation"
import type { Chat } from "@/frontend/features/chat/shared/types/core"
import { Users } from "lucide-react"

export interface ChatContextMenuProps extends ConversationCallbacks<ConversationItem> {
  chat: Chat
  children: React.ReactNode
  onManageParticipants?: (chat: Chat) => void
}

/**
 * Chat-specific context menu using shared ConversationContextMenu
 */
export function ChatContextMenu({
  chat,
  children,
  onEdit,
  onPin,
  onMute,
  onArchive,
  onFavorite,
  onLeave,
  onDelete,
  onManageParticipants,
}: ChatContextMenuProps) {
  // Convert Chat to ConversationItem
  const item: ConversationItem = {
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

  // Custom action for manage participants
  const customActions = onManageParticipants && chat.isGroup
    ? [{
        id: 'manage-participants',
        label: 'Manage Participants',
        icon: Users,
        onClick: () => onManageParticipants(chat),
      }]
    : undefined

  return (
    <ConversationContextMenu
      item={item}
      context="chat"
      showLeave={Boolean(chat.isGroup)}
      isGroup={chat.isGroup}
      customActions={customActions}
      onEdit={onEdit ? () => onEdit(item) : undefined}
      onPin={onPin}
      onFavorite={onFavorite}
      onMute={onMute}
      onArchive={onArchive}
      onLeave={onLeave}
      onDelete={onDelete}
    >
      {children}
    </ConversationContextMenu>
  )
}

export default ChatContextMenu
