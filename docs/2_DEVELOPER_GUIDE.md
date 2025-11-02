# 2. Developer Guide

> **Comprehensive guide for developers building features in SuperSpace**

**Last Updated:** 2025-11-01

---

## Table of Contents

1. [Quick Start (5 Minutes)](#quick-start-5-minutes)
2. [Building a Simple Feature](#building-a-simple-feature)
3. [Building a Complex Feature (with Sub-Features)](#building-a-complex-feature-with-sub-features)
4. [Using Feature-Level Shared](#using-feature-level-shared)
5. [Using Global Shared](#using-global-shared)
6. [Settings Integration](#settings-integration)
7. [RBAC & Security](#rbac--security)
8. [Testing Guidelines](#testing-guidelines)
9. [Pre-Commit Checklist](#pre-commit-checklist)

---

## Quick Start (5 Minutes)

Create a fully functional feature in under 5 minutes:

```bash
# 1. Scaffold the feature
pnpm run scaffold:feature analytics --type optional --category analytics

# 2. Sync to manifests
pnpm run sync:all

# 3. Validate everything
pnpm run validate:all

# 4. Run tests
pnpm test

# 5. Start development
pnpm dev
npx convex dev
```

**What gets created:**
```
✅ frontend/features/analytics/config.ts  # Feature config (SSOT)
✅ frontend/features/analytics/           # UI components
✅ convex/features/analytics/             # Backend logic
✅ tests/features/analytics/              # Test files
```

---

## Building a Simple Feature

### Step 1: Create Feature Config

Create `frontend/features/analytics/config.ts`:

```typescript
import { defineFeature } from '@/lib/features/defineFeature'

export default defineFeature({
  // Basic Info
  id: 'analytics',
  name: 'Analytics',
  description: 'Real-time analytics dashboard',

  // UI Config
  ui: {
    icon: 'BarChart',              // Lucide React icon
    path: '/dashboard/analytics',
    component: 'AnalyticsPage',
    category: 'analytics',
    order: 15,
  },

  // Technical Config
  technical: {
    featureType: 'optional',
    hasUI: true,
    hasConvex: true,
    hasTests: true,
    version: '1.0.0',
  },

  // Development Status
  status: {
    state: 'stable',
    isReady: true,
  },

  // Optional: Permissions
  permissions: ['analytics.view'],
})
```

### Step 2: Create Frontend Structure

```
frontend/features/analytics/
├── config.ts              # ✅ Created above
├── AnalyticsPage.tsx      # Main page
├── components/            # Feature components
│   ├── Chart.tsx
│   └── Stats.tsx
└── hooks/                 # Custom hooks
    └── useAnalytics.ts
```

**AnalyticsPage.tsx:**
```typescript
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Chart } from './components/Chart'
import { Stats } from './components/Stats'

export function AnalyticsPage() {
  const data = useQuery(api.features.analytics.queries.getAnalytics, {
    workspaceId: currentWorkspace._id
  })

  return (
    <div>
      <h1>Analytics</h1>
      <Stats data={data} />
      <Chart data={data} />
    </div>
  )
}
```

### Step 3: Create Convex Backend

```
convex/features/analytics/
├── queries.ts
├── mutations.ts
└── schema.ts
```

**queries.ts:**
```typescript
import { query } from '../../_generated/server'
import { v } from 'convex/values'
import { requirePermission } from '@/convex/shared/permissions/helpers'

export const getAnalytics = query({
  args: { workspaceId: v.id('workspaces') },
  handler: async (ctx, args) => {
    // ✅ RBAC check
    await requirePermission(ctx, args.workspaceId, 'analytics.view')

    // Query data
    const data = await ctx.db
      .query('analytics')
      .withIndex('by_workspace', q => q.eq('workspaceId', args.workspaceId))
      .collect()

    return data
  },
})
```

**mutations.ts:**
```typescript
import { mutation } from '../../_generated/server'
import { v } from 'convex/values'
import { requirePermission } from '@/convex/shared/permissions/helpers'
import { logAuditEvent } from '@/convex/shared/audit/logger'

export const trackEvent = mutation({
  args: {
    workspaceId: v.id('workspaces'),
    eventType: v.string(),
    metadata: v.any(),
  },
  handler: async (ctx, args) => {
    // ✅ RBAC check
    const { membership } = await requirePermission(
      ctx,
      args.workspaceId,
      'analytics.create'
    )

    // Insert data
    const eventId = await ctx.db.insert('analytics', {
      workspaceId: args.workspaceId,
      eventType: args.eventType,
      metadata: args.metadata,
      createdAt: Date.now(),
    })

    // ✅ Audit log
    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      userId: membership.userId,
      action: 'ANALYTICS_EVENT_TRACKED',
      resourceType: 'analytics',
      resourceId: eventId,
      metadata: { eventType: args.eventType },
    })

    return eventId
  },
})
```

### Step 4: Sync & Validate

```bash
# Sync features
pnpm run sync:all

# Validate
pnpm run validate:all

# Test
pnpm test
```

---

## Building a Complex Feature (with Sub-Features)

### When to Use Sub-Features

Use sub-features when:
- Feature has multiple distinct domains (e.g., CMS with posts, products, pages)
- Feature has admin panel separate from public UI
- Feature needs internal organization

### Example: CMS-Lite Feature

**Structure:**
```
frontend/features/cms-lite/
├── config.ts              # Main feature config
├── components/            # Main components
│   ├── Navbar.tsx
│   └── Footer.tsx
├── contexts/              # React contexts
│   ├── CartContext.tsx
│   └── ThemeContext.tsx
├── hooks/                 # Main hooks
│   └── useCart.ts
├── pages/                 # Public pages
│   ├── LandingPage.tsx
│   └── StorePage.tsx
├── features/              # 🎯 Sub-features
│   └── admin/             # Admin panel sub-feature
│       ├── components/
│       │   ├── AdminLayout.tsx
│       │   ├── ProductForm.tsx
│       │   └── PostForm.tsx
│       └── pages/
│           ├── AdminDashboard.tsx
│           └── ProductsAdmin.tsx
├── shared/                # 🎯 Feature-level shared
│   ├── components/
│   │   ├── ImageUploader.tsx  # Used by admin & public
│   │   └── RichEditor.tsx
│   ├── hooks/
│   │   └── useImageUpload.ts
│   └── utils/
│       └── imageUtils.ts
└── settings/              # Feature settings
    ├── GeneralSettings.tsx
    └── PaymentSettings.tsx
```

**Convex structure:**
```
convex/features/cms_lite/
├── posts/                 # Posts domain
│   └── api/
│       ├── queries.ts
│       ├── mutations.ts
│       └── schema.ts
├── products/              # Products domain
│   └── api/
│       ├── queries.ts
│       ├── mutations.ts
│       └── schema.ts
├── features/              # 🎯 Sub-features backend
│   └── api/
│       ├── queries.ts
│       └── mutations.ts
├── shared/                # 🎯 Feature-level shared
│   ├── audit.ts           # CMS-specific audit
│   ├── auth.ts            # CMS-specific auth
│   └── schema.ts          # Shared schemas
├── queries.ts             # Aggregated queries
├── mutations.ts           # Aggregated mutations
└── schema.ts              # Main schema
```

---

## Using Feature-Level Shared

**Purpose:** Share code WITHIN a feature (across sub-features)

### Frontend Feature-Shared

**Create shared component:**
```typescript
// frontend/features/cms-lite/shared/components/ImageUploader.tsx
export function ImageUploader({ onUpload }: ImageUploaderProps) {
  // Shared logic for image upload
  // Used by both admin panel AND public pages
}
```

**Use in sub-feature:**
```typescript
// frontend/features/cms-lite/features/admin/components/ProductForm.tsx
import { ImageUploader } from '@/features/cms-lite/shared/components/ImageUploader'
import { useImageUpload } from '@/features/cms-lite/shared/hooks/useImageUpload'

export function ProductForm() {
  const { upload } = useImageUpload()

  return (
    <form>
      <ImageUploader onUpload={upload} />
    </form>
  )
}
```

### Convex Feature-Shared

**Create shared helper:**
```typescript
// convex/features/cms_lite/shared/auth.ts
export async function requireCmsPermission(
  ctx: QueryCtx | MutationCtx,
  workspaceId: Id<'workspaces'>,
  permission: string
) {
  // CMS-specific permission logic
  const { membership } = await requirePermission(ctx, workspaceId, permission)

  // Additional CMS-specific checks
  const cmsSettings = await ctx.db
    .query('cms_settings')
    .withIndex('by_workspace', q => q.eq('workspaceId', workspaceId))
    .first()

  if (!cmsSettings?.enabled) {
    throw new Error('CMS is not enabled for this workspace')
  }

  return { membership, cmsSettings }
}
```

**Use in domain:**
```typescript
// convex/features/cms_lite/posts/api/mutations.ts
import { requireCmsPermission } from '../../shared/auth'
import { logCmsAudit } from '../../shared/audit'

export const createPost = mutation({
  handler: async (ctx, args) => {
    // Use feature-shared helper
    const { membership } = await requireCmsPermission(ctx, args.workspaceId, 'posts.create')

    const postId = await ctx.db.insert('posts', args)

    // Use feature-shared audit
    await logCmsAudit(ctx, 'POST_CREATED', postId)

    return postId
  }
})
```

---

## Using Global Shared

**Purpose:** Share code ACROSS ALL features

### Frontend Global Shared

**Available modules:**
```typescript
// UI Components (shadcn/ui)
import { Button } from '@/frontend/shared/ui/button'
import { Input } from '@/frontend/shared/ui/input'
import { Card } from '@/frontend/shared/ui/card'

// Builder System
import { Canvas } from '@/frontend/shared/builder/canvas'
import { Inspector } from '@/frontend/shared/builder/inspector'

// Communications
import { ChatWidget } from '@/frontend/shared/communications/chat'

// Contexts
import { useWorkspace } from '@/frontend/shared/context/WorkspaceContext'

// Hooks
import { useAuth } from '@/frontend/shared/foundation/hooks/useAuth'
```

### Convex Global Shared

**Available modules:**
```typescript
// RBAC
import { requirePermission } from '@/convex/shared/permissions/helpers'
import { hasPermission } from '@/convex/shared/permissions/helpers'

// Audit
import { logAuditEvent } from '@/convex/shared/audit/logger'

// Validation
import { validateSchema } from '@/convex/shared/utils/validation'
```

---

## Settings Integration

### Global Settings

**Location:** `frontend/shared/settings/`

**Example:**
```typescript
// frontend/shared/settings/workspace/WorkspaceSettings.tsx
export function WorkspaceSettings() {
  // Global workspace settings
  return <div>Workspace Settings</div>
}
```

### Feature Settings

**Location:** `frontend/features/{feature}/settings/`

**Example:**
```typescript
// frontend/features/cms-lite/settings/GeneralSettings.tsx
export function GeneralSettings() {
  // CMS-lite specific settings
  return <div>CMS Lite Settings</div>
}
```

**Register in settings registry:**
```typescript
// frontend/shared/settings/featureSettingsRegistry.ts
export const FEATURE_SETTINGS_REGISTRY = {
  'cms-lite': {
    id: 'cms-lite',
    label: 'CMS Lite Settings',
    component: lazy(() => import('@/features/cms-lite/settings/GeneralSettings'))
  },
}
```

---

## RBAC & Security

### ✅ REQUIRED: Permission Checks

**Every Convex query MUST check permissions:**
```typescript
export const getData = query({
  args: { workspaceId: v.id('workspaces') },
  handler: async (ctx, args) => {
    // ✅ REQUIRED
    const { membership } = await requirePermission(
      ctx,
      args.workspaceId,
      'resource.view'
    )

    // Your logic
  }
})
```

**Every Convex mutation MUST check permissions AND log audit:**
```typescript
export const createData = mutation({
  args: { workspaceId: v.id('workspaces'), data: v.any() },
  handler: async (ctx, args) => {
    // ✅ REQUIRED: Permission check
    const { membership } = await requirePermission(
      ctx,
      args.workspaceId,
      'resource.create'
    )

    // Insert data
    const id = await ctx.db.insert('resources', args.data)

    // ✅ REQUIRED: Audit log
    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      userId: membership.userId,
      action: 'RESOURCE_CREATED',
      resourceType: 'resource',
      resourceId: id,
      metadata: { ...args.data },
    })

    return id
  }
})
```

### Permission Patterns

**Basic permission:**
```typescript
await requirePermission(ctx, workspaceId, 'posts.create')
```

**Custom permission logic:**
```typescript
// In feature/shared/auth.ts
export async function requirePostOwnership(
  ctx: MutationCtx,
  postId: Id<'posts'>
) {
  const { membership } = await requireActiveMembership(ctx, workspaceId)

  const post = await ctx.db.get(postId)
  if (!post) throw new Error('Post not found')

  if (post.authorId !== membership.userId) {
    if (!hasPermission(membership.role, 'posts.manage')) {
      throw new Error('You can only edit your own posts')
    }
  }

  return { membership, post }
}
```

---

## Testing Guidelines

### Unit Tests

**Location:** `tests/features/{feature}/{feature}.test.ts`

```typescript
import { describe, it, expect } from 'vitest'
import { analyzeData } from '@/features/analytics/utils/analyze'

describe('Analytics Utils', () => {
  it('should calculate correct metrics', () => {
    const data = [{ value: 10 }, { value: 20 }]
    const result = analyzeData(data)
    expect(result.total).toBe(30)
  })
})
```

### Integration Tests

**Location:** `tests/features/{feature}/{feature}.integration.test.ts`

```typescript
import { convexTest } from 'convex-test'
import { describe, it, expect } from 'vitest'
import schema from '@/convex/schema'
import { api } from '@/convex/_generated/api'

describe('Analytics Integration', () => {
  it('should track events', async () => {
    const t = convexTest(schema)

    // Create workspace
    const workspaceId = await t.run(async (ctx) => {
      return await ctx.db.insert('workspaces', {
        name: 'Test Workspace'
      })
    })

    // Track event
    const eventId = await t.mutation(api.features.analytics.mutations.trackEvent, {
      workspaceId,
      eventType: 'page_view',
      metadata: { page: '/home' }
    })

    expect(eventId).toBeDefined()
  })
})
```

---

## Pre-Commit Checklist

Before committing your feature:

### 1. Code Quality
- [ ] No TypeScript errors (`pnpm type-check`)
- [ ] No ESLint errors (`pnpm lint`)
- [ ] Code formatted (`pnpm format`)

### 2. RBAC & Security
- [ ] All queries have permission checks
- [ ] All mutations have permission checks
- [ ] All mutations have audit logging

### 3. Testing
- [ ] Unit tests written and passing
- [ ] Integration tests written and passing
- [ ] All tests pass (`pnpm test`)

### 4. Validation
- [ ] Feature config is valid (`pnpm run validate:all`)
- [ ] Schemas are valid
- [ ] No hardcoded feature references

### 5. Documentation
- [ ] Feature config has description
- [ ] Complex logic has comments
- [ ] README.md updated (if needed)

### 6. Sync
- [ ] Run `pnpm run sync:all`
- [ ] Manifests are up to date
- [ ] No merge conflicts

---

## 📖 See Also

- **[System Overview](./1_SYSTEM_OVERVIEW.md)** - High-level architecture
- **[Modular Architecture](./3_MODULAR_ARCHITECTURE.md)** - Detailed patterns
- **[Troubleshooting](./4_TROUBLESHOOTING.md)** - Common issues
- **[Feature Reference](./5_FEATURE_REFERENCE.md)** - Feature catalog
- **[Feature Rules](./FEATURE_RULES.md)** - Strict rules & enforcement

---

**Last Updated:** 2025-11-01
