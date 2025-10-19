# 1. System Overview

> **Gambaran besar arsitektur, konsep, dan alur kerja SuperSpace**

---

## 🏗️ Arsitektur Sistem

SuperSpace menggunakan **Feature Package System** dengan **Single Source of Truth** di `features.config.ts`.

```
┌──────────────────────────────────────────────────────┐
│              features.config.ts                      │
│          (Single Source of Truth)                    │
└─────────────────────┬────────────────────────────────┘
                      │
         ┌────────────┴─────────────┐
         │    pnpm run sync:all     │
         └────────────┬─────────────┘
                      │
      ┌───────────────┴───────────────┐
      │                               │
      ▼                               ▼
┌─────────────────┐          ┌──────────────────┐
│ Convex Backend  │          │    Frontend      │
│                 │          │                  │
│ • menu_manifest │          │ • manifest.tsx   │
│ • catalog       │          │ • lazy imports   │
└─────────────────┘          └──────────────────┘
      │                               │
      └───────────────┬───────────────┘
                      │
            ┌─────────┴──────────┐
            │   Workspace UI     │
            │   with Menus       │
            └────────────────────┘
```

### Komponen Utama

1. **`features.config.ts`**
   - Definisi semua fitur (default & optional)
   - Metadata lengkap (name, slug, icon, permissions, dll)
   - Satu-satunya file yang perlu diedit manual

2. **Scripts Auto-Generation**
   - `sync-features.ts` → Generate Convex manifests
   - `generate-manifest.ts` → Generate React component registry
   - `sync:all` → Jalankan keduanya sekaligus

3. **Feature Packages**
   - Frontend: `frontend/features/{default|optional}/{slug}/`
   - Backend: `convex/features/{slug}/`
   - Tests: `tests/features/{slug}/`

---

## 🔑 Konsep Kunci

### 1. Feature Types

| Type | Auto-installed | Uninstallable | Lokasi | Contoh |
|------|----------------|---------------|--------|--------|
| **default** | ✅ Ya | ❌ Tidak | `features/default/` | Overview, WA, Members |
| **optional** | ❌ Tidak | ✅ Ya | `features/optional/` | Reports, Calendar, Tasks |
| **experimental** | ❌ Tidak | ✅ Ya | `features/optional/` | Beta features |

### 2. RBAC (Role-Based Access Control)

**Hierarchy Roles:**
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
// Setiap query/mutation wajib cek permission
const { membership, role } = await requirePermission(
  ctx,
  args.workspaceId,
  PERMS.VIEW_REPORTS
)
```

### 3. Audit Logging

Semua mutations dicatat dalam `activityEvents` table:
- **WHO**: User yang melakukan aksi
- **WHAT**: Aksi yang dilakukan
- **WHEN**: Timestamp
- **WHERE**: Workspace context
- **CHANGES**: Data diff (before/after)

```typescript
await logAuditEvent(ctx, {
  workspaceId: args.workspaceId,
  userId: membership.userId,
  action: "REPORT_CREATED",
  resourceType: "report",
  resourceId: reportId,
  metadata: { title: args.title },
})
```

### 4. Feature Status System

Features punya status development:

| Status | Meaning | UI Behavior |
|--------|---------|-------------|
| `stable` | Production-ready | Normal |
| `beta` | Testing phase | Badge "Beta" |
| `development` | Under development | "Feature Not Ready" UI |
| `experimental` | Proof of concept | Hidden dari catalog |
| `deprecated` | Sunset soon | Warning message |

**Configuration:**
```typescript
{
  slug: "reports",
  status: "development",
  isReady: false,
  expectedRelease: "Q1 2025",
}
```

---

## 🔄 Feature Lifecycle

```
1. PLANNING
   └─> Define metadata di features.config.ts

2. SCAFFOLDING
   └─> pnpm run scaffold:feature {slug}

3. DEVELOPMENT
   ├─> Implementasi Frontend (React)
   ├─> Implementasi Backend (Convex)
   ├─> Tambah RBAC checks
   └─> Tambah Audit logging

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

8. PRODUCTION
   └─> Feature tersedia (default) atau di Menu Store (optional)
```

---

## 📊 Data Flow

### Creating a Workspace

```
User creates workspace
       │
       ▼
createWorkspace() mutation
       │
       ├─> Insert workspace record
       ├─> Create default roles (Owner, Admin, Staff, Guest)
       ├─> Create workspace membership (user as Owner)
       ├─> Create default menu set
       └─> Call createDefaultMenuItems()
              │
              └─> Install all "default" features from manifest
                     │
                     ▼
              Workspace ready with navigation!
```

### Installing Optional Feature

```
User browses Menu Store
       │
       ▼
getAvailableFeatureMenus()
       │
       └─> Returns features with featureType="optional"
              │
              ▼
User clicks "Install"
       │
       ▼
installFeatureMenus({ featureSlugs: ["reports"] })
       │
       ├─> Check RBAC (MANAGE_MENUS permission)
       ├─> Validate feature exists in catalog
       ├─> Insert menu item to workspace
       ├─> Apply role restrictions
       └─> Return menuItemId
              │
              ▼
Feature appears in sidebar!
```

---

## 🛡️ Security Model

### Layer 1: Authentication (Clerk)
- User identity verification
- Session management
- OAuth providers

### Layer 2: Authorization (RBAC)
- Role hierarchy (Owner → Admin → ... → Guest)
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

## 🎯 Design Principles

1. **DRY (Don't Repeat Yourself)**
   - Single source of truth: `features.config.ts`
   - Auto-generate everything else

2. **Type Safety**
   - Zod schemas for validation
   - TypeScript for type checking
   - Runtime + compile-time safety

3. **Self-Contained Features**
   - Each feature = independent package
   - Clear boundaries
   - Easy to add/remove

4. **Permission-First**
   - RBAC checks di setiap endpoint
   - Principle of least privilege
   - Audit everything

5. **Developer Experience**
   - CLI tools for common tasks
   - Auto-scaffolding
   - Clear documentation

---

## 📁 Folder Structure (Recommended)

```
frontend/
├── features/
│   ├── default/              # Core features (always installed)
│   │   ├── overview/
│   │   ├── chat/
│   │   ├── members/
│   │   ├── friends/
│   │   ├── pages/
│   │   ├── databases/
│   │   ├── canvas/
│   │   ├── menus/
│   │   ├── invitations/
│   │   ├── profile/
│   │   └── settings/
│   │
│   └── optional/             # Marketplace features
│       ├── chat/
│       ├── documents/
│       ├── calendar/
│       ├── reports/
│       ├── tasks/
│       └── wiki/
│
└── shared/                   # Shared utilities only
    ├── components/           # Button, Modal, etc.
    ├── hooks/                # useAuth, useWorkspace
    ├── utils/
    └── pages/
        └── manifest.tsx      # Auto-generated

convex/
├── features/                 # Mirror frontend structure
│   ├── overview/
│   ├── chat/
│   ├── documents/
│   └── ...
│
└── menu/store/
    ├── menu_manifest_data.ts         # Auto-generated
    └── optional_features_catalog.ts  # Auto-generated
```

---

## 🔧 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 15 (App Router) | React framework |
| **Backend** | Convex | Real-time serverless DB |
| **Auth** | Clerk + @convex-dev/auth | Authentication |
| **UI** | shadcn/ui + Tailwind CSS | Component library |
| **State** | Zustand | Client state management |
| **Validation** | Zod | Schema validation |
| **Testing** | Vitest + convex-test | Unit & integration tests |
| **Types** | TypeScript | Type safety |

---

## 📖 Lihat Juga

- **[Developer Guide](./2_DEVELOPER_GUIDE.md)** - How to build features
- **[AI Knowledge Base](./3_AI_KNOWLEDGE_BASE.md)** - Technical details
- **[Troubleshooting](./4_TROUBLESHOOTING.md)** - Common issues

---

**Last Updated:** 2025-01-19
