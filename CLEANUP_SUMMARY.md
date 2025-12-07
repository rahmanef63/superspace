# Cleanup Summary & Next Steps

> **Progress Report - 2025-01-20**

---

## ✅ What We've Accomplished

### Phase 1: Audit Logging Fixes

**Files Fixed:**
1. ✅ `convex/features/cms/mutations.ts` - 11 mutations
2. ✅ `convex/features/database/mutations.ts` - 1 mutation
3. ✅ `convex/features/database/tables.ts` - 4 mutations
4. ✅ `convex/features/database/rows.ts` - 1 mutation
5. ✅ `convex/features/database/fields.ts` - 1 mutation
6. ✅ `convex/features/database/changeType.ts` - 1 mutation

**Total:** 19 mutations fixed (13% of 147)

**Additional Improvements:**
- ✅ Updated validation script to recognize `logAuditEvent` from `convex/shared/audit`
- ✅ Removed all placeholder `createAuditLog` functions
- ✅ Standardized on `logAuditEvent` from `convex/shared/audit`
- ✅ Normalized action format: `{resourceType}.{action}`

---

## 📊 Current Status

**Validation Results:**
- **Total Mutations:** 147
- **With Audit Logs:** 23 (16%)
- **Without Audit Logs:** 124 (84%)

**Breakdown:**
- ✅ Fixed in this session: 19 mutations
- ✅ Already had audit logging: 4 mutations
- ⏳ Still need fixing: 124 mutations

---

## 🎯 Recommended Next Steps

### Option 1: Continue Systematically (Recommended)

**Priority Order:**
1. **High-Value Features** (fix first):
   - `convex/features/ai/mutations.ts` - 10 mutations
   - `convex/features/chat/messages.ts` - 7 mutations
   - `convex/features/chat/conversations.ts` - 7 mutations

2. **Medium-Value Features**:
   - `convex/features/cms_lite/**/mutations.ts` - 40+ mutations (largest batch)
   - Other core features

3. **Lower-Value Features**:
   - Remaining features

**Approach:**
- Fix 1-2 files per session
- Run validation after each batch
- Track progress in `CLEANUP_PROGRESS.md`

### Option 2: Batch Processing Script

**Create enhanced migration script:**
- Automatically detect mutations missing audit logging
- Add permission checks where missing
- Add audit logging calls
- Generate fix suggestions

**Pros:** Faster, more consistent
**Cons:** Requires careful review, may miss edge cases

### Option 3: Hybrid Approach

1. Use script for simple cases (add audit logging only)
2. Manual fixes for complex cases (need permission checks, validation)

---

## 📋 Files Needing Attention

### High Priority (Missing Both Permission Checks & Audit Logging)

1. `convex/features/ai/mutations.ts` - 10 mutations
2. `convex/features/chat/messages.ts` - 7 mutations
3. `convex/features/chat/conversations.ts` - 7 mutations
4. `convex/features/calendar/mutations.ts` - 2 mutations
5. `convex/features/calls/mutations.ts` - 3 mutations

### Medium Priority

6. `convex/features/cms_lite/**/mutations.ts` - 40+ mutations
7. `convex/features/projects/mutations.ts` - 4 mutations
8. `convex/features/tasks/mutations.ts` - 2 mutations
9. `convex/features/wiki/mutations.ts` - 2 mutations

### Lower Priority

10. Remaining features - 70+ mutations

---

## 🛠️ Tools Created

1. ✅ `scripts/migration/fix-audit-logging.ts` - Migration script
2. ✅ `scripts/migration/fix-imports.ts` - Import pattern fixer
3. ✅ Updated `scripts/validate-audit-logs.ts` - Now recognizes `logAuditEvent`

---

## 📝 Pattern to Follow

For each mutation, add:

```typescript
// 1. Import (at top of file)
import { logAuditEvent } from "../../shared/audit"
import { requirePermission, ensureUser } from "../../auth/helpers"

// 2. In mutation handler (after successful operation):
await logAuditEvent(ctx, {
  workspaceId: args.workspaceId,
  actorUserId: userId,
  action: "{resourceType}.{action}", // e.g., "aiChatSession.created"
  resourceType: "{tableName}", // e.g., "aiChatSessions"
  resourceId: resourceId,
  metadata: { /* relevant data */ },
})
```

---

## 🎯 Success Metrics

**Target:**
- ✅ 100% of mutations have audit logging
- ✅ 100% of mutations have permission checks
- ✅ All mutations follow 6-step pattern
- ✅ All imports follow three-tier sharing model

**Current:**
- 🟡 16% have audit logging
- ⏳ Permission checks: Need validation
- ⏳ 6-step pattern: Need validation
- ⏳ Import patterns: Need validation

---

## 💡 Tips for Continuing

1. **Fix in batches** - Don't try to fix all 124 at once
2. **Test frequently** - Run `pnpm run validate:audit` after each batch
3. **Follow patterns** - Use the fixed files as templates
4. **Check permissions** - Many mutations also need permission checks
5. **Update progress** - Track in `CLEANUP_PROGRESS.md`

---

## 🚀 Quick Commands

```bash
# Check current status
pnpm run validate:audit

# Check permissions
pnpm run validate:permissions

# Check everything
pnpm run validate:all

# Run tests
pnpm test
```

---

**Status:** 🟡 In Progress (16% Complete)
**Next Session:** Fix AI and Chat mutations (24 mutations)

