# Project Guardrails (SuperSpace / Convex)

## 🎯 **Project Overview**
**SuperSpace** adalah Notion-like SaaS platform dengan arsitektur modular yang sungguhan. Built dengan Next.js 15, Convex, dan React 19. Project ini memiliki **28+ features** yang auto-discovered dengan zero hardcoding.

## 🛠️ **Tech Stack**
- **Frontend:** Next.js 15 (App Router), React 19, TypeScript
- **Backend:** Convex (real-time serverless database)
- **UI:** TailwindCSS v4, shadcn/ui, Radix UI
- **Auth:** Clerk (authentication + billing)
- **State:** Zustand + Jotai
- **Validation:** Zod
- **Testing:** Vitest + convex-test
- **Package Manager:** pnpm

## 🏗️ **Arsitektur Core**
- **Auto-Discovery System:** Features dari `frontend/features/*/config.ts` (100% zero hardcoding)
- **Three-Tier Sharing:** Global → Feature → Local
- **RBAC:** Permission hierarchy (0=Owner → 90=Guest)
- **Audit Logging:** Immutable logs untuk compliance
- **Universal Database:** 21 property types, 10 view layouts

## 🚫 **Rules (DILARANG)**
- Ganti arsitektur RBAC/Convex
- Hapus atau bypass audit logging
- Hardcode feature registration
- Skip permission checks
- Lupakan Zod validation

## ✅ **Definition of Done (DoD)**
1. Zod validation untuk semua inputs
2. RBAC & permission checks diterapkan
3. Audit event dicatat
4. Workspace isolation enforced
5. Tests hijau (unit + integration)
6. Tidak ada hardcoding
7. Auto-discovery system digunakan
8. Full TypeScript coverage
9. Validation scripts pass
10. CI snippet siap

## 📁 **Sumber Kebenaran**
- **Schema:** `convex/schema.ts`
- **Core:** `convex/workspace/*`, `convex/user/*`, `convex/menu/*`, `convex/components/*`
- **Validation:** `scripts/validate-*.ts`
- **Tests:** `tests/*.test.ts`
- **Feature Config:** `frontend/features/*/config.ts`

## Feature Analysis & Documentation

### Available Scripts

#### 1. Feature Analyzer (`analyze:feature`)
Script untuk menganalisis dan mendokumentasikan features secara detail.

**Location:** `scripts/features/analyze-feature.ts`

**Usage:**
```bash
# Direct analysis (console only)
pnpm run analyze:feature <feature-name>

# Interactive selection (keyboard up/down)
pnpm run analyze:feature --list

# Save to docs/features/ with date prefix
pnpm run analyze:feature <feature-name> --save

# Custom output location
pnpm run analyze:feature <feature-name> --save --output path/to/file.md
```

**Output:**
- Console: Detailed analysis di terminal
- File: `docs/features/{YYYY-MM-DD}-{feature-id}.md` (dengan --save)

**Analysis Includes:**
- Basic info (ID, name, description, category, status, version)
- Capabilities (UI, Convex, Tests, Settings, Permissions/RBAC)
- Frontend structure (components, hooks, stores, types)
- Convex backend (queries, mutations, actions dengan file locations)
- Dependencies & exports

**Examples:**
```bash
pnpm run analyze:feature chat --save
pnpm run analyze:feature cms --list
pnpm run analyze:feature --list  # Interactive mode
```

#### 2. Other Feature Scripts

- `list:features` - List all registered features
- `create:feature` - Create new feature scaffolding
- `sync:features` - Sync features with registry
- `validate:features` - Validate feature configurations

### Feature Registry System

Features are auto-discovered from `frontend/features/*/config.ts` files. Each feature defines:
- UI metadata (icon, path, component, category, order)
- Technical specs (featureType, hasUI, hasConvex, hasTests, version)
- Status (state, isReady)
- Permissions for RBAC

**Registry Location:** `lib/features/registry.server.ts`

### Documentation Location

All generated feature documentation is stored in:
```
docs/features/
├── 2025-10-27-cms.md
├── 2025-10-27-chat.md
└── {date}-{feature-id}.md
```

### When to Use

- **Before modifying a feature:** Run analyzer untuk understand struktur lengkap
- **Documentation updates:** Use `--save` untuk generate/update docs
- **Onboarding new developers:** Share docs/features/ untuk feature overview
- **Architecture reviews:** Analyze semua features untuk consistency check
