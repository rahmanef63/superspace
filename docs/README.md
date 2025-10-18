# SuperSpace Documentation

> **Central knowledge base for SuperSpace project**
> Last Updated: 2025-01-18

---

## 📖 Table of Contents

1. [Feature System Overview](#feature-system-overview)
2. [Quick Start](#quick-start)
3. [Documentation Index](#documentation-index)
4. [Common Tasks](#common-tasks)
5. [Troubleshooting](#troubleshooting)

---

## 🎯 Feature System Overview

SuperSpace uses a **feature package system** where each feature is:
- Self-contained (frontend + backend + tests)
- RBAC-protected (role-based access control)
- Audit-logged (all mutations tracked)
- Type-safe (Zod validation + TypeScript)

### Feature Types

| Type | Auto-installed | Uninstallable | Examples |
|------|----------------|---------------|----------|
| **Default** | ✅ Yes | ❌ No | Overview, WhatsApp, Members |
| **Optional** | ❌ No | ✅ Yes | Reports, Calendar, Tasks |
| **Experimental** | ❌ No | ✅ Yes | Beta features |

---

## 🚀 Quick Start

### Creating a New Feature

```bash
# 1. Scaffold the feature
pnpm run scaffold:feature reports --type optional --category analytics

# 2. Implement your feature
# - Edit frontend/features/reports/
# - Edit convex/features/reports/
# - Write tests/features/reports/

# 3. Sync configuration
pnpm run sync:features

# 4. Validate
pnpm run validate:features
pnpm test

# 5. Commit
git add .
git commit -m "feat: add reports feature"
git push
```

### Common Commands

```bash
# Feature Management
pnpm run scaffold:feature {slug}     # Create new feature
pnpm run sync:features               # Regenerate manifests
pnpm run validate:features           # Validate features.config.ts

# Validation (run ALL before commit)
pnpm run validate:workspace          # Validate workspace schema
pnpm run validate:settings           # Validate settings schema
pnpm run validate:document           # Validate document schema
pnpm run validate:role               # Validate role schema
pnpm run validate:conversation       # Validate conversation schema
pnpm run validate:all                # Run all validators

# Testing
pnpm test                            # Run all tests
pnpm test workspaces                 # Run workspace tests
pnpm test features                   # Run feature tests

# Development
pnpm run dev                         # Start dev server
pnpm run typecheck                   # Type checking
pnpm run lint                        # ESLint
```

---

## 📚 Documentation Index

### Core Documentation

| Document | Purpose | Audience |
|----------|---------|----------|
| [FEATURE_STATUS.md](./FEATURE_STATUS.md) | **START HERE** - Current project status | Everyone |
| [feature-system-diagram.md](./feature-system-diagram.md) | Visual architecture diagrams | Developers |
| [FEATURE_SYSTEM.md](./FEATURE_SYSTEM.md) | Detailed feature system guide | Developers |
| [CLAUDE.md](../.claude/CLAUDE.md) | Project guardrails & rules | AI Agents |

### Reference Files

| File | Description |
|------|-------------|
| [features.config.ts](../features.config.ts) | Single source of truth for all features |
| [convex/schema.ts](../convex/schema.ts) | Database schema definitions |
| [convex/menu/store/menu_manifest_data.ts](../convex/menu/store/menu_manifest_data.ts) | Auto-generated menu manifest (DO NOT EDIT) |

### Architecture Diagrams

See [feature-system-diagram.md](./feature-system-diagram.md) for:
- System architecture
- Data flow
- Feature lifecycle
- Permission flow
- CI/CD pipeline
- Feature structure

---

## 🔧 Common Tasks

### Task 1: Add a New Default Feature

```bash
# Example: Adding a "Calendar" feature

# 1. Scaffold
pnpm run scaffold:feature calendar --type default --category productivity

# 2. Update features.config.ts
# Add calendar to defaultFeatures array

# 3. Implement
# - frontend/features/calendar/views/CalendarPage.tsx
# - convex/features/calendar/queries.ts
# - convex/features/calendar/mutations.ts
# - tests/features/calendar/calendar.test.ts

# 4. Sync & Validate
pnpm run sync:features
pnpm run validate:features
pnpm test

# 5. Commit
git add .
git commit -m "feat: add calendar feature"
```

### Task 2: Add a New Optional Feature

```bash
# Example: Adding a "Tasks" feature

# 1. Scaffold
pnpm run scaffold:feature tasks --type optional --category productivity

# 2. Update features.config.ts
# Add tasks to optionalFeatures array

# 3. Implement (same as default)

# 4. Sync & Validate
pnpm run sync:features
pnpm run validate:features

# 5. Feature will appear in Menu Store for installation
```

### Task 3: Fix Workspace Bootstrap Issue

If a workspace has no menus after creation:

```typescript
// In Convex dashboard or via mutation
await ctx.runMutation(api.workspace.workspaces.resetWorkspace, {
  workspaceId: "workspace_id_here",
  mode: "replaceMenus" // or "clean" to delete and recreate
})
```

### Task 4: Add RBAC to a Feature

```typescript
// In convex/features/{slug}/queries.ts
import { requirePermission } from "../../auth/helpers"
import { PERMS } from "../../workspace/permissions"

export const list = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    // Check permission
    await requirePermission(ctx, args.workspaceId, PERMS.VIEW_REPORTS)

    // Your query logic
    const reports = await ctx.db
      .query("reports")
      .withIndex("by_workspace", q => q.eq("workspaceId", args.workspaceId))
      .collect()

    return reports
  }
})
```

### Task 5: Add Audit Logging

```typescript
// In convex/features/{slug}/mutations.ts
import { logAuditEvent } from "../../lib/audit"

export const create = mutation({
  args: { workspaceId: v.id("workspaces"), title: v.string() },
  handler: async (ctx, args) => {
    const { membership } = await requirePermission(ctx, args.workspaceId, PERMS.CREATE_REPORTS)

    const reportId = await ctx.db.insert("reports", {
      workspaceId: args.workspaceId,
      title: args.title,
      createdBy: membership.userId,
    })

    // Log audit event
    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      userId: membership.userId,
      action: "REPORT_CREATED",
      resourceType: "report",
      resourceId: reportId,
      metadata: { title: args.title },
    })

    return reportId
  }
})
```

---

## 🐛 Troubleshooting

### Issue: New workspace has no menus

**Symptoms:**
- Create workspace successfully
- Sidebar is empty
- No menu items visible

**Cause:**
Error in `createDefaultMenuItems` is suppressed (see [FEATURE_STATUS.md](./FEATURE_STATUS.md))

**Solution:**
```typescript
// Run this mutation
await ctx.runMutation(api.workspace.workspaces.resetWorkspace, {
  workspaceId: yourWorkspaceId,
  mode: "replaceMenus"
})
```

**Prevention:**
- Fix has been applied to error handling
- Test workspace creation after deployment
- Monitor logs for "CRITICAL: Failed to create default menus"

### Issue: Feature not showing in Menu Store

**Checklist:**
1. ✅ Feature is `type: "optional"` in `features.config.ts`?
2. ✅ Ran `pnpm run sync:features`?
3. ✅ `optional_features_catalog.ts` exists?
4. ✅ Feature not already installed?

**Debug:**
```typescript
// Check available features
const available = await ctx.runQuery(
  api.menu.store.menuItems.getAvailableFeatureMenus,
  { workspaceId }
)
console.log("Available features:", available)
```

### Issue: Permission denied on feature access

**Checklist:**
1. ✅ User has active workspace membership?
2. ✅ User's role has required permission?
3. ✅ Feature's `requiresPermission` is correct?

**Debug:**
```typescript
// Check user's permissions
const workspace = await ctx.runQuery(
  api.workspace.workspaces.getWorkspace,
  { workspaceId }
)
console.log("User role:", workspace.role)
console.log("Role permissions:", workspace.role.permissions)
```

### Issue: Tests failing after adding feature

**Common causes:**
1. Missing mock data
2. Missing RBAC checks
3. Schema changes not reflected
4. Convex not regenerated

**Solutions:**
```bash
# Regenerate Convex types
npx convex dev --once

# Check schema
pnpm run validate:all

# Run specific test
pnpm test features/yourfeature
```

---

## 📊 Project Health Checks

### Before Every Commit

```bash
# Run ALL of these
pnpm run validate:all    # Validates all schemas
pnpm run typecheck       # TypeScript checks
pnpm run lint            # ESLint
pnpm test                # All tests
```

### Weekly Health Check

```bash
# 1. Check feature status
cat docs/FEATURE_STATUS.md

# 2. Review open issues
# Check GitHub Issues

# 3. Update dependencies (careful!)
pnpm outdated

# 4. Run full test suite
pnpm test --coverage
```

---

## 🎓 Learning Resources

### For New Developers

1. **Start here:** [FEATURE_STATUS.md](./FEATURE_STATUS.md)
2. **Understand the system:** [feature-system-diagram.md](./feature-system-diagram.md)
3. **Read the rules:** [CLAUDE.md](../.claude/CLAUDE.md)
4. **Try scaffolding:** `pnpm run scaffold:feature demo --type optional`

### Key Concepts

- **RBAC:** Role-Based Access Control
- **Audit Logging:** Track all mutations
- **Feature Package:** Self-contained feature module
- **Menu Sets:** Collections of menu items
- **Workspace Bootstrap:** Initial setup when workspace is created

### External Links

- [Convex Documentation](https://docs.convex.dev)
- [Zod Documentation](https://zod.dev)
- [Vitest Documentation](https://vitest.dev)

---

## 🤝 Contributing

### Definition of Done (DoD)

Before marking a feature as complete:

1. ✅ Schema validated (Zod scripts pass)
2. ✅ RBAC checks implemented
3. ✅ Audit events logged
4. ✅ Tests written and passing (unit + integration)
5. ✅ Documentation updated
6. ✅ CI/CD passes
7. ✅ Code reviewed

### Code Review Checklist

- [ ] RBAC checks present in all queries/mutations
- [ ] Audit logging for all mutations
- [ ] Tests cover happy path + edge cases
- [ ] TypeScript types are correct
- [ ] No hardcoded values
- [ ] Error handling is proper
- [ ] Documentation updated

---

## 📞 Support

### Getting Help

1. **Check this documentation first**
2. Check [FEATURE_STATUS.md](./FEATURE_STATUS.md) for known issues
3. Search GitHub Issues
4. Ask in team chat
5. Create new GitHub Issue with template

### Reporting Bugs

When reporting bugs, include:
- Steps to reproduce
- Expected vs actual behavior
- Error messages / logs
- Browser / environment info
- Relevant code snippets

---

## 🔄 Version History

| Date | Version | Changes |
|------|---------|---------|
| 2025-01-18 | 1.0.0 | Initial documentation consolidation |

---

**Next Review:** 2025-01-25
**Maintained by:** Development Team
