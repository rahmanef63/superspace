# Shared Chat Module Architecture

## Overview

The shared chat module (`frontend/shared/chat/`) is a reusable, configuration-driven system that provides chat functionality across multiple SuperSpace features.

## Design Principles

1. **Single Responsibility**: Each component/module has one clear purpose
2. **Configuration over Code**: Behavior controlled via config, not custom implementations
3. **Type Safety**: Comprehensive TypeScript coverage
4. **RBAC First**: Permission checks baked into every action
5. **Provider Agnostic**: Abstract data layer supports any backend
6. **Composable**: Components can be used individually or as a complete system

## Architecture Layers

### 1. Type Layer (`types/`)

Foundation types that define contracts:

- `config.ts`: Configuration and layout types
- `message.ts`: Message, attachment, and user types
- `chat.ts`: Room, data source, and presence types
- `events.ts`: Event handlers and message bus events

### 2. Constants Layer (`constants/`)

Immutable configuration:

- `chat.ts`: Limits, timeouts, UI constants
- `roles.ts`: Permission matrices, role hierarchy

### 3. Configuration Layer (`config/`)

Preset configurations and defaults:

- `defaultChatConfig.ts`: Base config + context presets
- `commandRegistry.ts`: Slash command system

### 4. Utility Layer (`util/`)

Pure functions, no side effects:

- `formatMessage.ts`: Message formatting, timestamp handling
- `guard.ts`: RBAC permission checks
- `id.ts`: ID generation utilities
- `storage.ts`: LocalStorage abstraction

### 5. Library Layer (`lib/`)

Core business logic:

- `chatClient.ts`: Data source adapters (Convex, mock)
- `messageBus.ts`: Event bus for real-time communication
- `upload.ts`: File upload handling
- `ogPreview.ts`: Link preview fetching

### 6. Hook Layer (`hooks/`)

React state management:

- `useChat.ts`: Main chat state and operations
- `useChatScroll.ts`: Auto-scroll behavior
- `useChatPresence.ts`: Presence and typing indicators
- `useMessageActions.ts`: Message action handlers

### 7. Component Layer (`components/`)

React UI components:

```
ChatContainer (orchestrator)
├── ChatHeader
├── ChatThread
│   ├── ChatMessage
│   │   ├── ReactionBar
│   │   └── ChatComposer (for editing)
│   └── TypingIndicator
├── ChatInput
│   ├── ChatComposer
│   └── AttachmentButton
└── ChatSidebar
    ├── Participants list
    └── MediaGallery
```

## Data Flow

### Message Send Flow

```
User Input → ChatComposer
           ↓
        ChatInput (validation)
           ↓
        useChat hook (permission check)
           ↓
        events.onSend (optional)
           ↓
        dataSource.sendMessage
           ↓
        Optimistic UI update
           ↓
        MessageBus.emit("message:new")
```

### Message Load Flow

```
ChatContainer mount
           ↓
        useChat hook
           ↓
        dataSource.listMessages
           ↓
        State update
           ↓
        ChatThread render
           ↓
        useChatScroll (auto-scroll if at bottom)
```

## Configuration System

### Context Modes

Each context has a preset configuration:

```typescript
CHAT_CONFIG_PRESETS = {
  comment: { /* minimal, side-panel */ },
  support: { /* moderation, export */ },
  workspace: { /* full-featured */ },
  project: { /* task-focused */ },
  document: { /* real-time collab */ },
  crm: { /* customer messaging */ },
  system: { /* read-only feed */ }
}
```

### Config Merging

```
DEFAULT_CHAT_CONFIG
  ↓
Context Preset (if specified)
  ↓
User-provided config
  ↓
Final merged config
```

## RBAC System

### Permission Flow

```
User Action
    ↓
Permission Check (guard.ts)
    ↓
Role Lookup (from roomMeta.roles)
    ↓
Permission Matrix (config.permissions)
    ↓
Allow/Deny
```

### Permission Matrix

```typescript
permissions: {
  owner: ["send", "edit", "delete", "pin", "manageUsers", "rename", "changeAvatar"],
  admin: ["send", "edit", "delete", "pin", "manageUsers"],
  member: ["send", "edit", "delete"],
  guest: ["send"]
}
```

## Real-time Features

### Presence System

```
useChatPresence hook
    ↓
Heartbeat timer (30s)
    ↓
Update presence status
    ↓
Convex ephemeral doc
    ↓
Subscribe to presence changes
```

### Typing Indicators

```
User types → debounce (500ms)
           ↓
        setTyping(true)
           ↓
        Timeout (3s)
           ↓
        setTyping(false)
```

## Message Bus

Event-driven communication between components:

```typescript
messageBus.emit({
  type: "message:new",
  message: {...}
});

messageBus.on("message:new", (event) => {
  // Handle new message
});
```

## Data Source Abstraction

Allows swapping backends:

```typescript
interface ChatDataSource {
  listMessages(roomId, cursor?): Promise<Paginated<Message>>;
  sendMessage(roomId, draft): Promise<Message>;
  editMessage(roomId, id, patch): Promise<Message>;
  deleteMessage(roomId, id, hard?): Promise<void>;
  pinMessage(roomId, id, pinned): Promise<void>;
  updateRoom(roomId, patch): Promise<void>;
  manageParticipant(roomId, userId, action): Promise<void>;
}
```

Current implementations:
- `createConvexChatDataSource`: Convex backend
- `createMockChatDataSource`: Testing/development

## Extension Points

### 1. Custom Commands

```typescript
commandRegistry.register({
  name: "/mycmd",
  handler: async (args) => { /* ... */ }
});
```

### 2. Event Handlers

```typescript
<ChatContainer
  events={{
    onSend: async (draft) => { /* custom logic */ },
    onCommand: async (cmd, args) => { /* ... */ }
  }}
/>
```

### 3. Custom Data Source

```typescript
const myDataSource: ChatDataSource = {
  // Implement all methods
};
```

### 4. Moderation Hooks

```typescript
events={{
  onModeration: async (result) => {
    if (result.action === "block") {
      // Custom handling
    }
  }
}}
```

## Integration with SuperSpace

### 1. Convex Schema

Add to `convex/schema.ts`:

```typescript
chatRooms: defineTable({
  name: v.string(),
  contextMode: v.string(),
  linkedEntities: v.array(v.object({ id: v.string(), type: v.string() })),
  settings: v.any(), // JSON config
  roles: v.object(...), // userId -> role
}),

chatMessages: defineTable({
  roomId: v.id("chatRooms"),
  authorId: v.id("users"),
  content: v.any(), // JSON message content
  threadOf: v.optional(v.id("chatMessages")),
  reactions: v.optional(v.any()),
  readBy: v.optional(v.array(v.id("users"))),
  isPinned: v.optional(v.boolean()),
  deletedAt: v.optional(v.number()),
}),
```

### 2. Convex Functions

Implement in `convex/chat/`:

```typescript
// queries.ts
export const listMessages = query({ ... });
export const getRoomMeta = query({ ... });
export const listParticipants = query({ ... });

// mutations.ts
export const sendMessage = mutation({ ... });
export const editMessage = mutation({ ... });
export const deleteMessage = mutation({ ... });
export const pinMessage = mutation({ ... });
```

### 3. Feature Integration

Each feature imports and configures:

```typescript
// features/support/SupportChat.tsx
import { ChatContainer } from "@/frontend/shared/chat";

export function SupportChat({ ticketId }) {
  return (
    <ChatContainer
      room={{ roomId: `support_${ticketId}`, provider: "convex" }}
      config={{ contextMode: "support", ... }}
      linkedEntities={[{ id: ticketId, type: "ticket" }]}
    />
  );
}
```

## Performance Optimizations

1. **Virtualization**: For long message lists (TODO)
2. **Optimistic Updates**: Instant UI feedback
3. **Debouncing**: Typing indicators, search
4. **Caching**: OG previews, room metadata
5. **Pagination**: Cursor-based message loading
6. **Lazy Loading**: Attachments loaded on demand

## Testing Strategy

1. **Unit Tests**: Utils, guards, formatters
2. **Hook Tests**: React Testing Library
3. **Component Tests**: Storybook + Jest
4. **Integration Tests**: Full chat flows
5. **E2E Tests**: Cypress for critical paths

## Security Considerations

1. **RBAC**: Every action checked
2. **Input Validation**: Zod schemas on backend
3. **XSS Prevention**: Text sanitization
4. **File Upload**: Size limits, type validation
5. **Rate Limiting**: Backend enforcement
6. **Audit Logging**: All mutations logged

## Future Enhancements

- [ ] Voice messages with transcription
- [ ] End-to-end encryption
- [ ] Message search (full-text)
- [ ] Rich text editor (Markdown)
- [ ] Video/audio calls
- [ ] Screen sharing
- [ ] Message templates
- [ ] Auto-translation
- [ ] AI-powered suggestions
- [ ] Advanced moderation (ML)
