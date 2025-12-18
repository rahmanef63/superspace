# Feature Creation Template Guide

> **Template untuk membuat fitur baru yang konsisten dan bebas error**
> **Last Updated:** 2025-12-08

---

## 🎯 Quick Reference

### Naming Conventions

| Item | Convention | Example |
|------|------------|---------|
| Feature folder (frontend) | `kebab-case` | `frontend/features/hr-management/` |
| Feature folder (convex) | `camelCase` | `convex/features/hrManagement/` |
| Hook file | `use{PascalCase}.ts` | `hooks/useHrManagement.ts` |
| Hook function | `use{PascalCase}` | `export function useHrManagement()` |
| Page component | `{PascalCase}Page.tsx` | `views/HrManagementPage.tsx` |
| Config id | `kebab-case` | `id: 'hr-management'` |

> ⚠️ **PENTING**: Convex folder HARUS menggunakan `camelCase` karena Convex tidak mendukung kebab-case dalam nama folder.

---

## 📁 Feature Structure Template

```
frontend/features/{feature-slug}/          # kebab-case
├── config.ts              # ✅ SSOT - Single Source of Truth
├── page.tsx               # ✅ Entry point (exports main component)
├── index.ts               # ✅ Public exports
├── hooks/
│   └── use{Feature}.ts    # ✅ Main hook with Convex queries
├── views/
│   └── {Feature}Page.tsx  # ✅ Main page component
├── components/            # Feature-specific UI components
│   └── {Component}.tsx
├── types/                 # TypeScript types
│   └── index.ts
└── shared/                # Shared within this feature only
    └── components/

convex/features/{featureSlug}/             # camelCase (NO dashes!)
├── queries.ts             # ✅ Read operations with RBAC
├── mutations.ts           # ✅ Write operations with RBAC + Audit
└── schema.ts              # Database schema for this feature
```

### Konversi Nama Folder

| Frontend (kebab-case) | Convex (camelCase) |
|-----------------------|-------------------|
| `hr-management` | `hrManagement` |
| `sales-crm` | `salesCrm` |
| `my-feature` | `myFeature` |
| `hr` | `hr` (single word tetap sama) |

---

## 🚀 Quick Start: Create Feature via CLI

```bash
# Create new feature (script otomatis konversi nama untuk convex)
pnpm run create:feature {slug} --type {type} --category {category} --icon {icon}

# Example:
pnpm run create:feature sales-report --type optional --category analytics --icon BarChart
# Result:
#   - frontend/features/sales-report/  (kebab-case)
#   - convex/features/salesReport/     (camelCase - auto converted)
```

Available Options:
- `--type`: default | optional | experimental | system
- `--category`: communication | productivity | collaboration | administration | social | creativity | analytics
- `--icon`: Lucide icon name (e.g., Users, Calculator, Package)
- `--bundles-recommended`: startup,business-pro
- `--no-ui`: Skip frontend generation
- `--no-convex`: Skip backend generation

---

## 📝 Template Files

### 1. config.ts (SSOT)

```typescript
import { defineFeature } from '@/frontend/shared/lib/features/defineFeature'

/**
 * {Feature Name} Feature Configuration
 *
 * This is the single source of truth for the {feature-slug} feature.
 * Auto-discovered by the feature registry system.
 *
 * @see lib/features/registry.ts for auto-discovery
 * @see lib/features/defineFeature.ts for schema
 */
export default defineFeature({
  // Basic Info
  id: '{feature-slug}',
  name: '{Feature Name}',
  description: '{Short description of the feature}',

  // UI Config
  ui: {
    icon: '{LucideIconName}',           // e.g., 'Users', 'Calculator', 'Package'
    path: '/dashboard/{feature-slug}',
    component: '{Feature}Page',
    category: '{category}',             // productivity, analytics, administration, etc.
    order: 100,
  },

  // Technical Config
  technical: {
    featureType: 'optional',            // default | optional | experimental
    hasUI: true,
    hasConvex: true,
    hasTests: true,
    version: '1.0.0',
  },

  // Development Status
  status: {
    state: 'development',               // development | beta | stable | deprecated
    isReady: false,                     // Set to true when ready for production
  },

  // Bundle Membership
  bundles: {
    core: [],
    recommended: [],
    optional: ['startup', 'business-pro'],
  },

  // Required Permissions
  permissions: ['{feature-slug}.view', '{feature-slug}.create', '{feature-slug}.update', '{feature-slug}.delete'],
})
```

### 2. hooks/use{Feature}.ts

```typescript
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@convex/_generated/dataModel"

/**
 * Hook for {Feature Name} feature
 * 
 * Pattern: Use Convex query directly, no manual loading state
 * The query returns undefined while loading, data when ready
 * 
 * @see docs/00_BASE_KNOWLEDGE.md - Pattern 4: React Component with Convex
 */
export function use{Feature}(workspaceId: Id<"workspaces"> | null | undefined) {
  // ✅ Query data from Convex - returns undefined while loading
  // NOTE: Use camelCase for Convex path (e.g., api.features.hrManagement not hr-management)
  const data = useQuery(
    workspaceId ? api.features.{featureSlugCamelCase}.queries.getData : "skip",
    workspaceId ? { workspaceId } : "skip"
  )

  // ✅ Mutations
  const createItem = useMutation(api.features.{featureSlugCamelCase}.mutations.create)
  const updateItem = useMutation(api.features.{featureSlugCamelCase}.mutations.update)
  const deleteItem = useMutation(api.features.{featureSlugCamelCase}.mutations.remove)

  return {
    // State
    isLoading: data === undefined && workspaceId !== null && workspaceId !== undefined,
    data,
    
    // Actions
    createItem,
    updateItem,
    deleteItem,
  }
}
```

### 3. views/{Feature}Page.tsx

```typescript
"use client"

import React from "react"
import { {Icon}, Plus, Settings } from "lucide-react"
import { Id } from "@convex/_generated/dataModel"
import { FeatureHeader } from "@/frontend/shared/ui/layout/header"
import { PageContainer } from "@/frontend/shared/ui/layout/container"
import { use{Feature} } from "../hooks/use{Feature}"

interface {Feature}PageProps {
  workspaceId?: Id<"workspaces"> | null
}

/**
 * {Feature Name} Page Component
 * 
 * Pattern: Feature page with shared layout components
 * @see docs/guides/three-column-layout-usage.md for complex layouts
 * @see docs/00_BASE_KNOWLEDGE.md - Pattern 4: React Component with Convex
 */
export default function {Feature}Page({ workspaceId }: {Feature}PageProps) {
  // ✅ Use hook with workspaceId - this is the correct pattern
  const { isLoading, data, createItem } = use{Feature}(workspaceId)

  // ✅ Handle no workspace
  if (!workspaceId) {
    return (
      <PageContainer centered>
        <div className="text-center">
          <h2 className="text-xl font-semibold">No Workspace Selected</h2>
          <p className="mt-2 text-muted-foreground">
            Please select a workspace to view {Feature Name}
          </p>
        </div>
      </PageContainer>
    )
  }

  // ✅ Handle loading
  if (isLoading) {
    return (
      <PageContainer centered>
        <div className="text-muted-foreground">Loading {Feature Name}...</div>
      </PageContainer>
    )
  }

  // ✅ Main content with proper scroll wrapper
  return (
    <div className="flex h-full flex-col">
      <FeatureHeader
        icon={{Icon}}
        title="{Feature Name}"
        subtitle="{Feature description}"
        badge={{ text: "Beta", variant: "secondary" }}
        primaryAction={{
          label: "Add Item",
          icon: Plus,
          onClick: () => {},
        }}
        secondaryActions={[
          {
            id: "settings",
            label: "Settings",
            icon: Settings,
            onClick: () => {},
          },
        ]}
      />

      {/* ✅ Scrollable content area */}
      <div className="flex-1 overflow-auto p-6">
        {/* Your feature content here */}
        <div className="space-y-4">
          {/* Content */}
        </div>
      </div>
    </div>
  )
}
```

### 4. page.tsx (Entry Point)

```typescript
"use client"

import type { Id } from "@convex/_generated/dataModel"
import {Feature}Page from "./views/{Feature}Page"

export interface {Feature}PageProps {
  workspaceId?: Id<"workspaces"> | null
}

export default function Page({ workspaceId }: {Feature}PageProps) {
  return <{Feature}Page workspaceId={workspaceId} />
}
```

### 5. index.ts (Exports)

```typescript
// Public exports for {Feature Name} feature
export { default as {Feature}Page } from "./page"
export { use{Feature} } from "./hooks/use{Feature}"
export * from "./types"
```

---

## 🔧 Convex Backend Templates

### queries.ts

```typescript
import { v } from "convex/values"
import { query } from "../../_generated/server"
import { requireActiveMembership } from "../../auth/helpers"

/**
 * Queries for {feature-slug} feature
 * 
 * Pattern: All queries MUST check workspace membership
 * @see docs/2-rules/MUTATION_TEMPLATE_GUIDE.md
 */

export const getData = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  returns: v.object({
    items: v.array(v.any()), // Replace with proper schema
    message: v.string(),
  }),
  handler: async (ctx, args) => {
    // ✅ REQUIRED: Check workspace membership
    const { membership } = await requireActiveMembership(ctx, args.workspaceId)

    // Query your data
    const items = await ctx.db
      .query("{table_name}")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect()

    return {
      items,
      message: "Query successful",
    }
  },
})

export const getById = query({
  args: {
    workspaceId: v.id("workspaces"),
    id: v.id("{table_name}"),
  },
  handler: async (ctx, args) => {
    // ✅ REQUIRED: Check workspace membership
    await requireActiveMembership(ctx, args.workspaceId)

    const item = await ctx.db.get(args.id)
    
    // Verify workspace ownership
    if (!item || item.workspaceId !== args.workspaceId) {
      return null
    }

    return item
  },
})
```

### mutations.ts

```typescript
import { v } from "convex/values"
import { mutation } from "../../_generated/server"
import { requirePermission } from "../../auth/helpers"
import { logAudit } from "../../lib/audit/logger"
import { PERMS } from "../../workspace/permissions"

/**
 * Mutations for {feature-slug} feature
 * 
 * Pattern: All mutations MUST check permissions AND log audit events
 * @see docs/2-rules/MUTATION_TEMPLATE_GUIDE.md
 */

export const create = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
    // ... other fields
  },
  returns: v.object({
    id: v.id("{table_name}"),
    success: v.boolean(),
  }),
  handler: async (ctx, args) => {
    // ✅ STEP 1: Permission check (MUST be first)
    const { membership, userId } = await requirePermission(
      ctx,
      args.workspaceId,
      PERMS.MANAGE_WORKSPACE // Use appropriate permission
    )

    // ✅ STEP 2: Validation
    if (!args.name || args.name.trim().length === 0) {
      throw new Error("Name is required")
    }

    // ✅ STEP 3: Business logic
    const now = Date.now()
    const id = await ctx.db.insert("{table_name}", {
      workspaceId: args.workspaceId,
      name: args.name.trim(),
      createdBy: userId,
      createdAt: now,
      updatedAt: now,
    })

    // ✅ STEP 4: Audit log (REQUIRED)
    await logAudit(ctx, {
      action: "{feature}.created",
      entityType: "{table_name}",
      entityId: id,
      workspaceId: args.workspaceId,
      userId,
      metadata: { name: args.name },
    })

    return { id, success: true }
  },
})

export const update = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    id: v.id("{table_name}"),
    name: v.optional(v.string()),
    // ... other fields
  },
  handler: async (ctx, args) => {
    // ✅ Permission check
    const { userId } = await requirePermission(
      ctx,
      args.workspaceId,
      PERMS.MANAGE_WORKSPACE
    )

    // Get existing item
    const existing = await ctx.db.get(args.id)
    if (!existing || existing.workspaceId !== args.workspaceId) {
      throw new Error("Item not found")
    }

    // Update
    const updates: Record<string, any> = { updatedAt: Date.now() }
    if (args.name !== undefined) updates.name = args.name.trim()

    await ctx.db.patch(args.id, updates)

    // ✅ Audit log
    await logAudit(ctx, {
      action: "{feature}.updated",
      entityType: "{table_name}",
      entityId: args.id,
      workspaceId: args.workspaceId,
      userId,
      metadata: updates,
    })

    return { success: true }
  },
})

export const remove = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    id: v.id("{table_name}"),
  },
  handler: async (ctx, args) => {
    // ✅ Permission check
    const { userId } = await requirePermission(
      ctx,
      args.workspaceId,
      PERMS.MANAGE_WORKSPACE
    )

    // Verify ownership
    const existing = await ctx.db.get(args.id)
    if (!existing || existing.workspaceId !== args.workspaceId) {
      throw new Error("Item not found")
    }

    // Delete
    await ctx.db.delete(args.id)

    // ✅ Audit log
    await logAudit(ctx, {
      action: "{feature}.deleted",
      entityType: "{table_name}",
      entityId: args.id,
      workspaceId: args.workspaceId,
      userId,
      metadata: { name: existing.name },
    })

    return { success: true }
  },
})
```

---

## ⚠️ Common Mistakes to Avoid

### 1. ❌ Incorrect Hook Naming

```typescript
// ❌ WRONG - lowercase
export function usehr() {}
export function useaccounting() {}

// ✅ CORRECT - PascalCase after 'use'
export function useHr() {}
export function useAccounting() {}
```

### 2. ❌ Manual Loading State with useEffect

```typescript
// ❌ WRONG - manual loading state
export function useFeature() {
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    setTimeout(() => setIsLoading(false), 500)
  }, [])
  
  return { isLoading, data: null }
}

// ✅ CORRECT - let Convex handle loading
export function useFeature(workspaceId: Id<"workspaces"> | null) {
  const data = useQuery(
    workspaceId ? api.features.feature.queries.getData : "skip",
    workspaceId ? { workspaceId } : "skip"
  )
  
  return {
    isLoading: data === undefined && !!workspaceId,
    data,
  }
}
```

### 3. ❌ Not Passing workspaceId to Hooks

```typescript
// ❌ WRONG - hook doesn't receive workspaceId
const { data } = useFeature()

// ✅ CORRECT - hook receives workspaceId
const { data } = useFeature(workspaceId)
```

### 4. ❌ Missing Permission Checks in Backend

```typescript
// ❌ WRONG - no permission check
export const getData = query({
  handler: async (ctx, args) => {
    return await ctx.db.query("items").collect()
  },
})

// ✅ CORRECT - permission check first
export const getData = query({
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)
    return await ctx.db
      .query("items")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect()
  },
})
```

### 5. ❌ Missing Audit Logs in Mutations

```typescript
// ❌ WRONG - no audit log
export const create = mutation({
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("items", args)
    return id
  },
})

// ✅ CORRECT - with audit log
export const create = mutation({
  handler: async (ctx, args) => {
    const { userId } = await requirePermission(ctx, args.workspaceId, PERMS.MANAGE)
    const id = await ctx.db.insert("items", args)
    
    await logAudit(ctx, {
      action: "item.created",
      entityType: "items",
      entityId: id,
      workspaceId: args.workspaceId,
      userId,
      metadata: args,
    })
    
    return id
  },
})
```

### 6. ❌ Missing Scroll Wrapper in Page

```typescript
// ❌ WRONG - content may overflow
return (
  <div className="p-6">
    <h1>Feature</h1>
    {/* Long content */}
  </div>
)

// ✅ CORRECT - with scroll wrapper
return (
  <div className="flex h-full flex-col">
    <FeatureHeader ... />
    <div className="flex-1 overflow-auto p-6">
      {/* Content is scrollable */}
    </div>
  </div>
)
```

---

## 🔄 Feature Creation Checklist

Before creating a new feature, verify:

- [ ] Feature slug is `kebab-case`
- [ ] Hook is named `use{PascalCase}`
- [ ] Page component is named `{PascalCase}Page`
- [ ] `config.ts` uses `defineFeature()`
- [ ] Hook passes `workspaceId` to Convex queries
- [ ] Hook uses "skip" pattern for conditional queries
- [ ] Page handles `!workspaceId` case
- [ ] Page handles `isLoading` case
- [ ] Page uses `FeatureHeader` component
- [ ] Page has scroll wrapper (`flex-1 overflow-auto`)
- [ ] Backend queries check `requireActiveMembership`
- [ ] Backend mutations check `requirePermission`
- [ ] Backend mutations call `logAudit`
- [ ] All exports are in `index.ts`

---

## 🤖 Automated Feature Creation Script

> **RECOMMENDED**: Gunakan script automation untuk membuat feature baru secara konsisten!

### Lokasi Script

```
scripts/features/create.ts
```

### Usage

```bash
# Format: pnpm create:feature <feature-slug> --category <category> --type <type>

# Contoh: Buat feature project-management di kategori productivity
pnpm create:feature project-management --category productivity --type optional

# Contoh: Buat feature marketing di kategori business
pnpm create:feature marketing --category business --type core
```

### Apa yang Di-generate Script

Script akan membuat SEMUA file berikut secara otomatis:

```
frontend/features/{featureSlug}/
├── config.ts           # Feature configuration dengan defineFeature()
├── page.tsx            # Entry point
├── types.ts            # TypeScript types
├── index.ts            # Public exports
├── hooks/
│   └── use{Feature}.ts # Hook dengan pattern Convex query yang benar
└── views/
    └── {Feature}Page.tsx # Main page dengan FeatureHeader & scroll wrapper

convex/features/{featureSlug}/  # ⚠️ camelCase, bukan kebab-case!
├── queries.ts          # Query dengan requireActiveMembership
└── mutations.ts        # Mutation dengan requirePermission + logAudit
```

### Keuntungan Menggunakan Script

1. **Konsistensi**: Semua template sudah mengikuti pattern yang benar
2. **Hemat Token**: Tidak perlu generate manual satu per satu
3. **Bebas Error**: Hook sudah pakai Convex query pattern, page sudah pakai FeatureHeader
4. **Auto Naming**: Kebab-case → camelCase untuk convex folder otomatis
5. **Complete**: Semua file yang diperlukan langsung jadi

### Script Source Code Reference

<details>
<summary>Klik untuk lihat core template functions</summary>

```typescript
// File: scripts/features/create.ts

// Hook template sudah include pattern yang benar:
function generateHook(slug: string, name: string): string {
  const convexSlug = slug.replace(/-/g, '') // kebab → camelCase
  // - useQuery dengan "skip" pattern
  // - workspaceId sebagai parameter
  // - isLoading = data === undefined && !!workspaceId
}

// Page template sudah include:
function generateFrontendPage(slug: string, name: string, icon: string): string {
  // - FeatureHeader dengan icon
  // - PageContainer dengan scroll wrapper
  // - Loading dan error states
  // - Proper spacing dan layout
}
```

</details>

---

## 📚 Related Documentation

- [00_BASE_KNOWLEDGE.md](../00_BASE_KNOWLEDGE.md) - Core concepts
- [FEATURE_RULES.md](../2-rules/FEATURE_RULES.md) - Strict rules
- [MUTATION_TEMPLATE_GUIDE.md](../2-rules/MUTATION_TEMPLATE_GUIDE.md) - Backend patterns
- [three-column-layout-usage.md](./three-column-layout-usage.md) - Complex layouts

---

**Last Updated:** 2025-01-08
