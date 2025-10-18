# Feature Package System

> **Unified system for managing features in SuperSpace**

This document provides an overview of the feature package system implemented in this project. For detailed development instructions, see [docs/feature-playbook.md](./docs/feature-playbook.md).

## Overview

The feature package system provides a **schema-driven, auto-generated approach** to managing features in SuperSpace. It eliminates manual synchronization between UI, backend, and menu systems by using a single source of truth.

## Key Benefits

✅ **Single Source of Truth** - All feature metadata in `features.config.ts`
✅ **Auto-Generated** - Manifest and catalog files generated automatically
✅ **Type-Safe** - Zod schemas ensure validation at build time
✅ **CLI Generator** - Scaffold new features in seconds
✅ **RBAC Compliant** - Built-in permission checks
✅ **CI/CD Ready** - Automated validation and sync checks
✅ **Self-Contained** - Each feature is a complete package

## Quick Start

### 1. Create a New Feature

```bash
# Scaffold a new optional feature
pnpm run scaffold:feature reports --type optional --category analytics

# This generates:
# ✓ frontend/features/reports/
# ✓ convex/features/reports/
# ✓ tests/features/reports/
```

### 2. Sync Features

```bash
# Sync features.config.ts to manifest
pnpm run sync:features

# This updates:
# ✓ convex/menu/store/menu_manifest_data.ts
# ✓ convex/menu/store/optional_features_catalog.ts
```

### 3. Validate

```bash
# Validate features configuration
pnpm run validate:features

# Validate all schemas
pnpm run validate:all
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     features.config.ts                      │
│                  (Single Source of Truth)                   │
└────────────────────────┬────────────────────────────────────┘
                         │
              ┌──────────┴──────────┐
              │                     │
         [sync:features]      [scaffold:feature]
              │                     │
    ┌─────────┴─────────┐     ┌────┴────────────────┐
    │                   │     │                     │
    ▼                   ▼     ▼                     ▼
┌────────────┐   ┌──────────────┐   ┌────────┐   ┌────────┐
│ Manifest   │   │   Catalog    │   │Frontend│   │Convex  │
│   (Auto)   │   │    (Auto)    │   │Feature │   │Feature │
└────────────┘   └──────────────┘   └────────┘   └────────┘
```

## File Structure

```
.
├── features.config.ts                        # Single source of truth
│
├── frontend/features/{slug}/                 # UI layer
│   ├── index.ts
│   ├── views/{Name}Page.tsx
│   ├── components/
│   ├── hooks/
│   └── types/
│
├── convex/features/{slug}/                   # Backend layer
│   ├── index.ts
│   ├── queries.ts
│   ├── mutations.ts
│   └── actions.ts
│
├── tests/features/{slug}/                    # Test layer
│   ├── {slug}.test.ts
│   └── {slug}.integration.test.ts
│
├── convex/menu/store/
│   ├── menu_manifest_data.ts                # AUTO-GENERATED
│   └── optional_features_catalog.ts         # AUTO-GENERATED
│
├── lib/features/
│   ├── registerFeature.ts                   # Registration helper
│   └── examples/
│       └── reports-feature-example.ts       # Reference implementation
│
├── scripts/
│   ├── scaffold-feature.ts                  # CLI generator
│   ├── sync-features.ts                     # Sync script
│   └── validate-features.ts                 # Validation script
│
└── docs/
    └── feature-playbook.md                  # Complete guide
```

## Feature Types

### Default Features
- Included in every workspace by default
- Cannot be uninstalled
- Examples: Overview, Settings, Members

### Optional Features
- Available in Menu Store catalog
- Can be installed/uninstalled by users
- Examples: Reports, Calendar, Tasks

### Experimental Features
- Under development
- Not shown in production
- For testing new concepts

## CLI Commands

### Development

```bash
# Scaffold a new feature
pnpm run scaffold:feature <slug> [options]

# Options:
#   --type         default|optional|experimental
#   --category     communication|productivity|etc.
#   --icon         Lucide icon name
#   --permission   Required permission
#   --no-ui        Skip UI generation
#   --no-convex    Skip Convex generation
#   --no-tests     Skip test generation
```

### Validation

```bash
# Validate features config
pnpm run validate:features

# Validate all schemas
pnpm run validate:all

# Check if sync is needed
pnpm run check:features
```

### Sync

```bash
# Sync features to manifest
pnpm run sync:features

# This updates:
# - convex/menu/store/menu_manifest_data.ts
# - convex/menu/store/optional_features_catalog.ts
```

### Testing

```bash
# Run all tests
pnpm test

# Run feature-specific tests
pnpm test tests/features/{slug}

# Watch mode
pnpm test --watch
```

### Pre-commit

```bash
# Run all checks (lint, validate, test)
pnpm run precommit
```

## Example: Creating a Reports Feature

```bash
# 1. Scaffold the feature
pnpm run scaffold:feature reports --type optional --category analytics --icon BarChart

# 2. Implement UI (frontend/features/reports/)
# - Edit views/ReportsPage.tsx
# - Add components
# - Create hooks

# 3. Implement backend (convex/features/reports/)
# - Add queries in queries.ts
# - Add mutations in mutations.ts
# - Ensure RBAC checks

# 4. Write tests (tests/features/reports/)
# - Unit tests
# - Integration tests
# - RBAC tests

# 5. Sync and validate
pnpm run sync:features
pnpm run validate:features

# 6. Run tests
pnpm test tests/features/reports

# 7. Commit
git add .
git commit -m "feat: add reports feature"
```

## Registration Pattern

For advanced use cases, you can manually register features:

```typescript
import { registerFeature } from '@/lib/features/registerFeature'
import { getFeatureBySlug } from '@/features.config'

const metadata = getFeatureBySlug('reports')

registerFeature({
  slug: 'reports',
  metadata: metadata!,
  convexHandlers: {
    queries: /* ... */,
    mutations: /* ... */,
  },
})
```

## CI/CD Integration

The system includes GitHub Actions workflows for:

- ✅ Feature validation on push/PR
- ✅ Manifest sync verification
- ✅ Test execution
- ✅ Lint checks

See [.github/workflows/feature-validation.yml](./.github/workflows/feature-validation.yml)

## Current Features

### Default Features (11)
- Overview - Dashboard overview
- WhatsApp - Communication hub (with 8 sub-features)
- Members - Workspace member management
- Friends - Social connections
- Pages - Notion-like pages
- Databases - Database views
- Canvas - Visual collaboration
- Menu Store - Menu management
- Invitations - Invitation system
- Profile - User settings
- Settings - Workspace configuration

### Optional Features (6)
- Chat - Alternative chat interface
- Documents - Collaborative documents
- Calendar - Team calendar
- Reports - Analytics dashboard
- Tasks - Task management
- Wiki - Knowledge base

## Best Practices

1. **Always sync after config changes**
   ```bash
   pnpm run sync:features
   ```

2. **Validate before committing**
   ```bash
   pnpm run validate:features
   ```

3. **Use RBAC checks in Convex**
   ```typescript
   await requirePermission(ctx, workspaceId, PERMS.YOUR_PERM)
   ```

4. **Add audit logs for sensitive operations**
   ```typescript
   await logAudit(ctx, { action: "feature:action", ... })
   ```

5. **Write comprehensive tests**
   - Unit tests for logic
   - Integration tests for Convex
   - RBAC tests for permissions

## Troubleshooting

### Manifest out of sync
```bash
pnpm run sync:features
```

### Duplicate slug error
```bash
pnpm run validate:features
# Fix duplicate in features.config.ts
```

### Feature not in Menu Store
Ensure `featureType: "optional"` in `features.config.ts`

### Permission denied
Add RBAC check in Convex handler:
```typescript
await requirePermission(ctx, workspaceId, PERMS.YOUR_PERM)
```

## Documentation

- **[Feature Playbook](./docs/feature-playbook.md)** - Complete development guide
- **[Project Guardrails](./.claude/CLAUDE.md)** - RBAC and security guidelines
- **[Convex Docs](https://docs.convex.dev)** - Convex reference

## Support

For issues or questions:
1. Check [docs/feature-playbook.md](./docs/feature-playbook.md)
2. Review examples in `lib/features/examples/`
3. Ask in team chat
4. Create a GitHub issue

---

**Status:** ✅ Production Ready
**Version:** 1.0.0
**Last Updated:** 2025-01-17
