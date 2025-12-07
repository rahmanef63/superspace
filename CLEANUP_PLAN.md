# SuperSpace Project Cleanup Plan

> **Comprehensive plan to ensure consistency with latest rules and implementation methods**
> **Created:** 2025-01-20

---

## 🎯 Objective

Ensure the entire codebase follows:
- ✅ Latest frontend development rules
- ✅ Latest backend (Convex) development rules
- ✅ Zero hardcoding policy
- ✅ RBAC requirements
- ✅ Audit logging requirements
- ✅ Consistent patterns and structure

---

## 📊 Current State Analysis

### Backend (Convex) Issues Found

1. **Audit Logging Inconsistencies:**
   - ❌ 6 files using placeholder `createAuditLog` with `console.log`
   - ❌ Many mutations missing audit logging entirely
   - ✅ Correct helper exists: `convex/shared/audit.ts` → `logAuditEvent()`
   - ✅ Alternative helper: `convex/lib/audit/logger.ts` → `logAudit()`

2. **Permission Checks:**
   - ✅ 108 `requirePermission` calls found (good coverage)
   - ⚠️ Need to verify all mutations have permission checks

3. **Mutation Pattern:**
   - ⚠️ Some mutations may not follow 6-step pattern
   - ⚠️ Inconsistent error handling
   - ⚠️ Inconsistent workspace verification

### Frontend Issues Found

1. **Import Patterns:**
   - ⚠️ Some components using `@/components/ui/button` instead of `@/frontend/shared/ui/button`
   - ⚠️ Need to verify three-tier sharing model is followed

2. **Component Structure:**
   - ⚠️ Need to verify proper TypeScript types
   - ⚠️ Need to verify error handling patterns

---

## 🚀 Cleanup Phases

### Phase 1: Backend Audit Logging (HIGH PRIORITY)

**Goal:** Replace all placeholder audit logging with proper implementation

**Files to Fix:**
1. `convex/features/database/tables.ts`
2. `convex/features/database/mutations.ts`
3. `convex/features/database/rows.ts`
4. `convex/features/database/fields.ts`
5. `convex/features/database/changeType.ts`
6. `convex/features/cms/mutations.ts`

**Action Steps:**

1. **Replace placeholder functions:**
   ```typescript
   // ❌ REMOVE THIS:
   async function createAuditLog(ctx: any, params: {...}) {
     console.log('Audit log:', params)
   }
   
   // ✅ REPLACE WITH:
   import { logAuditEvent } from '@/convex/shared/audit'
   // or
   import { logAudit } from '@/convex/lib/audit/logger'
   ```

2. **Update all mutation calls:**
   ```typescript
   // ❌ OLD:
   await createAuditLog(ctx, {
     workspaceId: args.workspaceId,
     userId: userId,
     action: "entry.update",
     resourceType: "cms_entry",
     resourceId: args.id,
   })
   
   // ✅ NEW:
   await logAuditEvent(ctx, {
     workspaceId: args.workspaceId,
     actorUserId: userId,
     action: "cms_entry.updated",
     resourceType: "cms_entry",
     resourceId: args.id,
     metadata: { /* relevant data */ },
   })
   ```

3. **Verify all mutations have audit logging:**
   ```bash
   pnpm run validate:audit
   ```

**Estimated Time:** 2-3 hours

---

### Phase 2: Backend Permission Checks (HIGH PRIORITY)

**Goal:** Ensure all mutations follow 6-step pattern with permission checks

**Action Steps:**

1. **Run validation:**
   ```bash
   pnpm run validate:permissions
   ```

2. **Fix mutations missing permission checks:**
   - Ensure permission check is FIRST line in handler
   - Use proper permission constants (not hardcoded strings)
   - Follow pattern:
     ```typescript
     const { membership } = await requirePermission(
       ctx,
       args.workspaceId,
       PERMISSIONS.RESOURCE.CREATE
     )
     ```

3. **Verify workspace isolation:**
   - All mutations verify workspace ownership
   - Cross-workspace access prevented

**Estimated Time:** 2-3 hours

---

### Phase 3: Backend Mutation Pattern Standardization (MEDIUM PRIORITY)

**Goal:** Ensure all mutations follow the 6-step pattern

**6-Step Pattern Checklist:**

```typescript
export const createResource = mutation({
  args: { workspaceId: v.id('workspaces'), ... },
  handler: async (ctx, args) => {
    // ✅ STEP 1: Permission check (MANDATORY - FIRST LINE)
    const { membership } = await requirePermission(...)
    
    // ✅ STEP 2: Input validation
    if (!args.title || args.title.length < 3) {
      throw new Error('Title must be at least 3 characters')
    }
    
    // ✅ STEP 3: Workspace verification
    const workspace = await ctx.db.get(args.workspaceId)
    if (!workspace) {
      throw new Error('Workspace not found')
    }
    
    // ✅ STEP 4: User authentication
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) {
      throw new Error('User not authenticated')
    }
    
    // ✅ STEP 5: Business logic
    const resourceId = await ctx.db.insert('resources', {...})
    
    // ✅ STEP 6: Audit log (MANDATORY - AFTER SUCCESS)
    await logAuditEvent(ctx, {...})
    
    return resourceId
  }
})
```

**Action Steps:**

1. **Review each mutation file:**
   - Check if all 6 steps are present
   - Verify order (permission first, audit last)
   - Ensure proper error handling

2. **Create migration script** (optional):
   - Automatically detect missing steps
   - Generate fix suggestions

**Estimated Time:** 4-6 hours

---

### Phase 4: Frontend Import Patterns (MEDIUM PRIORITY)

**Goal:** Standardize all imports to follow three-tier sharing model

**Action Steps:**

1. **Find incorrect imports:**
   ```bash
   # Search for old import patterns
   grep -r "@/components/ui/" frontend/
   grep -r "@/components/" frontend/features/
   ```

2. **Replace with correct patterns:**
   ```typescript
   // ❌ OLD:
   import { Button } from "@/components/ui/button"
   
   // ✅ NEW:
   import { Button } from "@/frontend/shared/ui/button"
   ```

3. **Verify feature-shared imports:**
   ```typescript
   // ✅ Feature-shared (within one feature)
   import { ImageUploader } from "@/features/cms/shared/components/ImageUploader"
   
   // ✅ Global shared (all features)
   import { Button } from "@/frontend/shared/ui/button"
   ```

**Estimated Time:** 2-3 hours

---

### Phase 5: Frontend Component Structure (LOW PRIORITY)

**Goal:** Ensure all components follow latest patterns

**Checklist:**

- [ ] Proper TypeScript types (`Id<'workspaces'>`, `Doc<'resources'>`)
- [ ] Proper error handling with try/catch
- [ ] Loading states handled (`if (data === undefined)`)
- [ ] Accessibility (ARIA labels, keyboard navigation)
- [ ] Proper Convex hooks usage
- [ ] Toast notifications for errors

**Estimated Time:** 3-4 hours

---

### Phase 6: Validation & Testing (CRITICAL)

**Goal:** Ensure all validations pass

**Action Steps:**

1. **Run all validations:**
   ```bash
   # Feature validation
   pnpm run validate:features
   
   # Permission validation
   pnpm run validate:permissions
   
   # Audit logging validation
   pnpm run validate:audit
   
   # Complete DoD validation
   pnpm run validate:dod
   
   # All validations
   pnpm run validate:all
   ```

2. **Run tests:**
   ```bash
   pnpm test
   pnpm test:coverage
   ```

3. **Fix any failures:**
   - Address validation errors
   - Fix failing tests
   - Update test coverage

**Estimated Time:** 2-3 hours

---

## 📋 Detailed Action Items

### Immediate Actions (Do First)

1. **Create audit logging migration script:**
   - Script to find all `createAuditLog` placeholder calls
   - Script to replace with `logAuditEvent`
   - Validation to ensure replacements are correct

2. **Run validation scripts:**
   ```bash
   pnpm run validate:permissions
   pnpm run validate:audit
   pnpm run validate:dod
   ```

3. **Create issue list:**
   - Document all mutations missing audit logging
   - Document all mutations missing permission checks
   - Document all incorrect import patterns

### Short-term Actions (This Week)

1. **Fix audit logging in 6 identified files**
2. **Fix permission checks in any missing mutations**
3. **Standardize import patterns in frontend**
4. **Update mutation templates to match 6-step pattern**

### Long-term Actions (This Month)

1. **Review all mutations for 6-step pattern compliance**
2. **Review all frontend components for pattern compliance**
3. **Add automated checks to CI/CD**
4. **Create developer documentation with examples**

---

## 🛠️ Tools & Scripts Needed

### 1. Audit Logging Migration Script

**File:** `scripts/migration/fix-audit-logging.ts`

```typescript
// Script to:
// 1. Find all createAuditLog placeholder calls
// 2. Replace with logAuditEvent
// 3. Update import statements
// 4. Validate replacements
```

### 2. Import Pattern Fixer Script

**File:** `scripts/migration/fix-imports.ts`

```typescript
// Script to:
// 1. Find incorrect import patterns
// 2. Replace with correct patterns
// 3. Validate replacements
```

### 3. Mutation Pattern Validator

**File:** `scripts/validation/mutation-pattern.ts`

```typescript
// Script to:
// 1. Check all mutations for 6-step pattern
// 2. Report missing steps
// 3. Suggest fixes
```

---

## ✅ Success Criteria

### Backend

- [ ] All mutations have permission checks (first line)
- [ ] All mutations have audit logging (after success)
- [ ] All mutations follow 6-step pattern
- [ ] All mutations use permission constants (not hardcoded strings)
- [ ] All mutations verify workspace ownership
- [ ] `pnpm run validate:permissions` passes
- [ ] `pnpm run validate:audit` passes
- [ ] `pnpm run validate:dod` passes

### Frontend

- [ ] All imports follow three-tier sharing model
- [ ] All components use proper TypeScript types
- [ ] All components have proper error handling
- [ ] All components handle loading states
- [ ] All components are accessible
- [ ] No hardcoded feature references

### Overall

- [ ] `pnpm run validate:all` passes
- [ ] `pnpm test` passes
- [ ] Test coverage > 80%
- [ ] No linting errors
- [ ] Documentation updated

---

## 📝 Migration Checklist Template

For each file being migrated:

```markdown
## File: `convex/features/{feature}/mutations.ts`

### Before:
- [ ] Has placeholder `createAuditLog` function
- [ ] Missing permission checks
- [ ] Not following 6-step pattern
- [ ] Using hardcoded permission strings

### After:
- [ ] Uses `logAuditEvent` from `@/convex/shared/audit`
- [ ] Has permission check as first line
- [ ] Follows 6-step pattern
- [ ] Uses permission constants
- [ ] Has workspace verification
- [ ] Has proper error handling
- [ ] Tests updated
- [ ] Validation passes
```

---

## 🎯 Priority Order

1. **CRITICAL:** Fix audit logging (Phase 1)
2. **CRITICAL:** Fix permission checks (Phase 2)
3. **HIGH:** Standardize mutation patterns (Phase 3)
4. **MEDIUM:** Fix import patterns (Phase 4)
5. **MEDIUM:** Component structure (Phase 5)
6. **HIGH:** Validation & testing (Phase 6)

---

## 📚 Reference Documents

- `.cursorrules` - Main rules file
- `.cursor/rules/convex_backend.mdc` - Backend rules
- `.cursor/rules/frontend_development.mdc` - Frontend rules
- `docs/2-rules/MUTATION_TEMPLATE_GUIDE.md` - Mutation guide
- `convex/templates/mutation_template.ts.example` - Template
- `convex/shared/audit.ts` - Audit helper
- `convex/lib/audit/logger.ts` - Alternative audit helper

---

## 🚦 Getting Started

1. **Run validations to see current state:**
   ```bash
   pnpm run validate:all
   ```

2. **Start with Phase 1 (Audit Logging):**
   - Fix the 6 identified files
   - Run `pnpm run validate:audit` to verify

3. **Continue with Phase 2 (Permissions):**
   - Run `pnpm run validate:permissions`
   - Fix any missing permission checks

4. **Iterate through remaining phases**

---

**Last Updated:** 2025-01-20
**Status:** 🟡 In Progress
**Next Review:** After Phase 1 completion

