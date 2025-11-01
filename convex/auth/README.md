# Auth Feature Documentation

## Overview
The auth feature provides role-based access control (RBAC) and workspace membership management for the CMS system.

## Tables

### `adminUsers`
Stores user information and global role assignments.
```typescript
{
  clerkId: string;        // Clerk user ID
  email: string;          // User's email
  name: string;          // Display name
  roleLevel: number;     // 0 (Owner) to 90 (Guest)
  permissions: string[]; // Global permissions
  status: string;       // active, inactive, suspended
  workspaceIds: string[]; // List of accessible workspaces
  createdBy?: string;   // Clerk ID of creator
  updatedBy?: string;   // Clerk ID of last updater
}
```

### `roles`
Defines system roles and their base permissions.
```typescript
{
  name: string;         // Role name
  level: number;       // 0 (Owner) to 90 (Guest)
  permissions: string[]; // Base permissions
  isSystem: boolean;   // If true, cannot be modified
  description?: string; // Role description
  createdBy?: string;  // Clerk ID of creator
  updatedBy?: string;  // Clerk ID of last updater
}
```

### `workspaceMemberships`
Maps users to workspaces with specific roles.
```typescript
{
  userId: string;      // References adminUsers.clerkId
  workspaceId: string; // Workspace ID
  roleLevel: number;   // Role level in this workspace
  additionalPermissions: string[]; // Workspace-specific permissions
  status: string;     // active, inactive
  joinedAt: number;   // Timestamp
  createdBy?: string; // Clerk ID of creator
  updatedBy?: string; // Clerk ID of last updater
}
```

## Role Hierarchy
1. Owner (level 0) - Full system access
2. Admin (level 10) - Manage workspace & users
3. Manager (level 30) - Manage content & features
4. Staff (level 50) - Create & edit content
5. Client (level 70) - Limited access
6. Guest (level 90) - Read-only access

## Public APIs

### Queries
- `getCurrentUser`: Get authenticated user info
- `listMyWorkspaceMemberships`: List user's workspace access

### Mutations
- `createAdminUser`: Create new admin user
- `addToWorkspace`: Add user to workspace
- `updateWorkspaceRole`: Update workspace role

### Actions
- `syncClerkUser`: Handle Clerk webhook events

## Internal Utilities
The `helpers.ts` module provides:
- Permission checking utilities
- Role validation
- Workspace membership verification

## Usage Examples

### Check Permission
```typescript
import { requirePermission } from "../helpers";

export const createItem = mutation({
  handler: async (ctx, args) => {
    // Ensure user has permission
    await requirePermission(ctx, args.workspaceId, "content.create");
    // Create item...
  }
});
```

### Get Current User
```typescript
import { api } from "../_generated/api";

const user = await ctx.runQuery(api.auth.queries.getCurrentUser);
if (!user) {
  throw new Error("Not authenticated");
}
```

## Migration Notes
1. User data is migrated from Encore's `admin_users` table
2. Roles are created during initial setup
3. Workspace memberships preserve existing access levels
4. Clerk webhooks sync user data automatically

## Migration Status
- [x] Schema migrated
- [x] Queries ported
- [x] Mutations ported
- [x] Actions ported
- [x] Docs updated

## Pending Tasks
- [ ] Implement user deletion/deactivation
- [ ] Add role management APIs
- [ ] Create migration script for existing users
- [ ] Add workspace invitation flow
