# Developer Guide

> **Comprehensive guide for developers building features in SuperSpace**
> **Last Updated:** 2025-01-19

---

## Table of Contents

1. [Quick Start (5 Minutes)](#quick-start-5-minutes)
2. [Checklist: Default Feature](#checklist-default-feature)
3. [Checklist: Optional Feature](#checklist-optional-feature)
4. [Best Practices](#best-practices)
5. [Testing Guidelines](#testing-guidelines)
6. [CI/CD Workflow](#cicd-workflow)
7. [Pre-Commit Checklist](#pre-commit-checklist)

---

## Quick Start (5 Minutes)

Create a fully functional feature in under 5 minutes:

```bash
# 1. Scaffold the feature (creates all boilerplate)
pnpm run scaffold:feature analytics --type optional --category analytics

# 2. Sync to manifests (updates auto-generated files)
pnpm run sync:all

# 3. Validate everything
pnpm run validate:all

# 4. Run tests
pnpm test

# 5. Start development
pnpm dev
npx convex dev --configure=existing --team abdurrahman-fakhrul --project superspace  # In separate terminal
```

**What gets created:**
```
✅ frontend/features/analytics/          # UI components
✅ convex/features/analytics/            # Backend logic
✅ tests/features/analytics/             # Test files
✅ Entry in features.config.ts           # Metadata
✅ Auto-updated manifest files           # Menu data
```

---

## Checklist: Default Feature

**Use this for features that should be included in every new workspace.**

### Phase 1: Scaffolding

- [ ] **Run scaffold command**
  ```bash
  pnpm run scaffold:feature {slug} --type default --category {category}
  # Categories: communication, productivity, collaboration, administration, social, creativity, analytics
  ```

- [ ] **Verify generated structure**
  ```
  frontend/features/{slug}/
    ├── index.ts
    ├── views/{Name}Page.tsx
    ├── components/
    ├── hooks/
    └── types/

  convex/features/{slug}/
    ├── index.ts
    ├── queries.ts
    ├── mutations.ts
    └── actions.ts (optional)

  tests/features/{slug}/
    ├── {slug}.test.ts
    └── {slug}.integration.test.ts
  ```

### Phase 2: Implementation

- [ ] **Update features.config.ts**
  ```typescript
  {
    slug: "analytics",
    name: "Analytics",
    description: "Real-time analytics dashboard",
    featureType: "default",
    category: "analytics",
    icon: "BarChart",          // Lucide icon name
    path: "/dashboard/analytics",
    component: "AnalyticsPage",
    order: 15,                 // Position in menu
    type: "route",             // route | folder | divider
    version: "1.0.0",
    hasUI: true,
    hasConvex: true,
    hasTests: true,
    requiresPermission: "VIEW_ANALYTICS", // Optional
  }
  ```

- [ ] **Implement UI (frontend/features/{slug}/)**
  - Update `views/{Name}Page.tsx` with main UI
  - Create reusable components in `components/`
  - Add React hooks in `hooks/use{Name}.ts`
  - Define TypeScript types in `types/index.ts`
  - Export public API in `index.ts`

- [ ] **Implement Backend (convex/features/{slug}/)**
  - Add queries in `queries.ts`
  - Add mutations in `mutations.ts`
  - Add actions in `actions.ts` (if needed)
  - Export public API in `index.ts`

### Phase 3: RBAC & Security

- [ ] **Add permission check to ALL queries**
  ```typescript
  // convex/features/analytics/queries.ts
  import { requireActiveMembership } from "../../auth/helpers"

  export const getAnalytics = query({
    args: { workspaceId: v.id("workspaces") },
    handler: async (ctx, args) => {
      // ✅ REQUIRED: Check membership
      const { membership, role } = await requireActiveMembership(
        ctx,
        args.workspaceId
      )

      // Your logic here
      const data = await ctx.db.query("analytics")
        .withIndex("by_workspace", q => q.eq("workspaceId", args.workspaceId))
        .collect()

      return data
    }
  })
  ```

- [ ] **Add permission check to ALL mutations**
  ```typescript
  // convex/features/analytics/mutations.ts
  import { requirePermission } from "../../auth/helpers"
  import { PERMS } from "../../workspace/permissions"

  export const createReport = mutation({
    args: {
      workspaceId: v.id("workspaces"),
      name: v.string(),
      data: v.any(),
    },
    handler: async (ctx, args) => {
      // ✅ REQUIRED: Check specific permission
      const { membership } = await requirePermission(
        ctx,
        args.workspaceId,
        PERMS.DOCUMENTS_CREATE  // Or create custom permission
      )

      // Your logic here
      const reportId = await ctx.db.insert("reports", {
        workspaceId: args.workspaceId,
        name: args.name,
        data: args.data,
        createdBy: membership.userId,
      })

      return reportId
    }
  })
  ```

- [ ] **Add audit logging for mutations**
  ```typescript
  // After successful mutation
  await ctx.runMutation(internal.audit.logEvent, {
    actorUserId: membership.userId,
    workspaceId: args.workspaceId,
    entityType: "report",
    entityId: String(reportId),
    action: "create",
    diff: { name: args.name },
    createdAt: Date.now(),
  })
  ```

### Phase 4: Testing

- [ ] **Write unit tests**
  ```typescript
  // tests/features/analytics/analytics.test.ts
  import { describe, it, expect } from "vitest"

  describe("Analytics Feature", () => {
    it("should initialize correctly", () => {
      // Test pure functions, utilities, etc.
    })
  })
  ```

- [ ] **Write integration tests**
  ```typescript
  // tests/features/analytics/analytics.integration.test.ts
  import { describe, it, expect, beforeEach } from "vitest"
  import { convexTest } from "convex-test"
  import schema from "@/convex/schema"
  import { api } from "@/convex/_generated/api"

  describe("Analytics Integration", () => {
    let t: any

    beforeEach(async () => {
      t = convexTest(schema)
      // Setup test data
    })

    it("should enforce RBAC", async () => {
      // Test permission checks
    })

    it("should create analytics report", async () => {
      const reportId = await t.mutation(
        api.features.analytics.mutations.createReport,
        { /* args */ }
      )
      expect(reportId).toBeDefined()
    })
  })
  ```

- [ ] **Run tests and verify coverage**
  ```bash
  pnpm test tests/features/analytics
  pnpm test:coverage
  ```

### Phase 5: Sync & Validate

- [ ] **Sync features to manifests**
  ```bash
  pnpm run sync:all
  ```

- [ ] **Validate all schemas**
  ```bash
  pnpm run validate:all
  ```

- [ ] **Run full test suite**
  ```bash
  pnpm test
  ```

- [ ] **Type check**
  ```bash
  pnpm run typecheck
  ```

### Phase 6: Documentation & PR

- [ ] **Add JSDoc comments to public APIs**
  ```typescript
  /**
   * Get analytics data for a workspace
   * @param workspaceId - The workspace to get analytics for
   * @returns Analytics data with metrics
   */
  export const getAnalytics = query({...})
  ```

- [ ] **Update feature documentation (if complex)**
  - Add usage examples
  - Document special configurations
  - Add troubleshooting tips

- [ ] **Create Pull Request**
  - Title: `feat: add analytics feature`
  - Description: Feature overview, screenshots
  - Link related issues
  - Include test results

---

## Checklist: Optional Feature

**Use this for features available in the Menu Store catalog.**

Follow all steps from "Default Feature" above, plus:

### Additional Steps

- [ ] **Set featureType to "optional"**
  ```typescript
  {
    slug: "tasks",
    featureType: "optional",  // ✅ Must be optional
    // ... rest of config
  }
  ```

- [ ] **Verify catalog generation**
  ```bash
  # After sync:all, check this file exists
  cat convex/menu/store/optional_features_catalog.ts

  # Should contain your feature:
  export const OPTIONAL_FEATURES_CATALOG = [
    {
      slug: "tasks",
      name: "Tasks",
      description: "Task management and tracking",
      // ...
    }
  ]
  ```

- [ ] **Test installation flow**
  1. Start app: `pnpm dev`
  2. Navigate to Menu Store (`/dashboard/menus`)
  3. Verify feature appears in catalog
  4. Click "Install" button
  5. Verify feature appears in sidebar
  6. Test feature functionality

- [ ] **Test uninstallation**
  1. Click "Uninstall" in Menu Store
  2. Verify feature removed from sidebar
  3. Verify data persists (not deleted)

---

## Best Practices

### 1. RBAC Pattern

**Always check permissions in Convex handlers:**

```typescript
// ✅ GOOD: Use requireActiveMembership for basic access
export const listItems = query({
  handler: async (ctx, args) => {
    const { membership } = await requireActiveMembership(ctx, args.workspaceId)
    // User has access to workspace
  }
})

// ✅ GOOD: Use requirePermission for specific actions
export const deleteItem = mutation({
  handler: async (ctx, args) => {
    const { membership } = await requirePermission(
      ctx,
      args.workspaceId,
      PERMS.DOCUMENTS_DELETE
    )
    // User has specific permission
  }
})

// ❌ BAD: No permission check
export const dangerousQuery = query({
  handler: async (ctx, args) => {
    // Anyone can call this!
    return await ctx.db.query("sensitiveData").collect()
  }
})
```

### 2. Audit Logging Pattern

**Log ALL mutations that change data:**

```typescript
export const updateDocument = mutation({
  handler: async (ctx, args) => {
    const { membership } = await requirePermission(...)

    // Get old data for diff
    const oldDoc = await ctx.db.get(args.documentId)

    // Update
    await ctx.db.patch(args.documentId, { title: args.newTitle })

    // ✅ Log the change
    await ctx.runMutation(internal.audit.logEvent, {
      actorUserId: membership.userId,
      workspaceId: args.workspaceId,
      entityType: "document",
      entityId: String(args.documentId),
      action: "update",
      diff: {
        old: { title: oldDoc.title },
        new: { title: args.newTitle }
      },
      createdAt: Date.now(),
    })

    return args.documentId
  }
})
```

### 3. Dynamic Import Pattern

**Improve performance with code splitting:**

```typescript
// ✅ GOOD: Dynamic import for large components
const AnalyticsPage = lazy(() =>
  import("@/frontend/features/analytics").then(m => ({
    default: m.AnalyticsPage
  }))
)

// ✅ GOOD: Show loading state
<Suspense fallback={<LoadingSpinner />}>
  <AnalyticsPage />
</Suspense>

// ❌ BAD: Static import for large feature
import { AnalyticsPage } from "@/frontend/features/analytics"
```

### 4. Error Handling

```typescript
// ✅ GOOD: Specific error messages
export const createReport = mutation({
  handler: async (ctx, args) => {
    const { membership } = await requirePermission(...)

    // Validate input
    if (!args.name || args.name.trim().length === 0) {
      throw new Error("Report name is required")
    }

    // Check constraints
    const existing = await ctx.db.query("reports")
      .withIndex("by_workspace_name", q =>
        q.eq("workspaceId", args.workspaceId).eq("name", args.name)
      )
      .first()

    if (existing) {
      throw new Error(`Report "${args.name}" already exists`)
    }

    // Create
    return await ctx.db.insert("reports", {...})
  }
})
```

### 5. Naming Conventions

```typescript
// Feature slugs: lowercase-kebab-case
slug: "task-management"

// Components: PascalCase + Page suffix
TaskManagementPage.tsx

// Hooks: camelCase + use prefix
useTaskManagement.ts

// Types: PascalCase
export type TaskItem = {...}

// Files: kebab-case
task-list-item.tsx

// Convex functions: camelCase
export const getTaskList = query({...})
```

---

## Testing Guidelines

### Unit Tests

**Location:** `tests/features/{slug}/{slug}.test.ts`

**Test pure functions, utilities, helpers:**

```typescript
import { describe, it, expect } from "vitest"
import { formatTaskDate, calculateProgress } from "@/frontend/features/tasks"

describe("Task Utilities", () => {
  it("should format dates correctly", () => {
    const date = new Date("2025-01-19")
    expect(formatTaskDate(date)).toBe("Jan 19, 2025")
  })

  it("should calculate progress percentage", () => {
    expect(calculateProgress(3, 10)).toBe(30)
    expect(calculateProgress(0, 10)).toBe(0)
    expect(calculateProgress(10, 10)).toBe(100)
  })
})
```

### Integration Tests

**Location:** `tests/features/{slug}/{slug}.integration.test.ts`

**Test Convex queries/mutations with database:**

```typescript
import { describe, it, expect, beforeEach } from "vitest"
import { convexTest } from "convex-test"
import schema from "@/convex/schema"
import { api } from "@/convex/_generated/api"

  describe("Tasks Integration", () => {
    let t: any
    let workspaceId: any
  let userId: any

  beforeEach(async () => {
    t = convexTest(schema)

    // Setup test data
    userId = await t.run(async (ctx) => {
      return await ctx.db.insert("users", {
        name: "Test User",
        email: "test@example.com",
      })
    })

    workspaceId = await t.mutation(api.workspace.workspaces.createWorkspace, {
      name: "Test Workspace",
      slug: "test",
      type: "personal",
      isPublic: false,
    })
  })

  it("should create a task", async () => {
    const taskId = await t.mutation(api.features.tasks.mutations.createTask, {
      workspaceId,
      name: "Test Task",
    })

    expect(taskId).toBeDefined()

    const task = await t.run(async (ctx) => ctx.db.get(taskId))
    expect(task).toMatchObject({
      workspaceId,
      name: "Test Task",
    })
  })

  it("should enforce RBAC on task creation", async () => {
    // Test without membership should fail
    await expect(
      t.mutation(api.features.tasks.mutations.createTask, {
        workspaceId: "invalid_workspace_id",
        name: "Test",
      })
    ).rejects.toThrow()
  })
  })
  ```

### Dashboard Navigation Regression

- `tests/features/navigation-registry.test.ts` guards the required dashboard slugs (Reports, Support, Projects, CRM, Notifications, Workflows, etc.) so that future refactors cannot accidentally hide them from end users.
- Update `frontend/views/static/workspaces/constants/navigation.ts` and rerun `pnpm test` whenever you add or rename a dashboard view slug to keep the manifest, navigation, and toast UX in sync.
- The catch-all route (`app/dashboard/[[...slug]]/page.tsx`) now emits a developer-facing `[frog]` log and a workspace toast if a slug is missing. Treat failing tests or unexpected toasts as blockers before shipping.

### Menu Version Tracking Workflow

- `frontend/shared/layout/menus/components/DragDropMenuTree.tsx` now queries `api.menu.store.menuItems.getMenuUpdates` so every menu item can surface a version badge and an "Update Available" pill when a newer catalog entry exists.

### Layout System (Secondary Sidebar)

The app uses a modular **Secondary Sidebar Layout System** located in `frontend/shared/layout/secondary-sidebar/`:

**Components:**
- `SecondarySidebarLayout` - Main container component
- `SecondarySidebarHeader` - Header with title, actions, breadcrumbs, toolbar
- `SecondarySidebarTools` - Toolbar with search, sort, filter, view toggle
- `SecondarySidebar` - Sidebar navigation with sections and items
- `MenuPreview` - Preview panel for menu items (in `frontend/shared/layout/menus/`)

**Usage:**
```typescript
import {
  SecondarySidebarLayout,
  SecondarySidebarHeader,
  SecondarySidebarTools,
} from "@/frontend/shared/layout/secondary-sidebar";

<SecondarySidebarLayout
  headerProps={{
    title: "My Feature",
    description: "Feature description",
    primaryAction: {
      label: "New Item",
      icon: Plus,
      onClick: () => setShowForm(true),
    },
    toolbar: (
      <SecondarySidebarTools
        search={{ value: search, onChange: setSearch }}
        sortOptions={[...]}
        filterOptions={[...]}
        viewOptions={[...]}
      />
    ),
  }}
  sidebarProps={{
    sections: [...],
  }}
>
  <MainContent />
</SecondarySidebarLayout>
```

See `frontend/shared/layout/secondary-sidebar/README.md` for full documentation.
- Extend `frontend/views/static/menus/hooks/useMenuMutations.ts` with the optional `forceUpdate` flag and call `installFeatureMenus({ workspaceId, featureSlugs, forceUpdate: true })` to upgrade an item without reinstalling the entire workspace.
- Keep semantic versions in sync by editing the catalog entry (`menu_manifest_data.ts` or `optional_features_catalog.ts`) and include `metadata.version`, `previousVersion`, and `lastUpdated` fields for audit logging.
- All version jumps emit `action: "version_updated"` events in `activityEvents`. Add regression coverage any time you touch the versioning flow.

### Shared Chat Migration Playbook

- New chat surfaces should import the appropriate container from `frontend/features/{domain}/components/*ChatContainer.tsx` or use the generic `shared/chat` presets; never reimplement message loops.
- Each feature adapter wires Convex through `frontend/features/chat/adapters/convexChatAdapter.ts`; reuse or extend the adapter instead of calling Convex APIs directly.
- When migrating a legacy screen, follow the three-phase plan: run the shared module in parallel, swap imports feature-by-feature, then delete the bespoke implementation once analytics and QA are green.
- Convex schema requirements live in `convex/schema.ts` under `chatRooms` and `chatMessages`. Ensure new contexts populate `contextMode`, `linkedEntities`, and `participantIds` so shared analytics (presence, audit trails) remain accurate.

### Test Coverage Requirements

- **Unit Tests:** > 80% coverage for utilities and helpers
- **Integration Tests:** 100% coverage for all CRUD operations
- **RBAC Tests:** Test all permission scenarios
- **Edge Cases:** Test validation, error handling

---

## CI/CD Workflow

### Automated Checks (on PR)

1. **Feature Validation**
   - Validates `features.config.ts` schema
   - Checks for duplicate slugs
   - Ensures manifest sync

2. **Type Checking**
   ```bash
   pnpm run typecheck
   ```

3. **Linting**
   ```bash
   pnpm run lint
   ```

4. **Schema Validation**
   ```bash
   pnpm run validate:all
   ```

5. **Tests**
   ```bash
   pnpm test
   pnpm test:coverage
   ```

### Manual Validation Before Push

```bash
# Run all checks locally
pnpm run precommit

# This runs:
# - Linting
# - Validation (all schemas)
# - All tests
```

---

## Pre-Commit Checklist

Before creating a PR, verify:

- [ ] **Code Quality**
  - [ ] No TypeScript errors: `pnpm run typecheck`
  - [ ] No ESLint errors: `pnpm run lint`
  - [ ] Code formatted consistently

- [ ] **Features Config**
  - [ ] Updated `features.config.ts` with correct metadata
  - [ ] Ran `pnpm run sync:all`
  - [ ] All manifest files updated

- [ ] **Schema Validation**
  - [ ] Ran `pnpm run validate:all`
  - [ ] No validation errors

- [ ] **RBAC Compliance**
  - [ ] All queries have permission checks
  - [ ] All mutations have permission checks
  - [ ] Audit logging added to mutations

- [ ] **Testing**
  - [ ] Unit tests written and passing
  - [ ] Integration tests written and passing
  - [ ] Coverage > 80%: `pnpm test:coverage`

- [ ] **Documentation**
  - [ ] JSDoc comments on public APIs
  - [ ] Complex logic documented
  - [ ] README updated (if needed)

- [ ] **Manual Testing**
  - [ ] Feature works in dev environment
  - [ ] UI responsive on mobile/tablet/desktop
  - [ ] No console errors
  - [ ] No accessibility issues

---

## Common Commands Cheat Sheet

```bash
# Scaffolding
pnpm run scaffold:feature {slug} --type {default|optional} --category {category}

# Syncing
pnpm vitest run tests/manifest-content.test.ts          # Sync features + generate manifest
pnpm run sync:features         # Sync features only
pnpm run generate:manifest     # Generate manifest only

# Validation
pnpm run validate:features     # Validate features.config.ts
pnpm run validate:all          # Validate all schemas
pnpm run check:features        # Validate + sync (dry-run)

# Testing
pnpm test                      # Run all tests
pnpm test:coverage             # Run with coverage report
pnpm test tests/features/{slug} # Run specific feature tests
pnpm test:ui                   # Run with UI (Vitest UI)

# Development
pnpm dev                       # Start Next.js dev server
npx convex dev --configure=existing --team abdurrahman-fakhrul --project superspace  # Start Convex dev server
pnpm run typecheck             # Run TypeScript compiler
pnpm run lint                  # Run ESLint

# Pre-commit
pnpm run precommit             # Run all pre-commit checks
```

---

## Need Help?

1. Check [3_AI_KNOWLEDGE_BASE.md](./3_AI_KNOWLEDGE_BASE.md) for technical details
2. Check [4_TROUBLESHOOTING.md](./4_TROUBLESHOOTING.md) for common issues
3. Check [5_FEATURE_REFERENCE.md](./5_FEATURE_REFERENCE.md) for feature examples
4. Ask in team chat
5. Create GitHub issue

---

**Last Updated:** 2025-01-19
**Version:** 1.0.0
