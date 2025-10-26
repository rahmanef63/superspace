# 1. System Overview

> **Gambaran besar arsitektur, konsep, dan alur kerja SuperSpace**

---

## 🏗️ Arsitektur Sistem

SuperSpace menggunakan **Truly Modular Feature System** dengan **Auto-Discovery** untuk zero-config feature management.

### ✨ New Architecture (Auto-Discovery System)

**Status:** ✅ **IMPLEMENTED** - Sistem baru sudah aktif dan production-ready!

```
┌──────────────────────────────────────────────────────┐
│     frontend/features/*/config.ts                    │
│     (Per-feature config - Auto-discovered!)          │
└─────────────────────┬────────────────────────────────┘
                      │
         ┌────────────┴─────────────┐
         │ lib/features/registry.ts │
         │   (Auto-discovery)       │
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

### 🎯 Key Benefits

**✅ 100% Modular**
- Each feature is completely self-contained in its own folder
- Add feature = create `config.ts` in feature folder (that's it!)
- No need to edit central files

**✅ Zero Manual Registration**
- Auto-discovery via `import.meta.glob` (browser) and `glob` (Node scripts)
- Add 29 features discovered automatically
- No imports, no manual config

**✅ Type-Safe & Validated**
- Single schema via `defineFeature()` helper
- Zod validation for runtime safety
- TypeScript for compile-time safety

**✅ DRY (Don't Repeat Yourself)**
- No duplication between files
- Single source of truth per feature
- Auto-generated aggregations

### Komponen Utama

#### 1. **Feature Config (Per Feature)**

Each feature has `frontend/features/{slug}/config.ts`:

```typescript
import { defineFeature } from '@/lib/features/defineFeature'

export default defineFeature({
  // Basic Info
  id: 'cms',
  name: 'CMS Builder',
  description: 'Build and manage your content',

  // UI Config
  ui: {
    icon: 'Layout',              // Lucide React icon
    path: '/dashboard/cms',
    component: 'CMSBuilderPage',
    category: 'creativity',
    order: 20,
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

  // Optional: Permissions, tags, children
  permissions: ['schemas.create', 'schemas.update'],
  tags: ['cms', 'content', 'builder'],
})
```

#### 2. **Auto-Discovery System**

`lib/features/registry.ts` automatically discovers all feature configs:

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

**✨ Result:** 29 features auto-discovered! No manual maintenance needed.

#### 3. **Scripts (Reorganized)**

All scripts now organized by purpose in `scripts/`:

```
scripts/
├── build/          # Build and dev tools
├── features/       # Feature management (scaffold, sync, generate)
│   ├── scaffold.ts
│   ├── sync.ts
│   ├── generate-manifest.ts
│   └── test-registry.ts
├── validation/     # All validation scripts
├── migration/      # Migration scripts
└── health/         # Health checks
```

**Commands:**
- `pnpm run scaffold:feature {slug}` → Create new feature
- `pnpm run sync:all` → Sync features + generate manifest
- `pnpm run test:registry` → Test auto-discovery system
- `pnpm run validate:all` → Validate all schemas

See [scripts/README.md](../scripts/README.md) for full documentation.

#### 4. **Migration Status**

| Aspect | Old System | New System | Status |
|--------|-----------|------------|--------|
| **Config Location** | `features.config.ts` (root) | `frontend/features/*/config.ts` | ✅ Migrated |
| **Discovery** | Manual editing | Auto-discovery | ✅ Active |
| **Lines of Code** | 933 lines | 230 lines | ✅ 75% reduction |
| **Features** | 29 features | 29 features | ✅ All migrated |
| **Maintenance** | Manual | Zero | ✅ Automated |

**Backward Compatibility:** `features.config.ts` still exists but is now DEPRECATED. All new features should use the per-feature `config.ts` approach.

### 📦 Adding a New Feature (1 Step!)

**Old Way (DEPRECATED):**
1. ❌ Edit `features.config.ts` (add 50+ lines)
2. ❌ Edit `manifest.config.ts` (add import)
3. ❌ Create `manifest.ts` in feature folder
4. ❌ Run sync scripts

**New Way (CURRENT):**
1. ✅ Create `frontend/features/{slug}/config.ts`
2. ✅ Run `pnpm run sync:all`
3. ✅ **DONE!** Auto-discovered and integrated!

**Example:**
```bash
# Create feature folder
mkdir -p frontend/features/analytics

# Create config.ts
cat > frontend/features/analytics/config.ts << 'EOF'
import { defineFeature } from '@/lib/features/defineFeature'

export default defineFeature({
  id: 'analytics',
  name: 'Analytics',
  description: 'Real-time analytics dashboard',

  ui: {
    icon: 'BarChart',
    path: '/dashboard/analytics',
    component: 'AnalyticsPage',
    category: 'analytics',
    order: 15,
  },

  technical: {
    featureType: 'optional',
    hasUI: true,
    hasConvex: true,
    hasTests: true,
    version: '1.0.0',
  },

  status: {
    state: 'stable',
    isReady: true,
  },
})
EOF

# Sync - Done!
pnpm run sync:all
```

That's it! No manual registration, no editing central files. ✨

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

### 5. Layout Architecture

SuperSpace menggunakan **Secondary Sidebar Layout System** untuk UI yang konsisten:

**Location:** `frontend/shared/layout/secondary-sidebar/`

**Komponen Utama:**
- `SecondarySidebarLayout` - Container utama untuk halaman feature
- `SecondarySidebarHeader` - Header dengan title, actions, breadcrumbs, toolbar
- `SecondarySidebarTools` - Toolbar dengan search, sort, filter, view toggle
- `SecondarySidebar` - Navigation sidebar dengan sections dan items
- `MenuPreview` - Preview panel untuk menu items (di `frontend/shared/layout/menus/`)

**Menu Management:**
- Menu Store adalah **feature** di `frontend/features/menu-store/`
- Hanya accessible untuk users dengan `MANAGE_MENUS` permission (Owner & Admin)
- Wrapped dengan `MenuStoreMenuWrapper` untuk access control
- Supports 3 tabs: Installed, Available, Import
- Supports 2 view modes: Tree (dengan preview), Grid

See `frontend/shared/layout/secondary-sidebar/README.md` untuk dokumentasi lengkap.

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

##  Data Flow

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

##  Design Principles

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

## 📁 Folder Structure (Current)

```
frontend/
├── features/                 # ✨ All features (flat structure, auto-discovered)
│   ├── overview/
│   │   ├── config.ts        # ⭐ Feature config (SSOT)
│   │   ├── OverviewPage.tsx
│   │   └── ...
│   ├── chat/
│   │   ├── config.ts        # ⭐ Feature config (SSOT)
│   │   └── ...
│   ├── analytics/
│   │   ├── config.ts        # ⭐ Feature config (SSOT)
│   │   └── ...
│   └── ...                   # 29 features total
│
├── shared/                   # Shared utilities only
│   ├── components/           # Button, Modal, etc.
│   ├── hooks/                # useAuth, useWorkspace
│   ├── layout/               # Layout components
│   │   ├── sidebar/
│   │   ├── secondary-sidebar/
│   │   └── menus/
│   ├── utils/
│   └── manifest/             # Auto-generated manifests
│       └── registry.tsx      # Generated from configs
│
├── lib/
│   └── features/             # ✨ Feature system core
│       ├── defineFeature.ts  # Type-safe feature helper
│       ├── registry.ts       # Auto-discovery (browser)
│       └── registry.server.ts # Auto-discovery (Node)
│
└── views/
    └── manifest.tsx          # Auto-generated

convex/
├── features/                 # Mirror frontend structure
│   ├── overview/
│   ├── chat/
│   ├── analytics/
│   └── ...
│
└── menu/store/
    ├── menu_manifest_data.ts         # Auto-generated
    └── optional_features_catalog.ts  # Auto-generated

scripts/                      # ✨ Reorganized scripts
├── build/                    # Build and dev tools
├── features/                 # Feature management
│   ├── scaffold.ts
│   ├── sync.ts
│   ├── generate-manifest.ts
│   └── test-registry.ts
├── validation/               # All validation scripts
├── migration/                # Migration scripts
└── health/                   # Health checks

docs/                         # Documentation
├── 1_SYSTEM_OVERVIEW.md      # This file!
├── 2_DEVELOPER_GUIDE.md
├── 3_AI_KNOWLEDGE_BASE.md
├── 4_TROUBLESHOOTING.md
├── 5_FEATURE_REFERENCE.md
└── architecture/             # Additional architecture docs
```

**Key Changes:**
- ✨ **Flat feature structure** - No more `default/` and `optional/` subfolders
- ⭐ **Per-feature config.ts** - Single source of truth for each feature
- 🎯 **Auto-discovery** - `lib/features/registry.ts` finds all configs
- 📦 **Organized scripts** - Categorized by purpose in subfolders

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

## Chat Platform Modernization Highlights

- All product chat surfaces now share the `frontend/shared/chat` platform, replacing eight bespoke implementations with one configurable module.
- Nine experiences (workspace, AI, support, projects, documents, CRM, notifications, workflows, comments) ship with the new stack and expose consistent UX patterns.
- Feature visibility is guaranteed through the updated workspace navigation registry and the guarded catch-all route in `app/dashboard/[[...slug]]/page.tsx`.

| Indicator | Previous | Current | Notes |
|-----------|----------|---------|-------|
| Chat-related LOC | ~12,000 | ~3,600 | 70% reduction through consolidation |
| Distinct chat implementations | 8 | 1 shared module | Shared adapters provide Convex integration hooks |
| Feature coverage | Workspace + AI | 9 feature-ready surfaces | Includes Support, Projects, CRM, Notifications, Workflows |
| Time-to-add new chat view | 2-3 weeks | 1-2 hours | Configure presets and reuse shared containers |

See the Developer Guide for migration instructions and the Feature Reference for per-feature usage notes.

---

**Last Updated:** 2025-01-19
