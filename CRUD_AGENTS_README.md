# CRUD Agents & Global Settings - Implementation Guide

This document describes the CRUD agents and global settings infrastructure implemented for the Superspace project.

## 🎯 Overview

We've implemented a comprehensive system for managing CRUD operations and global settings with:
- **9 Sub-Agents** for different entity types
- **Validation Scripts** with Zod for schema enforcement
- **Integration Tests** for CRUD workflows
- **CI/CD Pipeline** for automated validation
- **Migration Scripts** with dry-run support
- **Audit Logging** for all operations

## 📁 File Structure

```
.
├── convex/
│   ├── workspace/
│   │   └── settings.ts              # Workspace settings manager
│   └── components/
│       └── registry.ts               # Component registry manager (enhanced)
├── scripts/
│   ├── validate-workspace.ts         # Workspace payload validator
│   ├── validate-workspace-settings.ts # Settings validator
│   ├── validate-document.ts          # Document payload validator
│   ├── validate-role.ts              # Role payload validator
│   ├── validate-conversation.ts      # Conversation payload validator
│   ├── validate-component.ts         # Component payload validator
│   ├── migrate-workspace-settings.ts # Settings migration script
│   └── migrate-component-schema.ts   # Component schema migration
├── tests/
│   └── workspaces.test.ts            # Workspace CRUD integration tests
├── fixtures/
│   ├── workspace.json                # Sample workspace payload
│   ├── workspace-settings.json       # Sample settings payload
│   ├── document.json                 # Sample document payload
│   ├── role.json                     # Sample role payload
│   ├── conversation.json             # Sample conversation payload
│   └── component.json                # Sample component payload
└── .github/
    └── workflows/
        └── validate-schemas.yml      # CI workflow for validation
```

## 🤖 Sub-Agents

### 1. CRUD Agent - Workspaces (P0)
**File:** `convex/workspace/workspaces.ts`

**Responsibilities:**
- Create/update/delete workspaces with validation
- Auto-generate default roles (Owner, Admin, Manager, Staff, Client, Guest)
- Create workspace membership for creator
- Enforce RBAC via PERMS constants
- Cascade deletion of related entities
- Write audit events

**Convex Functions:**
- `createWorkspace` - Create workspace with roles and membership
- `updateWorkspace` - Update workspace fields
- `deleteWorkspace` - Cascade delete workspace and relations
- `getUserWorkspaces` - Get user's workspaces
- `addMember` / `removeMember` - Manage workspace members

### 2. CRUD Agent - Documents (P0)
**File:** `convex/menu/page/documents.ts`

**Responsibilities:**
- Create/update/delete documents with workspace scoping
- Support parent-child hierarchy (nested documents)
- Toggle public/private visibility
- Update search index for title field
- Track lastModified and metadata

**Convex Functions:**
- `create` - Create document
- `update` - Update document
- `deleteDocument` - Delete document
- `togglePublic` - Toggle visibility
- `search` / `searchDocuments` - Search by title

### 3. CRUD Agent - Roles (P0)
**File:** `convex/workspace/roles.ts`

**Responsibilities:**
- Create/manage workspace roles with hierarchical levels (0-99)
- Validate unique role names per workspace
- Normalize role slug from name
- Support system roles and custom roles
- Update workspace defaultRoleId when isDefault=true

**Convex Functions:**
- `createRole` - Create custom role
- `setupBasicRoles` - Create default system roles
- `getAllRoles` - Get all workspace roles
- `hasPermission` - Check user permission

### 4. CRUD Agent - Conversations (P0)
**File:** `convex/menu/chat/conversations.ts`

**Responsibilities:**
- Create/manage conversations (personal, group, AI)
- Verify friendship for personal chats
- Prevent duplicate personal conversations
- Manage conversation participants
- Support AI conversations with metadata

**Convex Functions:**
- `createConversation` - Create conversation
- `createOrGetDirectGlobal` - Get or create direct chat
- `getWorkspaceConversations` / `getGlobalConversations`
- `addParticipant` / `removeParticipant`
- `markAsRead` - Update last read timestamp

### 5. CRUD Agent - Menu Items (P1)
**File:** `convex/menu/store/menuItems.ts`

**Responsibilities:**
- Create/manage menu items with parent-child hierarchy
- Filter by role visibility (visibleForRoleIds)
- Support menu types (folder, route, divider, action, chat, document)
- Bind menu items to component versions

**Convex Functions:**
- `createDefaultMenuItems` - Create default menu structure
- `getMenuSiblings` - Get sibling menu items
- `getBreadcrumbPath` - Build breadcrumb navigation
- `createMenuStructure` - Create hierarchical menu

### 6. CRUD Agent - Database Tables (P1)
**File:** `convex/menu/page/db/tables.ts`, `convex/menu/page/db/fields.ts`, `convex/menu/page/db/rows.ts`

**Responsibilities:**
- Manage Notion-like database tables (dbTables, dbFields, dbViews, dbRows)
- Validate field types (text, number, select, date, person, files, etc.)
- Support view filtering and sorting
- Compute formula and rollup fields

**Convex Functions:**
- `tables.create` / `tables.update` / `tables.delete`
- `fields.create` / `fields.update` / `fields.delete`
- `rows.create` / `rows.update` / `rows.delete`
- `utils.computeFormula` - Evaluate formulas

### 7. CRUD Agent - Users (P0)
**File:** `convex/user/users.ts`

**Responsibilities:**
- Sync users from Clerk webhooks (upsert/delete)
- Update user profiles (name, bio, image)
- Manage user privacy settings
- Link Clerk externalId to Convex users table

**Convex Functions:**
- `upsertFromClerk` - Sync user from Clerk
- `deleteFromClerk` - Delete user from Clerk webhook
- `updateUserProfile` - Update profile fields
- `current` - Get current user

### 8. Global Settings Manager (P1)
**File:** `convex/workspace/settings.ts` ✨ **NEW**

**Responsibilities:**
- Centralize workspace settings CRUD
- Validate settings schema (defaultRoleId, theme, etc.)
- Track settings history with audit events
- Compute diff for each settings update
- Reset settings to defaults

**Convex Functions:**
- `updateSettings` - Update settings with validation and audit
- `getSettings` - Get current settings (enriched with role details)
- `validateSettings` - Pre-flight validation
- `getSettingsHistory` - Get audit trail
- `resetToDefaults` - Reset to default settings

**Settings Schema:**
```typescript
{
  allowInvites?: boolean
  requireApproval?: boolean
  defaultRoleId?: Id<"roles">
  allowPublicDocuments?: boolean
  theme?: "light" | "dark" | "system"
}
```

### 9. Component Registry Manager (P2)
**File:** `convex/components/registry.ts` ✨ **ENHANCED**

**Responsibilities:**
- Manage component versioning (semver)
- Create component aliases for search
- Bind components to menu items
- Track component status (draft, active, deprecated)
- Support schema migrations

**Convex Functions:**
- `createComponent` - Create component registry entry
- `addComponentVersion` - Add new version
- `updateVersionStatus` - Update status with audit
- `listComponents` - List components with latest active version
- `searchComponents` - Search by key, alias, or category

## 🛠 Validation Scripts

All validation scripts use **Zod** for schema validation and exit with code 1 on failure.

### Usage

```bash
# Validate workspace payload
node scripts/validate-workspace.ts fixtures/workspace.json

# Validate workspace settings
node scripts/validate-workspace-settings.ts fixtures/workspace-settings.json

# Validate document payload
node scripts/validate-document.ts fixtures/document.json

# Validate role payload
node scripts/validate-role.ts fixtures/role.json

# Validate conversation payload
node scripts/validate-conversation.ts fixtures/conversation.json

# Validate component payload
node scripts/validate-component.ts fixtures/component.json
```

### Example Output

```
✓ Workspace payload is valid
  Name: My Workspace
  Slug: my-workspace
  Type: personal
  Public: false
```

## 🧪 Integration Tests

**File:** `tests/workspaces.test.ts`

Uses **Vitest** and **convex-test** for integration testing.

### Test Coverage

- ✅ `createWorkspace` creates default roles and membership
- ✅ `createWorkspace` normalizes slug and prevents duplicates
- ✅ `updateWorkspace` updates fields correctly
- ✅ `deleteWorkspace` cascades to related entities
- ✅ `getUserWorkspaces` returns user's workspaces
- ✅ `addMember` adds user to workspace with role
- ✅ `removeMember` deactivates membership

### Running Tests

```bash
# Run all tests
pnpm test

# Run workspace tests only
pnpm test tests/workspaces.test.ts

# Run with coverage
pnpm test --coverage
```

## 🔄 Migration Scripts

Migration scripts support `--dry-run` for safe preview of changes.

### 1. Workspace Settings Migration

**File:** `scripts/migrate-workspace-settings.ts`

Backfills missing workspace settings fields (theme, allowInvites, etc.)

```bash
# Preview changes (dry run)
CONVEX_URL=https://your-deployment.convex.cloud \
  node scripts/migrate-workspace-settings.ts --dry-run

# Apply changes
CONVEX_URL=https://your-deployment.convex.cloud \
  node scripts/migrate-workspace-settings.ts
```

**Output:**
```
🔍 DRY RUN MODE - No changes will be made

📥 Fetching all workspaces...
   Found 15 workspaces

📊 MIGRATION SUMMARY
==================================================
   Workspaces processed: 15
   Workspaces migrated:  8
   Workspaces skipped:   7

📝 CHANGES:
1. My Workspace (k123...)
   Old: {"allowInvites":true}
   New: {"allowInvites":true,"requireApproval":false,"allowPublicDocuments":false,"theme":"system"}

✅ Dry run complete. Run without --dry-run to apply changes.
```

### 2. Component Schema Migration

**File:** `scripts/migrate-component-schema.ts`

Applies componentVersions.migrations to evolve component schemas.

```bash
# Preview changes (dry run)
CONVEX_URL=https://your-deployment.convex.cloud \
  node scripts/migrate-component-schema.ts --dry-run

# Apply changes
CONVEX_URL=https://your-deployment.convex.cloud \
  node scripts/migrate-component-schema.ts
```

**Migration Functions:**
```typescript
const MIGRATIONS: Record<number, MigrationFunction> = {
  1: {
    from: 1,
    to: 2,
    transform: (data) => {
      // Example: Rename 'colour' to 'color'
      if (data.propsSchema?.colour) {
        data.propsSchema.color = data.propsSchema.colour;
        delete data.propsSchema.colour;
      }
      return data;
    },
  },
};
```

## 🚀 CI/CD Pipeline

**File:** `.github/workflows/validate-schemas.yml`

Automatically runs on pull requests and pushes to main/develop.

### Jobs

1. **validate** - Validate all schema payloads
2. **test** - Run integration tests
3. **typecheck** - Run TypeScript type check

### Workflow Steps

```yaml
validate:
  - Checkout code
  - Setup Node.js & pnpm
  - Install dependencies
  - Validate workspace schema
  - Validate workspace settings schema
  - Validate document schema
  - Validate role schema
  - Validate conversation schema
  - Validate component schema

test:
  - Run workspace CRUD tests
  - Run all tests

typecheck:
  - Run TypeScript type check
```

## 📊 Audit Logging

All CRUD operations write audit events to the `activityEvents` table.

### Event Structure

```typescript
{
  actorUserId: Id<"users">          // Who performed the action
  workspaceId: Id<"workspaces">     // Which workspace
  entityType: string                // e.g., "workspace_settings", "component"
  entityId: string                  // Entity ID
  action: string                    // e.g., "workspace_settings_updated"
  diff: object                      // Before/after diff
  createdAt: number                 // Timestamp
}
```

### Example Audit Event

```json
{
  "actorUserId": "k123...",
  "workspaceId": "k456...",
  "entityType": "workspace_settings",
  "entityId": "k456...",
  "action": "workspace_settings_updated",
  "diff": {
    "changes": {
      "theme": {
        "old": null,
        "new": "dark"
      },
      "allowPublicDocuments": {
        "old": false,
        "new": true
      }
    }
  },
  "createdAt": 1704067200000
}
```

## 🎨 Usage Examples

### Update Workspace Settings

```typescript
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

function SettingsPanel({ workspaceId }) {
  const updateSettings = useMutation(api.workspace.settings.updateSettings);

  const handleThemeChange = async (theme: "light" | "dark" | "system") => {
    await updateSettings({
      workspaceId,
      settings: { theme },
    });
  };

  return <ThemeSelector onChange={handleThemeChange} />;
}
```

### Search Components

```typescript
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

function ComponentSearch({ workspaceId }) {
  const results = useQuery(api.components.registry.searchComponents, {
    query: "button",
    workspaceId,
    type: "ui",
  });

  return (
    <div>
      {results?.map((item) => (
        <ComponentCard
          key={item.component._id}
          component={item.component}
          version={item.version}
          matchType={item.matchType}
        />
      ))}
    </div>
  );
}
```

### Get Settings History

```typescript
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

function SettingsHistory({ workspaceId }) {
  const history = useQuery(api.workspace.settings.getSettingsHistory, {
    workspaceId,
    limit: 10,
  });

  return (
    <div>
      {history?.map((event) => (
        <HistoryItem
          key={event._id}
          actor={event.actor}
          changes={event.diff.changes}
          timestamp={event.createdAt}
        />
      ))}
    </div>
  );
}
```

## 📚 Next Steps

1. **Create Additional Tests** - Add tests for documents, roles, conversations, and components
2. **Implement API Routes** - Create Next.js API routes for external access (e.g., `/api/workspaces`, `/api/documents`)
3. **Add Rate Limiting** - Implement rate limiting for CRUD operations
4. **Setup Monitoring** - Add monitoring for audit events and failed validations
5. **Documentation** - Generate API documentation from Zod schemas
6. **E2E Tests** - Add Playwright tests for full user workflows

## 🤝 Contributing

When adding new CRUD agents:

1. Create validation script in `scripts/validate-{entity}.ts`
2. Add fixture in `fixtures/{entity}.json`
3. Create integration tests in `tests/{entity}.test.ts`
4. Update CI workflow to include new validation
5. Add audit logging to all mutations
6. Document in this README

## 📖 References

- [Convex Documentation](https://docs.convex.dev/)
- [Zod Schema Validation](https://zod.dev/)
- [Vitest Testing](https://vitest.dev/)
- [GitHub Actions](https://docs.github.com/en/actions)

---

**Generated with Claude Code** 🤖
