# Migration Checklist: Template Files & Audit Logging Update

**Date:** 2025-11-03
**Reason:** Template files updated to use `.example` extension and audit logging migrated to `activityEvents` table

---

## 📋 Background

Recent changes to improve developer experience and fix schema issues:

1. **Template files** now use `.example` extension to prevent TypeScript errors during development
2. **Audit logging** now uses the existing `activityEvents` table instead of non-existent `auditLogs` table
3. **File naming** follows Convex conventions (underscores instead of dashes)

---

## ✅ For Developers with Existing Code

### Check Your Code

Run these checks to see if your code needs updates:

```bash
# Check for old template references
grep -r "mutation-template.ts" convex/
grep -r "mutation_template.ts\"" convex/

# Check for old audit table usage
grep -r "auditLogs" convex/
grep -r "\.insert(\"auditLogs\"" convex/

# Check for old field names
grep -r "userId:" convex/lib/audit/
grep -r "metadata:" convex/lib/audit/
```

### If You Have Direct Template Imports

**❌ Old Code:**
```typescript
import { someFunction } from "../../templates/mutation-template";
```

**✅ New Code:**
Templates should never be imported! They should be copied and customized:

```bash
# Copy the template to your feature
cp convex/templates/mutation_template.ts.example convex/features/yourFeature/mutations.ts
```

### If You're Using Custom Audit Logging

**❌ Old Code:**
```typescript
await ctx.db.insert("auditLogs", {
  userId: user._id,
  action: "database.created",
  metadata: { name: "Test" },
  timestamp: Date.now(),
});
```

**✅ New Code:**
```typescript
// Use the helper
import { logAudit } from "../../lib/audit/logger";

await logAudit(ctx, {
  action: "database.created",
  entityType: "databases",
  entityId: databaseId,
  workspaceId: workspaceId,
  userId: user._id,
  metadata: { name: "Test" },
});

// Or insert directly to activityEvents
await ctx.db.insert("activityEvents", {
  actorUserId: user._id,       // Changed from 'userId'
  workspaceId: workspaceId,
  entityType: "databases",
  entityId: databaseId,
  action: "database.created",
  diff: { name: "Test" },      // Changed from 'metadata'
  createdAt: Date.now(),
});
```

### Migration Steps

- [ ] **Step 1:** Search for `auditLogs` references in your code
- [ ] **Step 2:** Replace with `activityEvents` table
- [ ] **Step 3:** Update field names:
  - `userId` → `actorUserId`
  - `metadata` → `diff`
  - Remove `timestamp` (use `createdAt`)
- [ ] **Step 4:** Update any direct template imports to use copies
- [ ] **Step 5:** Run tests: `pnpm test`
- [ ] **Step 6:** Run validation: `pnpm run validate:dod`
- [ ] **Step 7:** Test in dev environment
- [ ] **Step 8:** Deploy to production

---

## 🆕 For Creating New Mutations

### Quick Start

```bash
# 1. Copy the template
cp convex/templates/mutation_template.ts.example convex/features/yourFeature/mutations.ts

# 2. Open the file and replace placeholders
# - yourEntitiesTable → your table name
# - YourEntity → your entity name
# - entity.create → your permission

# 3. Customize the business logic

# 4. Test
pnpm test

# 5. Validate
pnpm run validate:permissions
pnpm run validate:audit
```

### Follow the Guide

See **[docs/MUTATION_TEMPLATE_GUIDE.md](../docs/MUTATION_TEMPLATE_GUIDE.md)** for complete instructions.

---

## 🗄️ Table Changes Reference

### Audit Logging

| Aspect | Old (❌) | New (✅) |
|--------|---------|---------|
| **Table Name** | `auditLogs` | `activityEvents` |
| **User Field** | `userId` | `actorUserId` |
| **Data Field** | `metadata` | `diff` |
| **Time Field** | `timestamp` | `createdAt` |
| **Indexes** | N/A | `by_workspace`, `by_actor`, `by_entity` |

### Schema Definition

```typescript
// activityEvents table (EXISTS in schema)
activityEvents: defineTable({
  actorUserId: v.id("users"),
  workspaceId: v.id("workspaces"),
  entityType: v.string(),
  entityId: v.string(),
  action: v.string(),
  diff: v.optional(v.any()),
  createdAt: v.number(),
})
  .index("by_workspace", ["workspaceId"])
  .index("by_actor", ["actorUserId"])
  .index("by_entity", ["entityType", "entityId"])
```

---

## 🛠️ Helper Functions

### Using `logAudit` Helper

The recommended way to log audit events:

```typescript
import { logAudit } from "../../lib/audit/logger";

// In your mutation
await logAudit(ctx, {
  action: "database.created",        // Format: "{entity}.{action}"
  entityType: "databases",           // Table name
  entityId: databaseId,              // Record ID
  workspaceId: args.workspaceId,    // Workspace context
  userId: user._id,                  // User who performed action
  metadata: {                        // Additional data (optional)
    name: args.name,
    description: args.description,
  },
});
```

### Query Functions Available

```typescript
import {
  getAuditHistory,
  getWorkspaceAuditLogs,
  getUserAuditLogs,
  getAuditLogsByAction,
} from "../../lib/audit/logger";

// Get audit history for an entity
const history = await getAuditHistory(ctx, entityId, limit);

// Get all audit logs for a workspace
const logs = await getWorkspaceAuditLogs(ctx, workspaceId, limit);

// Get all actions by a user
const userActions = await getUserAuditLogs(ctx, userId, limit);

// Get specific action type
const deletions = await getAuditLogsByAction(ctx, workspaceId, "database.deleted", limit);
```

---

## 🧪 Testing Checklist

Before deploying your changes:

### Unit Tests
- [ ] All tests pass: `pnpm test`
- [ ] New tests for updated code
- [ ] Test coverage maintained (85%+)

### Validation Scripts
- [ ] Permissions check: `pnpm run validate:permissions`
- [ ] Audit logging check: `pnpm run validate:audit`
- [ ] DoD compliance: `pnpm run validate:dod`

### Manual Testing
- [ ] Create operations log to `activityEvents`
- [ ] Update operations log correctly
- [ ] Delete operations log correctly
- [ ] Audit logs are immutable
- [ ] Query functions work
- [ ] No TypeScript errors
- [ ] Convex deploys successfully

### Integration Testing
- [ ] Test in dev environment
- [ ] Verify audit logs in Convex dashboard
- [ ] Check no broken functionality
- [ ] Performance acceptable

---

## 🚨 Common Issues & Solutions

### Issue 1: TypeScript Error - Table doesn't exist

**Error:**
```
Type '"auditLogs"' does not satisfy the constraint 'TableNames'
```

**Solution:**
Change `auditLogs` to `activityEvents`:
```typescript
// ❌ Wrong
await ctx.db.query("auditLogs")

// ✅ Correct
await ctx.db.query("activityEvents")
```

### Issue 2: Field not found error

**Error:**
```
Property 'userId' does not exist on type 'activityEvents'
```

**Solution:**
Update field names:
```typescript
// ❌ Wrong
userId: user._id,
metadata: { ... },

// ✅ Correct
actorUserId: user._id,
diff: { ... },
```

### Issue 3: Template file causes build errors

**Error:**
```
Argument of type '"yourEntitiesTable"' is not assignable to parameter
```

**Solution:**
Template files should be `.example` and copied, not used directly:
```bash
# Don't import from template
# Instead, copy and customize:
cp convex/templates/mutation_template.ts.example convex/features/myFeature/mutations.ts
```

---

## 📚 Additional Resources

### Documentation
- **[MUTATION_TEMPLATE_GUIDE.md](../docs/MUTATION_TEMPLATE_GUIDE.md)** - Complete mutation guide
- **[2_DEVELOPER_GUIDE.md](../docs/2_DEVELOPER_GUIDE.md)** - General development patterns
- **[4_TROUBLESHOOTING.md](../docs/4_TROUBLESHOOTING.md)** - Common issues

### Template Files
- **[convex/templates/README.md](../convex/templates/README.md)** - Template usage guide
- **[convex/templates/mutation_template.ts.example](../convex/templates/mutation_template.ts.example)** - The template

### Helper Libraries
- **[convex/lib/audit/logger.ts](../convex/lib/audit/logger.ts)** - Audit logging helpers
- **[convex/lib/rbac/permissions.ts](../convex/lib/rbac/permissions.ts)** - Permission helpers

---

## 📞 Need Help?

### Quick Checks
1. Read this checklist completely
2. Check [TROUBLESHOOTING.md](../docs/4_TROUBLESHOOTING.md)
3. Review [MUTATION_TEMPLATE_GUIDE.md](../docs/MUTATION_TEMPLATE_GUIDE.md)
4. Look at existing implementations in `convex/features/`

### Still Stuck?
- Check Convex logs for detailed error messages
- Run validation scripts to identify specific issues
- Review the schema in `convex/schema.ts`

---

## ✅ Migration Complete Checklist

Mark these when you've successfully migrated:

### Code Updates
- [ ] All `auditLogs` references changed to `activityEvents`
- [ ] All field names updated (userId → actorUserId, etc.)
- [ ] No direct template imports
- [ ] Using `logAudit()` helper function

### Testing
- [ ] All unit tests pass
- [ ] Validation scripts pass
- [ ] Manual testing complete
- [ ] Integration tests pass

### Deployment
- [ ] Code reviewed
- [ ] Merged to main branch
- [ ] Deployed to dev environment
- [ ] Deployed to production
- [ ] Monitoring confirms no errors

---

**Document Version:** 1.0
**Last Updated:** 2025-11-03
**Status:** Active Migration Guide

---

**Need to update this checklist?** Contact the development team or update this file directly.
