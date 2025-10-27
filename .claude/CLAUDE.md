# Project Guardrails (SuperSpace / Convex)
- Stack: Next.js (App Router), Convex (DB utama), shadcn/ui, Zustand.
- Prinsip: **RBAC ketat**, **audit logging**, **validasi Zod**, **tests hijau**.
- Dilarang: ganti arsitektur RBAC/Convex; hapus audit; bypass permission.
- Sumber kebenaran:
  - convex/workspace/*, convex/menu/*, convex/components/*, convex/user/*, convex/schema.ts
  - scripts/validate-*.ts, tests/*.test.ts
- Pipeline:
  - `/validate:workspace`, `/validate:settings`, `/validate:document`, `/validate:role`, `/validate:conversation`
  - `/test` untuk semua integration/unit tests
- Definition of Done (DoD) untuk semua agen:
  1) Skema tervalidasi (Zod script OK)
  2) RBAC & permission checks diterapkan
  3) Audit event dicatat
  4) Tests hijau (unit+integration)
  5) CI snippet siap

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
