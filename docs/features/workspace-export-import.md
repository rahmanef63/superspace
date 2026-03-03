# Workspace Export/Import API Documentation

> **Module:** `convex/workspace/exportImport.ts`  
> **Last Updated:** December 2025  
> **Status:** ✅ Complete

## Overview

The Workspace Export/Import API provides comprehensive functionality for exporting workspace configurations to JSON and importing them to create new workspaces or merge into existing ones. This enables workspace templating, backup/restore, and migration scenarios.

---

## Table of Contents

1. [Features](#features)
2. [Data Format](#data-format)
3. [API Reference](#api-reference)
   - [Queries](#queries)
   - [Mutations](#mutations)
4. [Usage Examples](#usage-examples)
5. [Permission Requirements](#permission-requirements)
6. [Best Practices](#best-practices)
7. [Error Handling](#error-handling)

---

## Features

| Feature | Description |
|---------|-------------|
| **Full Export** | Export workspace settings, roles, and members |
| **Selective Export** | Export custom roles only, with/without members |
| **Import as New** | Create new workspace from export data |
| **Merge Import** | Merge settings/roles into existing workspace |
| **Validation** | Validate import data before processing |
| **History Tracking** | Track all import/export operations |
| **Audit Logging** | Full audit trail for compliance |

---

## Data Format

### WorkspaceExportData Schema

```typescript
type WorkspaceExportData = {
  version: string;              // Export format version (e.g., "1.0")
  exportedAt: number;           // Unix timestamp
  exportedBy: string;           // User ID who exported
  
  workspace: {
    name: string;               // Workspace name
    slug: string;               // URL-friendly slug
    description?: string;       // Optional description
    type: string;               // "organization" | "institution" | "group" | "family" | "personal"
    timezone?: string;          // e.g., "Asia/Jakarta"
    language?: string;          // e.g., "id", "en"
    icon?: string;              // Icon identifier
    color?: string;             // Hex color code
    themePreset?: string;       // Theme preset name
    settings?: Record<string, unknown>; // Custom settings
  };
  
  roles: Array<{
    name: string;               // Role display name
    slug: string;               // Role identifier
    description?: string;       // Role description
    permissions: string[];      // Permission strings
    color?: string;             // Role color
    level?: number;             // Hierarchy level (0-90)
    isSystemRole?: boolean;     // Whether system-managed
  }>;
  
  members?: Array<{
    email: string;              // Member email
    roleSlug: string;           // Assigned role slug
    additionalPermissions?: string[]; // Extra permissions
  }>;
  
  enabledFeatures?: string[];   // List of enabled feature slugs
};
```

### Example Export Data

```json
{
  "version": "1.0",
  "exportedAt": 1703318400000,
  "exportedBy": "k57abc123def",
  "workspace": {
    "name": "Acme Corp",
    "slug": "acme-corp",
    "description": "Main corporate workspace",
    "type": "organization",
    "timezone": "America/New_York",
    "language": "en",
    "themePreset": "corporate"
  },
  "roles": [
    {
      "name": "Owner",
      "slug": "owner",
      "permissions": ["*"],
      "level": 0,
      "isSystemRole": true
    },
    {
      "name": "Project Lead",
      "slug": "project-lead",
      "permissions": ["project.*", "task.*", "member.view"],
      "level": 30,
      "color": "#3B82F6"
    }
  ],
  "members": [
    {
      "email": "admin@acme.com",
      "roleSlug": "owner"
    },
    {
      "email": "lead@acme.com",
      "roleSlug": "project-lead",
      "additionalPermissions": ["analytics.view"]
    }
  ],
  "enabledFeatures": ["projects", "crm", "cms"]
}
```

---

## API Reference

### Queries

#### `getExportPreview`

Get a preview of what will be exported without performing the actual export.

```typescript
const preview = await ctx.runQuery(api.workspace.exportImport.getExportPreview, {
  workspaceId: "k57abc...",
  includeMembers: true,
});
```

**Arguments:**

| Argument | Type | Required | Description |
|----------|------|----------|-------------|
| `workspaceId` | `Id<"workspaces">` | ✅ | Workspace to preview |
| `includeMembers` | `boolean` | ❌ | Include member count |

**Returns:**

```typescript
{
  workspace: {
    name: string;
    slug: string;
    type: string;
    hasSettings: boolean;
    hasTimezone: boolean;
    hasLanguage: boolean;
  };
  roles: {
    total: number;
    system: number;
    custom: number;
  };
  members: number | null;
  enabledFeatures: number;
}
```

---

#### `getExportHistory`

Retrieve import/export operation history for a workspace.

```typescript
const history = await ctx.runQuery(api.workspace.exportImport.getExportHistory, {
  workspaceId: "k57abc...",
  limit: 10,
});
```

**Arguments:**

| Argument | Type | Required | Description |
|----------|------|----------|-------------|
| `workspaceId` | `Id<"workspaces">` | ✅ | Workspace to query |
| `limit` | `number` | ❌ | Max records (default: 20) |

**Returns:**

```typescript
Array<{
  _id: Id<"importExportHistory">;
  type: "import" | "export";
  entityType: string;
  status: string;
  fileName: string;
  format: string;
  recordCount: number;
  successCount: number;
  errorCount: number;
  startedAt: number;
  completedAt: number;
  user: {
    name: string;
    email: string;
    avatarUrl?: string;
  } | null;
}>
```

---

#### `validateImportData`

Validate import data JSON before importing.

```typescript
const validation = await ctx.runQuery(api.workspace.exportImport.validateImportData, {
  importData: JSON.stringify(exportData),
});
```

**Arguments:**

| Argument | Type | Required | Description |
|----------|------|----------|-------------|
| `importData` | `string` | ✅ | JSON string of export data |

**Returns:**

```typescript
{
  valid: boolean;
  errors: string[];           // Critical errors
  warnings: string[];         // Non-critical issues
  preview: {
    workspaceName: string;
    workspaceType: string;
    rolesCount: number;
    membersCount: number;
    enabledFeaturesCount: number;
  } | null;
}
```

---

### Mutations

#### `exportWorkspace`

Export workspace configuration to JSON format.

```typescript
const exportData = await ctx.runMutation(api.workspace.exportImport.exportWorkspace, {
  workspaceId: "k57abc...",
  includeMembers: true,
  includeCustomRolesOnly: false,
});
```

**Arguments:**

| Argument | Type | Required | Description |
|----------|------|----------|-------------|
| `workspaceId` | `Id<"workspaces">` | ✅ | Workspace to export |
| `includeMembers` | `boolean` | ❌ | Include member list |
| `includeCustomRolesOnly` | `boolean` | ❌ | Exclude system roles |

**Returns:** `WorkspaceExportData` (see [Data Format](#data-format))

**Side Effects:**
- Creates record in `importExportHistory` table
- Logs `workspace_exported` audit event

---

#### `importWorkspace`

Create a new workspace from export data.

```typescript
const result = await ctx.runMutation(api.workspace.exportImport.importWorkspace, {
  importData: JSON.stringify(exportData),
  overrideName: "New Workspace",
  overrideSlug: "new-workspace",
  importMembers: true,
  parentWorkspaceId: "k57parent...", // Optional
});
```

**Arguments:**

| Argument | Type | Required | Description |
|----------|------|----------|-------------|
| `importData` | `string` | ✅ | JSON string of export data |
| `overrideName` | `string` | ❌ | Override workspace name |
| `overrideSlug` | `string` | ❌ | Override workspace slug |
| `importMembers` | `boolean` | ❌ | Import members/create invitations |
| `parentWorkspaceId` | `Id<"workspaces">` | ❌ | Nest under parent workspace |

**Returns:**

```typescript
{
  workspaceId: Id<"workspaces">;
  summary: {
    rolesCreated: number;      // Custom roles created
    membersImported: number;   // Members/invitations created
    membersFailed: number;     // Failed member imports
    memberErrors?: Array<{
      email: string;
      error: string;
    }>;
  };
}
```

**Member Import Behavior:**
- **Existing users:** Creates membership with `pending` status
- **Non-existing users:** Creates invitation (valid for 7 days)

**Side Effects:**
- Creates new workspace record
- Creates system roles (owner, admin, member, client, guest)
- Creates custom roles from import
- Adds importing user as Owner
- Creates memberships/invitations for imported members
- Logs in `importExportHistory`
- Logs `workspace_imported` audit event

---

#### `mergeIntoWorkspace`

Merge settings and roles from export data into an existing workspace.

```typescript
const result = await ctx.runMutation(api.workspace.exportImport.mergeIntoWorkspace, {
  workspaceId: "k57abc...",
  importData: JSON.stringify(exportData),
  mergeSettings: true,
  mergeRoles: true,
});
```

**Arguments:**

| Argument | Type | Required | Description |
|----------|------|----------|-------------|
| `workspaceId` | `Id<"workspaces">` | ✅ | Target workspace |
| `importData` | `string` | ✅ | JSON string of export data |
| `mergeSettings` | `boolean` | ❌ | Merge workspace settings |
| `mergeRoles` | `boolean` | ❌ | Import non-existing roles |

**Returns:**

```typescript
{
  settingsUpdated: boolean;    // Whether settings were changed
  rolesCreated: number;        // New roles added
  rolesSkipped: number;        // Skipped (existing or system)
}
```

**Merge Behavior:**
- **Settings:** Only fills empty fields, doesn't overwrite
- **Roles:** Only creates roles with unique slugs, skips duplicates

**Side Effects:**
- Updates workspace settings (if applicable)
- Creates new custom roles
- Logs `workspace_merged` audit event

---

## Usage Examples

### Complete Export/Import Workflow

```typescript
// 1. Preview what will be exported
const preview = await ctx.runQuery(api.workspace.exportImport.getExportPreview, {
  workspaceId: sourceWorkspaceId,
  includeMembers: true,
});
console.log(`Exporting ${preview.roles.total} roles, ${preview.members} members`);

// 2. Export the workspace
const exportData = await ctx.runMutation(api.workspace.exportImport.exportWorkspace, {
  workspaceId: sourceWorkspaceId,
  includeMembers: true,
});

// 3. Validate before import
const validation = await ctx.runQuery(api.workspace.exportImport.validateImportData, {
  importData: JSON.stringify(exportData),
});

if (!validation.valid) {
  console.error("Validation errors:", validation.errors);
  return;
}

// 4. Import as new workspace
const result = await ctx.runMutation(api.workspace.exportImport.importWorkspace, {
  importData: JSON.stringify(exportData),
  overrideName: "Cloned Workspace",
  importMembers: true,
});

console.log(`Created workspace: ${result.workspaceId}`);
console.log(`Imported ${result.summary.membersImported} members`);
```

### Export for Backup

```typescript
// Export without members (configuration only)
const backup = await ctx.runMutation(api.workspace.exportImport.exportWorkspace, {
  workspaceId,
  includeMembers: false,
  includeCustomRolesOnly: false,
});

// Store as file
const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
downloadFile(blob, `${backup.workspace.slug}-backup-${Date.now()}.json`);
```

### Merge Template Roles

```typescript
// Load a role template
const roleTemplate = {
  version: "1.0",
  exportedAt: Date.now(),
  exportedBy: "system",
  workspace: { name: "Template", type: "organization" },
  roles: [
    {
      name: "Content Editor",
      slug: "content-editor",
      permissions: ["content.*", "media.upload"],
      level: 40,
    },
    {
      name: "Viewer",
      slug: "viewer",
      permissions: ["*.view"],
      level: 80,
    },
  ],
};

// Merge roles into existing workspace
const result = await ctx.runMutation(api.workspace.exportImport.mergeIntoWorkspace, {
  workspaceId,
  importData: JSON.stringify(roleTemplate),
  mergeRoles: true,
});

console.log(`Added ${result.rolesCreated} new roles`);
```

---

## Permission Requirements

| Operation | Required Permission |
|-----------|---------------------|
| `getExportPreview` | `workspace.manage` |
| `getExportHistory` | `workspace.manage` |
| `validateImportData` | None (stateless) |
| `exportWorkspace` | `workspace.manage` |
| `importWorkspace` | Authenticated user |
| `mergeIntoWorkspace` | `workspace.manage` |

> **Note:** `importWorkspace` creates a new workspace where the importing user becomes the Owner, so it doesn't require prior workspace permission.

---

## Best Practices

### 1. Always Validate Before Import

```typescript
const validation = await validateImportData({ importData });
if (!validation.valid) {
  // Show errors to user
  return;
}
// Proceed with import
```

### 2. Use Unique Slugs for Imports

```typescript
// Generate unique slug to avoid conflicts
const timestamp = Date.now();
const importSlug = `${originalSlug}-import-${timestamp}`;
```

### 3. Handle Member Import Carefully

- Members with existing accounts get `pending` memberships
- Non-existing users receive email invitations
- Monitor `memberErrors` for failed imports

### 4. Regular Backups

```typescript
// Schedule regular exports for disaster recovery
const backup = await exportWorkspace({
  workspaceId,
  includeMembers: true,
  includeCustomRolesOnly: false,
});
await storeBackup(backup);
```

---

## Error Handling

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| `Invalid import data format` | Malformed JSON | Validate JSON before sending |
| `Workspace with slug "x" already exists` | Duplicate slug | Use `overrideSlug` |
| `Missing workspace name` | Invalid export data | Ensure `workspace.name` exists |
| `Invalid workspace type` | Unknown type value | Use valid type enum |

### Error Response Format

```typescript
try {
  await importWorkspace({ ... });
} catch (error) {
  if (error.message.includes("already exists")) {
    // Handle duplicate slug
  } else if (error.message.includes("Invalid import")) {
    // Handle format error
  }
}
```

---

## Related Documentation

- [Workspace Settings](./workspace-settings.md)
- [Workspace Templates](./workspace-templates.md)
- [RBAC & Permissions](../core/rbac-permissions.md)
- [Audit Logging](../core/audit-logging.md)

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Dec 2025 | Initial release with export, import, merge, validation |
