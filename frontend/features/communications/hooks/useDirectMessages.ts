/**
 * Direct Message Hooks
 * 
 * Hooks for fetching and managing direct conversations and messages.
 * 
 * @module features/communications/hooks
 */

"use client"

import { useQuery, useMutation } from "convex/react"
// import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import type { DirectConversation, Message } from "../shared"

interface UseDirectConversationsOptions {
  workspaceId?: Id<"workspaces">
}

/**
 * Fetch direct conversations for the current user
 */
export function useDirectConversations(options: UseDirectConversationsOptions = {}) {
  // TODO: Implement Convex query when backend is ready
  // const conversations = useQuery(
  //   api.features.communications.direct.list,
  //   { workspaceId: options.workspaceId }
  // )

  const conversations: DirectConversation[] = []
  const isLoading = false
  const error = null

  return {
    conversations,
    isLoading,
    error,
  }
}

interface UseDirectMessagesOptions {
  conversationId?: Id<"directConversations">
  limit?: number
  cursor?: string
}

/**
 * Fetch messages for a direct conversation with pagination
 */
export function useDirectMessages(options: UseDirectMessagesOptions = {}) {
  // TODO: Implement Convex query when backend is ready
  // const result = useQuery(
  //   api.features.communications.direct.messages,
  //   options.conversationId ? {
  //     conversationId: options.conversationId,
  //     limit: options.limit || 50,
  //     cursor: options.cursor,
  //   } : "skip"
  // )

  const messages: Message[] = []
  const hasMore = false
  const nextCursor: string | null = null
  const isLoading = false
  const error = null

  return {
    messages,
    hasMore,
    nextCursor,
    isLoading,
    error,
  }
}

/**
 * Direct message mutation hooks
 */
export function useDirectMessageMutations() {
  // TODO: Implement Convex mutations when backend is ready
  // const createConversation = useMutation(api.features.communications.direct.create)
  // const sendMessage = useMutation(api.features.communications.direct.sendMessage)
  // const markAsRead = useMutation(api.features.communications.direct.markAsRead)
  // const archiveConversation = useMutation(api.features.communications.direct.archive)

  return {
    /**
     * Start or get a direct conversation with one or more users
     */
    createConversation: async (data: {
      participantIds: Id<"users">[]
      workspaceId?: Id<"workspaces">
      name?: string // For group DMs
    }) => {
      console.log("Creating/getting conversation:", data)
      // return await createConversation(data)
    },
    
    /**
     * Send a message in a direct conversation
     */
    sendMessage: async (data: {
      conversationId: Id<"directConversations">
      content: string
      type?: Message["type"]
      attachments?: Message["attachments"]
    }) => {
      console.log("Sending DM:", data)
      // return await sendMessage(data)
    },
    
    /**
     * Mark a conversation as read up to a specific message
     */
    markAsRead: async (conversationId: Id<"directConversations">, messageId?: Id<"directMessages">) => {
      console.log("Marking as read:", conversationId, messageId)
      // return await markAsRead({ conversationId, messageId })
    },
    
    /**
     * Archive a conversation (hide from list but keep messages)
     */
    archiveConversation: async (conversationId: Id<"directConversations">) => {
      console.log("Archiving conversation:", conversationId)
      // return await archiveConversation({ conversationId })
    },
    
    /**
     * Unarchive a conversation
     */
    unarchiveConversation: async (conversationId: Id<"directConversations">) => {
      console.log("Unarchiving conversation:", conversationId)
      // return await unarchiveConversation({ conversationId })
    },
  }
}

/**
 * Find or create a conversation with a specific user
 */
export function useStartConversation() {
  const { createConversation } = useDirectMessageMutations()
  
  return async (userId: Id<"users">, workspaceId?: Id<"workspaces">) => {
    return createConversation({
      participantIds: [userId],
      workspaceId,
    })
  }
}

export default useDirectConversations
