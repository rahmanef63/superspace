# Phase 2 Quick Reference Card

**Status:** ⏸️ Ready to Start  
**Duration:** 2 weeks (Week 3-4)  
**Focus:** Backend CRUD operations

---

## 🎯 Quick Tasks

| Task | File | Lines | Tests | Status |
|------|------|-------|-------|--------|
| 2.1 | `convex/features/database/mutations/createUniversal.ts` | ~200 | 20+ | ⏸️ |
| 2.2 | `convex/features/database/mutations/updateUniversal.ts` | ~250 | 25+ | ⏸️ |
| 2.3 | `convex/features/database/queries/getUniversal.ts` | ~150 | 15+ | ⏸️ |
| 2.4 | `convex/features/database/queries/listUniversal.ts` | ~150 | 15+ | ⏸️ |

---

## 🚀 Quick Start

### 1. Read Full Instructions
```bash
# Open detailed task file
code docs/PHASE_2_TASKS.md
```

### 2. Start Task 2.1
```bash
# Create mutation file
mkdir -p convex/features/database/mutations
touch convex/features/database/mutations/createUniversal.ts
```

### 3. Follow Template
- Use mutation template pattern from Week 0
- Add `requirePermission()` check
- Add `logAudit()` call
- Validate with Zod schemas

### 4. Write Tests
```bash
# Create test file
mkdir -p tests/features/database
touch tests/features/database/universal-mutations.test.ts
```

---

## ✅ Checklist Per Task

- [ ] Permission check with `requirePermission()`
- [ ] Input validation with Zod schemas
- [ ] Business logic implementation
- [ ] Audit logging with `logAudit()`
- [ ] Error handling (400, 403, 404, 409)
- [ ] JSDoc documentation
- [ ] 20+ unit tests
- [ ] All tests passing
- [ ] 85%+ coverage

---

## 📚 Key Imports

```typescript
// Convex
import { mutation, query } from "../../../_generated/server";
import { v } from "convex/values";

// RBAC
import { requirePermission, checkPermission } from "../../../lib/rbac/permissions";

// Audit
import { logAudit } from "../../../lib/audit/logger";

// Validation
import { UniversalDatabaseSchema } from "../../../../frontend/shared/foundation/schemas/universal-database";

// Utils
import { getUserId } from "../../../lib/auth";
```

---

## 🔑 Key Patterns

### Permission Check
```typescript
await requirePermission(ctx, workspaceId, "database:create");
```

### Validation
```typescript
const result = UniversalDatabaseSchema.safeParse(spec);
if (!result.success) {
  throw new Error(`Invalid spec: ${result.error.message}`);
}
```

### Audit Logging
```typescript
await logAudit(ctx, {
  action: "database.create",
  workspaceId,
  resourceType: "universal_database",
  resourceId: databaseId,
  metadata: { name },
});
```

### Error Handling
```typescript
// 404 Not Found
if (!database) {
  throw new Error("Database not found");
}

// 403 Forbidden
if (!hasPermission) {
  throw new Error("Permission denied");
}

// 400 Bad Request
if (!validationResult.success) {
  throw new Error(`Validation failed: ${validationResult.error}`);
}

// 409 Conflict
if (duplicateName) {
  throw new Error("Database name already exists");
}
```

---

## 📊 Success Criteria

### Code Quality
- ✅ All 4 mutations/queries implemented
- ✅ 750+ lines of backend code
- ✅ No TypeScript errors
- ✅ No linting errors
- ✅ Follows project conventions

### Testing
- ✅ 75+ unit tests written
- ✅ 100% tests passing
- ✅ 85%+ code coverage
- ✅ Edge cases covered
- ✅ Error scenarios tested

### Security
- ✅ RBAC enforced on all operations
- ✅ Workspace isolation maintained
- ✅ Audit logging on all mutations
- ✅ Input validation with Zod
- ✅ Proper error messages (no info leaks)

### Documentation
- ✅ JSDoc on all exports
- ✅ Inline comments for complex logic
- ✅ Clear function signatures
- ✅ Usage examples

---

## 🎯 Expected Output

After Phase 2:
```
convex/features/database/
  mutations/
    createUniversal.ts    (~200 lines, 20+ tests)
    updateUniversal.ts    (~250 lines, 25+ tests)
  queries/
    getUniversal.ts       (~150 lines, 15+ tests)
    listUniversal.ts      (~150 lines, 15+ tests)

tests/features/database/
  universal-mutations.test.ts  (45+ tests)
  universal-queries.test.ts    (30+ tests)
```

---

## 📞 Reference Docs

- **Full Instructions:** `docs/PHASE_2_TASKS.md`
- **Phase 1 Summary:** `docs/PHASE_1_SUMMARY.md`
- **Mutation Template:** `convex/templates/mutation_template.ts.example`
- **Type Definitions:** `frontend/shared/foundation/types/universal-database.ts`
- **Zod Schemas:** `frontend/shared/foundation/schemas/universal-database.ts`
- **Converters:** `convex/lib/converters/database-converter.ts`

---

**Created:** 2025-01-06  
**Phase 1:** ✅ Complete  
**Phase 2:** ⏸️ Ready to Start  
**Target:** Complete by Week 4
