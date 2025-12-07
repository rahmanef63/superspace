# Cleanup Quick Start Guide

> **Get started with project cleanup in 5 minutes**

---

## 🚀 Immediate Actions

### Step 1: Assess Current State (2 minutes)

```bash
# Run all validations to see what needs fixing
pnpm run validate:all

# Check specific areas
pnpm run validate:permissions
pnpm run validate:audit
pnpm run validate:dod
```

**Expected Output:**
- List of mutations missing permission checks
- List of mutations missing audit logging
- List of validation failures

---

### Step 2: Fix Audit Logging (10 minutes)

**Option A: Automated Fix (Recommended)**

```bash
# Run the migration script
tsx scripts/migration/fix-audit-logging.ts

# Verify fixes
pnpm run validate:audit
```

**Option B: Manual Fix**

1. Open files listed in `CLEANUP_PLAN.md` Phase 1
2. Replace placeholder `createAuditLog` with `logAuditEvent`
3. See example in `CLEANUP_PLAN.md`

---

### Step 3: Fix Import Patterns (5 minutes)

```bash
# Run the migration script
tsx scripts/migration/fix-imports.ts

# Verify no breaking changes
pnpm run build
```

---

### Step 4: Verify Everything Works (5 minutes)

```bash
# Run all validations
pnpm run validate:all

# Run tests
pnpm test

# Check for linting errors
pnpm run lint
```

---

## 📋 Priority Checklist

### Critical (Do First)
- [ ] Run `pnpm run validate:all` to see current state
- [ ] Fix audit logging in 6 identified files
- [ ] Run `pnpm run validate:audit` to verify
- [ ] Fix any missing permission checks
- [ ] Run `pnpm run validate:permissions` to verify

### High Priority (This Week)
- [ ] Fix import patterns in frontend
- [ ] Standardize mutation patterns
- [ ] Update tests if needed
- [ ] Run full test suite

### Medium Priority (This Month)
- [ ] Review all components for pattern compliance
- [ ] Add automated checks to CI/CD
- [ ] Update documentation

---

## 🛠️ Available Tools

### Migration Scripts

1. **Fix Audit Logging:**
   ```bash
   tsx scripts/migration/fix-audit-logging.ts
   ```

2. **Fix Import Patterns:**
   ```bash
   tsx scripts/migration/fix-imports.ts
   ```

### Validation Scripts

1. **Check Permissions:**
   ```bash
   pnpm run validate:permissions
   ```

2. **Check Audit Logging:**
   ```bash
   pnpm run validate:audit
   ```

3. **Check Everything:**
   ```bash
   pnpm run validate:all
   ```

---

## 📚 Reference

- **Full Plan:** `CLEANUP_PLAN.md`
- **Rules:** `.cursorrules`
- **Backend Rules:** `.cursor/rules/convex_backend.mdc`
- **Frontend Rules:** `.cursor/rules/frontend_development.mdc`
- **Mutation Guide:** `docs/2-rules/MUTATION_TEMPLATE_GUIDE.md`

---

## 🎯 Success Criteria

You're done when:

- ✅ `pnpm run validate:all` passes
- ✅ `pnpm test` passes
- ✅ No linting errors
- ✅ All mutations have permission checks
- ✅ All mutations have audit logging
- ✅ All imports follow three-tier sharing model

---

## 💡 Tips

1. **Start Small:** Fix one file at a time
2. **Test Often:** Run validations after each fix
3. **Use Scripts:** Automated fixes are faster and less error-prone
4. **Review Changes:** Always review automated changes before committing
5. **Ask for Help:** Check `.cursorrules` for patterns and examples

---

**Ready to start?** Run `pnpm run validate:all` to see what needs fixing!

