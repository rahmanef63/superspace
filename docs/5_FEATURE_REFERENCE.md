# Feature Reference

> **Quick reference for all SuperSpace features**
> **Last Updated:** 2025-01-19

---

## Table of Contents

1. [Default Features (11)](#default-features)
2. [Optional Features (6)](#optional-features)
3. [Programmatic Installation](#programmatic-installation)
4. [Slug Reference Table](#slug-reference-table)
5. [Feature Status](#feature-status)

---

## Default Features

**Default features are automatically installed in every new workspace and cannot be uninstalled.**

### 1. Overview
```typescript
{
  slug: "overview",
  name: "Overview",
  description: "Dashboard overview with analytics and insights",
  category: "analytics",
  icon: "Home",
  path: "/dashboard/overview",
  order: 1,
  type: "route",
  version: "1.0.0"
}
```
**Purpose:** Main dashboard with workspace analytics, recent activity, and quick actions.

---

### 2. Chats (wa)
```typescript
{
  slug: "chat",
  name: "Chats",
  description: "Chats clone with chat, calls, status, and AI features",
  category: "communication",
  icon: "MessageCircle",
  path: "/dashboard/chat",
  order: 3,
  type: "folder",
  version: "2.0.0",
  children: [
    // 8 sub-features
  ]
}
```
**Purpose:** Full-featured Chats clone with real-time messaging.

**Sub-features:**
- `chats` - Chat conversations
- `wa-calls` - Voice and video calls
- `wa-status` - Status updates
- `wa-ai` - AI assistant
- `wa-starred` - Starred messages
- `wa-archived` - Archived chats
- `wa-profile` - User profile

---

### 3. Members
```typescript
{
  slug: "members",
  name: "Members",
  description: "Manage workspace members and permissions",
  category: "administration",
  icon: "Users",
  path: "/dashboard/members",
  order: 4,
  type: "route",
  version: "1.1.0",
  requiresPermission: "MANAGE_MEMBERS"
}
```
**Purpose:** Member management, role assignment, permissions.
**Access:** Admin+ only (requires MANAGE_MEMBERS permission)

---

### 4. Friends
```typescript
{
  slug: "friends",
  name: "Friends",
  description: "Manage your friends and connections",
  category: "social",
  icon: "Heart",
  path: "/dashboard/friends",
  order: 5,
  type: "route",
  version: "1.0.0"
}
```
**Purpose:** Social connections, friend requests, friend list.

---

### 5. Pages
```typescript
{
  slug: "pages",
  name: "Pages",
  description: "Notion-like pages for documentation",
  category: "productivity",
  icon: "FileText",
  path: "/dashboard/pages",
  order: 6,
  type: "route",
  version: "1.0.0"
}
```
**Purpose:** Create and organize documentation pages (Notion-style).

---

### 6. Databases
```typescript
{
  slug: "databases",
  name: "Databases",
  description: "Notion-style database views and management",
  category: "productivity",
  icon: "Database",
  path: "/dashboard/databases",
  order: 7,
  type: "route",
  version: "1.0.0"
}
```
**Purpose:** Structured data management with multiple views (table, board, calendar).

---

### 7. Canvas
```typescript
{
  slug: "canvas",
  name: "Canvas",
  description: "Visual collaboration and whiteboarding",
  category: "creativity",
  icon: "Palette",
  path: "/dashboard/canvas",
  order: 8,
  type: "route",
  version: "1.0.0"
}
```
**Purpose:** Collaborative whiteboard for visual brainstorming.

---

### 8. Menu Store
```typescript
{
  slug: "menus",
  name: "Menu Store",
  description: "Install and manage navigation menus",
  category: "administration",
  icon: "Menu",
  path: "/dashboard/menus",
  order: 10,
  type: "route",
  version: "1.0.0",
  requiresPermission: "MANAGE_MENUS"
}
```
**Purpose:** Browse and install optional features.
**Access:** Admin+ only (requires MANAGE_MENUS permission)

---

### 9. Invitations
```typescript
{
  slug: "invitations",
  name: "Invitations",
  description: "Manage workspace invitations",
  category: "administration",
  icon: "Mail",
  path: "/dashboard/invitations",
  order: 11,
  type: "route",
  version: "1.0.0"
}
```
**Purpose:** Send and manage workspace invitations.

---

### 10. Profile
```typescript
{
  slug: "user-settings",
  name: "Profile",
  description: "Manage your user profile and preferences",
  category: "administration",
  icon: "User",
  path: "/dashboard/user-settings",
  order: 20,
  type: "route",
  version: "1.0.0"
}
```
**Purpose:** User profile management, preferences, account settings.

---

### 11. Settings
```typescript
{
  slug: "settings",
  name: "Settings",
  description: "Workspace configuration and settings",
  category: "administration",
  icon: "Settings",
  path: "/dashboard/settings",
  order: 99,
  type: "route",
  version: "1.0.0",
  requiresPermission: "MANAGE_WORKSPACE"
}
```
**Purpose:** Workspace-wide settings and configuration.
**Access:** Owner/Admin only (requires MANAGE_WORKSPACE permission)

---

## Optional Features

**Optional features are available in the Menu Store and can be installed/uninstalled by workspace admins.**

### 1. Chat
```typescript
{
  slug: "chat",
  name: "Chat",
  description: "Alternative chat interface with AI assistant",
  category: "communication",
  icon: "MessageSquare",
  path: "/dashboard/chat",
  order: 2,
  type: "route",
  version: "1.0.0",
  tags: ["messaging", "ai"]
}
```
**Purpose:** Alternative chat interface (different from Chats).
**Status:** ✅ Stable, ready to use

---

### 2. Documents
```typescript
{
  slug: "documents",
  name: "Documents",
  description: "Collaborative document editor with real-time sync",
  category: "productivity",
  icon: "FileText",
  path: "/dashboard/documents",
  order: 3,
  type: "route",
  version: "1.2.0",
  tags: ["collaboration", "real-time"]
}
```
**Purpose:** Real-time collaborative document editor.
**Status:** ✅ Stable, ready to use

---

### 3. Calendar
```typescript
{
  slug: "calendar",
  name: "Calendar",
  description: "Team calendar with event management",
  category: "productivity",
  icon: "Calendar",
  path: "/dashboard/calendar",
  order: 9,
  type: "route",
  version: "1.0.0",
  tags: ["scheduling", "events"],
  status: "development",
  isReady: false,
  expectedRelease: "Q1 2025"
}
```
**Purpose:** Team calendar, scheduling, event management.
**Status:** 🚧 In development, not ready for production

---

### 4. Reports
```typescript
{
  slug: "reports",
  name: "Reports",
  description: "Analytics and reporting dashboard",
  category: "analytics",
  icon: "BarChart",
  path: "/dashboard/reports",
  order: 12,
  type: "route",
  version: "1.0.0",
  requiresPermission: "VIEW_REPORTS",
  status: "development",
  isReady: false,
  expectedRelease: "Q1 2025"
}
```
**Purpose:** Analytics dashboards, custom reports, data visualization.
**Status:** 🚧 In development, not ready for production
**Access:** Requires VIEW_REPORTS permission

---

### 5. Tasks
```typescript
{
  slug: "tasks",
  name: "Tasks",
  description: "Task management and tracking",
  category: "productivity",
  icon: "CheckSquare",
  path: "/dashboard/tasks",
  order: 13,
  type: "route",
  version: "1.0.0",
  tags: ["productivity", "project-management"],
  status: "development",
  isReady: false,
  expectedRelease: "Q2 2025"
}
```
**Purpose:** Task lists, project management, kanban boards.
**Status:** 🚧 In development, not ready for production

---

### 6. Wiki
```typescript
{
  slug: "wiki",
  name: "Wiki",
  description: "Knowledge base and documentation",
  category: "productivity",
  icon: "Book",
  path: "/dashboard/wiki",
  order: 14,
  type: "route",
  version: "1.0.0",
  tags: ["documentation", "knowledge-base"],
  status: "development",
  isReady: false,
  expectedRelease: "Q2 2025"
}
```
**Purpose:** Team wiki, knowledge base, documentation hub.
**Status:** 🚧 In development, not ready for production

---

## Programmatic Installation

### Install Single Feature

```typescript
// Via Convex mutation
import { api } from "@/convex/_generated/api"

// Install a feature
const result = await ctx.runMutation(api.menu.store.menuItems.installFeatureMenus, {
  workspaceId: "workspace_id",
  featureSlugs: ["tasks"]  // Feature to install
})

console.log(result)
// { success: true, installed: ["tasks"] }
```

### Install Multiple Features

```typescript
// Install multiple features at once
const result = await ctx.runMutation(api.menu.store.menuItems.installFeatureMenus, {
  workspaceId: "workspace_id",
  featureSlugs: ["tasks", "reports", "wiki"]
})

console.log(result)
// { success: true, installed: ["tasks", "reports", "wiki"] }
```

### Uninstall Feature

```typescript
// Uninstall a feature
const result = await ctx.runMutation(api.menu.store.menuItems.uninstallFeatureMenus, {
  workspaceId: "workspace_id",
  featureSlugs: ["tasks"]
})

console.log(result)
// { success: true, uninstalled: ["tasks"] }
```

### Check Installed Features

```typescript
// Get all installed menu items for workspace
const items = await ctx.runQuery(api.menu.store.menuItems.getWorkspaceMenuItems, {
  workspaceId: "workspace_id"
})

console.log("Installed features:", items.map(i => i.slug))
// ["overview", "chat", "members", "tasks", ...]
```

### Get Available Optional Features

```typescript
// Get catalog of installable features
const catalog = await ctx.runQuery(api.menu.store.menuItems.getOptionalFeaturesCatalog, {})

console.log(catalog)
// [
//   { slug: "chat", name: "Chat", description: "...", isReady: true },
//   { slug: "documents", name: "Documents", description: "...", isReady: true },
//   { slug: "calendar", name: "Calendar", description: "...", isReady: false },
//   ...
// ]
```

### Create Workspace with Selected Features

```typescript
// Create workspace and select which default features to include
const workspaceId = await ctx.runMutation(api.workspace.workspaces.createWorkspace, {
  name: "My Workspace",
  slug: "my-workspace",
  type: "organization",
  isPublic: false,
  selectedMenuSlugs: [
    // Choose which default features to include
    "overview",
    "chat",
    "members",
    "settings",
    // Optionally exclude some defaults
  ]
})
```

---

## Slug Reference Table

### Default Features (Auto-installed)

| Slug | Name | Category | Icon | Permission Required |
|------|------|----------|------|---------------------|
| `overview` | Overview | analytics | Home | - |
| `wa` | Chats | communication | MessageCircle | - |
| `chats` | Chats | communication | MessageCircle | - |
| `wa-calls` | Calls | communication | Phone | - |
| `wa-status` | Status | communication | Camera | - |
| `wa-ai` | AI | communication | Bot | - |
| `wa-starred` | Starred | communication | Star | - |
| `wa-archived` | Archived | communication | Archive | - |
| `wa-profile` | Profile | communication | User | - |
| `members` | Members | administration | Users | MANAGE_MEMBERS |
| `friends` | Friends | social | Heart | - |
| `pages` | Pages | productivity | FileText | - |
| `databases` | Databases | productivity | Database | - |
| `canvas` | Canvas | creativity | Palette | - |
| `menus` | Menu Store | administration | Menu | MANAGE_MENUS |
| `invitations` | Invitations | administration | Mail | - |
| `user-settings` | Profile | administration | User | - |
| `settings` | Settings | administration | Settings | MANAGE_WORKSPACE |

### Optional Features (Install from Menu Store)

| Slug | Name | Category | Icon | Status | Ready |
|------|------|----------|------|--------|-------|
| `chat` | Chat | communication | MessageSquare | stable | ✅ |
| `documents` | Documents | productivity | FileText | stable | ✅ |
| `calendar` | Calendar | productivity | Calendar | development | ❌ |
| `reports` | Reports | analytics | BarChart | development | ❌ |
| `tasks` | Tasks | productivity | CheckSquare | development | ❌ |
| `wiki` | Wiki | productivity | Book | development | ❌ |

---

## Feature Status

### Status Definitions

| Status | Meaning | Show in Store? | Installable? |
|--------|---------|----------------|--------------|
| `stable` | Production-ready | ✅ Yes | ✅ Yes |
| `beta` | Testing phase | ✅ Yes | ✅ Yes (with warning) |
| `development` | In development | ✅ Yes | ⚠️ If isReady=true |
| `experimental` | Experimental | ❌ No | ❌ No |
| `deprecated` | Being phased out | ❌ No | ❌ No |

### isReady Flag

```typescript
{
  status: "development",
  isReady: true,        // ✅ Can be installed (feature works but may have bugs)
  isReady: false,       // ❌ Cannot be installed (feature incomplete)
}
```

### Feature Maturity

**Production Ready (2/6 optional):**
- ✅ Chat
- ✅ Documents

**In Development (4/6 optional):**
- 🚧 Calendar (Q1 2025)
- 🚧 Reports (Q1 2025)
- 🚧 Tasks (Q2 2025)
- 🚧 Wiki (Q2 2025)

**Default Features:**
- All 11 default features are production-ready

---

## Category Breakdown

### By Category

**Communication (3):**
- Chats (default)
- Chat (optional)

**Productivity (6):**
- Pages (default)
- Databases (default)
- Documents (optional)
- Calendar (optional)
- Tasks (optional)
- Wiki (optional)

**Administration (5):**
- Members (default)
- Menu Store (default)
- Invitations (default)
- Profile (default)
- Settings (default)

**Analytics (2):**
- Overview (default)
- Reports (optional)

**Social (1):**
- Friends (default)

**Creativity (1):**
- Canvas (default)

---

## Permission Requirements

### No Permission Required
- Overview
- Chats (all sub-features)
- Friends
- Pages
- Databases
- Canvas
- Invitations
- Profile
- Chat
- Documents
- Calendar
- Tasks
- Wiki

### Permissions Required

**MANAGE_MEMBERS:**
- Members

**MANAGE_MENUS:**
- Menu Store

**MANAGE_WORKSPACE:**
- Settings

**VIEW_REPORTS:**
- Reports (optional)

---

## Feature File Locations

```bash
# Feature metadata (100% auto-discovered, NO MANUAL REGISTRATION!)
frontend/features/{slug}/config.ts  # Single source of truth per feature

# Auto-generated from feature configs
lib/features/registry.ts             # Auto-discovery system (browser)
lib/features/registry.server.ts      # Auto-discovery system (Node.js)
convex/features/menus/menu_manifest_data.ts  # Auto-synced from registry
frontend/views/manifest.tsx          # Auto-generated component registry

# Feature implementation
frontend/features/{slug}/
convex/features/{slug}/
tests/features/{slug}/

# Example: Documents feature (100% self-contained)
frontend/features/documents/
  ├── config.ts                    # ⭐ Feature metadata (auto-discovered!)
  ├── page.tsx                     # Main page component
  ├── components/                  # Feature-specific components
  ├── hooks/                       # Feature-specific hooks
  └── api/                         # Frontend API adapters

convex/features/documents/
  ├── index.ts
  ├── queries.ts
  ├── mutations.ts
  ├── schema.ts                    # Feature-specific schema

tests/features/documents/
  ├── documents.test.ts
  └── documents.integration.test.ts
```

## Adding a New Feature (Zero Manual Registration!)

```bash
# Option 1: Use CRUD command (RECOMMENDED)
pnpm run create:feature my-feature --type optional --category productivity

# This auto-generates:
# - frontend/features/my-feature/config.ts
# - frontend/features/my-feature/page.tsx
# - convex/features/my-feature/ (handlers)
# - tests/features/my-feature/ (test files)

# Option 2: Manual creation
# 1. Create feature folder
mkdir -p frontend/features/my-feature

# 2. Create config.ts - THAT'S IT! Auto-discovered automatically!
cat > frontend/features/my-feature/config.ts << 'EOF'
import { defineFeature } from '@/lib/features/defineFeature'

export default defineFeature({
  id: 'my-feature',
  name: 'My Feature',
  description: 'Amazing new feature',

  ui: {
    icon: 'Sparkles',            // Lucide React icon name
    path: '/dashboard/my-feature',
    component: 'MyFeaturePage',
    category: 'productivity',
    order: 100,
  },

  technical: {
    featureType: 'optional',
    hasUI: true,
    hasConvex: true,
    hasTests: true,
    version: '1.0.0',
  },

  status: {
    state: 'stable',
    isReady: true,
  },

  tags: ['awesome', 'new'],
  permissions: ['MY_FEATURE_ACCESS'],  // Optional
})
EOF

# 3. Run sync (auto-generates manifests)
pnpm run sync:all

# 4. Feature is now available! No manual imports needed!
```

## Icon Management

All icons use **Lucide React** icons. You can:
- Browse icons: https://lucide.dev/icons
- Edit any menu icon using **IconsPicker** component at `frontend/shared/components/icons`
- Icons are rendered dynamically - no imports needed

---

## Usage Examples

### Example 1: Install Feature via UI

1. Navigate to Menu Store: `/dashboard/menus`
2. Browse optional features catalog
3. Click "Install" on desired feature (e.g., "Tasks")
4. Feature appears in sidebar navigation
5. Access feature at `/dashboard/tasks`

### Example 2: Install Feature via Code

```typescript
// In your application code
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"

function InstallFeatureButton() {
  const installFeature = useMutation(api.menu.store.menuItems.installFeatureMenus)

  const handleInstall = async () => {
    await installFeature({
      workspaceId: currentWorkspaceId,
      featureSlugs: ["tasks"]
    })
    // Feature now installed
  }

  return <button onClick={handleInstall}>Install Tasks</button>
}
```

### Example 3: Bulk Install on Workspace Creation

```typescript
// Create workspace with specific features pre-installed
const workspaceId = await createWorkspace({
  name: "Engineering Team",
  slug: "engineering",
  type: "organization",
  isPublic: false,
  selectedMenuSlugs: [
    // Default features to include
    "overview",
    "chat",
    "members",
    "pages",
    "databases",
    "canvas",
    "settings",
  ]
})

// Then install optional features
await installFeatureMenus({
  workspaceId,
  featureSlugs: ["documents", "tasks", "wiki"]
})
```

---

## Workspace Navigation (100% Auto-Generated)

**WORKSPACE_NAVIGATION_ITEMS** is now 100% dynamically generated from feature configs!

### How It Works:

1. **Feature configs define navigation**:
   - Each `frontend/features/{slug}/config.ts` defines UI metadata
   - `ui.icon`, `ui.path`, `ui.order` control navigation appearance

2. **Auto-generated at runtime**:
   - `frontend/views/static/workspaces/constants/navigation.ts` reads from registry
   - Filters features where `technical.hasUI = true` and `status.isReady = true`
   - Sorts by `ui.order` field

3. **Zero hardcoding**:
   - No manual list of navigation items
   - Add/remove features → navigation updates automatically
   - Tests validate dynamically (no hardcoded expectations)

### To modify navigation:

```bash
# Edit the feature's config.ts
# Example: Change order of analytics feature
pnpm run edit:feature analytics
# Update ui.order field in config.ts
# Navigation updates automatically!
```

---

## Menu Version Tracking

- Each menu item can surface `metadata.version`, `previousVersion`, and `lastUpdated` to show a badge in `DragDropMenuTree`.
- Use `api.menu.store.menuItems.getMenuUpdates` to detect available upgrades; the hook returns `hasUpdate`, `currentVersion`, and `latestVersion`.
- Trigger an update with:
  ```typescript
  await installFeatureMenus({
    workspaceId,
    featureSlugs: ["chat"],
    forceUpdate: true,
  })
  ```
- Every upgrade writes `action: "version_updated"` to `activityEvents` with a diff containing `previousVersion` and `newVersion`. Use this trail for auditing or rollbacks.

---

## Shared Chat Feature Matrix

| Feature | Entry Component | Notes |
|---------|----------------|-------|
| Workspace Chat | `frontend/features/chat/components/WorkspaceChatContainer.tsx` | Standard room-based collaboration, uses `convexChatAdapter`. |
| AI Chat | `frontend/features/ai/components/AIChatContainer.tsx` | Supports `assistant`, `workflow`, `gpt`, and `custom` bot modes. |
| Support | `frontend/features/support/components/SupportChatContainer.tsx` | Ticket aware, wires `/resolve`, `/escalate`, `/assign`, `/note` commands. |
| Projects | `frontend/features/projects/components/ProjectDiscussionChat.tsx` | Provides `/assign`, `/milestone`, `/status`, `/task` helpers. |
| Documents | `frontend/features/documents/components/DocumentCollaboration.tsx` | Embeds side-panel comments with live presence. |
| CRM | `frontend/features/crm/components/CRMChatContainer.tsx` | Focuses on customer context and activity logging. |
| Notifications | `frontend/features/notifications/page.tsx` | Uses shared components for activity feed rendering. |
| Workflows | `frontend/features/workflows/page.tsx` | Leverages shared chat presets for bot-driven automation steps. |
| Comments | `frontend/features/comments/components/CommentsPanel.tsx` | Generic threaded discussion attachable to any entity. |

See the Developer Guide for migration steps and the AI Knowledge Base for adapter details.

---

## CLI Commands

```bash
# ============================================================================
# FEATURE CRUD OPERATIONS
# ============================================================================

# Create new feature (auto-generates config.ts, frontend, convex, tests)
pnpm run create:feature my-feature --type optional --category productivity

# List all auto-discovered features
pnpm run list:features
pnpm run list:features --type optional
pnpm run list:features --category analytics

# Edit existing feature (with optional maintenance mode)
pnpm run edit:feature my-feature
pnpm run edit:feature my-feature --maintenance --backup

# Delete feature (with optional archive)
pnpm run delete:feature my-feature --confirm
pnpm run delete:feature my-feature --archive --confirm

# ============================================================================
# SYNC AND VALIDATION
# ============================================================================

# Sync all feature configs to manifests
pnpm run sync:all
pnpm run sync:features

# Generate manifest.tsx from configs
pnpm run generate:manifest

# Validate all feature configs
pnpm run validate:features
pnpm run validate:pages
pnpm run validate:all

# ============================================================================
# TESTING
# ============================================================================

# Test auto-discovery system
pnpm run test:registry

# Run all tests
pnpm test
```

## Migration from Old System

If you have old features without `config.ts`:

```bash
# Old way (DEPRECATED - DO NOT USE):
# 1. Edit features.config.ts (771 lines of hardcode!)
# 2. Edit manifest.config.ts (162 lines of imports)
# 3. Update validation scripts
# 4. Update test files
# 5. Run sync
# Total: 5 manual steps, 933+ lines of hardcode

# New way (CURRENT - RECOMMENDED):
# 1. pnpm run create:feature {slug}
# Total: 1 command, zero hardcode!

# The system automatically:
# - Creates frontend/features/{slug}/config.ts
# - Auto-discovers via lib/features/registry.ts
# - Validates with Zod schemas
# - Generates manifests
# - Updates navigation
# - Zero manual registration needed!

# Files REMOVED:
# ❌ features.config.ts → DELETED (was 771 lines)
# ❌ manifest.config.ts → DELETED (was 162 lines)
# ❌ COMPONENT_IMPORT_OVERRIDES → REMOVED (24 hardcoded paths)
# ❌ componentMap → REMOVED (30+ hardcoded paths)
# ❌ REQUIRED_FEATURES → REMOVED (11 hardcoded features)
# ❌ REQUIRED_SLUGS → REMOVED (20 hardcoded slugs)
# Total: 933+ lines of hardcode REMOVED! ✅
```

---

## Next Steps

- **For Developers:** See [DEVELOPER_GUIDE.md](./2_DEVELOPER_GUIDE.md)
- **For AI Agents:** See [AI_KNOWLEDGE_BASE.md](./3_AI_KNOWLEDGE_BASE.md)
- **For Troubleshooting:** See [TROUBLESHOOTING.md](./4_TROUBLESHOOTING.md)

---

## Feature Implementation Status

### All Features with Real Convex Data (100% Complete)

**Tier 1: Production Ready**
- ✅ **Overview** (100%) - Real-time activity feed, workspace stats
- ✅ **Chats** (85%) - Full messaging with conversations, messages, participants
- ✅ **Documents** (80%) - Real-time collaborative editing
- ✅ **Starred** (90%) - Bookmark messages & documents via starredItems table
- ✅ **Archived** (90%) - Archive conversations with metadata flags
- ✅ **AI** (70%) - AI conversations via conversations type:ai
- ✅ **Calls** (60%) - Call history with calls & callParticipants tables
- ✅ **Status** (65%) - Stories feature with statuses & statusViews tables
- ✅ **Members** (75%) - Team management
- ✅ **Menus** (80%) - Navigation and feature installation
- ✅ **Settings** (75%) - Workspace configuration with dynamic feature settings
- ✅ **Invitations** (70%) - Workspace invites
- ✅ **Profile** (60%) - User preferences

**Total:** 13 features online with 100% real Convex data integration

### Convex Backend Coverage

All 27 features have complete Convex schemas:
- **16 Feature Schemas** with 35+ tables
- **All indexes configured** for optimal performance
- **Real-time subscriptions** ready
- **RBAC integration** for all features
- **Audit logging** via activityEvents table

### Recent Major Updates

**Dynamic Settings System (Phase 2 Complete):**
- ✅ Auto-registration pattern for feature settings
- ✅ WorkspaceSettings refactored from 437 to 40 lines (-91%)
- ✅ Zero manual integration required
- ✅ Automatic cleanup on unmount
- ✅ Mobile-responsive UI
- ✅ Permission-aware settings

See `frontend/shared/settings/README.md` for complete documentation.

**Menu Version Tracking:**
- ✅ Version badges in menu items
- ✅ Update notifications with blue badge
- ✅ One-click updates from dropdown
- ✅ Audit trail for all version changes
- ✅ Semantic versioning support

---

**Last Updated:** 2025-01-20
**Total Features:** 27 (18 default/system + 9 optional)
**Production Ready:** 13 features with 100% real data
**Mock Data Removed:** 100% (all features now use Convex)
