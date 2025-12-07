# SuperSpace Project Quick Reference

## 🚀 **One-Liner**
Notion-like SaaS platform dengan 28+ auto-discovered features, built on Next.js 15 + Convex.

## 📋 **Quick Commands**

### Feature Management
```bash
pnpm run create:feature <slug>     # Buat feature baru
pnpm run analyze:feature <slug>    # Analisis feature
pnpm run analyze:feature --list    # Interactive selection
pnpm run list:features             # List semua features
pnpm run sync:all                  # Sync manifests
```

### Validation & Testing
```bash
pnpm run validate:all              # Validasi semuanya
pnpm run validate:features         # Validasi feature configs
pnpm run validate:permissions      # Check RBAC
pnpm run validate:audit           # Check audit logs
pnpm test                          # Run semua tests
```

### Development
```bash
pnpm dev                          # Start dev server
pnpm build                        # Build untuk production
pnpm lint                         # Lint code
pnpm type-check                   # TypeScript check
```

## 🏗️ **Project Structure**

```
├── app/                         # Next.js routes
│   ├── (landing)/              # Marketing pages
│   ├── (cms)/                  # CMS pages
│   └── dashboard/              # Main app
├── frontend/
│   ├── features/               # 🔥 Auto-discovered features
│   └── shared/                 # Global shared components
├── convex/
│   ├── features/               # Backend implementations
│   └── shared/                 # Shared utilities
├── docs/                       # 📚 Comprehensive docs
└── scripts/                    # Build & validation tools
```

## 🎯 **Key Concepts**

### Auto-Discovery System
- Features di `frontend/features/*/config.ts`
- Zero hardcoding - 100% dynamic
- Registry di `lib/features/registry.server.ts`

### Feature Structure
```
frontend/features/{slug}/
├── config.ts                  # SSOT (Single Source of Truth)
├── components/                # UI components
├── hooks/                     # Custom hooks
├── features/                  # Sub-features
└── shared/                    # Feature-level shared

convex/features/{slug}/
├── queries.ts                 # Read operations
├── mutations.ts               # Write operations
├── schema.ts                  # DB schema
└── actions.ts                 # Complex operations
```

### RBAC Hierarchy
```
0    Owner      (Full access)
10   Admin      (Almost full)
30   Manager    (Team management)
50   Staff      (Operational)
70   Client     (Read/write own)
90   Guest      (Read-only)
```

## 🔥 **Active Features (28+)**
- AI, Analytics, Chat, CMS-Lite, Database, Documents
- Members, Projects, Tasks, Universal Database
- Property System (21 types), View System (10 layouts)
- Filter System, Feature CRUD, dll

## 📝 **Mutation Pattern (6 Steps)**
1. Permission check
2. Input validation (Zod)
3. Workspace verification
4. User authentication
5. Business logic
6. Audit logging

## 🚨 **Critical Rules**
- ❌ NO hardcoding features
- ✅ ALWAYS check permissions
- ✅ ALWAYS log mutations
- ✅ ALWAYS validate inputs
- ✅ ALWAYS write tests

## 📚 **Essential Docs**
1. `docs/00_BASE_KNOWLEDGE.md` - Must read first
2. `docs/1-core/1_SYSTEM_OVERVIEW.md` - Architecture
3. `docs/2-rules/FEATURE_RULES.md` - Development rules
4. `docs/5-features/FEATURE_REGISTRY_SYSTEM.md` - Feature system

## 🎨 **UI Components**
- Built on shadcn/ui + Radix UI
- TailwindCSS v4 styling
- Responsive, mobile-first
- Dark mode support

## 🔧 **Debugging Tips**
- Check `convex/_generated/api.d.ts` untuk generated types
- Use `/validate:all` untuk comprehensive check
- Feature config errors → coba `pnpm run sync:all`
- RBAC issues → check permission hierarchy

## 💡 **Pro Tips**
- Use `analyze:feature --save` untuk dokumentasi
- Check `docs/features/` untuk feature analysis
- Always run `validate:all` sebelum commit
- Use feature templates untuk consistency