# Rules & Guidelines

> Critical rules and best practices for SuperSpace development

---

## 📜 Files in This Folder

### Feature Management Rules
- **[FEATURE_RULES.md](FEATURE_RULES.md)** - **CRITICAL - MUST FOLLOW**
  - Golden Rule: Zero hardcoding outside feature folders
  - Single Source of Truth (config.ts)
  - 100% auto-discovery
  - Dynamic everything
  - CRUD operations only
  - Enforcement metrics

### Backend Patterns
- **[MUTATION_TEMPLATE_GUIDE.md](MUTATION_TEMPLATE_GUIDE.md)** - **MANDATORY READING** (800+ lines)
  - The 6-Step Pattern (permission → validation → verification → auth → logic → audit)
  - 4 mutation templates (create, update, delete, batch)
  - RBAC + audit logging enforcement
  - Best practices & anti-patterns
  - Testing requirements
  - Real-world examples

### Convex-Specific Rules
- **[convex_rules.mdc](convex_rules.mdc)** - Convex best practices
  - Query patterns
  - Mutation patterns
  - Schema design
  - Performance tips
  - (Cursor IDE integration)

---

## ⚠️ Critical Rules Summary

### Rule #1: Zero Hardcoding
**NEVER** hardcode feature lists, imports, or configuration outside of feature folders.
✅ Use auto-discovery
❌ Manual registration

### Rule #2: Single Source of Truth
Every feature has **EXACTLY ONE** config file: `frontend/features/{slug}/config.ts`

### Rule #3: Always Check Permissions
**EVERY** Convex handler MUST check permissions:
```typescript
await requirePermission(ctx, workspaceId, 'resource.create')
```

### Rule #4: Always Log Mutations
**EVERY** Convex mutation MUST log audit:
```typescript
await logAuditEvent(ctx, { ... })
```

### Rule #5: Use CRUD Commands Only
```bash
pnpm run create:feature {slug}
pnpm run edit:feature {slug}
pnpm run delete:feature {slug}
```

---

## 📖 Reading Order

### For All Developers (REQUIRED)
1. **[FEATURE_RULES.md](FEATURE_RULES.md)** - Read FIRST, understand rules
2. **[MUTATION_TEMPLATE_GUIDE.md](MUTATION_TEMPLATE_GUIDE.md)** - Before writing any backend code

### For Backend Development
1. **[MUTATION_TEMPLATE_GUIDE.md](MUTATION_TEMPLATE_GUIDE.md)** - Complete guide
2. **[convex_rules.mdc](convex_rules.mdc)** - Convex-specific patterns

---

## 🚨 Consequences of Violations

**Zero tolerance policy for:**
- Hardcoding feature references
- Bypassing RBAC checks
- Missing audit logs
- Manual feature registration

**All code must pass:**
- `pnpm run validate:all`
- `pnpm test`
- Pre-commit checks

---

## 🔗 Related Documentation

- **[../00_BASE_KNOWLEDGE.md](../00_BASE_KNOWLEDGE.md)** - Core concepts
- **[../1-core/2_DEVELOPER_GUIDE.md](../1-core/2_DEVELOPER_GUIDE.md)** - Development workflow
- **[../3-universal-database/](../3-universal-database/)** - Universal DB patterns

---

**Last Updated:** 2025-11-04
**Status:** ✅ Actively Enforced
