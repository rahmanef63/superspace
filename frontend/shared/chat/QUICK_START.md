# Quick Start Guide

## 5-Minute Setup

### 1. Import the Module

```typescript
import { ChatContainer } from "@/shared/chat";
```

### 2. Create Data Source

```typescript
import { createConvexChatDataSource } from "@/shared/chat";
import { useConvex } from "convex/react";

const convex = useConvex();
const dataSource = createConvexChatDataSource(convex, "chat");
```

### 3. Add the Component

```typescript
export function MyChat() {
  const currentUser = {
    id: "user123",
    name: "John Doe",
    avatarUrl: "/avatar.jpg",
  };

  return (
    <ChatContainer
      room={{ roomId: "my-room", provider: "convex" }}
      dataSource={dataSource}
      currentUser={currentUser}
    />
  );
}
```

### 4. Done! 🎉

That's it! You now have a fully functional chat with:
- Message sending/editing/deleting
- Real-time updates
- Typing indicators
- Reactions
- File attachments
- And more!

## Customize It

### Use a Preset

```typescript
<ChatContainer
  config={{ contextMode: "support" }}  // ← Pre-configured for support
  // ... other props
/>
```

Available presets:
- `comment` - Document comments
- `support` - Customer support
- `workspace` - Team chat
- `project` - Project discussions
- `document` - Doc collaboration
- `crm` - Customer messaging
- `system` - Activity feed

### Or Configure Manually

```typescript
<ChatContainer
  config={{
    isGroup: true,
    threading: true,
    reactionEnabled: true,
    mentionEnabled: true,
    allowAttachments: true,
    messageEditing: "author",
    messageDeletion: "admin",
  }}
  // ... other props
/>
```

### Add a Sidebar

```typescript
<ChatContainer
  layout={{
    sidebar: true,
    headerActions: ["search", "pin", "invite"],
    inputAccessories: ["attachments", "emoji", "voice"],
  }}
  // ... other props
/>
```

### Handle Events

```typescript
<ChatContainer
  events={{
    onSend: async (draft) => {
      console.log("Message sent:", draft);
      // Track analytics, create notifications, etc.
    },
    onCommand: async (cmd, args) => {
      if (cmd === "/task") {
        // Create task from args
      }
    },
  }}
  // ... other props
/>
```

## Common Patterns

### Support Ticket Chat

```typescript
<ChatContainer
  room={{ roomId: `support_${ticketId}`, provider: "convex" }}
  dataSource={dataSource}
  currentUser={currentUser}
  config={{ contextMode: "support" }}
  layout={{ sidebar: true }}
/>
```

### Document Comments Panel

```typescript
<div style={{ width: "400px", position: "fixed", right: 0 }}>
  <ChatContainer
    room={{ roomId: `doc_${documentId}`, provider: "convex" }}
    dataSource={dataSource}
    currentUser={currentUser}
    config={{
      contextMode: "document",
      allowAttachments: false,
    }}
  />
</div>
```

### Team Channel

```typescript
<ChatContainer
  room={{ roomId: channelId, provider: "convex" }}
  dataSource={dataSource}
  currentUser={currentUser}
  config={{ contextMode: "workspace" }}
  layout={{
    sidebar: true,
    headerActions: ["search", "pin", "invite"],
    inputAccessories: ["attachments", "emoji", "voice", "commands"],
  }}
/>
```

### Read-Only Activity Feed

```typescript
<ChatContainer
  room={{ roomId: "activity", provider: "convex" }}
  dataSource={dataSource}
  currentUser={currentUser}
  config={{ contextMode: "system" }}
/>
```

## Need More Help?

1. **Full Documentation**: See [README.md](./README.md)
2. **Implementation Guide**: See [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)
3. **Architecture**: See [docs/architecture/shared-chat-module.md](../../docs/architecture/shared-chat-module.md)
4. **Examples**: Check [examples/](./examples/) folder

## Troubleshooting

### Messages not loading?

Make sure Convex backend is set up:
1. Add schema to `convex/schema.ts`
2. Create queries in `convex/chat/queries.ts`
3. Create mutations in `convex/chat/mutations.ts`

See [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md) for details.

### Permission errors?

Check RBAC configuration:
```typescript
config={{
  permissions: {
    owner: ["send", "edit", "delete", "pin", "manageUsers"],
    admin: ["send", "edit", "delete", "pin"],
    member: ["send", "edit", "delete"],
    guest: ["send"],
  }
}}
```

### Upload not working?

Configure upload handler in `lib/upload.ts`:
```typescript
export async function uploadFile(file: File): Promise<UploadedRef> {
  // Implement Convex storage upload
}
```

## What's Included?

✅ Message sending/editing/deleting
✅ Threaded conversations
✅ Emoji reactions
✅ @Mentions
✅ File attachments
✅ Link previews
✅ Typing indicators
✅ Read receipts
✅ Presence status
✅ Message pinning
✅ Slash commands
✅ RBAC permissions
✅ Moderation hooks
✅ Custom integrations

## Configuration Reference

### Behavior Options
- `isGroup` - Enable group chat (vs 1-on-1)
- `threading` - Enable threaded replies
- `canReply` - Allow replying to messages
- `reactionEnabled` - Enable emoji reactions
- `mentionEnabled` - Enable @mentions
- `readReceipts` - Show read status
- `typingIndicator` - Show typing status
- `messageEditing` - "off" | "author" | "admin"
- `messageDeletion` - "off" | "author" | "admin" | "hard"
- `autoScroll` - Auto-scroll on new messages

### Media Options
- `allowAttachments` - Enable file uploads
- `maxAttachmentSizeMB` - File size limit
- `linkPreview` - Show URL previews
- `imagePreview` - Show inline images
- `fileViewer` - In-app file viewer
- `voiceRecorder` - Enable voice messages
- `mediaGallery` - Show media gallery

### Security Options
- `isEncrypted` - E2E encryption (TODO)
- `allowInviteLink` - Generate invite links
- `allowExport` - Export chat history
- `pinMessageEnabled` - Enable pinning
- `moderationEnabled` - Content moderation
- `requireApproval` - Moderate before posting

### Layout Options
- `sidebar` - Show sidebar
- `headerActions` - ["search", "sort", "filter", "pin", "invite"]
- `inputAccessories` - ["attachments", "emoji", "voice", "commands"]

## Performance Tips

1. **Lazy load attachments**: Only load when visible
2. **Use pagination**: Don't load all messages at once
3. **Optimize images**: Compress before upload
4. **Debounce typing**: Already handled (500ms)
5. **Cache metadata**: Handled automatically

## Best Practices

1. **Always set contextMode**: Use appropriate preset
2. **Link entities**: Connect chat to relevant objects
3. **Handle events**: Track analytics, send notifications
4. **Check permissions**: Enforce RBAC properly
5. **Test thoroughly**: Multiple roles and scenarios

---

**Ready to build?** Start with one of the [examples](./examples/)!
