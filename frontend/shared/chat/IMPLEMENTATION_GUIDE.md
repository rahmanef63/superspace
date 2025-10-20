# Chat Module Implementation Guide

## Overview

This guide walks through integrating the shared chat module into SuperSpace features.

## Prerequisites

- Convex backend setup
- User authentication in place
- Basic understanding of React hooks

## Step 1: Backend Setup

### 1.1 Update Convex Schema

Add to `convex/schema.ts`:

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ... existing tables

  chatRooms: defineTable({
    name: v.string(),
    avatarUrl: v.optional(v.string()),
    isGroup: v.boolean(),
    contextMode: v.string(),
    linkedEntities: v.optional(
      v.array(v.object({ id: v.string(), type: v.string() }))
    ),
    settings: v.optional(v.any()), // JSON ChatConfig
    roles: v.optional(v.any()), // Record<userId, role>
    participantIds: v.array(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_context", ["contextMode"])
    .index("by_linked_entity", ["linkedEntities"]),

  chatMessages: defineTable({
    roomId: v.id("chatRooms"),
    authorId: v.string(), // User ID
    content: v.any(), // JSON MessageContent
    threadOf: v.optional(v.id("chatMessages")),
    reactions: v.optional(v.any()), // Record<emoji, userId[]>
    readBy: v.optional(v.array(v.string())),
    isPinned: v.optional(v.boolean()),
    isSystem: v.optional(v.boolean()),
    createdAt: v.number(),
    editedAt: v.optional(v.number()),
    deletedAt: v.optional(v.number()),
  })
    .index("by_room", ["roomId", "createdAt"])
    .index("by_thread", ["threadOf", "createdAt"])
    .index("by_pinned", ["roomId", "isPinned"]),
});
```

### 1.2 Create Convex Functions

Create `convex/chat/queries.ts`:

```typescript
import { query } from "../_generated/server";
import { v } from "convex/values";

export const listMessages = query({
  args: {
    roomId: v.id("chatRooms"),
    cursor: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { roomId, cursor, limit = 50 }) => {
    // TODO: Permission check

    const messages = await ctx.db
      .query("chatMessages")
      .withIndex("by_room", (q) => q.eq("roomId", roomId))
      .order("desc")
      .take(limit + 1);

    const hasMore = messages.length > limit;
    const items = hasMore ? messages.slice(0, limit) : messages;

    return {
      items: items.reverse(),
      cursor: hasMore ? items[items.length - 1]._id : undefined,
      hasMore,
    };
  },
});

export const getRoomMeta = query({
  args: { roomId: v.id("chatRooms") },
  handler: async (ctx, { roomId }) => {
    return await ctx.db.get(roomId);
  },
});

export const listParticipants = query({
  args: { roomId: v.id("chatRooms") },
  handler: async (ctx, { roomId }) => {
    const room = await ctx.db.get(roomId);
    if (!room) return [];

    // TODO: Fetch user details for participantIds
    return room.participantIds.map((id) => ({
      id,
      name: `User ${id}`,
      avatarUrl: undefined,
    }));
  },
});
```

Create `convex/chat/mutations.ts`:

```typescript
import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const sendMessage = mutation({
  args: {
    roomId: v.id("chatRooms"),
    text: v.optional(v.string()),
    markdown: v.optional(v.string()),
    attachments: v.optional(v.any()),
    threadOf: v.optional(v.id("chatMessages")),
    meta: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // TODO: Permission check

    const messageId = await ctx.db.insert("chatMessages", {
      roomId: args.roomId,
      authorId: identity.subject,
      content: {
        text: args.text,
        markdown: args.markdown,
        attachments: args.attachments || [],
        meta: args.meta,
      },
      threadOf: args.threadOf,
      createdAt: Date.now(),
    });

    return await ctx.db.get(messageId);
  },
});

export const editMessage = mutation({
  args: {
    roomId: v.id("chatRooms"),
    messageId: v.id("chatMessages"),
    patch: v.any(),
  },
  handler: async (ctx, { messageId, patch }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // TODO: Permission check

    await ctx.db.patch(messageId, {
      ...patch,
      editedAt: Date.now(),
    });

    return await ctx.db.get(messageId);
  },
});

export const deleteMessage = mutation({
  args: {
    roomId: v.id("chatRooms"),
    messageId: v.id("chatMessages"),
    hard: v.optional(v.boolean()),
  },
  handler: async (ctx, { messageId, hard }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // TODO: Permission check

    if (hard) {
      await ctx.db.delete(messageId);
    } else {
      await ctx.db.patch(messageId, {
        deletedAt: Date.now(),
      });
    }
  },
});

export const pinMessage = mutation({
  args: {
    roomId: v.id("chatRooms"),
    messageId: v.id("chatMessages"),
    pinned: v.boolean(),
  },
  handler: async (ctx, { messageId, pinned }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    // TODO: Permission check

    await ctx.db.patch(messageId, { isPinned: pinned });
  },
});
```

### 1.3 Update API Exports

Create `convex/chat/index.ts`:

```typescript
export * from "./queries";
export * from "./mutations";
```

## Step 2: Frontend Integration

### 2.1 Create Convex Hook Wrapper

Create `frontend/features/chat/hooks/useConvexChat.ts`:

```typescript
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { createConvexChatDataSource } from "@/shared/chat";
import type { ChatDataSource } from "@/shared/chat";

export function useConvexChatDataSource(): ChatDataSource {
  const listMessages = useQuery(api.chat.listMessages);
  const getRoomMeta = useQuery(api.chat.getRoomMeta);
  const sendMessage = useMutation(api.chat.sendMessage);
  const editMessage = useMutation(api.chat.editMessage);
  const deleteMessage = useMutation(api.chat.deleteMessage);
  const pinMessage = useMutation(api.chat.pinMessage);

  return {
    listMessages: async (roomId, cursor) => {
      const result = await listMessages({ roomId, cursor });
      return result || { items: [], hasMore: false };
    },
    getRoomMeta: async (roomId) => {
      return await getRoomMeta({ roomId });
    },
    listParticipants: async (roomId) => {
      // TODO: Implement
      return [];
    },
    sendMessage: async (roomId, draft) => {
      return await sendMessage({ roomId, ...draft });
    },
    editMessage: async (roomId, messageId, patch) => {
      return await editMessage({ roomId, messageId, patch });
    },
    deleteMessage: async (roomId, messageId, hard) => {
      await deleteMessage({ roomId, messageId, hard });
    },
    pinMessage: async (roomId, messageId, pinned) => {
      await pinMessage({ roomId, messageId, pinned });
    },
    updateRoom: async (roomId, patch) => {
      // TODO: Implement
    },
    manageParticipant: async (roomId, userId, action) => {
      // TODO: Implement
    },
  };
}
```

### 2.2 Use in Features

#### Example: Support Chat

Create `frontend/features/support/components/SupportChat.tsx`:

```typescript
import React from "react";
import { ChatContainer } from "@/shared/chat";
import { useConvexChatDataSource } from "@/features/chat/hooks/useConvexChat";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export function SupportChat({ ticketId }: { ticketId: string }) {
  const dataSource = useConvexChatDataSource();
  const currentUser = useCurrentUser();

  return (
    <ChatContainer
      room={{ roomId: `support_${ticketId}`, provider: "convex" }}
      dataSource={dataSource}
      currentUser={currentUser}
      config={{
        contextMode: "support",
        isGroup: false,
        threading: true,
        allowAttachments: true,
        moderationEnabled: true,
        linkedEntities: [{ id: ticketId, type: "ticket" }],
      }}
      layout={{
        sidebar: true,
        headerActions: ["search", "pin"],
        inputAccessories: ["attachments", "emoji"],
      }}
    />
  );
}
```

#### Example: Document Comments

Create `frontend/features/documents/components/DocComments.tsx`:

```typescript
import React from "react";
import { ChatContainer } from "@/shared/chat";
import { useConvexChatDataSource } from "@/features/chat/hooks/useConvexChat";
import { useCurrentUser } from "@/hooks/useCurrentUser";

export function DocComments({ documentId }: { documentId: string }) {
  const dataSource = useConvexChatDataSource();
  const currentUser = useCurrentUser();

  return (
    <div className="doc-comments-panel">
      <ChatContainer
        room={{ roomId: `doc_${documentId}`, provider: "convex" }}
        dataSource={dataSource}
        currentUser={currentUser}
        config={{
          contextMode: "document",
          threading: true,
          mentionEnabled: true,
          linkedEntities: [{ id: documentId, type: "document" }],
        }}
        layout={{
          sidebar: false,
          inputAccessories: ["emoji"],
        }}
      />
    </div>
  );
}
```

## Step 3: File Upload Integration

### 3.1 Configure Upload Handler

Update `frontend/shared/chat/lib/upload.ts`:

```typescript
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export async function uploadFile(file: File, config?: ChatConfig): Promise<UploadedRef> {
  // Get upload URL from Convex
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  const uploadUrl = await generateUploadUrl();

  // Upload file
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": file.type },
    body: file,
  });

  const { storageId } = await response.json();

  // Get public URL
  const getUrl = useMutation(api.storage.getUrl);
  const url = await getUrl({ storageId });

  return {
    id: storageId,
    url,
    name: file.name,
    size: file.size,
    mimeType: file.type,
  };
}
```

## Step 4: Styling

Create `frontend/shared/chat/styles.css`:

```css
/* Chat Container */
.chat-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--chat-bg, #ffffff);
  border: 1px solid var(--chat-border, #e0e0e0);
}

/* Chat Header */
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid var(--chat-border, #e0e0e0);
}

/* Chat Thread */
.chat-thread {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

/* Chat Message */
.chat-message {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.chat-message.own {
  flex-direction: row-reverse;
}

.chat-message-content {
  max-width: 70%;
  padding: 0.75rem;
  border-radius: 0.5rem;
  background: var(--chat-bubble-other, #f0f0f0);
}

.chat-message.own .chat-message-content {
  background: var(--chat-bubble-me, #0084ff);
  color: white;
}

/* Chat Input */
.chat-input {
  border-top: 1px solid var(--chat-border, #e0e0e0);
  padding: 1rem;
}

/* Add more styles as needed */
```

Import in your app:

```typescript
import "@/shared/chat/styles.css";
```

## Step 5: Testing

### 5.1 Unit Tests

```typescript
import { describe, it, expect } from "vitest";
import { formatTimestamp, canEdit } from "@/shared/chat";

describe("Chat Utils", () => {
  it("formats timestamps correctly", () => {
    const now = Date.now();
    expect(formatTimestamp(now, "relative")).toBe("just now");
  });

  it("checks edit permissions", () => {
    const message = { author: { id: "user1" }, /* ... */ };
    expect(canEdit("user1", message)).toBe(true);
    expect(canEdit("user2", message)).toBe(false);
  });
});
```

### 5.2 Integration Tests

```typescript
import { render, screen, waitFor } from "@testing-library/react";
import { ChatContainer } from "@/shared/chat";
import { createMockChatDataSource } from "@/shared/chat";

it("sends a message", async () => {
  const dataSource = createMockChatDataSource();
  const onSend = vi.fn();

  render(
    <ChatContainer
      room={{ roomId: "test", provider: "convex" }}
      dataSource={dataSource}
      currentUser={{ id: "user1", name: "User 1" }}
      events={{ onSend }}
    />
  );

  // Type and send message
  const input = screen.getByPlaceholderText("Type a message...");
  fireEvent.change(input, { target: { value: "Hello" } });
  fireEvent.click(screen.getByText("Send"));

  await waitFor(() => {
    expect(onSend).toHaveBeenCalledWith({ text: "Hello" });
  });
});
```

## Step 6: RBAC Implementation

Add permission checks to Convex mutations:

```typescript
async function checkPermission(
  ctx: MutationCtx,
  roomId: Id<"chatRooms">,
  permission: string
) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("Not authenticated");

  const room = await ctx.db.get(roomId);
  if (!room) throw new Error("Room not found");

  const userRole = room.roles?.[identity.subject] || "guest";
  const permissions = room.settings?.permissions?.[userRole] || [];

  if (!permissions.includes(permission)) {
    throw new Error("Permission denied");
  }
}

// Use in mutations
export const sendMessage = mutation({
  // ...
  handler: async (ctx, args) => {
    await checkPermission(ctx, args.roomId, "send");
    // ... rest of handler
  },
});
```

## Step 7: Monitoring & Analytics

Add event tracking:

```typescript
<ChatContainer
  // ...
  events={{
    onSend: async (draft) => {
      analytics.track("chat_message_sent", {
        roomId: room.roomId,
        hasAttachments: draft.attachments?.length > 0,
      });
    },
  }}
/>
```

## Common Issues & Solutions

### Issue: Messages not loading

**Solution**: Check Convex indexes are created:
```bash
npx convex dev
```

### Issue: Permission denied errors

**Solution**: Verify user has correct role in room.roles

### Issue: File upload fails

**Solution**: Check storage configuration in Convex dashboard

## Next Steps

1. Implement remaining Convex functions
2. Add real-time subscriptions
3. Implement moderation hooks
4. Add analytics tracking
5. Configure file storage
6. Set up monitoring

## Resources

- [Chat Module README](./README.md)
- [Architecture Document](../../docs/architecture/shared-chat-module.md)
- [Convex Documentation](https://docs.convex.dev)
- [Example Usage](./examples/)
