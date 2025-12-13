# Communications Feature - Migration Plan

## Overview

This document outlines the migration from the current `chat` feature to the new unified `communications` feature that supports channels, video/audio calls, screen sharing, role-based permissions, and AI bots.

## Naming Decision

**Rename: `chat` → `communications`**

Rationale:
- More descriptive of the full feature set (chat, calls, video, AI)
- Aligns with industry terminology (Slack, Discord, Teams)
- Future-proof for additional communication features

## Shared Layout Integration

**All communications views MUST use shared layout components from `@/frontend/shared/ui/layout`**

### Required Layouts

```tsx
// Primary layouts to use
import {
  MasterDetailLayout,           // List + Detail split
  ThreeColumnLayout,            // Channels | Messages | Members
  SecondarySidebarWithView,     // Sidebar + Content
  SecondarySidebarLayout,       // Sidebar layout wrapper
  SecondarySidebar,             // Sidebar component
  SecondarySidebarHeader,       // Sidebar header
} from "@/frontend/shared/ui/layout"
```

### Layout Usage Examples

```tsx
// Channel view with member panel
<ThreeColumnLayout
  leftPanel={<ChannelList />}
  centerPanel={<MessageList />}
  rightPanel={<MemberPanel />}
  leftWidth={240}
  rightWidth={260}
/>

// Simple chat view (DMs)
<MasterDetailLayout
  listView={<ConversationList />}
  detailView={<ChatView />}
  hasSelection={!!selectedId}
/>

// DM view with sidebar
<SecondarySidebarWithView
  sidebar={<DirectMessageList />}
  content={<DirectMessageView />}
/>
```

## Current State

```
frontend/features/chat/          # OLD - WhatsApp-style chat (to be migrated)
├── components/
├── sections/ (left/center/right)
├── shared/ (hooks, stores, types)
└── views/

frontend/shared/communications/  # Shared components (keep & enhance)
├── chat/
├── conversation/
├── composer/
└── message/

convex/features/chat/            # OLD - conversations, messages (keep for now)
convex/features/calls/           # OLD - calls (merge into communications)
```

## Target State

```
frontend/features/communications/    # NEW - Unified communications
├── index.ts
├── config.ts
│
├── shared/                          # ✅ Created
│   ├── types/                       # ✅ Created
│   ├── permissions/                 # ✅ Created
│   ├── stores/                      # ✅ Created
│   ├── hooks/                       # To be created
│   └── constants/
│
├── components/                      # Feature-specific components
│   ├── channel/
│   ├── message/
│   ├── call/
│   ├── thread/
│   ├── direct/
│   ├── roles/
│   └── ai/
│
├── sections/                        # ✅ Created - Use shared layouts
│   ├── ChannelSidebar.tsx          # ✅ Uses SecondarySidebar
│   ├── MessageArea.tsx              # ✅ Main content
│   ├── MemberPanel.tsx              # ✅ Right panel
│   ├── DirectSidebar.tsx            # ✅ DM list
│   └── CallView.tsx                 # ✅ Video/audio call UI
│
├── hooks/                           # ✅ Created - Data fetching
│   ├── useChannels.ts              # ✅ Channel queries & mutations
│   ├── useMessages.ts               # ✅ Message queries & mutations
│   ├── useCalls.ts                  # ✅ Call queries & mutations
│   ├── usePresence.ts               # ✅ Presence queries & auto-presence
│   ├── useDirectMessages.ts         # ✅ DM queries & mutations
│   └── useAI.ts                     # ✅ AI bot queries & mutations
│
└── views/                           # ✅ Created - Page-level views
    └── CommunicationsView.tsx       # ✅ Uses ThreeColumnLayout/MasterDetailLayout

frontend/shared/communications/      # Shared (keep, enhance)
├── conversation/                    # ConversationContextMenu, etc.
├── message/                         # MessageItem, MessageList
├── composer/                        # MessageInput
└── components/                      # Shared UI pieces

convex/features/communications/      # ✅ Schema created
├── api/
│   └── schema.ts                    # ✅ Created
├── channels.ts                      # To be created
├── messages.ts
├── calls.ts
├── roles.ts
├── bots.ts
└── presence.ts
```

## Migration Phases

### Phase 1: Foundation (Completed ✅)

1. **Backend Schema** - `convex/features/communications/api/schema.ts`
   - ✅ Channel categories
   - ✅ Channels (text, voice, video, announcement, forum, stage, huddle)
   - ✅ Channel roles & permissions
   - ✅ Channel members
   - ✅ Channel messages
   - ✅ Threads
   - ✅ Calls with screen sharing
   - ✅ AI bots
   - ✅ Direct messages
   - ✅ Presence & typing indicators

2. **Frontend Types** - `frontend/features/communications/shared/types/`
   - ✅ Channel types
   - ✅ Message types
   - ✅ Call types
   - ✅ Role & permission types
   - ✅ AI bot types
   - ✅ DM types
   - ✅ Presence types

3. **Permission System** - `frontend/features/communications/shared/permissions/`
   - ✅ Permission flags (bitfield)
   - ✅ Role templates
   - ✅ Permission calculators
   - ✅ Permission checks

4. **Store** - `frontend/features/communications/shared/stores/`
   - ✅ Channel state
   - ✅ Thread state
   - ✅ Call state
   - ✅ DM state
   - ✅ Presence state
   - ✅ AI state
   - ✅ UI state
   - ✅ Selectors

### Phase 2: Views & Sections (Completed ✅)

1. **Views** - `frontend/features/communications/views/`
   - ✅ CommunicationsView - Main entry using ThreeColumnLayout/MasterDetailLayout

2. **Sections** - `frontend/features/communications/sections/`
   - ✅ ChannelSidebar - Using SecondarySidebar sections API
   - ✅ DirectSidebar - DM conversation list
   - ✅ MessageArea - Message display and input
   - ✅ MemberPanel - Channel member list with roles
   - ✅ CallView - Video/audio call UI with controls

3. **Hooks** - `frontend/features/communications/hooks/`
   - ✅ useChannels - Channel CRUD hooks (placeholder for Convex)
   - ✅ useMessages - Message CRUD hooks (placeholder for Convex)
   - ✅ useCalls - Call management hooks (placeholder for Convex)
   - ✅ usePresence - Presence management with auto-heartbeat
   - ✅ useDirectMessages - DM CRUD hooks (placeholder for Convex)
   - ✅ useAI - AI bot management hooks (placeholder for Convex)

### Phase 3: Backend Mutations (Next)

Create Convex mutations for:

```typescript
// channels.ts
- createChannel
- updateChannel
- deleteChannel
- archiveChannel
- joinChannel
- leaveChannel

// channelRoles.ts
- createRole
- updateRole
- deleteRole
- assignRole
- removeRole

// channelMessages.ts
- sendMessage
- editMessage
- deleteMessage
- pinMessage
- addReaction
- removeReaction

// calls.ts
- startCall
- joinCall
- leaveCall
- endCall
- updateMediaState
- startScreenShare
- stopScreenShare

// bots.ts
- createBot
- updateBot
- deleteBot
- addBotToChannel
- removeBotFromChannel

// presence.ts
- updatePresence
- setTyping
- clearTyping
```

### Phase 3: Hooks & Data Fetching

Create React hooks that connect to Convex:

```typescript
// useChannels.ts
- useWorkspaceChannels(workspaceId)
- useChannel(channelId)
- useChannelMessages(channelId)
- useChannelMembers(channelId)

// useRoles.ts
- useChannelRoles(channelId)
- useUserPermissions(channelId, userId)

// useCalls.ts
- useCall(callId)
- useCallParticipants(callId)
- useScreenShares(callId)

// useBots.ts
- useWorkspaceBots(workspaceId)
- useChannelBots(channelId)

// usePresence.ts
- useOnlineUsers(channelId)
- useTypingUsers(channelId)
```

### Phase 4: UI Components

Build shared UI components:

```
components/
├── channel/
│   ├── ChannelList.tsx          # List of channels with categories
│   ├── ChannelHeader.tsx        # Channel name, topic, actions
│   ├── ChannelSettings.tsx      # Channel settings modal
│   ├── ChannelInvite.tsx        # Invite members modal
│   └── CategoryAccordion.tsx    # Collapsible category
│
├── message/
│   ├── MessageList.tsx          # Virtual scrolling message list
│   ├── MessageItem.tsx          # Single message
│   ├── MessageInput.tsx         # Composer with rich text
│   ├── MessageReactions.tsx     # Reaction picker
│   ├── MessageActions.tsx       # Reply, edit, delete, etc.
│   └── MessageAttachments.tsx   # File/media display
│
├── thread/
│   ├── ThreadPanel.tsx          # Side panel for threads
│   ├── ThreadList.tsx           # List of threads
│   └── ThreadItem.tsx           # Thread preview
│
├── call/
│   ├── CallView.tsx             # Main call interface
│   ├── CallControls.tsx         # Mute, video, screen share buttons
│   ├── ParticipantGrid.tsx      # Video grid
│   ├── ParticipantTile.tsx      # Single participant
│   ├── ScreenShareView.tsx      # Screen share display
│   └── CallInvite.tsx           # Invite to call modal
│
├── roles/
│   ├── RoleManager.tsx          # Manage channel roles
│   ├── RoleEditor.tsx           # Edit role permissions
│   ├── RoleAssignment.tsx       # Assign roles to members
│   └── PermissionToggle.tsx     # Toggle individual permissions
│
├── ai/
│   ├── BotList.tsx              # List of available bots
│   ├── BotConfig.tsx            # Configure bot settings
│   ├── BotMessage.tsx           # AI message display
│   └── BotInvoke.tsx            # @mention bot UI
│
└── direct/
    ├── DirectList.tsx           # DM conversation list
    ├── DirectChat.tsx           # DM view
    └── NewDirectModal.tsx       # Start new DM
```

### Phase 5: Views & Layout

```
views/
├── CommunicationsLayout.tsx     # Main layout wrapper
├── ChannelView.tsx              # Text channel view
├── VoiceChannelView.tsx         # Voice channel view
├── VideoChannelView.tsx         # Video room view
├── DirectView.tsx               # DM view
├── CallView.tsx                 # Active call view
└── ThreadView.tsx               # Thread side panel

sections/
├── sidebar/
│   ├── ChannelSidebar.tsx       # Main sidebar
│   ├── ServerHeader.tsx         # Workspace name
│   └── UserPanel.tsx            # User status/settings
│
├── main/
│   └── MainContent.tsx          # Dynamic content area
│
└── panel/
    ├── MemberPanel.tsx          # Member list
    ├── DetailsPanel.tsx         # Channel details
    └── SearchPanel.tsx          # Search results
```

### Phase 6: Migration from Chat

1. **Create adapter layer** to map existing conversations to channels/DMs
2. **Migrate data** from old tables to new tables
4. **Deprecate old components** gradually
5. **Remove old code** after validation

## Data Migration Script

```typescript
// scripts/migrate-chat-to-communications.ts

// 1. Migrate group conversations -> channels
// 2. Migrate personal conversations -> directConversations  
// 3. Migrate conversation participants -> channelMembers / directMembers
// 4. Migrate messages -> channelMessages / directMessages
// 5. Create default roles for each channel
// 6. Migrate calls -> new calls table structure
```

## Feature Comparison

| Feature | Old (Chat) | New (Communications) |
|---------|------------|----------------------|
| 1-1 Messages | ✅ | ✅ DirectConversations |
| Group Chats | ✅ | ✅ Channels (group type) |
| Public Channels | ❌ | ✅ |
| Categories | ❌ | ✅ |
| Threads | ❌ | ✅ |
| Roles | ❌ | ✅ Per-channel roles |
| Permissions | Basic | ✅ Granular (20+ perms) |
| Voice Calls | Basic | ✅ Voice channels |
| Video Calls | Basic | ✅ Video rooms |
| Screen Share | ❌ | ✅ |
| AI in Chat | ✅ | ✅ AI bots in channels |
| Presence | ❌ | ✅ |
| Typing | ❌ | ✅ |

## Integration with Existing Features

### AI Feature
- AI bots can be added to any channel
- `@mention` a bot to invoke it
- Bot can auto-respond based on settings
- Meeting notes bot for calls

### Workspace Feature
- Channels belong to workspaces
- Workspace admins can manage all channels
- Inherit workspace-level settings

### Notifications Feature
- Channel notification preferences
- Mention notifications
- DM notifications
- Call invites

## Technical Notes

### Real-time Updates
- Use Convex subscriptions for all real-time data
- Presence updates via heartbeat
- Typing indicators with auto-expire (10s)

### Video/Audio Integration
- Integrate with LiveKit, Daily.co, or Twilio
- Store room tokens in calls table
- Handle reconnection gracefully

### Performance
- Virtual scrolling for message lists
- Lazy load channel history
- Prefetch adjacent channels

## Timeline Estimate

- Phase 1 (Foundation): ✅ Completed
- Phase 2 (Backend Mutations): ~2-3 days
- Phase 3 (Hooks): ~2 days
- Phase 4 (UI Components): ~5-7 days
- Phase 5 (Views & Layout): ~3-4 days
- Phase 6 (Migration): ~2-3 days
- Testing & Polish: ~3-4 days

**Total: ~3-4 weeks**

## Next Steps

1. Register `communicationsTables` in `_schema.ts`
2. Create backend mutations for channels
3. Build channel list component
4. Build message list component
5. Integrate video provider (LiveKit/Daily)
