# SuperSpace - AI Context

> **Copy-paste this to any AI agent for instant project understanding**

---

## Project Overview

**SuperSpace** = Notion-like modular SaaS platform

| Stack | Version |
|-------|---------|
| Frontend | Next.js 15 (App Router) + React 19 |
| Backend | Convex (real-time serverless DB) |
| Auth | Clerk (auth + billing) |
| UI | TailwindCSS v4 + shadcn/ui |
| Validation | TypeScript + Zod |

**Status (December 2025):** 19/19 Dynamic Menus ✅ | 721 tests passing

---

## 🔴 Critical Rules (NEVER BREAK)

1. **Zero Hardcoding** - Use auto-discovery from `frontend/features/*/config.ts`
2. **RBAC Mandatory** - Every handler: `requirePermission(ctx, workspaceId, 'perm')`
3. **Audit Required** - Every mutation: `logAuditEvent(ctx, {...})`
4. **Feature Structure** - Every feature MUST have `agents/` and `settings/` folders

---

## Feature Structure (WAJIB)

```
frontend/features/{slug}/
├── config.ts           # Single Source of Truth
├── agents/             # 🔴 WAJIB - AI agent registration
│   └── index.ts
├── settings/           # 🔴 WAJIB - Feature settings UI
│   ├── XxxSettings.tsx
│   └── useXxxSettings.ts
├── components/
├── hooks/
├── init.ts
└── page.tsx

convex/features/{convexSlug}/
├── queries.ts
├── mutations.ts
├── agents/             # 🔴 WAJIB - Server-side tools
└── schema.ts
```

---

## Convex Mutation Pattern (6-Step)

```typescript
export const create = mutation({
  args: { workspaceId: v.id('workspaces'), title: v.string() },
  handler: async (ctx, args) => {
    // 1. Permission check (FIRST)
    const { membership } = await requirePermission(ctx, args.workspaceId, 'resource.create')
    // 2. Validate input
    if (!args.title) throw new Error('Title required')
    // 3. Business logic
    const id = await ctx.db.insert('resources', {...})
    // 4. Audit log (LAST)
    await logAuditEvent(ctx, { action: 'RESOURCE_CREATED', ... })
    return id
  }
})
```

---

## Key Files

| File | Purpose |
|------|---------|
| `PROJECT_STATUS.md` | Quick project status |
| `docs/00_BASE_KNOWLEDGE.md` | Essential developer knowledge |
| `docs/features/00-ROADMAP.md` | All 19 features & roadmap |
| `docs/rules/01-FEATURE-RULES.md` | Development rules |
| `docs/rules/02-MUTATION-GUIDE.md` | Convex patterns |

---

## Dev Commands

```bash
pnpm dev                    # Next.js :3000
npx convex dev              # Convex backend
pnpm run create:feature X   # Create feature
pnpm run sync:all           # Sync features
pnpm test                   # Run tests
```

---

## ❌ Don't Do

- Hardcode feature lists
- Skip permission checks
- Skip audit logging
- Edit generated files (registry.ts, manifest)
- Create features without agents/ and settings/

## ✅ Always Do

- Use `requirePermission()` on all handlers
- Use `logAuditEvent()` on all mutations  
- Validate with Zod
- Run `pnpm run sync:all` after config changes

---

**Last Updated:** 2025-12-15

