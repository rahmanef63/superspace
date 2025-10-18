# Dynamic Import Pattern untuk Features

## Masalah yang Diselesaikan

### Problem: Static Import

```typescript
// ❌ JANGAN LAKUKAN INI
// Di banyak file: ReportCard.tsx, ReportList.tsx, ReportForm.tsx, dll
import { api } from "@/convex/_generated/api"

function ReportCard() {
  const data = useQuery(api.features.reports.queries.list, ...)
  // ...
}

function ReportList() {
  const data = useQuery(api.features.reports.queries.list, ...)
  // ...
}
```

**Masalah**:
1. ❌ Import `api` di banyak file
2. ❌ Susah refactor kalau path berubah
3. ❌ Circular dependencies
4. ❌ Bundle size besar (semua API di-import)
5. ❌ Sulit di-test/mock

### Solution: API Folder Pattern

```typescript
// ✅ LAKUKAN INI
// frontend/features/reports/api/index.ts
export const reportsApi = {
  queries: {
    list: api.features.reports.queries.list,
    get: api.features.reports.queries.get,
  },
  mutations: {
    create: api.features.reports.mutations.create,
    update: api.features.reports.mutations.update,
  },
}

// Di component mana pun dalam feature
import { reportsApi } from "../api"

function ReportCard() {
  const data = useQuery(reportsApi.queries.list, ...)
}
```

**Keuntungan**:
1. ✅ Single source of truth untuk API imports
2. ✅ Easy refactoring
3. ✅ No circular dependencies
4. ✅ Better tree-shaking
5. ✅ Easier to test/mock

---

## Implementasi

### Step 1: Buat Folder API

```bash
mkdir -p frontend/features/{nama-feature}/api
touch frontend/features/{nama-feature}/api/index.ts
```

### Step 2: Export API

**File**: `frontend/features/reports/api/index.ts`

```typescript
import { api } from "@/convex/_generated/api"

export const reportsApi = {
  // Grouping by type
  queries: {
    list: api.features.reports.queries.list,
    get: api.features.reports.queries.get,
    search: api.features.reports.queries.search,
  },
  mutations: {
    create: api.features.reports.mutations.create,
    update: api.features.reports.mutations.update,
    remove: api.features.reports.mutations.remove,
    archive: api.features.reports.mutations.archive,
  },
  actions: {
    // Jika ada actions
    generatePDF: api.features.reports.actions.generatePDF,
  },
} as const

// Type-safe exports
export type ReportsApi = typeof reportsApi
```

### Step 3: Gunakan di Components

**File**: `frontend/features/reports/views/ReportsPage.tsx`

```typescript
"use client"

import { useQuery, useMutation } from "convex/react"
import { reportsApi } from "../api"  // ← Import dari api folder

export default function ReportsPage({ workspaceId }) {
  // Gunakan API
  const reports = useQuery(reportsApi.queries.list, { workspaceId })
  const createReport = useMutation(reportsApi.mutations.create)

  const handleCreate = async () => {
    await createReport({ workspaceId, name: "New Report" })
  }

  return (
    <div>
      {/* UI */}
    </div>
  )
}
```

**File**: `frontend/features/reports/components/ReportCard.tsx`

```typescript
import { useMutation } from "convex/react"
import { reportsApi } from "../api"  // ← Same import pattern

export function ReportCard({ report }) {
  const updateReport = useMutation(reportsApi.mutations.update)
  const removeReport = useMutation(reportsApi.mutations.remove)

  // ...
}
```

### Step 4: Testing dengan Mock

```typescript
// tests/features/reports/reports.test.ts
import { vi } from "vitest"

// Mock API
vi.mock("@/frontend/features/reports/api", () => ({
  reportsApi: {
    queries: {
      list: vi.fn(),
    },
    mutations: {
      create: vi.fn(),
    },
  },
}))

// Test component
```

---

## Best Practices

### 1. Naming Convention

```typescript
// ✅ Good: Descriptive, consistent
export const reportsApi = { ... }
export const analyticsApi = { ... }
export const dashboardApi = { ... }

// ❌ Bad: Generic, inconsistent
export const api = { ... }
export const convexAPI = { ... }
export const REPORTS_API = { ... }
```

### 2. Grouping

```typescript
// ✅ Good: Grouped by type
export const reportsApi = {
  queries: { list, get, search },
  mutations: { create, update, remove },
  actions: { export, import },
}

// ❌ Bad: Flat structure
export const reportsApi = {
  list,
  get,
  create,
  update,
  // Hard to know which is query/mutation
}
```

### 3. Type Safety

```typescript
// ✅ Good: Export types
export const reportsApi = { ... } as const
export type ReportsApi = typeof reportsApi

// Usage with type
import type { ReportsApi } from "../api"

function useReportsService(): ReportsApi {
  return reportsApi
}
```

### 4. Documentation

```typescript
/**
 * Reports Feature API
 *
 * Provides type-safe access to all Reports-related Convex functions.
 *
 * @example
 * ```tsx
 * import { useQuery } from "convex/react"
 * import { reportsApi } from "../api"
 *
 * function MyComponent({ workspaceId }) {
 *   const reports = useQuery(reportsApi.queries.list, { workspaceId })
 *   return <div>{reports?.length} reports</div>
 * }
 * ```
 */
export const reportsApi = {
  // ...
}
```

---

## Struktur Lengkap

```
frontend/features/reports/
├── api/
│   └── index.ts                 # API exports (SINGLE SOURCE)
├── views/
│   └── ReportsPage.tsx          # Uses ../api
├── components/
│   ├── ReportCard.tsx           # Uses ../api
│   ├── ReportList.tsx           # Uses ../api
│   └── ReportForm.tsx           # Uses ../api
├── hooks/
│   ├── useReports.ts            # Uses ../api
│   └── useReportActions.ts      # Uses ../api
├── types/
│   └── index.ts
├── lib/
│   └── helpers.ts
├── page.tsx
└── index.ts
```

**Key Point**: Semua import Convex API hanya ada di `api/index.ts`!

---

## Apakah Ini Best Practice?

### ✅ Ya, ini adalah best practice karena:

1. **Separation of Concerns**: API layer terpisah dari UI layer
2. **Single Responsibility**: Setiap file punya tanggung jawab jelas
3. **DRY (Don't Repeat Yourself)**: Import definition hanya di satu tempat
4. **Easy Refactoring**: Ubah path API di satu file, semua ter-update
5. **Better Testing**: Mudah di-mock untuk unit tests
6. **Type Safety**: TypeScript support penuh
7. **Tree Shaking**: Bundler bisa optimize imports
8. **Scalability**: Pattern konsisten untuk semua features

### 🌐 Dipakai oleh:

- Next.js recommended patterns
- Redux Toolkit Query
- React Query
- tRPC
- Many enterprise applications

### 📊 Comparison

| Aspect | Static Import | API Folder Pattern |
|--------|--------------|-------------------|
| Maintenance | ❌ Sulit | ✅ Mudah |
| Refactoring | ❌ Manual banyak file | ✅ Satu file |
| Testing | ❌ Sulit mock | ✅ Mudah mock |
| Bundle Size | ❌ Besar | ✅ Optimal |
| Type Safety | ✅ Ya | ✅ Ya |
| Circular Deps | ❌ Risiko tinggi | ✅ Tidak ada |
| Consistency | ❌ Bisa beda-beda | ✅ Konsisten |

---

## Alternative: Service Layer Pattern

Kalau project lebih besar, bisa gunakan Service Layer:

```typescript
// frontend/features/reports/services/reportsService.ts
import { reportsApi } from "../api"

export class ReportsService {
  static async createReport(workspaceId: string, name: string) {
    try {
      const id = await reportsApi.mutations.create({ workspaceId, name })
      return { success: true, id }
    } catch (error) {
      return { success: false, error }
    }
  }

  static async getReports(workspaceId: string) {
    return await reportsApi.queries.list({ workspaceId })
  }
}

// Usage
import { ReportsService } from "../services/reportsService"

const result = await ReportsService.createReport(workspaceId, "Q1 Report")
```

**Kapan pakai**:
- ✅ Butuh business logic kompleks
- ✅ Butuh error handling terpusat
- ✅ Butuh caching custom
- ✅ Butuh data transformation

---

## FAQ

### Q: Apakah harus semua feature punya folder `api/`?

**A**: Ya, sebaiknya semua feature yang menggunakan Convex API punya folder `api/`. Konsistensi penting!

### Q: Bagaimana kalau ada shared API antar features?

**A**: Buat folder `frontend/shared/api/` untuk shared APIs:

```typescript
// frontend/shared/api/workspace.ts
export const workspaceApi = {
  queries: {
    get: api.workspace.get,
    list: api.workspace.list,
  },
}

// Usage di any feature
import { workspaceApi } from "@/frontend/shared/api/workspace"
```

### Q: Apakah perlu export individual functions?

**A**: Tidak perlu. Export sebagai object lebih clean:

```typescript
// ✅ Good
import { reportsApi } from "../api"
reportsApi.queries.list

// ❌ Not recommended
import { listReports, getReport, createReport } from "../api"
```

### Q: Bagaimana dengan actions yang butuh parameters kompleks?

**A**: Buat wrapper function:

```typescript
// api/index.ts
export const reportsApi = {
  actions: {
    generatePDF: api.features.reports.actions.generatePDF,
  },
}

// Wrapper untuk complex logic
export async function generateReportPDF(
  workspaceId: string,
  reportId: string,
  options: PDFOptions
) {
  return await reportsApi.actions.generatePDF({
    workspaceId,
    reportId,
    format: options.format,
    includeCharts: options.includeCharts,
    // ... transform options
  })
}
```

---

## Kesimpulan

Dynamic Import Pattern dengan folder `api/` adalah **best practice** untuk:

✅ Maintainability
✅ Scalability
✅ Testability
✅ Type Safety
✅ Performance

**Recommendation**: Gunakan pattern ini untuk semua features baru!

---

**Related Docs**:
- [PANDUAN-LENGKAP.md](./PANDUAN-LENGKAP.md)
- [feature-playbook.md](./feature-playbook.md)

**Last Updated**: 2025-01-17
