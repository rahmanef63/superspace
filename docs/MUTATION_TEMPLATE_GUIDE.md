# Mutation Template Usage Guide

**Version:** 1.0
**Created:** 2025-11-02
**Status:** Official Guideline

---

## Purpose

This guide explains how to use the mutation templates to create Convex mutations that comply with SuperSpace project guardrails, specifically:

- ✅ **RBAC & permission checks** (DoD #2)
- ✅ **Audit event logging** (DoD #3)
- ✅ **Zod validation** (DoD #1)
- ✅ **Workspace isolation**
- ✅ **Proper error handling**

## Resources

- **Template:** `convex/templates/mutation_template.ts.example`
- **Note:** Template file uses `.example` extension to prevent TypeScript checking during development

---

## Quick Start

### Step 1: Copy the Template

```bash
# Copy the template to your feature mutations file
cp convex/templates/mutation_template.ts.example convex/features/yourFeature/mutations.ts
```

**Important:** The template file has `.example` extension because it contains placeholder code that doesn't compile. You must copy and customize it - don't use it directly.

### Step 2: Replace Placeholders

Replace these placeholders in the template:

| Placeholder | Replace With | Example |
|------------|--------------|---------|
| `yourEntitiesTable` | Your Convex table name | `databases` |
| `YourEntity` | Your entity name | `Database` |
| `entity.create` | Your permission string | `database.create` |
| `entity.created` | Your audit action | `database.created` |

### Step 3: Customize Args

Update the `args` section with your entity's fields:

```typescript
args: {
  workspaceId: v.id("workspaces"),  // Always required

  // Your custom fields
  name: v.string(),
  description: v.optional(v.string()),
  icon: v.optional(v.string()),
  // ... add more fields
},
```

### Step 4: Implement Business Logic

Replace the business logic section with your custom logic:

```typescript
// STEP 5: BUSINESS LOGIC
const databaseId = await ctx.db.insert("databases", {
  workspaceId: args.workspaceId,
  name: args.name,
  // ... your fields
});
```

### Step 5: Test & Validate

```bash
# Run your tests
npm test

# Run DoD validation
npm run validate:dod
```

---

## Complete Example

Here's a complete example of creating a database mutation:

```typescript
import { v } from "convex/values";
import { mutation } from "../../_generated/server";
import { requirePermission } from "../../lib/rbac/permissions";
import { logAudit } from "../../lib/audit/logger";

export const createDatabase = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
  },

  handler: async (ctx, args) => {
    // 🔴 CRITICAL: Permission check MUST be first
    await requirePermission(ctx, args.workspaceId, "database.create");

    // Validate input
    if (!args.name || args.name.trim().length === 0) {
      throw new Error("Database name is required");
    }

    if (args.name.length > 100) {
      throw new Error("Database name must be 100 characters or less");
    }

    // Verify workspace exists
    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace) {
      throw new Error("Workspace not found");
    }

    // Get authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("User not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    // Create database
    const now = Date.now();
    const databaseId = await ctx.db.insert("databases", {
      workspaceId: args.workspaceId,
      name: args.name,
      description: args.description,
      icon: args.icon,
      createdById: user._id,
      updatedById: user._id,
      createdAt: now,
      updatedAt: now,
    });

    // 🔴 CRITICAL: Audit logging MUST be called
    await logAudit(ctx, {
      action: "database.created",
      entityType: "databases",
      entityId: databaseId,
      workspaceId: args.workspaceId,
      userId: user._id,
      metadata: {
        name: args.name,
      },
    });

    return {
      id: databaseId,
      message: "Database created successfully",
    };
  },
});
```

---

## The 6-Step Pattern

Every mutation MUST follow this pattern:

### 1. Permission Check (MANDATORY)

```typescript
// MUST be the FIRST line in handler
await requirePermission(ctx, args.workspaceId, "feature.action");
```

**Why:** Prevents unauthorized access
**Validated by:** `scripts/validate-permissions.ts`

### 2. Input Validation

```typescript
// Validate all inputs
if (!args.name || args.name.trim().length === 0) {
  throw new Error("Name is required");
}
```

**Why:** Prevents invalid data
**Validated by:** Unit tests

### 3. Workspace Verification

```typescript
// Verify workspace exists
const workspace = await ctx.db.get(args.workspaceId);
if (!workspace) {
  throw new Error("Workspace not found");
}
```

**Why:** Ensures workspace isolation
**Validated by:** Integration tests

### 4. User Authentication

```typescript
// Get authenticated user
const identity = await ctx.auth.getUserIdentity();
if (!identity) {
  throw new Error("User not authenticated");
}
```

**Why:** Tracks who performed the action
**Validated by:** Auth tests

### 5. Business Logic

```typescript
// Your custom logic here
const entityId = await ctx.db.insert("yourTable", {
  // ... your data
});
```

**Why:** Actual operation
**Validated by:** Unit tests

### 6. Audit Logging (MANDATORY)

```typescript
// MUST be called after successful operation
await logAudit(ctx, {
  action: "entity.created",
  entityType: "yourTable",
  entityId: entityId,
  workspaceId: args.workspaceId,
  userId: user._id,
  metadata: { /* relevant data */ },
});
```

**Why:** Creates immutable audit trail
**Validated by:** `scripts/validate-audit-logs.ts`

---

## Permission Strings

Permission strings follow the format: `feature.action`

### Standard Actions

| Action | Description | Example |
|--------|-------------|---------|
| `create` | Create new entity | `database.create` |
| `read` | Read entity | `database.read` |
| `update` | Update entity | `database.update` |
| `delete` | Delete entity | `database.delete` |
| `manage` | Full management | `database.manage` |

### Using Permission Constants

**Don't** use hardcoded strings:
```typescript
// ❌ BAD
await requirePermission(ctx, workspaceId, "database.create");
```

**Do** use constants from `convex/lib/rbac/permissions.ts`:
```typescript
// ✅ GOOD
import { PERMISSIONS } from "../../lib/rbac/permissions";
await requirePermission(ctx, workspaceId, PERMISSIONS.DATABASE.CREATE);
```

---

## Audit Actions

Audit actions follow the format: `entityType.action`

### Standard Actions

Use constants from `convex/lib/audit/logger.ts`:

```typescript
import { AUDIT_ACTIONS, createActionString } from "../../lib/audit/logger";

// Create action string
const action = createActionString("database", AUDIT_ACTIONS.CREATED);
// Returns: "database.created"

await logAudit(ctx, {
  action: action,
  // ...
});
```

### Common Audit Actions

| Action | When to Use | Example |
|--------|-------------|---------|
| `created` | After insert | `database.created` |
| `updated` | After patch/replace | `database.updated` |
| `deleted` | After delete (permanent) | `database.deleted` |
| `soft_deleted` | After soft delete | `database.soft_deleted` |
| `batch_updated` | After bulk update | `database.batch_updated` |
| `shared` | After sharing | `database.shared` |
| `published` | After publishing | `database.published` |

---

## Error Handling

### Validation Errors

Throw descriptive errors for validation failures:

```typescript
if (!args.name || args.name.trim().length === 0) {
  throw new Error("Database name is required and cannot be empty");
}

if (args.name.length > 100) {
  throw new Error("Database name must be 100 characters or less");
}
```

### Permission Errors

Let `requirePermission()` throw automatically:

```typescript
// Will throw: "Permission denied: You don't have 'database.create' permission"
await requirePermission(ctx, args.workspaceId, "database.create");
```

### Not Found Errors

```typescript
const entity = await ctx.db.get(args.id);
if (!entity) {
  throw new Error("Database not found");
}
```

### Cross-Workspace Errors

```typescript
if (entity.workspaceId !== args.workspaceId) {
  throw new Error("Database does not belong to this workspace");
}
```

---

## Testing Your Mutations

Every mutation MUST have these tests:

### 1. Permission Tests

```typescript
test("rejects without permission", async () => {
  await expect(
    createDatabase(ctxWithoutPermission, args)
  ).rejects.toThrow("Permission denied");
});

test("succeeds with permission", async () => {
  const result = await createDatabase(ctxWithPermission, args);
  expect(result.id).toBeDefined();
});
```

### 2. Workspace Isolation Tests

```typescript
test("rejects cross-workspace access", async () => {
  const otherWorkspaceId = await createWorkspace();

  await expect(
    updateDatabase(ctx, {
      id: databaseId,
      workspaceId: otherWorkspaceId, // Different workspace!
      name: "Hacked",
    })
  ).rejects.toThrow("does not belong to this workspace");
});
```

### 3. Validation Tests

```typescript
test("rejects empty name", async () => {
  await expect(
    createDatabase(ctx, { ...args, name: "" })
  ).rejects.toThrow("name is required");
});

test("rejects name too long", async () => {
  await expect(
    createDatabase(ctx, { ...args, name: "a".repeat(101) })
  ).rejects.toThrow("must be 100 characters or less");
});
```

### 4. Audit Logging Tests

```typescript
test("creates audit log", async () => {
  const result = await createDatabase(ctx, args);

  const auditLog = await ctx.db
    .query("auditLogs")
    .withIndex("by_entity", (q) => q.eq("entityId", result.id))
    .first();

  expect(auditLog).toBeDefined();
  expect(auditLog.action).toBe("database.created");
  expect(auditLog.workspaceId).toBe(args.workspaceId);
});
```

### 5. Success Tests

```typescript
test("creates database successfully", async () => {
  const result = await createDatabase(ctx, args);

  expect(result.id).toBeDefined();

  const database = await ctx.db.get(result.id);
  expect(database.name).toBe(args.name);
  expect(database.workspaceId).toBe(args.workspaceId);
});
```

---

## Common Patterns

### Pattern 1: Update Mutation (PATCH semantics)

```typescript
export const updateDatabase = mutation({
  args: {
    id: v.id("databases"),
    workspaceId: v.id("workspaces"),

    // All fields optional for PATCH
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
  },

  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, "database.update");

    // Verify entity exists and belongs to workspace
    const database = await ctx.db.get(args.id);
    if (!database) {
      throw new Error("Database not found");
    }

    if (database.workspaceId !== args.workspaceId) {
      throw new Error("Database does not belong to this workspace");
    }

    // Build update object (only provided fields)
    const updates: any = {
      updatedAt: Date.now(),
      updatedById: user._id,
    };

    if (args.name !== undefined) updates.name = args.name;
    if (args.description !== undefined) updates.description = args.description;
    if (args.icon !== undefined) updates.icon = args.icon;

    // Perform update
    await ctx.db.patch(args.id, updates);

    // Audit log
    await logAudit(ctx, {
      action: "database.updated",
      entityType: "databases",
      entityId: args.id,
      workspaceId: args.workspaceId,
      userId: user._id,
      metadata: {
        fieldsUpdated: Object.keys(updates),
      },
    });

    return { id: args.id, message: "Database updated successfully" };
  },
});
```

### Pattern 2: Delete Mutation (with soft delete)

```typescript
export const deleteDatabase = mutation({
  args: {
    id: v.id("databases"),
    workspaceId: v.id("workspaces"),
    permanent: v.optional(v.boolean()),
  },

  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, "database.delete");

    const database = await ctx.db.get(args.id);
    if (!database) {
      throw new Error("Database not found");
    }

    if (database.workspaceId !== args.workspaceId) {
      throw new Error("Database does not belong to this workspace");
    }

    const user = await getAuthenticatedUser(ctx);

    if (args.permanent) {
      // Hard delete
      await ctx.db.delete(args.id);
    } else {
      // Soft delete
      await ctx.db.patch(args.id, {
        deletedAt: Date.now(),
        deletedById: user._id,
      });
    }

    await logAudit(ctx, {
      action: args.permanent ? "database.deleted" : "database.soft_deleted",
      entityType: "databases",
      entityId: args.id,
      workspaceId: args.workspaceId,
      userId: user._id,
      metadata: {
        permanent: args.permanent || false,
        name: database.name,
      },
    });

    return { id: args.id, message: "Database deleted successfully" };
  },
});
```

### Pattern 3: Batch Mutation

```typescript
export const batchUpdateDatabases = mutation({
  args: {
    ids: v.array(v.id("databases")),
    workspaceId: v.id("workspaceId"),
    updates: v.object({
      icon: v.optional(v.string()),
      // ... batch updatable fields
    }),
  },

  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, "database.update");

    // Validate batch size
    if (args.ids.length > 100) {
      throw new Error("Batch size cannot exceed 100");
    }

    // Verify all entities belong to workspace
    const databases = await Promise.all(
      args.ids.map(id => ctx.db.get(id))
    );

    for (const database of databases) {
      if (!database) {
        throw new Error("Database not found");
      }
      if (database.workspaceId !== args.workspaceId) {
        throw new Error("Cross-workspace batch operation not allowed");
      }
    }

    // Perform batch update
    const user = await getAuthenticatedUser(ctx);
    await Promise.all(
      args.ids.map(id =>
        ctx.db.patch(id, {
          ...args.updates,
          updatedAt: Date.now(),
          updatedById: user._id,
        })
      )
    );

    // Audit log batch operation
    await logAudit(ctx, {
      action: "database.batch_updated",
      entityType: "databases",
      entityId: args.ids[0],
      workspaceId: args.workspaceId,
      userId: user._id,
      metadata: {
        count: args.ids.length,
        ids: args.ids,
      },
    });

    return { count: args.ids.length, message: "Databases updated successfully" };
  },
});
```

---

## Anti-Patterns (DON'T DO THIS)

### ❌ Skipping Permission Checks

```typescript
// ❌ BAD: No permission check
export const createDatabase = mutation({
  handler: async (ctx, args) => {
    // MISSING: await requirePermission(...)
    const id = await ctx.db.insert("databases", args);
    return id;
  },
});
```

**Why it's bad:** Anyone can create databases, bypassing RBAC

### ❌ Skipping Audit Logging

```typescript
// ❌ BAD: No audit log
export const deleteDatabase = mutation({
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, "database.delete");
    await ctx.db.delete(args.id);
    // MISSING: await logAudit(...)
    return { success: true };
  },
});
```

**Why it's bad:** No audit trail, compliance violations

### ❌ Missing Workspace Verification

```typescript
// ❌ BAD: No workspace check
export const updateDatabase = mutation({
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, "database.update");
    // MISSING: Check if database.workspaceId === args.workspaceId
    await ctx.db.patch(args.id, args.updates);
    return { success: true };
  },
});
```

**Why it's bad:** Cross-workspace access possible

### ❌ Hardcoded Permission Strings

```typescript
// ❌ BAD: Hardcoded string
await requirePermission(ctx, workspaceId, "database.create");

// ✅ GOOD: Use constants
await requirePermission(ctx, workspaceId, PERMISSIONS.DATABASE.CREATE);
```

**Why it's bad:** Typos, inconsistency, hard to refactor

---

## Validation Scripts

Your mutations will be validated by these scripts:

### `scripts/validate-permissions.ts`

Checks that every mutation has `requirePermission()` call

```bash
npm run validate:permissions
```

### `scripts/validate-audit-logs.ts`

Checks that every mutation has `logAudit()` call

```bash
npm run validate:audit
```

### `scripts/validate-dod.ts`

Checks complete Definition of Done compliance

```bash
npm run validate:dod
```

---

## CI/CD Integration

These checks run automatically on every PR:

```yaml
# .github/workflows/database-dod-check.yml
name: Database DoD Check

on: [pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm install
      - run: npm run validate:permissions   # ✅
      - run: npm run validate:audit         # ✅
      - run: npm run validate:dod           # ✅
      - run: npm test                       # ✅
```

**PR will be blocked if any check fails.**

---

## Summary Checklist

When creating a mutation, ensure:

- [ ] Permission check is the FIRST line in handler
- [ ] Input validation is thorough
- [ ] Workspace verification is performed
- [ ] User authentication is checked
- [ ] Business logic is implemented
- [ ] Audit logging is called after success
- [ ] All 5 test types are written
- [ ] Permission constants are used (not hardcoded strings)
- [ ] Audit action constants are used
- [ ] Error messages are descriptive
- [ ] No cross-workspace access possible
- [ ] DoD validation passes

---

## Getting Help

- **Template:** `convex/templates/mutation_template.ts.example`
- **Permission Helper:** `convex/lib/rbac/permissions.ts`
- **Audit Helper:** `convex/lib/audit/logger.ts` (uses `activityEvents` table)
- **Project Guardrails:** `.claude/CLAUDE.md`
- **Examples:** `convex/features/database/mutations.ts`

### Audit Logging Note
- ✅ Use `activityEvents` table for audit logs (exists in schema)
- ❌ Don't use `auditLogs` table (doesn't exist)
- Field mapping: `userId` → `actorUserId`, `metadata` → `diff`

---

**Document Version:** 1.1
**Last Updated:** 2025-11-03
**Status:** Official - Must Follow
