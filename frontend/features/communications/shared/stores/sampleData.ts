/**
 * Sample Data for Communications Feature
 * 
 * Provides demo data for development and testing.
 * This will be replaced with real Convex data in production.
 * 
 * @module features/communications/shared/stores/sampleData
 */

import type {
  Channel,
  ChannelCategory,
  Message,
  DirectConversation,
  DirectMessage,
  AIBot,
  UserPresence,
} from "../types"

// =============================================================================
// SAMPLE CATEGORIES
// =============================================================================

export const SAMPLE_CATEGORIES: ChannelCategory[] = [
  {
    id: "cat-1",
    workspaceId: "ws-1",
    name: "General",
    position: 0,
    isCollapsed: false,
  },
  {
    id: "cat-2",
    workspaceId: "ws-1",
    name: "Development",
    position: 1,
    isCollapsed: false,
  },
  {
    id: "cat-3",
    workspaceId: "ws-1",
    name: "Teams",
    position: 2,
    isCollapsed: false,
  },
]

// =============================================================================
// SAMPLE CHANNELS
// =============================================================================

export const SAMPLE_CHANNELS: Channel[] = [
  {
    id: "ch-general",
    workspaceId: "ws-1",
    categoryId: "cat-1",
    name: "general",
    type: "text",
    topic: "General discussion for everyone",
    description: "This is the main channel for general conversations",
    isPrivate: false,
    position: 0,
    memberCount: 42,
  },
  {
    id: "ch-announcements",
    workspaceId: "ws-1",
    categoryId: "cat-1",
    name: "announcements",
    type: "announcement",
    topic: "Important updates and announcements",
    isPrivate: false,
    position: 1,
    memberCount: 42,
  },
  {
    id: "ch-random",
    workspaceId: "ws-1",
    categoryId: "cat-1",
    name: "random",
    type: "text",
    topic: "Off-topic conversations and fun stuff",
    isPrivate: false,
    position: 2,
    memberCount: 38,
  },
  {
    id: "ch-frontend",
    workspaceId: "ws-1",
    categoryId: "cat-2",
    name: "frontend",
    type: "text",
    topic: "React, Next.js, and UI discussions",
    isPrivate: false,
    position: 0,
    memberCount: 15,
  },
  {
    id: "ch-backend",
    workspaceId: "ws-1",
    categoryId: "cat-2",
    name: "backend",
    type: "text",
    topic: "Convex, APIs, and server-side development",
    isPrivate: false,
    position: 1,
    memberCount: 12,
  },
  {
    id: "ch-design",
    workspaceId: "ws-1",
    categoryId: "cat-3",
    name: "design",
    type: "text",
    topic: "UI/UX design discussions",
    isPrivate: false,
    position: 0,
    memberCount: 8,
  },
  {
    id: "ch-voice-lounge",
    workspaceId: "ws-1",
    categoryId: "cat-3",
    name: "Voice Lounge",
    type: "voice",
    topic: "Hangout and voice chat",
    isPrivate: false,
    position: 1,
    memberCount: 20,
  },
]

// =============================================================================
// SAMPLE MESSAGES
// =============================================================================

const createMessage = (
  id: string,
  channelId: string,
  content: string,
  senderId: string,
  senderName: string,
  createdAtOffset: number
): Message => {
  const createdAt = new Date(Date.now() - createdAtOffset).toISOString()
  return {
    id,
    channelId,
    content,
    senderId,
    senderType: "user",
    sender: {
      id: senderId,
      name: senderName,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${senderName}`,
    },
    type: "text",
    createdAt,
    timestamp: new Date(createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    attachments: [],
    reactions: [],
    isEdited: false,
    isPinned: false,
  }
}

export const SAMPLE_MESSAGES: Record<string, Message[]> = {
  "ch-general": [
    createMessage("msg-1", "ch-general", "Hey everyone! 👋 Welcome to the new Communications feature!", "user-1", "Alex", 3600000),
    createMessage("msg-2", "ch-general", "This looks amazing! Great work on the redesign.", "user-2", "Sarah", 3500000),
    createMessage("msg-3", "ch-general", "I love the Discord/Slack style layout. Very intuitive!", "user-3", "Mike", 3400000),
    createMessage("msg-4", "ch-general", "Can we try the voice channels too?", "user-4", "Emma", 3300000),
    createMessage("msg-5", "ch-general", "Yes! The voice lounge is in the Teams category 🎤", "user-1", "Alex", 3200000),
  ],
  "ch-announcements": [
    createMessage("msg-ann-1", "ch-announcements", "📢 **New Feature Launch**: Communications is now live!", "user-1", "Alex", 7200000),
    createMessage("msg-ann-2", "ch-announcements", "Please report any bugs in the #frontend channel.", "user-1", "Alex", 7100000),
  ],
  "ch-frontend": [
    createMessage("msg-fe-1", "ch-frontend", "Just pushed the new channel sidebar component", "user-2", "Sarah", 1800000),
    createMessage("msg-fe-2", "ch-frontend", "Nice! The collapsible categories work great.", "user-3", "Mike", 1700000),
    createMessage("msg-fe-3", "ch-frontend", "Should we add drag-and-drop for channel ordering?", "user-2", "Sarah", 1600000),
  ],
  "ch-backend": [
    createMessage("msg-be-1", "ch-backend", "Convex schema for channels is ready for review", "user-1", "Alex", 5400000),
    createMessage("msg-be-2", "ch-backend", "Looking at it now. The permissions system looks solid.", "user-4", "Emma", 5300000),
  ],
  "ch-random": [
    createMessage("msg-rnd-1", "ch-random", "Anyone up for a coffee break? ☕", "user-3", "Mike", 900000),
    createMessage("msg-rnd-2", "ch-random", "Sure! Meet in the voice lounge in 5?", "user-4", "Emma", 850000),
  ],
}

// =============================================================================
// SAMPLE DM CONVERSATIONS
// =============================================================================

export const SAMPLE_DM_CONVERSATIONS: DirectConversation[] = [
  {
    id: "dm-1",
    type: "direct",
    participantIds: ["user-1", "user-2"],
    participants: [
      { 
        id: "part-1",
        conversationId: "dm-1",
        userId: "user-1", 
        user: {
          id: "user-1",
          name: "Alex", 
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex", 
          status: "online",
        },
        joinedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      { 
        id: "part-2",
        conversationId: "dm-1",
        userId: "user-2", 
        user: {
          id: "user-2",
          name: "Sarah", 
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah", 
          status: "online",
        },
        joinedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    lastMessageAt: new Date(Date.now() - 300000).toISOString(),
    unreadCount: 2,
    createdBy: "user-1",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "dm-2",
    type: "direct",
    participantIds: ["user-1", "user-3"],
    participants: [
      { 
        id: "part-3",
        conversationId: "dm-2",
        userId: "user-1", 
        user: {
          id: "user-1",
          name: "Alex", 
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex", 
          status: "online",
        },
        joinedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      { 
        id: "part-4",
        conversationId: "dm-2",
        userId: "user-3", 
        user: {
          id: "user-3",
          name: "Mike", 
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike", 
          status: "idle",
        },
        joinedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    lastMessageAt: new Date(Date.now() - 3600000).toISOString(),
    unreadCount: 0,
    createdBy: "user-1",
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "dm-3",
    type: "direct",
    participantIds: ["user-1", "user-4"],
    participants: [
      { 
        id: "part-5",
        conversationId: "dm-3",
        userId: "user-1", 
        user: {
          id: "user-1",
          name: "Alex", 
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex", 
          status: "online",
        },
        joinedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      { 
        id: "part-6",
        conversationId: "dm-3",
        userId: "user-4", 
        user: {
          id: "user-4",
          name: "Emma", 
          avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma", 
          status: "offline",
        },
        joinedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ],
    lastMessageAt: new Date(Date.now() - 86400000).toISOString(),
    unreadCount: 0,
    createdBy: "user-1",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

// =============================================================================
// SAMPLE AI BOTS
// =============================================================================

export const SAMPLE_AI_BOTS: AIBot[] = [
  {
    id: "bot-assistant",
    workspaceId: "ws-1",
    name: "ai-assistant",
    displayName: "AI Assistant",
    description: "General purpose AI assistant for the workspace",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=assistant",
    type: "assistant",
    aiConfig: {
      provider: "openai",
      model: "gpt-4",
      canReadMessages: true,
      canSendMessages: true,
      triggerOnMention: true,
    },
    isActive: true,
    createdBy: "user-1",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "bot-coder",
    workspaceId: "ws-1",
    name: "code-helper",
    displayName: "Code Helper",
    description: "Specialized in code review and programming help",
    avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=coder",
    type: "custom",
    aiConfig: {
      provider: "anthropic",
      model: "claude-3",
      canReadMessages: true,
      canSendMessages: true,
      triggerOnMention: true,
    },
    isActive: true,
    createdBy: "user-1",
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

// =============================================================================
// SAMPLE PRESENCE
// =============================================================================

export const SAMPLE_PRESENCE: Record<string, UserPresence> = {
  "user-1": {
    userId: "user-1",
    workspaceId: "ws-1",
    status: "online",
    customStatus: {
      text: "Working on Communications",
      emoji: "💻",
    },
    lastActiveAt: new Date().toISOString(),
  },
  "user-2": {
    userId: "user-2",
    workspaceId: "ws-1",
    status: "online",
    lastActiveAt: new Date(Date.now() - 60000).toISOString(),
  },
  "user-3": {
    userId: "user-3",
    workspaceId: "ws-1",
    status: "idle",
    lastActiveAt: new Date(Date.now() - 300000).toISOString(),
  },
  "user-4": {
    userId: "user-4",
    workspaceId: "ws-1",
    status: "offline",
    lastActiveAt: new Date(Date.now() - 3600000).toISOString(),
  },
}

// =============================================================================
// HELPER TO INITIALIZE STORE WITH SAMPLE DATA
// =============================================================================

export function getSampleStoreData() {
  return {
    categories: SAMPLE_CATEGORIES,
    channels: SAMPLE_CHANNELS,
    messages: SAMPLE_MESSAGES,
    dmConversations: SAMPLE_DM_CONVERSATIONS,
    aiBots: SAMPLE_AI_BOTS,
    presence: SAMPLE_PRESENCE,
  }
}
