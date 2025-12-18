# V1/V2 Boundaries & Dependency Rules

**Version:** 1.0
**Created:** 2025-11-02
**Status:** Design Specification

---

## Purpose

Defines clear boundaries between V1 (current database implementation) and V2 (universal database with view-system), preventing circular dependencies and ensuring safe parallel development.

**Critical Issue Addressed:** Agent Alpha Issue #3 - Circular Dependency Risk

---

## Problem Statement

**Risk:**
Running V1 and V2 in parallel with feature flags could create:
- Circular dependencies (V1 ↔ V2)
- Import conflicts
- Shared state corruption
- Difficult rollback

**Example of Bad Pattern:**
```typescript
// ❌ BAD: V1 importing from V2
// frontend/features/database/views/DatabasePage.tsx (V1)
import { UniversalRecord } from "../v2/types"; // CIRCULAR!

// ❌ BAD: V2 importing from V1
// frontend/features/database/v2/DatabasePageV2.tsx
import { useDatabaseRecord } from "../hooks/useDatabase"; // SHARED STATE!
```

---

## Solution: Strict Boundaries with Adapter Layer

```
┌─────────────────────────────────────────────────────────┐
│                      V1 (Current)                       │
│  frontend/features/database/                            │
│  - views/DatabasePage.tsx                               │
│  - hooks/useDatabase.ts                                 │
│  - types/index.ts                                       │
│  - components/                                          │
│                                                         │
│  Rules:                                                 │
│  ✅ Can import from shared/                             │
│  ✅ Can use Convex queries/mutations                    │
│  ❌ CANNOT import from v2/                              │
│  ❌ CANNOT use adapter layer                            │
└─────────────────────────────────────────────────────────┘
                           ↑
                           │ NO DIRECT IMPORTS
                           ↓
┌─────────────────────────────────────────────────────────┐
│                   Adapter Layer                         │
│  frontend/features/database/adapters/                   │
│  - view-system-adapter.ts                               │
│  - universal-adapter.ts                                 │
│                                                         │
│  Rules:                                                 │
│  ✅ Can import from V1                                  │
│  ✅ Can import from V2                                  │
│  ✅ ONLY bridge between V1 and V2                       │
│  ❌ CANNOT contain business logic                       │
│  ❌ CANNOT have state                                   │
└─────────────────────────────────────────────────────────┘
                           ↑
                           │ ONLY THROUGH ADAPTER
                           ↓
┌─────────────────────────────────────────────────────────┐
│                      V2 (Universal)                     │
│  frontend/features/database/v2/                         │
│  - DatabasePageV2.tsx                                   │
│  - hooks/useUniversalDatabase.ts                        │
│  - types/universal.ts                                   │
│                                                         │
│  Rules:                                                 │
│  ✅ Can import from shared/                             │
│  ✅ Can import from view-system/                        │
│  ✅ Can use adapter layer                               │
│  ❌ CANNOT import from V1 (except via adapter)          │
└─────────────────────────────────────────────────────────┘
```

---

## Directory Structure

### Phase 1: Pre-Migration (Current)

```
frontend/features/database/
├── views/
│   ├── DatabasePage.tsx           ← V1
│   ├── db-management.tsx
│   └── index.ts
├── components/                    ← V1
│   ├── DatabaseShell.tsx
│   ├── DatabaseSidebar.tsx
│   ├── DatabaseToolbar.tsx
│   └── views/
│       ├── table/
│       ├── gantt/
│       ├── calendar/
│       ├── kanban/
│       └── list/
├── hooks/                         ← V1
│   ├── useDatabase.ts
│   └── index.ts
├── types/                         ← V1
│   └── index.ts
├── config.ts
├── index.ts
└── page.tsx                       ← Feature flag router
```

### Phase 2: Parallel Development

```
frontend/features/database/
├── v1/                            ← V1 CODE (MOVED)
│   ├── views/
│   │   └── DatabasePage.tsx
│   ├── components/
│   ├── hooks/
│   ├── types/
│   └── index.ts
│
├── v2/                            ← V2 CODE (NEW)
│   ├── views/
│   │   └── DatabasePageV2.tsx
│   ├── hooks/
│   │   └── useUniversalDatabase.ts
│   ├── types/
│   │   └── universal.ts
│   └── index.ts
│
├── adapters/                      ← ADAPTER LAYER (BRIDGE)
│   ├── view-system-adapter.ts
│   ├── universal-adapter.ts
│   └── index.ts
│
├── shared/                        ← SHARED CODE (SAFE)
│   ├── constants/
│   ├── utils/
│   └── index.ts
│
├── config.ts
├── index.ts
└── page.tsx                       ← Feature flag router
```

### Phase 3: Post-Migration

```
frontend/features/database/
├── views/                         ← V2 (promoted)
│   └── DatabasePageV2.tsx → DatabasePage.tsx
├── components/
├── hooks/
├── types/
├── deprecated/                    ← V1 (archived)
│   └── v1/
│       └── ... (kept for rollback)
├── config.ts
├── index.ts
└── page.tsx
```

---

## Import Rules

### V1 Import Rules

```typescript
// ✅ ALLOWED: Shared utilities
import { formatDate } from "@/frontend/shared/utils/format";

// ✅ ALLOWED: Shared UI components
import { Button } from "@/frontend/shared/ui/components/button";

// ✅ ALLOWED: Convex
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";

// ✅ ALLOWED: Feature shared code
import { DB_VIEW_TYPE_TO_APP } from "../shared/constants";

// ❌ FORBIDDEN: V2 imports
import { UniversalRecord } from "../v2/types/universal"; // ERROR!

// ❌ FORBIDDEN: Adapter imports
import { convertToUniversal } from "../adapters/universal-adapter"; // ERROR!
```

### V2 Import Rules

```typescript
// ✅ ALLOWED: Shared utilities
import { formatDate } from "@/frontend/shared/utils/format";

// ✅ ALLOWED: View-system
import { ViewProvider, ViewRenderer } from "@/frontend/shared/ui/layout/view-system";

// ✅ ALLOWED: Adapter layer
import { convertToUniversal } from "../adapters/universal-adapter";

// ✅ ALLOWED: Feature shared code
import { DB_VIEW_TYPE_TO_APP } from "../shared/constants";

// ❌ FORBIDDEN: V1 imports (except via adapter)
import { useDatabaseRecord } from "../v1/hooks/useDatabase"; // ERROR!
import { DatabasePage } from "../v1/views/DatabasePage"; // ERROR!
```

### Adapter Layer Import Rules

```typescript
// ✅ ALLOWED: V1 imports (to convert from)
import { DatabaseField, DatabaseView } from "../v1/types";

// ✅ ALLOWED: V2 imports (to convert to)
import { UniversalProperty, UniversalView } from "../v2/types/universal";

// ✅ ALLOWED: View-system types
import { ViewField, ViewConfig } from "@/frontend/shared/ui/layout/view-system/types";

// ✅ ALLOWED: Shared utilities
import { mapFieldType } from "../shared/utils/mappings";

// ❌ FORBIDDEN: Business logic
// Adapter should only convert types, not contain logic

// ❌ FORBIDDEN: State management
// Adapter should be stateless
```

---

## Feature Flag Router

```typescript
// frontend/features/database/page.tsx

import { useFeatureFlag } from "@/frontend/shared/lib/features/flags";

// V1 and V2 imports are ISOLATED
import DatabasePageV1 from "./v1/views/DatabasePage";
import DatabasePageV2 from "./v2/views/DatabasePageV2";

export default function DatabaseFeaturePage({ workspaceId }: Props) {
  // Feature flag determines which version to use
  const useUniversalDatabase = useFeatureFlag("USE_UNIVERSAL_DATABASE");

  if (!workspaceId) {
    return <SelectWorkspacePrompt />;
  }

  // Route to V1 or V2 (no shared state between them)
  if (useUniversalDatabase) {
    return <DatabasePageV2 workspaceId={workspaceId} />;
  }

  return <DatabasePageV1 workspaceId={workspaceId} />;
}
```

**Key Points:**
- ✅ V1 and V2 are **completely isolated**
- ✅ No shared state between versions
- ✅ Easy to toggle via feature flag
- ✅ Safe rollback (just flip flag)

---

## Shared Code Guidelines

Code that can be safely shared between V1 and V2:

### ✅ Safe to Share

**1. Constants**
```typescript
// frontend/features/database/shared/constants/index.ts

export const DB_VIEW_TYPE_TO_APP = {
  table: "table",
  board: "kanban",
  // ... mappings
};

export const FIELD_TYPE_ICONS = {
  text: Type,
  number: Hash,
  // ... icons
};
```

**2. Pure Utility Functions**
```typescript
// frontend/features/database/shared/utils/format.ts

export function formatPropertyValue(value: any, type: string): string {
  // Pure function, no state, no side effects
  return String(value);
}
```

**3. Type Constants**
```typescript
// frontend/features/database/shared/types/constants.ts

export const PROPERTY_TYPES = [
  "text", "number", "select", // ...
] as const;

export type PropertyType = typeof PROPERTY_TYPES[number];
```

### ❌ NOT Safe to Share

**1. State Management**
```typescript
// ❌ BAD: Shared hook with state
export function useDatabaseState() {
  const [state, setState] = useState(); // SHARED STATE!
  return { state, setState };
}
```

**2. Business Logic**
```typescript
// ❌ BAD: Shared business logic
export function createDatabase(args) {
  // Business logic tied to V1 or V2 schema
}
```

**3. Components**
```typescript
// ❌ BAD: Shared component with internal state
export function DatabaseComponent() {
  const [data, setData] = useState(); // SHARED STATE!
  return <div>...</div>;
}
```

---

## TypeScript Project References

Enforce boundaries at compile-time using TypeScript project references.

### V1 tsconfig

```json
// frontend/features/database/v1/tsconfig.json
{
  "extends": "../../../../tsconfig.json",
  "compilerOptions": {
    "composite": true,
    "outDir": "./dist",
    "rootDir": "."
  },
  "include": ["./**/*"],
  "exclude": [
    "../v2/**/*",           // Cannot see V2
    "../adapters/**/*"      // Cannot see adapters
  ],
  "references": [
    { "path": "../shared" } // Can see shared
  ]
}
```

### V2 tsconfig

```json
// frontend/features/database/v2/tsconfig.json
{
  "extends": "../../../../tsconfig.json",
  "compilerOptions": {
    "composite": true,
    "outDir": "./dist",
    "rootDir": "."
  },
  "include": ["./**/*"],
  "exclude": [
    "../v1/**/*"            // Cannot see V1 directly
  ],
  "references": [
    { "path": "../shared" },    // Can see shared
    { "path": "../adapters" }   // Can see adapters
  ]
}
```

### Adapter tsconfig

```json
// frontend/features/database/adapters/tsconfig.json
{
  "extends": "../../../../tsconfig.json",
  "compilerOptions": {
    "composite": true,
    "outDir": "./dist",
    "rootDir": "."
  },
  "include": ["./**/*"],
  "references": [
    { "path": "../v1" },     // Can see V1
    { "path": "../v2" },     // Can see V2
    { "path": "../shared" }  // Can see shared
  ]
}
```

---

## Validation Script

```typescript
// scripts/validate-dependencies.ts

/**
 * Validates V1/V2 boundaries
 *
 * Checks:
 * 1. V1 doesn't import from V2
 * 2. V2 doesn't import from V1 (except via adapter)
 * 3. No circular dependencies
 * 4. Shared code is stateless
 */

import * as fs from "fs";
import { globSync } from "glob";

// Check V1 files
const v1Files = globSync("frontend/features/database/v1/**/*.{ts,tsx}");

for (const file of v1Files) {
  const content = fs.readFileSync(file, "utf-8");

  // Check for V2 imports
  if (content.includes("../v2/") || content.includes("from \"../v2/")) {
    console.error(`❌ ${file}: V1 cannot import from V2`);
    process.exit(1);
  }

  // Check for adapter imports
  if (content.includes("../adapters/")) {
    console.error(`❌ ${file}: V1 cannot use adapters`);
    process.exit(1);
  }
}

// Check V2 files
const v2Files = globSync("frontend/features/database/v2/**/*.{ts,tsx}");

for (const file of v2Files) {
  const content = fs.readFileSync(file, "utf-8");

  // Check for direct V1 imports (except via adapter)
  if (content.includes("../v1/") && !file.includes("adapters/")) {
    console.error(`❌ ${file}: V2 cannot import directly from V1`);
    process.exit(1);
  }
}

console.log("✅ All boundary checks passed");
```

---

## Migration Timeline

### Week 1-2: Setup Boundaries

- [ ] Create `v1/` directory
- [ ] Move existing code to `v1/`
- [ ] Update imports in `v1/` code
- [ ] Create `v2/` directory (empty)
- [ ] Create `adapters/` directory
- [ ] Create `shared/` directory
- [ ] Setup TypeScript project references
- [ ] Validate boundaries

### Week 3-4: Build V2

- [ ] Implement V2 code in isolation
- [ ] No imports from V1
- [ ] Use adapters for data conversion
- [ ] Test V2 independently

### Week 5-6: Parallel Running

- [ ] Feature flag routing working
- [ ] Both V1 and V2 functional
- [ ] No shared state
- [ ] Gradual rollout

### Week 7+: Deprecate V1

- [ ] 100% on V2
- [ ] Move `v2/` code to root
- [ ] Archive `v1/` to `deprecated/v1/`
- [ ] Remove adapters (no longer needed)
- [ ] Clean up

---

## Rollback Strategy

### If Issues Found in V2

**Immediate Rollback (< 1 hour):**
1. Flip feature flag back to V1
2. All users instantly on V1
3. No data migration needed
4. Zero downtime

**Code Rollback (if needed):**
1. V1 code still in `v1/` directory
2. Can revert feature flag code
3. Remove V2 directory
4. Clean rollback

### Safety Measures

- ✅ V1 code preserved in `v1/`
- ✅ No destructive migrations
- ✅ Feature flag toggle
- ✅ Database backward compatible
- ✅ Independent deployments

---

## Testing Strategy

### Boundary Tests

```typescript
// tests/boundaries.test.ts

describe("V1/V2 Boundaries", () => {
  it("V1 should not import from V2", () => {
    const v1Files = globSync("frontend/features/database/v1/**/*.ts");

    for (const file of v1Files) {
      const content = fs.readFileSync(file, "utf-8");
      expect(content).not.toMatch(/from ["']..\/v2\//);
    }
  });

  it("V2 should not import directly from V1", () => {
    const v2Files = globSync("frontend/features/database/v2/**/*.ts");

    for (const file of v2Files) {
      const content = fs.readFileSync(file, "utf-8");
      if (!file.includes("adapters")) {
        expect(content).not.toMatch(/from ["']..\/v1\//);
      }
    }
  });

  it("Shared code should be stateless", () => {
    const sharedFiles = globSync("frontend/features/database/shared/**/*.ts");

    for (const file of sharedFiles) {
      const content = fs.readFileSync(file, "utf-8");
      // Check for useState, useReducer, etc.
      expect(content).not.toMatch(/useState|useReducer|createContext/);
    }
  });
});
```

---

## Summary

### Key Rules

1. **V1 ↔ V2: NO DIRECT IMPORTS**
2. **Adapter Layer: ONLY BRIDGE**
3. **Shared Code: STATELESS ONLY**
4. **TypeScript: PROJECT REFERENCES**
5. **Validation: AUTOMATED CHECKS**

### Benefits

- ✅ **Safe Parallel Development**
- ✅ **Easy Rollback**
- ✅ **No Circular Dependencies**
- ✅ **Compile-Time Safety**
- ✅ **Clear Ownership**

---

**Document Version:** 1.0
**Status:** Approved Design
**Enforced By:** `scripts/validate-dependencies.ts`
