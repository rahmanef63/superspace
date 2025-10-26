# Reusable Chat System

A comprehensive, param-driven chat module for SuperSpace that supports multiple use cases through configuration.

## Features

- **Multi-context**: Comments, Support, Workspace, Projects, Documents, CRM, Activity Feeds
- **Fully configurable**: 50+ config options to customize behavior
- **Type-safe**: Complete TypeScript support
- **RBAC**: Built-in role-based access control
- **Real-time**: Presence, typing indicators, optimistic updates
- **Rich media**: Attachments, link previews, image gallery
- **Extensible**: Custom commands, integrations, moderation hooks

## Installation

```bash
# Already included in shared/chat/
```

## Quick Start

```tsx
import { ChatContainer, createConvexChatDataSource } from "@/frontend/shared/chat";

function MyChat() {
  const convex = useConvex();
  const dataSource = createConvexChatDataSource(convex, "chat");

  return (
    <ChatContainer
      room={{ roomId: "my-room", provider: "convex" }}
      dataSource={dataSource}
      currentUser={{ id: "user1", name: "User 1" }}
      config={{
        contextMode: "workspace",
        isGroup: true,
        threading: true,
        reactionEnabled: true,
      }}
    />
  );
}
```

## Configuration

### Context Modes

Pre-configured presets for common use cases:

- **comment**: Side-panel discussions on documents/pages
- **support**: Ticket-based customer support
- **workspace**: Full-featured team chat
- **project**: Task-focused communication
- **document**: Real-time doc collaboration
- **crm**: Customer relationship messaging
- **system**: Read-only activity feed

### Config Options

```typescript
type ChatConfig = {
  // Behavior
  isGroup?: boolean;
  threading?: boolean;
  reactionEnabled?: boolean;
  mentionEnabled?: boolean;
  messageEditing?: "off" | "author" | "admin";
  messageDeletion?: "off" | "author" | "admin" | "hard";

  // Media
  allowAttachments?: boolean;
  linkPreview?: boolean;
  imagePreview?: boolean;
  voiceRecorder?: boolean;

  // Security
  isEncrypted?: boolean;
  moderationEnabled?: boolean;
  permissions?: Record<Role, Permission[]>;

  // Integration
  contextMode?: ContextMode;
  linkedEntities?: LinkedEntity[];
  customCommands?: string[];
  integrations?: string[];

  // ... and 30+ more options
};
```

## Examples

### Support/Helpdesk Chat

```tsx
<ChatContainer
  room={{ roomId: `support_${ticketId}`, provider: "convex" }}
  dataSource={dataSource}
  currentUser={currentUser}
  config={{
    contextMode: "support",
    threading: true,
    allowAttachments: true,
    moderationEnabled: true,
    allowExport: true,
  }}
  layout={{
    sidebar: true,
    headerActions: ["search", "pin"],
  }}
/>
```

### Document Comments

```tsx
<ChatContainer
  room={{ roomId: `doc_${documentId}`, provider: "convex" }}
  dataSource={dataSource}
  currentUser={currentUser}
  config={{
    contextMode: "document",
    threading: true,
    mentionEnabled: true,
    allowAttachments: false,
  }}
  layout={{
    sidebar: false,
    inputAccessories: ["emoji"],
  }}
/>
```

### Workspace Channel

```tsx
<ChatContainer
  room={{ roomId: channelId, provider: "convex" }}
  dataSource={dataSource}
  currentUser={currentUser}
  config={{
    contextMode: "workspace",
    isGroup: true,
    threading: true,
    reactionEnabled: true,
    voiceRecorder: true,
    allowInviteLink: true,
    customCommands: ["/task", "/remind"],
  }}
  layout={{
    sidebar: true,
    headerActions: ["search", "pin", "invite"],
    inputAccessories: ["attachments", "emoji", "voice", "commands"],
  }}
/>
```

### Activity Feed (Read-only)

```tsx
<ChatContainer
  room={{ roomId: "activity_feed", provider: "convex" }}
  dataSource={dataSource}
  currentUser={currentUser}
  config={{
    contextMode: "system",
    reactionEnabled: false,
    messageEditing: "off",
  }}
/>
```

## Data Source Integration

### Convex

```typescript
import { createConvexChatDataSource } from "@/frontend/shared/chat";

const dataSource = createConvexChatDataSource(convex, "chat");
```

### Custom Backend

Implement the `ChatDataSource` interface:

```typescript
const customDataSource: ChatDataSource = {
  listMessages: async (roomId, cursor) => { /* ... */ },
  sendMessage: async (roomId, draft) => { /* ... */ },
  // ... implement all methods
};
```

## Event Handlers

```typescript
<ChatContainer
  // ...
  events={{
    onSend: async (draft) => {
      console.log("Message sent:", draft);
    },
    onCommand: async (cmd, args) => {
      if (cmd === "/task") {
        // Create task
      }
    },
    onModeration: async (result) => {
      if (result.action === "block") {
        // Handle blocked message
      }
    },
  }}
/>
```

## Custom Commands

```typescript
import { commandRegistry } from "@/frontend/shared/chat";

commandRegistry.register({
  name: "/task",
  description: "Create a task",
  usage: "/task <title>",
  handler: async (args) => {
    const title = args.join(" ");
    // Create task logic
  },
  permissions: ["send"],
});
```

## RBAC

Built-in permission system:

```typescript
const config = {
  permissions: {
    owner: ["send", "edit", "delete", "pin", "manageUsers", "rename"],
    admin: ["send", "edit", "delete", "pin", "manageUsers"],
    member: ["send", "edit", "delete"],
    guest: ["send"],
  },
};
```

## Styling

Use CSS variables or Tailwind:

```css
.chat-container {
  --chat-bg: #ffffff;
  --chat-bubble-me: #0084ff;
  --chat-bubble-other: #e4e6eb;
  --chat-border: #e0e0e0;
  --chat-accent: #0084ff;
}
```

## Architecture

```
shared/chat/
├── components/      # React UI components
├── hooks/          # React hooks for state management
├── lib/            # Core logic (client, upload, etc.)
├── util/           # Utilities (formatting, guards, etc.)
├── config/         # Configuration presets
├── constants/      # Constants and enums
├── types/          # TypeScript type definitions
└── examples/       # Usage examples
```

## TODO Integration Points

### Convex Functions

Implement these Convex mutations/queries:

- `chat:listMessages`
- `chat:sendMessage`
- `chat:editMessage`
- `chat:deleteMessage`
- `chat:pinMessage`
- `chat:getRoomMeta`
- `chat:updateRoom`
- `chat:manageParticipant`

### File Upload

Configure upload strategy in `lib/upload.ts`:

```typescript
// Option 1: Convex storage
const uploadUrl = await convex.mutation(api.storage.generateUploadUrl);
const response = await fetch(uploadUrl, { method: "POST", body: file });

// Option 2: Direct CDN upload
// Use signed URLs from your server
```

### OpenGraph Preview

Implement server action in `lib/ogPreview.ts`:

```typescript
export async function fetchOgMetadata(url: string) {
  const response = await fetch("/api/og-preview", {
    method: "POST",
    body: JSON.stringify({ url }),
  });
  return response.json();
}
```

## Performance

- **Virtualization**: Use for large message lists
- **Optimistic updates**: Messages appear instantly
- **Debouncing**: Typing indicators debounced
- **Caching**: OG previews cached for 1 hour
- **Pagination**: Cursor-based message loading

## Accessibility

- Keyboard navigation
- ARIA labels
- Screen reader support
- Focus management

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- ES2020+
- React 18+

## License

Proprietary - SuperSpace
