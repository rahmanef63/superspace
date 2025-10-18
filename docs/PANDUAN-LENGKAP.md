# Panduan Lengkap SuperSpace

> **Panduan komprehensif untuk mengembangkan, mengelola, dan men-deploy fitur-fitur di SuperSpace**

## Daftar Isi

1. [Pengenalan Project](#pengenalan-project)
2. [Arsitektur Sistem](#arsitektur-sistem)
3. [Struktur Folder](#struktur-folder)
4. [Pola Feature Package](#pola-feature-package)
5. [Membuat Feature Baru](#membuat-feature-baru)
6. [Dynamic Import Pattern](#dynamic-import-pattern)
7. [Testing](#testing)
8. [CI/CD Pipeline](#cicd-pipeline)
9. [Troubleshooting](#troubleshooting)

---

## Pengenalan Project

### Apa itu SuperSpace?

SuperSpace adalah platform workspace kolaboratif yang dibangun dengan teknologi modern:

- **Frontend**: Next.js 14 (App Router) + shadcn/ui + Zustand
- **Backend**: Convex (realtime database & serverless functions)
- **Authentication**: Clerk
- **Testing**: Vitest + convex-test
- **Type Safety**: TypeScript + Zod

###

 Fitur Utama

- ✅ **Multi-workspace**: Organisasi, grup, keluarga, personal
- ✅ **RBAC Ketat**: Role-Based Access Control dengan granular permissions
- ✅ **Real-time**: Collaborative documents, chat, presence
- ✅ **Extensible**: Feature package system dengan Menu Store
- ✅ **Audit Logging**: Track semua perubahan penting
- ✅ **Type-safe**: End-to-end type safety dari database ke UI

---

## Arsitektur Sistem

### Tech Stack

```
┌─────────────────────────────────────────────────┐
│              Next.js Frontend                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │ Features │  │  Shared  │  │ Layouts  │      │
│  └──────────┘  └──────────┘  └──────────┘      │
└─────────────────────────────────────────────────┘
                      ↓ Convex React Client
┌─────────────────────────────────────────────────┐
│              Convex Backend                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐      │
│  │ Features │  │ Workspace│  │  Menu    │      │
│  └──────────┘  └──────────┘  └──────────┘      │
└─────────────────────────────────────────────────┘
                      ↓ Real-time Sync
┌─────────────────────────────────────────────────┐
│           Convex Database                        │
│     Tables + Indexes + Search + Storage         │
└─────────────────────────────────────────────────┘
```

### Prinsip Arsitektur

1. **Feature-Based Organization**: Setiap feature adalah package lengkap (UI + Backend + Tests)
2. **Schema-Driven Development**: Zod schemas untuk validasi dan type generation
3. **RBAC by Default**: Semua operasi melewati permission checks
4. **Audit by Design**: Logging otomatis untuk operasi sensitif
5. **Type Safety**: TypeScript strict mode + generated types dari Convex

---

## Struktur Folder

```
superspace/
├── frontend/                    # Next.js application
│   ├── app/                     # App router pages
│   ├── features/                # Feature packages (UI)
│   │   ├── reports/            # Example: Reports feature
│   │   │   ├── api/            # Dynamic import helpers (NEW!)
│   │   │   ├── views/          # Page components
│   │   │   ├── components/     # Feature-specific components
│   │   │   ├── hooks/          # React hooks
│   │   │   ├── types/          # TypeScript types
│   │   │   ├── lib/            # Utilities
│   │   │   ├── page.tsx        # Main export
│   │   │   └── index.ts        # Public API
│   │   ├── wa/                 # WhatsApp feature
│   │   ├── documents/          # Documents feature
│   │   └── canvas/             # Canvas feature
│   ├── shared/                  # Shared components & pages
│   │   ├── pages/
│   │   │   ├── manifest.tsx    # Page registry (IMPORTANT!)
│   │   │   ├── static/         # Static pages (friends, profile, etc)
│   │   │   └── dynamic/        # Dynamic pages
│   │   └── components/         # Shared UI components
│   └── lib/                     # Frontend utilities
│
├── convex/                      # Convex backend
│   ├── features/                # Feature packages (Backend)
│   │   ├── reports/            # Example: Reports feature
│   │   │   ├── index.ts        # Public API
│   │   │   ├── queries.ts      # Convex queries
│   │   │   ├── mutations.ts    # Convex mutations
│   │   │   └── actions.ts      # Convex actions (optional)
│   │   └── ...
│   ├── workspace/               # Workspace management
│   ├── menu/                    # Menu system
│   │   └── store/              # Menu Store (feature catalog)
│   ├── auth/                    # Authentication helpers
│   ├── user/                    # User management
│   ├── schema.ts               # Database schema (Convex tables)
│   ├── convex.config.ts        # Convex components config
│   └── _generated/             # Auto-generated types
│
├── tests/                       # Test files
│   └── features/                # Feature tests
│       └── reports/
│           ├── reports.test.ts              # Unit tests
│           └── reports.integration.test.ts  # Integration tests
│
├── docs/                        # Documentation
│   ├── PANDUAN-LENGKAP.md      # This file (Indonesian)
│   ├── feature-playbook.md     # Feature development guide (English)
│   ├── rbac-guide.md           # RBAC documentation
│   └── testing-guide.md        # Testing guidelines
│
├── scripts/                     # Utility scripts
│   ├── scaffold-feature.ts     # Generate new features
│   ├── sync-features.ts        # Sync feature manifest
│   └── validate-features.ts    # Validate feature config
│
├── features.config.ts           # Feature registry (Single source of truth)
├── package.json                 # Dependencies & scripts
└── .claude/                     # Claude Code configuration
    ├── CLAUDE.md               # Project guardrails
    └── settings.local.json     # Local settings
```

---

## Pola Feature Package

### Struktur Feature Lengkap

```
Feature: "reports"
├── frontend/features/reports/           # UI Layer
│   ├── api/                             # Dynamic import helpers (NEW!)
│   │   └── index.ts                     # Export convex queries/mutations
│   ├── views/
│   │   └── ReportsPage.tsx              # Main page component
│   ├── components/
│   │   ├── ReportCard.tsx
│   │   ├── ReportList.tsx
│   │   └── ReportForm.tsx
│   ├── hooks/
│   │   ├── useReports.ts
│   │   └── useReportActions.ts
│   ├── types/
│   │   └── index.ts
│   ├── lib/
│   │   └── helpers.ts
│   ├── page.tsx                         # Re-export dari views
│   └── index.ts                         # Public API
│
├── convex/features/reports/             # Backend Layer
│   ├── index.ts                         # Export queries & mutations
│   ├── queries.ts                       # Convex queries
│   ├── mutations.ts                     # Convex mutations
│   └── actions.ts                       # Convex actions (optional)
│
├── tests/features/reports/              # Test Layer
│   ├── reports.test.ts                  # Unit tests
│   └── reports.integration.test.ts      # Integration tests
│
└── features.config.ts                   # Metadata (add entry here)
```

### Prinsip Utama

1. **Single Source of Truth**: `features.config.ts` adalah sumber kebenaran
2. **Self-Contained**: Setiap feature bisa di-install/uninstall secara mandiri
3. **Type-Safe**: TypeScript + Zod schemas
4. **RBAC Compliant**: Semua mutations/queries ada permission check
5. **Testable**: Unit tests + Integration tests

---

## Membuat Feature Baru

### Quick Start (5 menit)

```bash
# 1. Scaffold feature baru
pnpm run scaffold:feature analytics --type optional --category reports

# 2. Review generated files
# - frontend/features/analytics/
# - convex/features/analytics/
# - tests/features/analytics/

# 3. Sync dengan manifest
pnpm run sync:features

# 4. Validasi
pnpm run validate:features

# 5. Run tests
pnpm test tests/features/analytics
```

### Checklist Lengkap

#### 1. Scaffold Feature

```bash
pnpm run scaffold:feature {nama-feature} --type {default|optional} --category {kategori}
```

**Catatan**:
- `default`: Feature yang otomatis ada di setiap workspace baru
- `optional`: Feature yang bisa di-install dari Menu Store

#### 2. Implementasi UI (Frontend)

**File utama**: `frontend/features/{nama}/views/{Nama}Page.tsx`

```typescript
"use client"

import type { Id } from "@convex/_generated/dataModel"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"

interface AnalyticsPageProps {
  workspaceId: Id<"workspaces">
}

export default function AnalyticsPage({ workspaceId }: AnalyticsPageProps) {
  // Fetch data menggunakan Convex queries
  const data = useQuery(api.features.analytics.queries.list, { workspaceId })

  return (
    <div className="flex h-full flex-col gap-4 p-6">
      <h1 className="text-3xl font-bold">Analytics</h1>
      {/* Your UI here */}
    </div>
  )
}
```

**Komponen tambahan**: Buat di `components/`

```typescript
// components/AnalyticsCard.tsx
export function AnalyticsCard({ data }) {
  return <Card>...</Card>
}
```

**Hooks**: Buat di `hooks/`

```typescript
// hooks/useAnalytics.ts
export function useAnalytics(workspaceId: Id<"workspaces">) {
  const data = useQuery(api.features.analytics.queries.list, { workspaceId })
  // Custom logic
  return { data, ... }
}
```

#### 3. Implementasi Backend (Convex)

**Queries** (`convex/features/{nama}/queries.ts`):

```typescript
import { v } from "convex/values"
import { query } from "../../_generated/server"
import { requireActiveMembership } from "../../auth/helpers"

export const list = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    // RBAC check (WAJIB!)
    await requireActiveMembership(ctx, args.workspaceId)

    // Query data
    const items = await ctx.db
      .query("analytics")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect()

    return items
  },
})
```

**Mutations** (`convex/features/{nama}/mutations.ts`):

```typescript
import { v } from "convex/values"
import { mutation } from "../../_generated/server"
import { requireActiveMembership } from "../../auth/helpers"

export const create = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    // RBAC check
    await requireActiveMembership(ctx, args.workspaceId)

    // Create item
    const itemId = await ctx.db.insert("analytics", {
      workspaceId: args.workspaceId,
      name: args.name,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    // Audit log (RECOMMENDED!)
    // await logAudit(ctx, {
    //   action: "analytics:create",
    //   workspaceId: args.workspaceId,
    //   targetId: itemId,
    // })

    return itemId
  },
})
```

#### 4. Tambahkan ke Schema

**File**: `convex/schema.ts`

```typescript
// Di dalam applicationTables object
analytics: defineTable({
  workspaceId: v.id("workspaces"),
  name: v.string(),
  createdAt: v.number(),
  updatedAt: v.number(),
}).index("by_workspace", ["workspaceId"]),
```

#### 5. Daftarkan di Manifest

**File**: `frontend/shared/pages/manifest.tsx`

```typescript
// 1. Import page
import AnalyticsPage from "../../features/analytics/page"

// 2. Import icon
import { BarChart } from "lucide-react"

// 3. Tambahkan ke DEFAULT_PAGE_MANIFEST array
{
  id: "analytics",
  componentId: "AnalyticsPage",
  title: "Analytics",
  description: "Analytics dashboard",
  icon: BarChart,
  component: ({ workspaceId }) => <AnalyticsPage workspaceId={workspaceId as Id<"workspaces">} />,
},
```

#### 6. Tulis Tests

**Unit test** (`tests/features/{nama}/{nama}.test.ts`):

```typescript
import { describe, it, expect } from "vitest"

describe("Analytics Feature", () => {
  it("should calculate metrics correctly", () => {
    // Test business logic
    expect(true).toBe(true)
  })
})
```

**Integration test** (`tests/features/{nama}/{nama}.integration.test.ts`):

```typescript
import { describe, it, expect, beforeEach } from "vitest"
import { convexTest } from "convex-test"
import schema from "@/convex/schema"

describe("Analytics Integration", () => {
  let t: any

  beforeEach(async () => {
    t = convexTest(schema, import.meta.glob("../../../convex/**/*.*s", { eager: true }))
  })

  it("should create analytics item", async () => {
    // Setup workspace & user
    // ...

    // Test mutation
    const itemId = await t.mutation(api.features.analytics.mutations.create, {
      workspaceId: testWorkspaceId,
      name: "Test Analytics",
    })

    expect(itemId).toBeDefined()
  })
})
```

#### 7. Sync & Validate

```bash
# Sync features manifest
pnpm run sync:features

# Validate config
pnpm run validate:features

# Run tests
pnpm test

# Start dev server
pnpm dev

# Start Convex dev (di terminal terpisah)
npx convex dev
```

---

## Dynamic Import Pattern

### Kenapa Perlu Dynamic Import?

**Problem**: Import static dapat menyebabkan circular dependencies dan bundle size besar.

**Solution**: Gunakan dynamic import dengan folder `api/` di setiap feature.

### Struktur Folder API

```
frontend/features/reports/
├── api/
│   └── index.ts           # Export dynamic imports
├── views/
│   └── ReportsPage.tsx
└── ...
```

### Implementasi

**File**: `frontend/features/reports/api/index.ts`

```typescript
import { api } from "@/convex/_generated/api"

// Re-export convex API dengan type safety
export const reportsApi = {
  queries: {
    list: api.features.reports.queries.list,
    get: api.features.reports.queries.get,
  },
  mutations: {
    create: api.features.reports.mutations.create,
    update: api.features.reports.mutations.update,
    remove: api.features.reports.mutations.remove,
  },
}
```

**Usage di Component**:

```typescript
import { useQuery, useMutation } from "convex/react"
import { reportsApi } from "../api"

function ReportsPage({ workspaceId }) {
  // Gunakan API yang sudah di-export
  const reports = useQuery(reportsApi.queries.list, { workspaceId })
  const createReport = useMutation(reportsApi.mutations.create)

  // ...
}
```

### Best Practice

1. ✅ **DO**: Buat folder `api/` untuk setiap feature yang butuh import Convex API
2. ✅ **DO**: Export API dengan nama descriptive (`reportsApi`, `analyticsApi`)
3. ✅ **DO**: Group by type (queries, mutations, actions)
4. ❌ **DON'T**: Import langsung dari `@/convex/_generated/api` di banyak file
5. ❌ **DON'T**: Buat circular dependencies antara features

---

## Testing

### Setup

Tests menggunakan **Vitest** + **convex-test**.

**File**: `vitest.config.ts`

```typescript
export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
})
```

### Unit Tests

**Lokasi**: `tests/features/{nama}/{nama}.test.ts`

**Purpose**: Test business logic, utilities, transformations

```typescript
import { describe, it, expect } from "vitest"
import { calculateMetrics } from "@/frontend/features/analytics/lib/helpers"

describe("Analytics Helpers", () => {
  it("should calculate average correctly", () => {
    const result = calculateMetrics([1, 2, 3, 4, 5])
    expect(result.average).toBe(3)
  })
})
```

### Integration Tests

**Lokasi**: `tests/features/{nama}/{nama}.integration.test.ts`

**Purpose**: Test Convex mutations/queries dengan mock database

```typescript
import { describe, it, expect, beforeEach } from "vitest"
import { convexTest } from "convex-test"
import schema from "@/convex/schema"
import { api } from "@/convex/_generated/api"

describe("Analytics Integration", () => {
  let t: any

  beforeEach(async () => {
    t = convexTest(schema, import.meta.glob("../../../convex/**/*.*s", { eager: true }))
  })

  it("should enforce RBAC permissions", async () => {
    // Test that unauthorized users can't access data
    await expect(
      t.query(api.features.analytics.queries.list, {
        workspaceId: "invalid",
      })
    ).rejects.toThrow()
  })
})
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run specific feature tests
pnpm test tests/features/reports

# Watch mode
pnpm test --watch

# Coverage
pnpm test --coverage
```

---

## CI/CD Pipeline

### GitHub Actions

**File**: `.github/workflows/feature-validation.yml`

```yaml
name: Feature Validation
on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm run validate:features
      - run: pnpm test
```

### Pre-commit Checks

```bash
# Run before committing
pnpm run precommit

# This includes:
# - ESLint
# - TypeScript check
# - Feature validation
# - Tests
```

---

## Troubleshooting

### Issue 1: "Feature tidak muncul di UI"

**Penyebab**: Feature tidak terdaftar di manifest

**Solusi**:
1. Pastikan feature sudah ditambahkan di `frontend/shared/pages/manifest.tsx`
2. Import page component
3. Tambahkan entry di `DEFAULT_PAGE_MANIFEST`
4. Restart dev server

### Issue 2: "Permission denied"

**Penyebab**: Missing RBAC check di Convex handler

**Solusi**:

```typescript
// Tambahkan di awal handler
await requireActiveMembership(ctx, args.workspaceId)
// atau
await requirePermission(ctx, args.workspaceId, PERMS.YOUR_PERMISSION)
```

### Issue 3: "Tests failing"

**Penyebab**: convex-test tidak support Convex components

**Solusi**: Saat ini, integration tests yang menggunakan `convexTest` tidak fully support Convex apps dengan components. Unit tests masih berjalan normal.

**Workaround**:
- Fokus pada unit tests
- Tunggu update dari convex-test package
- Atau skip integration tests sementara

### Issue 4: "Manifest out of sync"

**Penyebab**: `features.config.ts` berubah tapi manifest belum di-sync

**Solusi**:

```bash
pnpm run sync:features
git add convex/menu/store/
git commit -m "chore: sync feature manifest"
```

---

## Quick Reference

### Commands Cheat Sheet

```bash
# Development
pnpm dev                          # Start Next.js dev server
npx convex dev                    # Start Convex dev server

# Features
pnpm run scaffold:feature {name}  # Generate new feature
pnpm run sync:features            # Sync feature manifest
pnpm run validate:features        # Validate features.config.ts

# Testing
pnpm test                         # Run all tests
pnpm test --watch                 # Watch mode
pnpm test tests/features/reports  # Run specific tests

# Validation
pnpm run validate:all             # Run all validators
pnpm run lint                     # ESLint
pnpm run typecheck                # TypeScript check

# Pre-commit
pnpm run precommit                # Run all checks before commit
```

### File Locations

| Purpose | Location |
|---------|----------|
| Feature Config | `features.config.ts` |
| Feature Manifest | `convex/menu/store/menu_manifest_data.ts` |
| Optional Features Catalog | `convex/menu/store/optional_features_catalog.ts` |
| Page Manifest | `frontend/shared/pages/manifest.tsx` |
| Frontend Features | `frontend/features/{nama}/` |
| Backend Features | `convex/features/{nama}/` |
| Tests | `tests/features/{nama}/` |
| Database Schema | `convex/schema.ts` |

---

## Support

Untuk pertanyaan atau masalah:

1. ✅ Baca dokumentasi ini terlebih dahulu
2. ✅ Check [feature-playbook.md](./feature-playbook.md) untuk detail teknis
3. ✅ Review [.claude/CLAUDE.md](./.claude/CLAUDE.md) untuk project guardrails
4. ✅ Tanya di team chat
5. ✅ Buat GitHub issue

---

**Terakhir diupdate**: 2025-01-17
**Versi**: 1.0.0
**Maintainer**: SuperSpace Team
