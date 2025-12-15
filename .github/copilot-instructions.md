# Copilot Instructions (SuperSpace)

> **Last Updated:** December 15, 2025

## Project Overview

**SuperSpace** is a Notion-like modular SaaS platform.

**Status (December 2025):**
- **19/19 Dynamic Menus** ✅ Complete
- **Universal Database** ✅ 7 views, 20+ property types, 721 tests
- **All Core Systems** ✅ CRM, CMS, Projects, Helpdesk, Accounting, HR, Inventory

## Tech Stack

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript
- **Backend:** Convex (real-time serverless database)
- **UI:** TailwindCSS v4, shadcn/ui, Radix UI
- **Auth:** Clerk (authentication + billing)
- **State:** Zustand + Jotai
- **Validation:** Zod
- **Testing:** Vitest + convex-test
- **Package Manager:** pnpm

## Architecture

- **Modular Features:** `frontend/features/<slug>/` + `convex/features/<slug>/`
- **Auto-Discovery:** Features from `frontend/features/*/config.ts` (zero hardcoding)
- **Three-Tier Sharing:** Global (`shared/`) → Feature (`<feature>/shared/`) → Local
- **RBAC:** Permission hierarchy (0=Owner → 90=Guest)
- **Audit Logging:** All mutations logged for compliance

## Critical Conventions (DON'T BREAK)

1. **Zero hardcoding** of feature lists outside feature folders
2. **Single source of truth:** `frontend/features/<slug>/config.ts`
3. **RBAC mandatory:** Every query/mutation must check permissions
4. **Audit required:** Every mutation must log audit event
5. **Auto-discovery:** Use registry APIs, not manual registration
6. **Don't edit generated files:**
   - `lib/features/registry.ts`
   - `frontend/shared/foundation/manifest/registry.tsx`

## Feature Structure (WAJIB)

Every feature MUST have `agents/` and `settings/` folders:

```
frontend/features/{slug}/
├── config.ts           # SSOT
├── agents/             # 🔴 WAJIB - AI agent registration
│   └── index.ts        # registerXxxAgent()
├── settings/           # 🔴 WAJIB - Feature settings
│   ├── index.ts
│   ├── XxxSettings.tsx
│   └── useXxxSettings.ts
├── components/
├── hooks/
├── init.ts
└── page.tsx

convex/features/{slug}/
├── queries.ts
├── mutations.ts
├── agents/             # 🔴 WAJIB - Server-side tool handlers
└── schema.ts
```

## Dev Workflows

```bash
# Install & Run
pnpm install
pnpm dev                    # Next.js on :3000
npx convex dev              # Convex backend

# Validation
pnpm run sync:all           # Sync features + generate registry
pnpm run validate:all       # Zod schema validation
pnpm run precommit          # Lint + validate + tests

# Feature Management
pnpm run create:feature <slug>
pnpm run edit:feature <slug>
pnpm run delete:feature <slug>
pnpm run analyze:feature <slug> --save

# Testing
pnpm test
pnpm test:coverage
```

## Convex Backend Rules

1. **Schema:** Composed in `convex/schema.ts` via `featureTables`
2. **Permissions:** Use helpers from `convex/auth/helpers.ts`
3. **Audit:** Use `logAuditEvent` from `convex/shared/audit.ts`

```typescript
// Standard mutation pattern
export const create = mutation({
  args: { workspaceId: v.id('workspaces'), ... },
  handler: async (ctx, args) => {
    // 1. Permission check
    await requirePermission(ctx, args.workspaceId, 'resource.create')
    // 2. Business logic
    const id = await ctx.db.insert('table', { ... })
    // 3. Audit log
    await logAuditEvent(ctx, { ... })
    return id
  }
})
```

## Key Documentation

| File | Purpose |
|------|---------|
| `docs/00_BASE_KNOWLEDGE.md` | Essential developer knowledge |
| `docs/features/00-ROADMAP.md` | All 19 features status |
| `docs/rules/01-FEATURE-RULES.md` | Development rules |
| `docs/rules/02-MUTATION-GUIDE.md` | Convex patterns |
| `PROJECT_STATUS.md` | Quick project status |

## Auth & Webhooks

- **Middleware:** `middleware.ts` protects `/dashboard(.*)`
- **Providers:** `app/layout.tsx` (`SafeClerkProvider` + `ConvexClientProvider`)
- **Webhooks:** `convex/http.ts` at `/clerk-users-webhook`
