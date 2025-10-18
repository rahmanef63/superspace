# Feature Development Playbook

> **Comprehensive guide for creating, managing, and deploying features in SuperSpace**

This playbook provides step-by-step instructions for working with the feature package pattern system. Follow these guidelines to maintain consistency and efficiency across the codebase.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Feature Package Pattern](#feature-package-pattern)
3. [Creating a New Feature](#creating-a-new-feature)
4. [Feature Types](#feature-types)
5. [Development Workflow](#development-workflow)
6. [Testing Guidelines](#testing-guidelines)
7. [CI/CD Pipeline](#cicd-pipeline)
8. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Create a New Feature (5 minutes)

```bash
# 1. Scaffold a new feature
pnpm run scaffold:feature reports --type optional --category analytics

# 2. Review generated files
# frontend/features/reports/
# convex/features/reports/
# tests/features/reports/

# 3. Sync with manifest
pnpm run sync:features

# 4. Validate
pnpm run validate:features

# 5. Run tests
pnpm test tests/features/reports
```

---

## Feature Package Pattern

### Architecture Overview

```
Feature Package
├── frontend/features/{slug}/         # UI Layer
│   ├── index.ts                      # Public API
│   ├── views/{Name}Page.tsx          # Main page component
│   ├── components/                   # Feature-specific components
│   ├── hooks/use{Name}.ts            # React hooks
│   ├── types/index.ts                # TypeScript types
│   └── lib/                          # Utilities
│
├── convex/features/{slug}/           # Backend Layer
│   ├── index.ts                      # Public API
│   ├── queries.ts                    # Convex queries
│   ├── mutations.ts                  # Convex mutations
│   └── actions.ts                    # Convex actions (optional)
│
├── tests/features/{slug}/            # Test Layer
│   ├── {slug}.test.ts                # Unit tests
│   └── {slug}.integration.test.ts    # Integration tests
│
└── features.config.ts                # Single source of truth
```

### Key Principles

1. **Single Source of Truth**: All feature metadata lives in `features.config.ts`
2. **Schema-Driven**: Zod schemas ensure type safety and validation
3. **Auto-Generated**: Manifest and catalog files are generated automatically
4. **Self-Contained**: Each feature is a complete, reusable package
5. **RBAC Compliant**: All features respect permission boundaries

---

## Creating a New Feature

### Checklist: Default Feature

> **Use for features included by default in every workspace**

- [ ] **1. Scaffold the feature**
  ```bash
  pnpm run scaffold:feature {slug} --type default --category {category}
  ```

- [ ] **2. Implement UI components**
  - Update `frontend/features/{slug}/views/{Name}Page.tsx`
  - Add feature-specific components in `components/`
  - Create necessary hooks in `hooks/`

- [ ] **3. Implement Convex handlers**
  - Add queries in `convex/features/{slug}/queries.ts`
  - Add mutations in `convex/features/{slug}/mutations.ts`
  - Ensure RBAC checks using `requireActiveMembership` or `requirePermission`

- [ ] **4. Add audit logging**
  ```typescript
  await logAudit(ctx, {
    action: "{slug}:create",
    workspaceId: args.workspaceId,
    targetId: itemId,
  })
  ```

- [ ] **5. Write tests**
  - Unit tests in `tests/features/{slug}/{slug}.test.ts`
  - Integration tests in `tests/features/{slug}/{slug}.integration.test.ts`
  - Ensure tests cover RBAC scenarios

- [ ] **6. Update features.config.ts**
  - Verify metadata is correct
  - Set `featureType: "default"`
  - Set appropriate `order` value

- [ ] **7. Sync and validate**
  ```bash
  pnpm run sync:features
  pnpm run validate:features
  pnpm run validate:all
  ```

- [ ] **8. Run tests**
  ```bash
  pnpm test
  ```

- [ ] **9. Create PR**
  - Title: `feat: add {name} feature`
  - Include screenshots/demo
  - Reference any related issues

### Checklist: Optional Feature

> **Use for features available in the Menu Store catalog**

- [ ] **1. Scaffold the feature**
  ```bash
  pnpm run scaffold:feature {slug} --type optional --category {category}
  ```

- [ ] **2-8. Follow default feature steps above**

- [ ] **9. Verify catalog entry**
  - Check `convex/menu/store/optional_features_catalog.ts`
  - Ensure description is clear and compelling
  - Verify icon is appropriate

- [ ] **10. Test installation flow**
  - Navigate to Menu Store in app
  - Verify feature appears in catalog
  - Test installation via `installFeatureMenus`
  - Verify feature works after installation

- [ ] **11. Create PR**
  - Title: `feat: add optional {name} feature`
  - Include installation instructions
  - Add screenshots of Menu Store entry

---

## Feature Types

### Default Features

**Characteristics:**
- Included in every new workspace by default
- Cannot be uninstalled
- Core functionality
- Examples: Overview, Settings, Members

**Configuration:**
```typescript
{
  slug: "overview",
  name: "Overview",
  featureType: "default",
  // ...
}
```

### Optional Features

**Characteristics:**
- Available in Menu Store catalog
- Can be installed/uninstalled
- Extended functionality
- Examples: Reports, Calendar, Tasks

**Configuration:**
```typescript
{
  slug: "reports",
  name: "Reports",
  featureType: "optional",
  // ...
}
```

### Experimental Features

**Characteristics:**
- Under development
- May have breaking changes
- Not shown in production catalog
- For testing new concepts

**Configuration:**
```typescript
{
  slug: "ai-canvas",
  name: "AI Canvas",
  featureType: "experimental",
  // ...
}
```

---

## Development Workflow

### Local Development

```bash
# 1. Start dev server
pnpm dev

# 2. Start Convex dev
npx convex dev

# 3. Make changes to your feature
# Edit files in frontend/features/{slug}/
# Edit files in convex/features/{slug}/

# 4. Tests run automatically (if configured)
# Or run manually:
pnpm test --watch

# 5. Sync features when changing config
pnpm run sync:features
```

### Before Committing

```bash
# Run pre-commit checks
pnpm run precommit

# This runs:
# - pnpm run lint
# - pnpm run validate:all
# - pnpm test
```

### Git Workflow

```bash
# 1. Create feature branch
git checkout -b feat/add-reports-feature

# 2. Make changes and commit
git add .
git commit -m "feat: add reports feature with analytics dashboard"

# 3. Push and create PR
git push origin feat/add-reports-feature
```

---

## Testing Guidelines

### Unit Tests

**Location:** `tests/features/{slug}/{slug}.test.ts`

```typescript
import { describe, it, expect } from "vitest"
import { useReports } from "@/frontend/features/reports"

describe("Reports Feature", () => {
  it("should initialize with default state", () => {
    // Test logic
  })

  it("should handle filters correctly", () => {
    // Test logic
  })
})
```

### Integration Tests

**Location:** `tests/features/{slug}/{slug}.integration.test.ts`

```typescript
import { describe, it, expect, beforeEach } from "vitest"
import { convexTest } from "convex-test"
import schema from "@/convex/schema"
import { api } from "@/convex/_generated/api"

describe("Reports Integration", () => {
  let t: any

  beforeEach(async () => {
    t = convexTest(schema)
  })

  it("should create a report", async () => {
    const reportId = await t.mutation(api.features.reports.mutations.create, {
      workspaceId: "...",
      name: "Test Report",
    })

    expect(reportId).toBeDefined()
  })

  it("should enforce RBAC", async () => {
    // Test permission boundaries
  })
})
```

### Test Coverage Requirements

- ✅ Unit tests: > 80% coverage
- ✅ Integration tests: All CRUD operations
- ✅ RBAC tests: All permission scenarios
- ✅ Edge cases: Error handling, validation

---

## CI/CD Pipeline

### Automated Checks

On every push/PR to `main` or `develop`:

1. **Feature Validation** (`.github/workflows/feature-validation.yml`)
   - Validate `features.config.ts` schema
   - Check for duplicate slugs
   - Verify manifest sync
   - Run feature tests

2. **Lint Check**
   - ESLint for code quality
   - TypeScript type checking

3. **Tests**
   - All unit tests
   - All integration tests
   - Coverage report

### Manual Validation Commands

```bash
# Validate features config
pnpm run validate:features

# Sync features (dry run)
pnpm run sync:features

# Check if sync is needed
pnpm run check:features

# Validate all schemas
pnpm run validate:all

# Run all tests
pnpm test
```

---

## Troubleshooting

### Common Issues

#### 1. "Feature slug already exists"

**Cause:** Duplicate slug in `features.config.ts`

**Solution:**
```bash
pnpm run validate:features
# Fix duplicate slug
pnpm run sync:features
```

#### 2. "Manifest out of sync"

**Cause:** `features.config.ts` changed but manifest not updated

**Solution:**
```bash
pnpm run sync:features
git add convex/menu/store/
git commit -m "chore: sync feature manifest"
```

#### 3. "Permission denied when accessing feature"

**Cause:** Missing RBAC check in Convex handler

**Solution:**
```typescript
// Add to your mutation/query
await requirePermission(ctx, args.workspaceId, PERMS.YOUR_PERMISSION)
```

#### 4. "Feature not showing in Menu Store"

**Cause:** Feature type is not "optional" or catalog not synced

**Solution:**
```typescript
// In features.config.ts
{
  featureType: "optional", // Must be optional
  // ...
}
```
```bash
pnpm run sync:features
```

#### 5. "Tests failing after scaffold"

**Cause:** Template tests need implementation

**Solution:**
```bash
# Update test files with actual test logic
# Run tests to verify
pnpm test tests/features/{slug}
```

---

## Best Practices

### 1. Naming Conventions

- **Slugs:** lowercase, kebab-case (e.g., `task-management`)
- **Components:** PascalCase with "Page" suffix (e.g., `TaskManagementPage`)
- **Hooks:** camelCase with "use" prefix (e.g., `useTaskManagement`)
- **Types:** PascalCase (e.g., `TaskManagementItem`)

### 2. File Organization

```
feature/
├── index.ts              # Public API only
├── views/                # Page components
├── components/           # Feature-specific components
│   ├── Feature.tsx
│   ├── FeatureList.tsx
│   └── FeatureItem.tsx
├── hooks/                # React hooks
│   ├── useFeature.ts
│   └── useFeatureActions.ts
├── types/                # TypeScript types
│   └── index.ts
└── lib/                  # Utilities
    └── helpers.ts
```

### 3. RBAC Guidelines

- Always check permissions in Convex handlers
- Use `requireActiveMembership` for basic access
- Use `requirePermission` for admin actions
- Add audit logs for sensitive operations

### 4. Version Management

- Use semantic versioning (e.g., `1.2.3`)
- Increment:
  - **Major:** Breaking changes
  - **Minor:** New features
  - **Patch:** Bug fixes

### 5. Documentation

- Add JSDoc comments to all public APIs
- Document complex logic
- Include usage examples
- Update playbook for new patterns

---

## Quick Reference

### Commands Cheat Sheet

```bash
# Scaffolding
pnpm run scaffold:feature {slug} [options]

# Validation
pnpm run validate:features
pnpm run validate:all

# Sync
pnpm run sync:features

# Testing
pnpm test
pnpm test tests/features/{slug}

# Pre-commit
pnpm run precommit
```

### File Locations

- **Feature config:** `features.config.ts`
- **Manifest:** `convex/menu/store/menu_manifest_data.ts`
- **Catalog:** `convex/menu/store/optional_features_catalog.ts`
- **Frontend:** `frontend/features/{slug}/`
- **Convex:** `convex/features/{slug}/`
- **Tests:** `tests/features/{slug}/`

### Helper URLs

- [SuperSpace RBAC Docs](./rbac-guide.md)
- [Convex Documentation](https://docs.convex.dev)
- [Testing Guide](./testing-guide.md)

---

## Support

For questions or issues:
1. Check this playbook
2. Review [CLAUDE.md](./.claude/CLAUDE.md) for project guardrails
3. Ask in team chat
4. Create a GitHub issue

---

**Last Updated:** 2025-01-17
**Version:** 1.0.0
