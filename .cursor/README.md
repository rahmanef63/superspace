# Cursor AI Rules & Knowledge Base

This directory contains rules and base knowledge for AI agents working on the SuperSpace project.

## Structure

```
.cursor/
├── README.md                      # This file
└── rules/
    ├── base_knowledge.mdc         # Core project knowledge
    ├── feature_development.mdc    # Feature development rules
    ├── convex_backend.mdc         # Convex backend rules
    ├── frontend_development.mdc   # Frontend development rules
    └── convex_rules.mdc           # Convex-specific guidelines (existing)
```

## Files Overview

### `.cursorrules` (Root)
Main rules file that Cursor automatically loads. Contains:
- Critical rules (zero hardcoding, RBAC, audit logging)
- Architecture patterns
- Tech stack details
- Common commands
- Quick reference

### `rules/base_knowledge.mdc`
Core project knowledge:
- Project overview and concepts
- Project structure
- Essential files reference
- Common patterns
- Key principles

### `rules/feature_development.mdc`
Feature development rules:
- Zero hardcoding policy
- Single source of truth
- Auto-discovery system
- Feature structure
- Three-tier sharing model

### `rules/convex_backend.mdc`
Convex backend rules:
- Mutation pattern (6-step)
- Query pattern
- RBAC guidelines
- Audit logging
- Schema guidelines
- Error handling

### `rules/frontend_development.mdc`
Frontend development rules:
- Component structure
- Import patterns
- Convex hooks usage
- Type safety
- Error handling
- Accessibility
- Styling guidelines

### `rules/convex_rules.mdc`
Convex-specific guidelines (existing):
- Function syntax
- Validators
- Schema design
- Query guidelines
- Action guidelines

## How Cursor Uses These Files

1. **`.cursorrules`** - Automatically loaded on startup
2. **`rules/*.mdc`** - Loaded based on file context (via globs)
3. **Context-aware** - Rules apply based on files being edited

## Usage

When working on:
- **Features** → `feature_development.mdc` rules apply
- **Convex backend** → `convex_backend.mdc` + `convex_rules.mdc` apply
- **Frontend** → `frontend_development.mdc` rules apply
- **Any file** → `base_knowledge.mdc` provides context

## Key Rules Summary

1. **Zero Hardcoding** - Never hardcode feature references
2. **Single Source of Truth** - One config file per feature
3. **RBAC Mandatory** - Every operation checks permissions
4. **Audit Everything** - All mutations are logged
5. **Type Safety** - TypeScript + Zod validation everywhere

## Related Documentation

- `docs/00_BASE_KNOWLEDGE.md` - Essential developer knowledge
- `docs/2-rules/FEATURE_RULES.md` - Feature development rules
- `docs/2-rules/MUTATION_TEMPLATE_GUIDE.md` - Mutation patterns
- `PROJECT_STATUS.md` - Current project status

---

**Last Updated:** 2025-01-20
**Version:** 1.0.0

