/**
 * Convex adapter for shared chat module
 * @module features/chat/adapters/convexChatAdapter
 */

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { ChatDataSource } from "@/frontend/shared/chat";

/**
 * Create Convex chat data source
 * Uses real Convex queries and mutations
 */
export function useConvexChatDataSource(workspaceId: Id<"workspaces"> | null): ChatDataSource {
  // Mutations
  const sendMessageMutation = useMutation(api.menu.chat.mutations.sendMessage);
  const editMessageMutation = useMutation(api.menu.chat.mutations.editMessage);
  const deleteMessageMutation = useMutation(api.menu.chat.mutations.deleteMessage);
  const pinMessageMutation = useMutation(api.menu.chat.mutations.pinMessage);
  const updateRoomMutation = useMutation(api.menu.chat.mutations.updateRoom);
  const manageParticipantMutation = useMutation(api.menu.chat.mutations.manageParticipant);

  return {
    listMessages: async (roomId, cursor) => {
      // Use query client-side, this is a placeholder
      // In real implementation, you'd useQuery hook at component level
      return {
        items: [],
        hasMore: false,
        cursor: undefined,
      };
    },

    getRoomMeta: async (roomId) => {
      return {
        id: roomId,
        name: "Chat Room",
        isGroup: true,
      };
    },

    listParticipants: async (roomId) => {
      return [];
    },

    sendMessage: async (roomId, draft) => {
      const result = await sendMessageMutation({
        roomId: roomId as Id<"chatRooms">,
        workspaceId,
        text: draft.text,
        markdown: draft.markdown,
        threadOf: draft.threadOf as Id<"chatMessages"> | undefined,
        meta: draft.meta,
      });

      return result as any;
    },

    editMessage: async (roomId, messageId, patch) => {
      const result = await editMessageMutation({
        roomId: roomId as Id<"chatRooms">,
        messageId: messageId as Id<"chatMessages">,
        patch,
      });

      return result as any;
    },

    deleteMessage: async (roomId, messageId, hard) => {
      await deleteMessageMutation({
        roomId: roomId as Id<"chatRooms">,
        messageId: messageId as Id<"chatMessages">,
        hard,
      });
    },

    pinMessage: async (roomId, messageId, pinned) => {
      await pinMessageMutation({
        roomId: roomId as Id<"chatRooms">,
        messageId: messageId as Id<"chatMessages">,
        pinned,
      });
    },

    updateRoom: async (roomId, patch) => {
      await updateRoomMutation({
        roomId: roomId as Id<"chatRooms">,
        patch,
      });
    },

    manageParticipant: async (roomId, userId, action) => {
      await manageParticipantMutation({
        roomId: roomId as Id<"chatRooms">,
        userId,
        action,
      });
    },
  };
}

/**
 * Hook to get messages for a room
 */
export function useChatMessages(roomId: string | undefined) {
  const messages = useQuery(
    api.menu.chat.queries.listMessages,
    roomId ? { roomId: roomId as Id<"chatRooms"> } : "skip"
  );

  return messages || [];
}

/**
 * Hook to get room metadata
 */
export function useChatRoom(roomId: string | undefined) {
  const room = useQuery(
    api.menu.chat.queries.getRoomMeta,
    roomId ? { roomId: roomId as Id<"chatRooms"> } : "skip"
  );

  return room;
}

/**
 * Hook to get participants
 */
export function useChatParticipants(roomId: string | undefined) {
  const participants = useQuery(
    api.menu.chat.queries.listParticipants,
    roomId ? { roomId: roomId as Id<"chatRooms"> } : "skip"
  );

  return participants || [];
}
