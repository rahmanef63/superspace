# Mock Data Audit - Features Using Mock vs Real Convex Data

## ✅ Features Using Real Convex Data

### 1. **Chats** (85% Complete)
- ✅ Conversations list - `api.workspace.conversations.list`
- ✅ Messages - Real-time message queries
- ✅ Participants - Member data from Convex
- **Status:** Fully integrated with Convex

### 2. **Documents** (80% Complete)
- ✅ Document list and tree
- ✅ Real-time collaboration
- ✅ Document content and metadata
- **Status:** Fully integrated with Convex

### 3. **Members** (75% Complete)
- ✅ Workspace members - `api.workspace.workspaces.getMembers`
- ✅ Roles and permissions
- **Status:** Fully integrated with Convex

### 4. **Menus** (80% Complete)
- ✅ Menu items and structure
- ✅ Drag & drop persistence
- **Status:** Fully integrated with Convex

### 5. **Settings** (75% Complete)
- ✅ Workspace settings
- ✅ User preferences
- **Status:** Fully integrated with Convex

### 6. **Invitations** (70% Complete)
- ✅ Workspace invitations
- **Status:** Fully integrated with Convex

---

## ⚠️ Features Using Mock Data (Need Convex Integration)

### 1. **Overview Dashboard** (100% - Mock)
**Location:** `frontend/features/overview/OverviewView.tsx`

**Mock Data:**
```typescript
const stats = {
  totalMessages: 1247,
  activeUsers: members?.length || 0,
  documentsCreated: 42,
  tasksCompleted: 18,
}

const recentActivity = [...]  // Mock activity data
const upcomingEvents = [...]  // Mock calendar events
```

**Needs:**
- `api.workspace.activity.getRecent` - Recent activity feed
- `api.features.calendar.queries.getUpcoming` - Upcoming events
- Stats aggregation queries for messages/documents/tasks

---

### 2. **Starred** (90% - Mock)
**Location:** `frontend/features/starred/StarredView.tsx`

**Mock Data:**
```typescript
const starredItems: StarredItem[] = [...]  // Mock starred messages & documents
```

**Needs:**
- Add `isStarred` field to messages table
- Add `isStarred` field to documents table
- `api.features.chat.queries.getStarredMessages`
- `api.features.docs.queries.getStarredDocuments`

**Convex Schema Update Needed:**
```typescript
// convex/features/chat/api/schema.ts
export const starredMessages = defineTable({
  messageId: v.id("messages"),
  userId: v.id("users"),
  starredAt: v.number(),
})
  .index("by_user", ["userId"])
  .index("by_message", ["messageId"])
```

---

### 3. **Archived** (90% - Mock)
**Location:** `frontend/features/archived/ArchivedView.tsx`

**Mock Data:**
```typescript
const archivedConversations = [...]  // Mock archived chats
```

**Needs:**
- Add `isArchived` and `archivedAt` fields to conversations table
- `api.features.chat.queries.getArchivedConversations`
- Archive/unarchive mutations

**Convex Schema Update Needed:**
```typescript
// Update conversations table metadata
metadata: v.optional(
  v.object({
    isArchived: v.optional(v.boolean()),
    archivedAt: v.optional(v.number()),
    // ... existing fields
  })
)
```

---

### 4. **AI** (70% - Mock)
**Location:** `frontend/features/ai/AIListView.tsx` & `AIDetailView.tsx`

**Mock Data:**
```typescript
const mockAIChats = [...]  // Mock AI conversations
const mockAIConversations = {...}  // Mock AI messages
```

**Needs:**
- Use existing `conversations` table with `type: "ai"`
- `api.features.chat.queries.getAIConversations`
- Filter conversations where `type === "ai"`

**Status:** Can use existing schema, just need to filter by type!

---

### 5. **Calls** (60% - Mock)
**Location:** `frontend/features/calls/views/CallsView.tsx`

**Mock Data:**
```typescript
const mockCalls = [...]  // Mock call history
```

**Needs:**
- Create `calls` table in Convex
- `api.features.calls.queries.getCallHistory`
- `api.features.calls.mutations.startCall`

**Convex Schema Needed:**
```typescript
// convex/features/calls/api/schema.ts
export const calls = defineTable({
  conversationId: v.id("conversations"),
  participants: v.array(v.id("users")),
  type: v.union(v.literal("video"), v.literal("audio")),
  status: v.union(
    v.literal("ongoing"),
    v.literal("ended"),
    v.literal("missed")
  ),
  startedAt: v.number(),
  endedAt: v.optional(v.number()),
  duration: v.optional(v.number()),
})
  .index("by_conversation", ["conversationId"])
  .index("by_status", ["status"])
```

---

### 6. **Status** (65% - Mock)
**Location:** `frontend/features/status/views/StatusView.tsx`

**Mock Data:**
```typescript
const mockStatuses = [...]  // Mock status updates/stories
```

**Needs:**
- Create `statuses` table (stories feature)
- `api.features.status.queries.getStatuses`
- `api.features.status.mutations.createStatus`

**Convex Schema Needed:**
```typescript
// convex/features/status/api/schema.ts
export const statuses = defineTable({
  userId: v.id("users"),
  workspaceId: v.id("workspaces"),
  type: v.union(v.literal("image"), v.literal("video"), v.literal("text")),
  content: v.string(),
  storageId: v.optional(v.id("_storage")),
  viewedBy: v.array(v.id("users")),
  expiresAt: v.number(),
  createdAt: v.number(),
})
  .index("by_workspace", ["workspaceId"])
  .index("by_user", ["userId"])
  .index("by_expiry", ["expiresAt"])
```

---

## 📊 Summary

| Feature | Mock Data | Real Data | Priority | Effort |
|---------|-----------|-----------|----------|--------|
| Chats | ❌ | ✅ | - | - |
| Documents | ❌ | ✅ | - | - |
| Members | ❌ | ✅ | - | - |
| Menus | ❌ | ✅ | - | - |
| Settings | ❌ | ✅ | - | - |
| Invitations | ❌ | ✅ | - | - |
| **Overview** | ✅ | ⚠️ Partial | High | Medium |
| **Starred** | ✅ | ❌ | High | Low |
| **Archived** | ✅ | ❌ | High | Low |
| **AI** | ✅ | ❌ | Medium | Low |
| **Calls** | ✅ | ❌ | Medium | High |
| **Status** | ✅ | ❌ | Medium | High |

---

## 🎯 Action Plan to Remove All Mock Data

### Phase 1: Quick Wins (Low Effort) - 1-2 hours

#### 1. **AI Feature** ⚡
- Already has conversations table with `type: "ai"`
- Just need to query and filter by type
- Create: `convex/features/chat/queries/getAIConversations.ts`

#### 2. **Starred Feature** ⚡
- Add starredMessages table
- Create queries for starred items
- Minimal schema change

#### 3. **Archived Feature** ⚡
- Update conversations metadata
- Add isArchived field
- Create archive/unarchive mutations

---

### Phase 2: Medium Effort - 2-4 hours

#### 4. **Overview Dashboard**
- Integrate with activity feed
- Add stats aggregation queries
- Connect to calendar events (when ready)

---

### Phase 3: Complex Features - 4-8 hours

#### 5. **Calls Feature**
- Create full calls schema
- Implement WebRTC signaling
- Call history and status tracking

#### 6. **Status Feature**
- Create statuses (stories) schema
- Implement expiry logic
- View tracking system

---

## 🚀 Immediate Next Steps

1. ✅ Fix StarredView TypeScript errors
2. 🔧 Create `convex/features/chat/queries.ts` for AI/Starred/Archived
3. 🔧 Update conversations schema for archived support
4. 🔧 Create starredMessages table
5. 🔧 Wire up real queries in frontend

---

## 📝 Notes

- All features have Convex CRUD operations in `convex/features/*/`
- Chat schema is in `convex/features/chat/api/schema.ts`
- Most features can reuse existing tables with metadata flags
- WebRTC features (Calls) require additional infrastructure
