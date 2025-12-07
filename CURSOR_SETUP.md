# Cursor AI Setup - SuperSpace Project

> **Complete setup guide for Cursor AI with SuperSpace project knowledge**
> **Created:** 2025-01-20

---

## ✅ What Was Created

### 1. Main Rules File
**File:** `.cursorrules`

Comprehensive rules file that Cursor automatically loads. Contains:
- Critical rules (zero hardcoding, RBAC, audit logging)
- Architecture patterns (feature structure, three-tier sharing)
- Tech stack details
- Common commands reference
- Quick reference templates

### 2. Context-Aware Rules
**Location:** `.cursor/rules/`

Organized rules files that load based on file context:

| File | Purpose | Applies To |
|------|---------|------------|
| `base_knowledge.mdc` | Core project knowledge | All files |
| `feature_development.mdc` | Feature development rules | `frontend/features/**/*`, `convex/features/**/*` |
| `convex_backend.mdc` | Convex backend rules | `convex/**/*.ts` |
| `frontend_development.mdc` | Frontend development rules | `frontend/**/*.tsx`, `app/**/*.tsx` |
| `convex_rules.mdc` | Convex guidelines (existing) | All Convex files |

### 3. Documentation
**File:** `.cursor/README.md`

Explains the structure and usage of Cursor rules.

---

## 🎯 How It Works

### Automatic Loading

1. **`.cursorrules`** - Loaded automatically when Cursor starts
2. **`rules/*.mdc`** - Loaded based on file context (via glob patterns)
3. **Context-aware** - Rules apply based on files being edited

### Example Workflow

```
User opens: frontend/features/chat/components/ChatView.tsx
  ↓
Cursor loads:
  - .cursorrules (always loaded)
  - base_knowledge.mdc (all files)
  - feature_development.mdc (matches frontend/features/**/*)
  - frontend_development.mdc (matches frontend/**/*.tsx)
  ↓
Cursor has full context:
  ✓ Project structure
  ✓ Feature development rules
  ✓ Frontend patterns
  ✓ Import conventions
```

---

## 📚 Key Rules Summary

### 1. Zero Hardcoding Policy
- ❌ Never hardcode feature references outside feature folders
- ✅ Use auto-discovery via `lib/features/registry.ts`
- ✅ Dynamic path resolution

### 2. Single Source of Truth
- Each feature has EXACTLY ONE config: `frontend/features/{slug}/config.ts`
- ❌ Don't duplicate feature information
- ✅ Edit config.ts for all changes

### 3. RBAC Mandatory
- Every Convex handler MUST check permissions
- Use `requirePermission()` helper
- Validated by `scripts/validate-permissions.ts`

### 4. Audit Logging Required
- Every mutation MUST log audit events
- Use `logAuditEvent()` helper
- Validated by `scripts/validate-audit-logs.ts`

### 5. Mutation Pattern (6-Step)
1. Permission check (MANDATORY - FIRST LINE)
2. Input validation
3. Workspace verification
4. User authentication
5. Business logic
6. Audit log (MANDATORY - AFTER SUCCESS)

---

## 🚀 Quick Start

### For AI Agents

When working on SuperSpace:

1. **Understand the project:**
   - Read `base_knowledge.mdc` for core concepts
   - Check `PROJECT_STATUS.md` for current status

2. **Follow the rules:**
   - Zero hardcoding (use auto-discovery)
   - RBAC on all Convex handlers
   - Audit logging on all mutations
   - Single source of truth (config.ts)

3. **Use the patterns:**
   - Feature config template
   - Mutation 6-step pattern
   - Query pattern with RBAC
   - Three-tier sharing model

### For Developers

1. **Cursor automatically loads rules** - No setup needed!

2. **Rules apply contextually:**
   - Edit a feature → Feature rules apply
   - Edit Convex → Backend rules apply
   - Edit frontend → Frontend rules apply

3. **Check rules anytime:**
   - Read `.cursorrules` for overview
   - Read specific `.mdc` files for details

---

## 📁 File Structure

```
.cursor/
├── README.md                      # Rules directory overview
└── rules/
    ├── base_knowledge.mdc         # Core project knowledge
    ├── feature_development.mdc    # Feature development rules
    ├── convex_backend.mdc         # Convex backend rules
    ├── frontend_development.mdc   # Frontend development rules
    └── convex_rules.mdc           # Convex guidelines (existing)

.cursorrules                       # Main rules file (root)
```

---

## 🔍 What Cursor Knows Now

### Project Structure
- ✅ Modular feature system
- ✅ Auto-discovery mechanism
- ✅ Three-tier sharing model
- ✅ File organization patterns

### Development Rules
- ✅ Zero hardcoding policy
- ✅ Single source of truth
- ✅ RBAC requirements
- ✅ Audit logging requirements
- ✅ Mutation/query patterns

### Tech Stack
- ✅ Next.js 15 + React 19
- ✅ Convex (real-time database)
- ✅ Clerk (authentication)
- ✅ TypeScript + Zod
- ✅ shadcn/ui + Tailwind

### Common Patterns
- ✅ Feature config template
- ✅ Mutation 6-step pattern
- ✅ Query pattern with RBAC
- ✅ React component structure
- ✅ Import conventions

---

## 🎓 Examples

### Creating a Feature

Cursor will:
1. ✅ Use `pnpm run create:feature {slug}` command
2. ✅ Create proper structure (config.ts, components, backend)
3. ✅ Follow auto-discovery patterns
4. ✅ Add RBAC checks
5. ✅ Add audit logging

### Creating a Mutation

Cursor will:
1. ✅ Follow 6-step pattern
2. ✅ Add permission check (first line)
3. ✅ Add input validation
4. ✅ Add workspace verification
5. ✅ Add audit logging (after success)
6. ✅ Use permission constants (not hardcoded strings)

### Creating a Component

Cursor will:
1. ✅ Use proper TypeScript types
2. ✅ Use Convex hooks correctly
3. ✅ Follow import patterns (three-tier sharing)
4. ✅ Add error handling
5. ✅ Make it accessible

---

## 📖 Related Documentation

**Project Documentation:**
- `docs/00_BASE_KNOWLEDGE.md` - Essential developer knowledge
- `docs/2-rules/FEATURE_RULES.md` - Feature development rules
- `docs/2-rules/MUTATION_TEMPLATE_GUIDE.md` - Mutation patterns
- `docs/1-core/1_SYSTEM_OVERVIEW.md` - Architecture overview
- `PROJECT_STATUS.md` - Current project status

**Cursor Rules:**
- `.cursorrules` - Main rules file
- `.cursor/rules/*.mdc` - Context-specific rules
- `.cursor/README.md` - Rules directory overview

---

## ✅ Verification

To verify the setup:

1. **Check files exist:**
   ```bash
   ls -la .cursorrules
   ls -la .cursor/rules/
   ```

2. **Open a file in Cursor:**
   - Edit `frontend/features/chat/components/ChatView.tsx`
   - Cursor should understand feature structure
   - Cursor should suggest proper imports

3. **Create a mutation:**
   - Ask Cursor to create a new mutation
   - Should follow 6-step pattern
   - Should include RBAC and audit logging

---

## 🎯 Benefits

### Before Setup ❌
- Cursor doesn't know project structure
- Cursor doesn't know development rules
- Cursor may suggest hardcoded solutions
- Cursor may skip RBAC/audit logging

### After Setup ✅
- Cursor understands modular architecture
- Cursor enforces zero hardcoding policy
- Cursor always includes RBAC checks
- Cursor always includes audit logging
- Cursor follows project patterns
- Cursor suggests correct imports
- Cursor maintains consistency

---

## 🔄 Maintenance

### Updating Rules

1. **Edit `.cursorrules`** for main rules
2. **Edit `.cursor/rules/*.mdc`** for specific contexts
3. **Restart Cursor** to reload rules

### Adding New Rules

1. Create new `.mdc` file in `.cursor/rules/`
2. Add `description` and `globs` in frontmatter
3. Document the rules clearly
4. Update `.cursor/README.md` if needed

---

## 📝 Summary

**What You Have:**
- ✅ Comprehensive rules file (`.cursorrules`)
- ✅ Context-aware rules (`.cursor/rules/*.mdc`)
- ✅ Complete project knowledge
- ✅ Development patterns and templates
- ✅ Quick reference guides

**What This Means:**
- 🎯 Cursor understands SuperSpace architecture
- 🎯 Cursor enforces project rules automatically
- 🎯 Cursor suggests correct patterns
- 🎯 Cursor maintains consistency
- 🎯 Faster development with fewer errors

---

**Last Updated:** 2025-01-20
**Version:** 1.0.0
**Status:** ✅ Ready to Use



