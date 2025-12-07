# Cleanup Progress Tracker

> **Last Updated:** 2025-01-20

---

## ✅ Completed

### Phase 1: Audit Logging Fixes

**Files Fixed:**
- ✅ `convex/features/cms/mutations.ts` - 11 mutations fixed
- ✅ `convex/features/database/mutations.ts` - 1 mutation fixed
- ✅ `convex/features/database/tables.ts` - 4 mutations fixed
- ✅ `convex/features/database/rows.ts` - 1 mutation fixed
- ✅ `convex/features/database/fields.ts` - 1 mutation fixed
- ✅ `convex/features/database/changeType.ts` - 1 mutation fixed

**Total Fixed:** 18 mutations (12% of 147)

**Changes Made:**
- Removed all placeholder `createAuditLog` functions
- Added `logAuditEvent` imports from `convex/shared/audit`
- Replaced all `createAuditLog` calls with `logAuditEvent`
- Normalized action format (e.g., `"cms_collection.created"` instead of `"collection.create"`)
- Updated parameter names (`userId` → `actorUserId`)

---

## ⏳ In Progress

### Phase 1: Audit Logging (Remaining)

**Files missing audit logging entirely:**
- ⏳ 129 mutations across 30+ files

**Priority Files (by feature importance):**
1. `convex/features/ai/mutations.ts` - 10 mutations
2. `convex/features/chat/messages.ts` - 7 mutations
3. `convex/features/cms_lite/**/mutations.ts` - 40+ mutations
4. Other features - 70+ mutations

---

## 📊 Statistics

- **Total Mutations:** 147
- **Mutations Fixed:** 18 (12%)
- **Mutations Remaining:** 129 (88%)

**Breakdown:**
- ✅ Placeholder audit logging: 0 mutations (ALL FIXED!)
- ⏳ Missing audit logging: 129 mutations (in 30+ files)

---

## 🎯 Next Steps

### Immediate (High Priority)
1. **Fix AI feature mutations** - 10 mutations
2. **Fix Chat feature mutations** - 7 mutations
3. **Fix CMS-Lite mutations** - 40+ mutations (largest batch)

### Short-term (This Week)
4. **Fix remaining feature mutations** - 70+ mutations
5. **Run validation** after each batch
6. **Fix import patterns** in frontend
7. **Verify permission checks** in all mutations

---

## 📝 Notes

- All placeholder audit logging has been eliminated ✅
- Using `logAuditEvent` from `convex/shared/audit.ts` consistently
- Action format standardized: `{resourceType}.{action}` (e.g., `"cms_collection.created"`)
- Parameter standardized: `actorUserId` instead of `userId`

---

## 🔄 Workflow

For each file:
1. Add import: `import { logAuditEvent } from "../../shared/audit"`
2. Find mutations missing audit logging
3. Add audit log call after successful operation
4. Use format: `await logAuditEvent(ctx, { workspaceId, actorUserId, action, resourceType, resourceId, metadata })`
5. Run validation: `pnpm run validate:audit`

---

**Status:** 🟡 In Progress (12% Complete)
**Next:** Fix AI and Chat mutations (17 mutations)
