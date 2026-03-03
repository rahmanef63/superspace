# 00. Base Knowledge - SuperSpace Development

> **Essential knowledge base for developing features inside or outside this project**
> **Last Updated:** 2025-12-22

---

## 🚀 TL;DR - The 5-Minute Summary

**SuperSpace is a modular SaaS platform.** Here's what you need to know:

### Core Principles
1. **Zero Hardcoding** - Features auto-discovered from `config.ts` files
2. **RBAC Required** - Every query/mutation checks permissions
3. **Audit Required** - Every mutation logs an audit event
4. **SSOT** - Single Source of Truth in `config.ts`

### Quick Commands
```bash
pnpm dev                      # Start frontend
npx convex dev                # Start backend
pnpm run create:feature slug  # Create feature
pnpm test                     # Run tests
```

### Feature Structure
```
frontend/features/{slug}/     →  convex/features/{slug}/
├── config.ts (SSOT)              ├── queries.ts (+ RBAC)
├── page.tsx                      ├── mutations.ts (+ RBAC + Audit)
├── agents/ (required)            ├── schema.ts
└── settings/ (required)          └── agents/
```

### New to SuperSpace?
1. Read this document
2. Check [QUICKSTART.md](QUICKSTART.md) for setup
3. Study the [example feature](../frontend/features/example/)
4. Read [GLOSSARY.md](GLOSSARY.md) for terms

---

## 📋 Table of Contents

1. [Quick Overview](#quick-overview)
2. [Core Concepts](#core-concepts)
3. [Tech Stack](#tech-stack)
4. [Architecture Patterns](#architecture-patterns)
5. [Development Workflow](#development-workflow)
6. [Golden Rules](#golden-rules)
7. [Essential Files Reference](#essential-files-reference)
8. [Cheat Sheet](#cheat-sheet)

---

## 🎯 Quick Overview

### What is SuperSpace?

SuperSpace is a **modular, feature-based SaaS platform** built with:
- **Next.js 15 (App Router)** - Modern React framework
- **Convex** - Real-time serverless database
- **Clerk** - Authentication & user management
- **shadcn/ui + Tailwind** - Beautiful, accessible UI
- **TypeScript + Zod** - Type safety & validation

### Key Innovation: Truly Modular Features

**Zero hardcoding.** Every feature is:
- ✅ Auto-discovered (no manual registration)
- ✅ Self-contained (has own UI, backend, tests)
- ✅ Can have nested sub-features
- ✅ RBAC-enforced (permission checks on all operations)
- ✅ Audit-logged (all mutations tracked)

---

## 🧠 Core Concepts

### 1. Modular Feature System

**Everything is a feature.** Each feature is a self-contained module:

```
frontend/features/{feature-slug}/
├── config.ts              # Single Source of Truth (SSOT)
├── components/            # UI components
├── hooks/                 # Custom hooks
├── features/              # Nested sub-features
├── shared/                # Shared within feature
└── settings/              # Feature-specific settings

convex/features/{feature-slug}/
├── queries.ts             # Read operations
├── mutations.ts           # Write operations
├── schema.ts              # Database schema
├── features/              # Sub-features backend
└── shared/                # Shared within feature
```

**Key principle:** One feature = one folder. No scattered files.

### 2. Three-Tier Sharing Model

```
┌─────────────────────────────────────────────┐
│  Global Shared (All Features)               │
│  frontend/shared/, convex/shared/           │
│  Example: Button, requirePermission         │
└─────────────────────────────────────────────┘
           │
           ├─────────────────────────────────┐
           │  Feature-Shared (Within Feature) │
           │  {feature}/shared/               │
           │  Example: SharedEditor (CMS)     │
           └─────────────────────────────────┘
                      │
                      ├──────────────────────┐
                      │  Feature-Specific    │
                      │  {feature}/          │
                      │  Example: PostEditor │
                      └──────────────────────┘
```

**Decision tree:**
- Used by **all features**? → `frontend/shared/` or `convex/shared/`
- Used **within one feature**? → `{feature}/shared/`
- Used **in one place**? → Keep it local

### 3. Auto-Discovery System

**No manual registration!** Features are auto-discovered:

```typescript
// Browser (Vite)
const modules = import.meta.glob('../../frontend/features/*/config.ts', { eager: true })

// Node (tsx/scripts)
const configs = glob.sync('frontend/features/*/config.ts')

// Result: All features loaded automatically
export const FEATURES = Object.values(modules).map(m => m.default)
```

**Benefits:**
- Add feature → Instantly available
- Remove feature → Automatically removed
- Zero maintenance overhead

### 4. RBAC (Role-Based Access Control)

**Every operation checks permissions.** Hierarchy:

```
Owner (0)      → Full control
Admin (10)     → Manage workspace
Manager (30)   → Manage content
Staff (50)     → Create content
Client (70)    → Limited access
Guest (90)     → Read-only
```

**Pattern:**
```typescript
// EVERY Convex handler MUST do this:
const { membership } = await requirePermission(
  ctx,
  args.workspaceId,
  'resource.create' // Permission key
)
```

### 5. Audit Logging

**Every mutation is logged.** For compliance, forensics, and debugging:

```typescript
// EVERY Convex mutation MUST do this:
await logAuditEvent(ctx, {
  workspaceId: args.workspaceId,
  userId: membership.userId,
  action: 'RESOURCE_CREATED',
  resourceType: 'resource',
  resourceId: resourceId,
  metadata: { title: args.title },
})
```

**Why:** Immutable trail of all changes.

---

## 🛠️ Tech Stack

### Frontend Stack

| Technology | Purpose | Why |
|------------|---------|-----|
| **Next.js 15** | Framework | App Router, Server Components, RSC |
| **React 19** | UI Library | Latest features, concurrent rendering |
| **TypeScript** | Type Safety | Catch errors at compile time |
| **Tailwind CSS** | Styling | Utility-first, fast development |
| **shadcn/ui** | Components | Accessible, customizable, copy-paste |
| **Zustand** | State Mgmt | Simple, performant, no boilerplate |
| **Zod** | Validation | Schema validation, type inference |
| **Lucide React** | Icons | Consistent, tree-shakeable icons |

### Backend Stack

| Technology | Purpose | Why |
|------------|---------|-----|
| **Convex** | Database | Real-time, serverless, type-safe |
| **Clerk** | Auth | Drop-in auth, social logins, RBAC |
| **Vitest** | Testing | Fast, Vite-native, great DX |
| **convex-test** | Integration Tests | Test Convex handlers locally |

### Development Stack

| Tool | Purpose |
|------|---------|
| **pnpm** | Package manager (fast, efficient) |
| **tsx** | TypeScript execution for scripts |
| **Turbopack** | Fast build tool (Next.js dev) |
| **ESLint** | Code linting |
| **Prettier** | Code formatting |

---

## 🏗️ Architecture Patterns

### Pattern 1: Feature Config (SSOT)

**Every feature has ONE config file:**

```typescript
// frontend/features/{slug}/config.ts
import { defineFeature } from '@/frontend/shared/lib/features/defineFeature'

export default defineFeature({
  id: 'analytics',
  name: 'Analytics',
  description: 'Real-time analytics dashboard',

  ui: {
    icon: 'BarChart',              // Lucide icon
    path: '/dashboard/analytics',
    component: 'AnalyticsPage',
    category: 'analytics',
    order: 15,
  },

  technical: {
    featureType: 'optional',       // default | optional | experimental
    hasUI: true,
    hasConvex: true,
    hasTests: true,
    version: '1.0.0',
  },

  status: {
    state: 'stable',               // development | beta | stable | deprecated
    isReady: true,
  },

  permissions: ['analytics.view'],
})
```

**This ONE file defines:**
- UI metadata (icon, path, name)
- Navigation placement (category, order)
- Technical specs (type, version)
- Required permissions

### Pattern 2: Convex Query with RBAC

```typescript
import { query } from '../../_generated/server'
import { v } from 'convex/values'
import { requirePermission } from '@/convex/shared/permissions/helpers'

export const getData = query({
  args: { workspaceId: v.id('workspaces') },
  handler: async (ctx, args) => {
    // ✅ STEP 1: Permission check
    const { membership } = await requirePermission(
      ctx,
      args.workspaceId,
      'resource.view'
    )

    // ✅ STEP 2: Query data
    const data = await ctx.db
      .query('resources')
      .withIndex('by_workspace', q => q.eq('workspaceId', args.workspaceId))
      .collect()

    return data
  }
})
```

### Pattern 3: Convex Mutation with RBAC + Audit

```typescript
import { mutation } from '../../_generated/server'
import { v } from 'convex/values'
import { requirePermission } from '@/convex/shared/permissions/helpers'
import { logAuditEvent } from '@/convex/shared/audit/logger'

export const createResource = mutation({
  args: {
    workspaceId: v.id('workspaces'),
    title: v.string(),
    data: v.any(),
  },
  handler: async (ctx, args) => {
    // ✅ STEP 1: Permission check
    const { membership } = await requirePermission(
      ctx,
      args.workspaceId,
      'resource.create'
    )

    // ✅ STEP 2: Validation
    if (!args.title || args.title.length < 3) {
      throw new Error('Title must be at least 3 characters')
    }

    // ✅ STEP 3: Business logic
    const resourceId = await ctx.db.insert('resources', {
      workspaceId: args.workspaceId,
      title: args.title,
      data: args.data,
      createdBy: membership.userId,
      createdAt: Date.now(),
    })

    // ✅ STEP 4: Audit log
    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      userId: membership.userId,
      action: 'RESOURCE_CREATED',
      resourceType: 'resource',
      resourceId: resourceId,
      metadata: { title: args.title },
    })

    return resourceId
  }
})
```

### Pattern 4: React Component with Convex

```typescript
'use client'

import { useQuery, useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Button } from '@/frontend/shared/ui/button'

export function ResourceList({ workspaceId }: { workspaceId: Id<'workspaces'> }) {
  // Query data
  const resources = useQuery(api.features.resources.queries.getResources, {
    workspaceId
  })

  // Mutation
  const createResource = useMutation(api.features.resources.mutations.createResource)

  const handleCreate = async () => {
    await createResource({
      workspaceId,
      title: 'New Resource',
      data: {}
    })
  }

  if (resources === undefined) return <div>Loading...</div>

  return (
    <div>
      <Button onClick={handleCreate}>Create Resource</Button>
      {resources.map(r => (
        <div key={r._id}>{r.title}</div>
      ))}
    </div>
  )
}
```

### Pattern 5: Feature-Shared Components

```typescript
// For code used within ONE feature (across sub-features):

// frontend/features/cms/shared/components/ImageUploader.tsx
export function ImageUploader({ onUpload }: Props) {
  // Shared image upload logic
  // Used by: admin panel, post editor, product editor
}

// Usage in sub-feature:
// frontend/features/cms/features/admin/components/PostForm.tsx
import { ImageUploader } from '@/features/cms/shared/components/ImageUploader'

export function PostForm() {
  return (
    <form>
      <ImageUploader onUpload={handleUpload} />
    </form>
  )
}
```

---

## 🚀 Development Workflow

### 1. Create New Feature

```bash
# Scaffold feature (creates all boilerplate)
pnpm run create:feature analytics --type optional --category analytics

# What gets created:
# ✅ frontend/features/analytics/config.ts
# ✅ frontend/features/analytics/AnalyticsPage.tsx
# ✅ convex/features/analytics/queries.ts
# ✅ convex/features/analytics/mutations.ts
# ✅ tests/features/analytics/analytics.test.ts
```

### 2. Develop Feature

```bash
# Start dev servers
pnpm dev              # Next.js (http://localhost:3000)
npx convex dev        # Convex (real-time sync)

# Edit files:
# - frontend/features/analytics/AnalyticsPage.tsx (UI)
# - convex/features/analytics/queries.ts (Backend)
# - frontend/features/analytics/config.ts (Metadata)
```

### 3. Add Nested Sub-Features (if needed)

```bash
# For complex features, create sub-features:
mkdir -p frontend/features/analytics/features/reports
mkdir -p frontend/features/analytics/features/dashboards

# Structure becomes:
# frontend/features/analytics/
# ├── config.ts
# ├── features/
# │   ├── reports/
# │   │   └── components/
# │   └── dashboards/
# │       └── components/
# └── shared/          # Shared across sub-features
#     └── components/
```

### 4. Sync & Validate

```bash
# Sync feature registry
pnpm run sync:all

# Validate configuration
pnpm run validate:all

# Run tests
pnpm test
```

### 5. Test Feature

```bash
# Unit tests
pnpm test features/analytics

# Integration tests
pnpm test features/analytics.integration

# Coverage
pnpm test:coverage
```

### 6. Deploy

```bash
# Build for production
pnpm build

# Push Convex schema
npx convex deploy

# Deploy to Vercel
git push origin main  # Auto-deploys if connected
```

---

## ⚖️ Golden Rules

### Rule #1: Zero Hardcoding Outside Features

**❌ FORBIDDEN:**
```typescript
// DON'T hardcode feature lists
const FEATURES = ['analytics', 'chat', 'calendar']

// DON'T manually import features
import AnalyticsPage from '@/features/analytics/page'
```

**✅ REQUIRED:**
```typescript
// DO use auto-discovery
import { FEATURES } from '@/frontend/shared/lib/features/registry'

// DO use dynamic resolution
const feature = FEATURES.find(f => f.id === slug)
```

### Rule #2: Single Source of Truth

**Every feature has EXACTLY ONE config:**
- Location: `frontend/features/{slug}/config.ts`
- Contains: ALL feature metadata
- Used by: Auto-discovery, navigation, manifests

**DO NOT:**
- Duplicate feature info elsewhere
- Create separate config files
- Store metadata in databases

### Rule #3: Always Check Permissions

**EVERY Convex handler MUST check permissions:**

```typescript
// ✅ REQUIRED in all queries
await requirePermission(ctx, workspaceId, 'resource.view')

// ✅ REQUIRED in all mutations
const { membership } = await requirePermission(ctx, workspaceId, 'resource.create')
```

### Rule #4: Always Log Mutations

**EVERY Convex mutation MUST log audit:**

```typescript
// ✅ REQUIRED after all mutations
await logAuditEvent(ctx, {
  workspaceId,
  userId: membership.userId,
  action: 'RESOURCE_CREATED',
  resourceType: 'resource',
  resourceId,
  metadata: { /* changes */ }
})
```

### Rule #5: Use CRUD Commands Only

**To manage features:**

```bash
# ✅ DO use CRUD commands
pnpm run create:feature {slug}
pnpm run edit:feature {slug}
pnpm run delete:feature {slug}

# ❌ DON'T manually edit
# - manifest files
# - registry files
# - generated files
```

### Rule #6: Mirror Frontend/Backend Structure

```
frontend/features/{slug}/     ←→  convex/features/{slug}/
├── features/                 ←→  ├── features/
├── shared/                   ←→  ├── shared/
└── components/               ←→  └── api/
```

**Keep structure consistent** between frontend and backend.

---

## 📚 Essential Files Reference

### Must-Read Documentation

| File | Purpose | When to Read |
|------|---------|--------------|
| **[docs/README.md](./README.md)** | Docs overview | Start here |
| **[docs/QUICKSTART.md](./QUICKSTART.md)** | Quick setup | Getting started |
| **[docs/GLOSSARY.md](./GLOSSARY.md)** | Key terms | Reference |
| **[docs/core/01-SYSTEM-OVERVIEW.md](./core/01-SYSTEM-OVERVIEW.md)** | Architecture | Understanding system |
| **[docs/core/02-DEVELOPER-GUIDE.md](./core/02-DEVELOPER-GUIDE.md)** | Development guide | Building features |
| **[docs/core/03-ARCHITECTURE.md](./core/03-ARCHITECTURE.md)** | Code organization | Complex features |
| **[docs/rules/01-FEATURE-RULES.md](./rules/01-FEATURE-RULES.md)** | **CRITICAL** rules | Before coding |
| **[docs/core/05-FEATURE-REFERENCE.md](./core/05-FEATURE-REFERENCE.md)** | Feature catalog | Reference |
| **[docs/rules/02-MUTATION-GUIDE.md](./rules/02-MUTATION-GUIDE.md)** | Mutation patterns | Writing mutations |

### Core Implementation Files

| File | Purpose |
|------|---------|
| `lib/features/defineFeature.ts` | Type-safe feature helper |
| `lib/features/registry.ts` | Browser auto-discovery |
| `lib/features/registry.server.ts` | Node.js auto-discovery |
| `convex/schema.ts` | Database schema |
| `convex/shared/permissions/helpers.ts` | RBAC helpers |
| `convex/shared/audit/logger.ts` | Audit logging |

### Example Features to Study

| Feature | Why Study It |
|---------|--------------|
| `frontend/features/example/` | **Start here!** Minimal reference with detailed comments |
| `frontend/features/crm/` | Full-featured example with agents, settings |
| `frontend/features/calendar/` | UI-heavy feature with complex interactions |

---

## 🎓 Cheat Sheet

### Common Commands

```bash
# Feature Management
pnpm run create:feature {slug}          # Create new feature
pnpm run list:features                  # List all features
pnpm run edit:feature {slug}            # Edit feature
pnpm run delete:feature {slug}          # Delete feature
pnpm run sync:all                       # Sync manifests

# Analysis & Documentation
pnpm run analyze:feature {slug}         # Analyze feature
pnpm run analyze:feature {slug} --save  # Save to docs/features/

# Validation
pnpm run validate:all                   # Validate everything
pnpm run validate:features              # Validate features only
pnpm test                               # Run all tests

# Development
pnpm dev                                # Start Next.js
npx convex dev                          # Start Convex
pnpm build                              # Build for production
```

### Import Patterns

```typescript
// Global shared (all features can use)
import { Button } from '@/frontend/shared/ui/button'
import { requirePermission } from '@/convex/shared/permissions/helpers'

// Feature-shared (within one feature)
import { ImageUploader } from '@/features/cms/shared/components/ImageUploader'

// Feature-specific
import { PostEditor } from '@/features/cms/components/PostEditor'

// Convex API
import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
```

### Feature Config Template

```typescript
import { defineFeature } from '@/frontend/shared/lib/features/defineFeature'

export default defineFeature({
  id: '{slug}',
  name: '{Name}',
  description: '{Description}',
  ui: {
    icon: '{Icon}',
    path: '/dashboard/{slug}',
    component: '{Name}Page',
    category: '{category}',
    order: 100,
  },
  technical: {
    featureType: 'optional',  // default | optional | experimental
    hasUI: true,
    hasConvex: true,
    hasTests: true,
    version: '1.0.0',
  },
  status: {
    state: 'stable',          // development | beta | stable | deprecated
    isReady: true,
  },
  permissions: ['{slug}.view'],
})
```

### Mutation Template

```typescript
export const create{Resource} = mutation({
  args: {
    workspaceId: v.id('workspaces'),
    // ... other args
  },
  handler: async (ctx, args) => {
    // 1. Permission check
    const { membership } = await requirePermission(
      ctx, args.workspaceId, '{resource}.create'
    )

    // 2. Validation
    // Validate args...

    // 3. Business logic
    const id = await ctx.db.insert('{table}', {
      ...args,
      createdBy: membership.userId,
      createdAt: Date.now(),
    })

    // 4. Audit log
    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      userId: membership.userId,
      action: '{RESOURCE}_CREATED',
      resourceType: '{resource}',
      resourceId: id,
      metadata: { /* data */ },
    })

    return id
  }
})
```

---

## 🎯 Quick Start Checklist

For developing features in a new project:

### Prerequisites
- [ ] Install Node.js 18+
- [ ] Install pnpm (`npm install -g pnpm`)
- [ ] Clone/create project
- [ ] Set up Clerk account (auth)
- [ ] Set up Convex account (database)

### Environment Setup
- [ ] Copy `.env.example` to `.env.local`
- [ ] Add Clerk keys
- [ ] Add Convex URL
- [ ] Run `npx convex dev --configure`
- [ ] Set up Clerk JWT template

### Core Concepts to Master
- [ ] Read `docs/1_SYSTEM_OVERVIEW.md` (architecture)
- [ ] Read `docs/2_DEVELOPER_GUIDE.md` (workflow)
- [ ] Read `docs/FEATURE_RULES.md` (rules)
- [ ] Study example features (chat, cms-lite)

### Development Setup
- [ ] Run `pnpm install`
- [ ] Run `pnpm dev` (Next.js)
- [ ] Run `npx convex dev` (Convex)
- [ ] Create first feature: `pnpm run create:feature test`
- [ ] Validate: `pnpm run validate:all`
- [ ] Test: `pnpm test`

### Key Patterns to Remember
- [ ] Always use `defineFeature()` for config
- [ ] Always check permissions in Convex
- [ ] Always log mutations with audit
- [ ] Use auto-discovery (never hardcode)
- [ ] Follow 3-tier sharing model
- [ ] Mirror frontend/backend structure

---

## 📖 Additional Resources

### Internal Documentation
- Full docs available in `docs/` folder
- Feature-specific docs in `docs/features/`
- Architecture diagrams in `docs/`

### External Resources
- **Next.js:** https://nextjs.org/docs
- **Convex:** https://docs.convex.dev
- **Clerk:** https://clerk.com/docs
- **shadcn/ui:** https://ui.shadcn.com
- **Tailwind CSS:** https://tailwindcss.com/docs

### Getting Help
- Check `docs/4_TROUBLESHOOTING.md`
- Review example features
- Run analyzer: `pnpm run analyze:feature {slug}`
- Read generated docs in `docs/features/`

---

## 💡 Key Takeaways

1. **Everything is modular** - Features are self-contained, auto-discovered
2. **RBAC is mandatory** - Every operation checks permissions
3. **Audit everything** - All mutations are logged immutably
4. **No hardcoding** - Use auto-discovery, dynamic resolution
5. **Single source of truth** - One config file per feature
6. **Test-driven** - Write tests, achieve high coverage
7. **Type-safe** - TypeScript + Zod validation everywhere

---

**Last Updated:** 2025-12-15
**Version:** 1.1.0
**Maintainer:** Development Team
