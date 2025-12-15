# 1. System Overview

> **Gambaran besar arsitektur, konsep, dan alur kerja SuperSpace**

**Last Updated:** 2025-11-01

---

## 🏗️ Arsitektur Sistem

SuperSpace menggunakan **Truly Modular Feature System** dengan **Nested Features & Shared Components** untuk maksimum fleksibilitas dan reusability.

### ✨ Modular Architecture

**Status:** ✅ **PRODUCTION READY** - Fully implemented with nested features support!

```
┌──────────────────────────────────────────────────────────┐
│     frontend/features/*/config.ts                        │
│     (Per-feature config - Auto-discovered!)              │
└────────────────────┬─────────────────────────────────────┘
                     │
        ┌────────────┴─────────────┐
        │ lib/features/registry.ts │
        │   (Auto-discovery)       │
        └────────────┬─────────────┘
                     │
     ┌───────────────┴───────────────┐
     │                               │
     ▼                               ▼
┌────────────────┐          ┌────────────────┐
│ Convex Backend │          │    Frontend    │
│                │          │                │
│ • queries      │          │ • components   │
│ • mutations    │          │ • views        │
│ • features/    │          │ • features/    │
│ • shared/      │          │ • shared/      │
└────────────────┘          └────────────────┘
     │                               │
     └───────────────┬───────────────┘
                     │
          ┌──────────┴──────────┐
          │   Workspace UI      │
          │   with Features     │
          └─────────────────────┘
```

---

## 🎯 Key Concepts

### 1. Modular Feature Structure

**Setiap feature bisa memiliki:**
- **config.ts** - Single source of truth
- **components/** - UI components
- **views/** - Page components
- **hooks/** - Custom hooks
- **types/** - TypeScript types
- **settings/** - Feature-specific settings
- **features/** - Sub-features (nested)
- **shared/** - Shared dalam feature

**Example Structure:**
```
frontend/features/{feature-slug}/
├── config.ts              # Feature config (SSOT)
├── components/            # Main components
├── contexts/              # React contexts
├── hooks/                 # Custom hooks
├── settings/              # Feature settings
├── features/              # 🎯 Sub-features
│   └── {sub-feature}/     #    Nested feature
│       ├── components/
│       └── pages/
└── shared/                # 🎯 Shared in feature
    ├── components/
    ├── hooks/
    └── utils/
```

### 2. Nested Features Pattern

Features bisa punya **sub-features** dalam folder `features/`:

```typescript
// Parent feature
frontend/features/{feature-slug}/config.ts

// Sub-features (if needed)
frontend/features/{feature-slug}/features/{sub-feature-1}/
frontend/features/{feature-slug}/features/{sub-feature-2}/
```

### 3. Feature-Level Shared

Setiap feature bisa punya **shared/** untuk komponen yang dipakai internal:

```typescript
// Shared dalam feature
frontend/features/{feature-slug}/shared/
├── components/       // Shared components
├── hooks/            // Shared hooks
└── utils/            // Shared utilities
```

### 4. Global Shared

**`frontend/shared/`** - Shared across ALL features:

```
frontend/shared/
├── builder/              # Builder system (blocks, canvas, etc)
├── communications/       # Chat, notifications, etc
├── context/              # Global contexts
├── foundation/           # Core utilities
├── settings/             # Global settings
│   ├── account/
│   ├── chats/
│   ├── general/
│   ├── notifications/
│   ├── personalization/
│   ├── storage/
│   ├── video-voice/
│   └── workspace/
└── ui/                   # UI components (shadcn/ui)
```

### 5. Convex Mirror Pattern

**Convex backend mirrors frontend structure:**

```
convex/features/{feature_slug}/
├── {domain-1}/
│   └── api/
├── {domain-2}/
│   └── api/
├── features/              # 🎯 Sub-features backend
│   └── api/
└── shared/                # 🎯 Shared dalam feature
    ├── audit.ts
    ├── auth.ts
    └── schema.ts
```

**Global Convex Shared:**
```
convex/shared/             # Shared across ALL features
├── permissions/
├── audit/
└── utils/
```

---

## 🔑 Core Concepts

### 1. Auto-Discovery System

**Zero manual registration:**

```typescript
// Browser (Vite)
const featureModules = import.meta.glob(
  '../../frontend/features/*/config.ts',
  { eager: true }
)

// Node Scripts (tsx)
const configFiles = glob.sync('frontend/features/*/config.ts')

export const FEATURES = Object.values(featureModules)
  .map(m => m.default)
  .sort((a, b) => a.ui.order - b.ui.order)
```

### 2. Feature Types

| Type | Auto-installed | Uninstallable | Usage |
|------|----------------|---------------|-------|
| **default** | ✅ Yes | ❌ No | Core features |
| **optional** | ❌ No | ✅ Yes | Installable features |
| **experimental** | ❌ No | ✅ Yes | Beta features |

### 3. RBAC (Role-Based Access Control)

**Hierarchy:**
```
Owner (level 0)      → Full access
  ↓
Admin (level 10)     → Manage workspace
  ↓
Manager (level 30)   → Manage content
  ↓
Staff (level 50)     → Create content
  ↓
Client (level 70)    → Limited access
  ↓
Guest (level 90)     → Read-only
```

**Permission Check Pattern:**
```typescript
// Every Convex handler MUST check permission
const { membership, role } = await requirePermission(
  ctx,
  args.workspaceId,
  PERMS.VIEW_RESOURCE
)
```

### 4. Audit Logging

**All mutations logged:**
```typescript
await logAuditEvent(ctx, {
  workspaceId: args.workspaceId,
  userId: membership.userId,
  action: "RESOURCE_CREATED",
  resourceType: "resource",
  resourceId: resourceId,
  metadata: { title: args.title },
})
```

---

## 📁 Complete Folder Structure

```
frontend/
├── features/                    # All features (modular)
│   ├── {feature-slug}/
│   │   ├── config.ts           # Feature config (SSOT)
│   │   ├── components/
│   │   ├── shared/             # 🎯 Feature-specific shared
│   │   ├── features/           # 🎯 Nested sub-features
│   │   │   └── {sub-feature}/
│   │   └── settings/           # 🎯 Feature settings
│   └── ...                      # All features
│
├── shared/                      # 🎯 Global shared
│   ├── builder/                 # Builder system
│   │   ├── blocks/
│   │   ├── canvas/
│   │   ├── elements/
│   │   ├── flows/
│   │   ├── inspector/
│   │   ├── library/
│   │   ├── sections/
│   │   └── templates/
│   ├── communications/          # Chat, notifications
│   ├── context/                 # Global contexts
│   ├── foundation/              # Core utilities
│   ├── settings/                # Global settings
│   │   ├── account/
│   │   ├── chats/
│   │   ├── general/
│   │   ├── notifications/
│   │   ├── personalization/
│   │   ├── storage/
│   │   ├── video-voice/
│   │   └── workspace/
│   └── ui/                      # shadcn/ui components
│
└── lib/
    └── features/
        ├── defineFeature.ts     # Type-safe feature helper
        ├── registry.ts          # Auto-discovery (browser)
        └── registry.server.ts   # Auto-discovery (Node)

convex/
├── features/                    # Mirror frontend
│   ├── {feature_slug}/
│   │   ├── {domain}/
│   │   │   └── api/
│   │   ├── features/            # 🎯 Nested sub-features
│   │   │   └── api/
│   │   └── shared/              # 🎯 Feature-shared
│   │       ├── audit.ts
│   │       ├── auth.ts
│   │       └── schema.ts
│   └── ...
│
└── shared/                      # 🎯 Global shared
    ├── permissions/
    ├── audit/
    └── utils/

scripts/
├── build/                       # Build tools
├── features/                    # Feature management
│   ├── scaffold.ts
│   ├── sync.ts
│   └── generate-manifest.ts
├── validation/                  # Validation scripts
└── health/                      # Health checks

docs/
├── 1_SYSTEM_OVERVIEW.md         # This file!
├── 2_DEVELOPER_GUIDE.md
├── 3_MODULAR_ARCHITECTURE.md
├── 4_TROUBLESHOOTING.md
└── 5_FEATURE_REFERENCE.md
```

---

## 🔄 Feature Lifecycle

```
1. PLANNING
   └─> Design feature structure

2. SCAFFOLDING
   └─> pnpm run scaffold:feature {slug}

3. DEVELOPMENT
   ├─> Frontend (components, views, hooks)
   ├─> Backend (queries, mutations, actions)
   ├─> Sub-features (if needed) in features/
   ├─> Shared components in shared/
   ├─> Settings (if needed) in settings/
   ├─> RBAC checks
   └─> Audit logging

4. TESTING
   ├─> Unit tests
   └─> Integration tests

5. SYNC
   └─> pnpm run sync:all

6. VALIDATION
   ├─> pnpm run validate:all
   └─> pnpm test

7. DEPLOYMENT
   ├─> Create PR
   ├─> CI/CD runs
   └─> Merge to main
```

---

## 🛡️ Security Model

### Layer 1: Authentication (Clerk)
- User identity verification
- Session management
- OAuth providers

### Layer 2: Authorization (RBAC)
- Role hierarchy
- Permission sets per role
- Workspace membership validation

### Layer 3: Data Access
```typescript
// Every Convex handler checks:
1. User authenticated? (Clerk)
2. User has workspace membership? (requireActiveMembership)
3. User has required permission? (requirePermission)
4. Log the action (logAuditEvent)
```

### Layer 4: Audit Trail
- All mutations logged
- Immutable activity log
- Forensics & compliance

---

## 🔧 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 15 (App Router) | React framework |
| **Backend** | Convex | Real-time serverless DB |
| **Auth** | Clerk | Authentication |
| **UI** | shadcn/ui + Tailwind CSS | Component library |
| **State** | Zustand | Client state management |
| **Validation** | Zod | Schema validation |
| **Testing** | Vitest + convex-test | Unit & integration tests |
| **Types** | TypeScript | Type safety |

---

## 📖 Lihat Juga

- **[Developer Guide](./2_DEVELOPER_GUIDE.md)** - How to build features
- **[Modular Architecture](./3_MODULAR_ARCHITECTURE.md)** - Detailed patterns
- **[Troubleshooting](./4_TROUBLESHOOTING.md)** - Common issues
- **[Feature Reference](./5_FEATURE_REFERENCE.md)** - Feature catalog

---

**Last Updated:** 2025-11-01
