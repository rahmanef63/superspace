# Convex Templates

This directory contains template files for common Convex patterns. These are **example files** that should be copied and customized for your specific use case.

---

## 📋 Available Templates

### `mutation_template.ts.example`

Standard template for creating Convex mutations that comply with SuperSpace project guardrails.

**Purpose:**
- Provides a proven pattern for mutations with built-in compliance
- Enforces RBAC permission checks
- Includes audit logging
- Demonstrates proper error handling

**Why `.example` Extension?**

Template files use the `.example` extension for important reasons:

1. **Prevents TypeScript Errors:** Templates contain placeholder code (like `"yourEntitiesTable"`) that doesn't compile
2. **Prevents Convex Deployment Issues:** Files with `.example` are ignored by `convex dev` and `convex deploy`
3. **Clear Intent:** Makes it obvious these are templates to copy, not working code

---

## 🚀 How to Use Templates

### Step 1: Copy the Template

```bash
# Copy to your feature directory
cp convex/templates/mutation_template.ts.example convex/features/yourFeature/mutations.ts
```

**Important:** Always copy to a `.ts` file (remove `.example` extension) when creating your actual mutation.

### Step 2: Replace Placeholders

The template contains placeholders you must replace:

| Placeholder | Replace With | Example |
|------------|--------------|---------|
| `yourEntitiesTable` | Your actual Convex table name | `"databases"` |
| `YourEntity` | Your entity name (PascalCase) | `Database` |
| `entity.create` | Your permission string | `"database.create"` |
| `entity.created` | Your audit action | `"database.created"` |

### Step 3: Customize Business Logic

Replace the placeholder business logic with your actual implementation:

```typescript
// REPLACE THIS:
const entityId = await ctx.db.insert("yourEntitiesTable", {
  // ...placeholder fields
});

// WITH YOUR LOGIC:
const databaseId = await ctx.db.insert("databases", {
  workspaceId: args.workspaceId,
  name: args.name,
  description: args.description,
  // ...your actual fields
});
```

### Step 4: Test & Validate

```bash
# Run tests
pnpm test

# Validate compliance
pnpm run validate:dod
pnpm run validate:permissions
pnpm run validate:audit
```

---

## 📚 Complete Guide

For detailed instructions, see:
- **[Mutation Template Guide](../../docs/MUTATION_TEMPLATE_GUIDE.md)** - Complete usage guide
- **[2_DEVELOPER_GUIDE.md](../../docs/2_DEVELOPER_GUIDE.md)** - General development patterns

---

## ✅ The 6-Step Pattern

Every mutation in the template follows this pattern:

1. **Permission Check** - `requirePermission()` must be first
2. **Input Validation** - Validate all args with Zod or manual checks
3. **Workspace Verification** - Verify workspace exists
4. **User Authentication** - Get and verify authenticated user
5. **Business Logic** - Perform the actual operation
6. **Audit Logging** - Log the action to `activityEvents` table

**Never skip these steps!** They ensure security, traceability, and compliance.

---

## 🔍 Audit Logging

### Important: Use `activityEvents` Table

The template uses the `activityEvents` table for audit logging:

```typescript
await logAudit(ctx, {
  action: "database.created",
  entityType: "databases",
  entityId: databaseId,
  workspaceId: args.workspaceId,
  userId: user._id,
  metadata: { name: args.name },
});
```

**Table Schema:**
- Table: `activityEvents` (exists in schema)
- Fields: `actorUserId`, `workspaceId`, `entityType`, `entityId`, `action`, `diff`, `createdAt`
- Indexes: `by_workspace`, `by_actor`, `by_entity`

**Don't use:**
- ❌ `auditLogs` table (doesn't exist)
- ❌ `userId` field (use `actorUserId`)
- ❌ `metadata` field (use `diff`)

---

## 🛡️ RBAC Permission Checks

### Always Check Permissions First

```typescript
// ✅ CORRECT: First line in handler
await requirePermission(ctx, args.workspaceId, "database.create");

// ❌ WRONG: Checking permissions after business logic
const dbId = await ctx.db.insert("databases", { ... });
await requirePermission(ctx, args.workspaceId, "database.create"); // Too late!
```

### Permission String Format

Use dot notation: `"{entity}.{action}"`

**Examples:**
- `"database.create"`
- `"database.update"`
- `"database.delete"`
- `"database.view"`
- `"workspace.manage"`

---

## 🧪 Testing Your Mutations

### Unit Tests

Create test files alongside your mutations:

```
convex/features/yourFeature/
├── mutations.ts          # Your mutations
└── mutations.test.ts     # Tests
```

### Test Checklist

- [ ] Permission checks work correctly
- [ ] Audit logging fires for all operations
- [ ] Input validation catches invalid data
- [ ] Workspace isolation works (can't access other workspaces)
- [ ] Error handling provides clear messages
- [ ] Edge cases are handled

---

## 🚨 Common Mistakes

### ❌ Don't Do This:

```typescript
// 1. Skipping permission check
export const createDatabase = mutation({
  handler: async (ctx, args) => {
    // Missing: await requirePermission(...)
    return await ctx.db.insert("databases", args);
  }
});

// 2. Skipping audit logging
export const updateDatabase = mutation({
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, "database.update");
    await ctx.db.patch(args.id, args.updates);
    // Missing: await logAudit(...)
  }
});

// 3. Wrong audit table
await logAudit(ctx, {
  // ... entries
});
await ctx.db.insert("auditLogs", { ... }); // ❌ Table doesn't exist!
```

### ✅ Do This:

```typescript
export const createDatabase = mutation({
  handler: async (ctx, args) => {
    // 1. Permission check (FIRST!)
    await requirePermission(ctx, args.workspaceId, "database.create");
    
    // 2. Business logic
    const dbId = await ctx.db.insert("databases", {
      workspaceId: args.workspaceId,
      name: args.name,
    });
    
    // 3. Audit logging (LAST!)
    await logAudit(ctx, {
      action: "database.created",
      entityType: "databases",
      entityId: dbId,
      workspaceId: args.workspaceId,
      userId: user._id,
      metadata: { name: args.name },
    });
    
    return dbId;
  }
});
```

---

## 📞 Getting Help

- **Questions?** Check [MUTATION_TEMPLATE_GUIDE.md](../../docs/MUTATION_TEMPLATE_GUIDE.md)
- **Issues?** Check [4_TROUBLESHOOTING.md](../../docs/4_TROUBLESHOOTING.md)
- **Examples?** See `convex/features/database/mutations.ts`

---

## 📝 Template Updates

**Version:** 1.0
**Last Updated:** 2025-11-03
**Maintained By:** Development Team

**Changelog:**
- 2025-11-03: Added `.example` extension, updated for `activityEvents` table
- 2025-11-02: Initial template created

---

**Remember:** Templates are starting points, not final code. Always customize for your specific use case!
