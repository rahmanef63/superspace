# SuperSpace Project Instructions

> Instructions for Gemini AI when working with the SuperSpace codebase

## Project Overview

**SuperSpace** is a modular SaaS platform built with:
- **Next.js 15** (App Router) + React 19
- **Convex** (real-time serverless database)
- **Clerk** (authentication + billing)
- **TailwindCSS v4** + **shadcn/ui**
- **TypeScript** + **Zod** validation

**Status (December 2025):**
- 19/19 Dynamic Menus ✅ Complete
- Universal Database ✅ 7 views, 20+ property types, 721 tests
- All Core Systems ✅ CRM, CMS, Projects, Helpdesk, Accounting, HR, BI

---

## Critical Rules (MUST FOLLOW)

### 1. Zero Hardcoding
- **NEVER** hardcode feature lists or registration outside feature folders
- Use auto-discovery from `frontend/features/*/config.ts`
- Use registry APIs from `lib/features/registry.ts`

### 2. Single Source of Truth
- Each feature has ONE config: `frontend/features/{slug}/config.ts`
- DO NOT duplicate feature information elsewhere

### 3. RBAC Mandatory
- EVERY Convex query/mutation MUST check permissions
- Use `requirePermission(ctx, workspaceId, 'permission.name')`

### 4. Audit Logging
- EVERY mutation MUST log audit events
- Use `logAuditEvent(ctx, { ... })`

### 5. Zod Validation
- ALL inputs must be validated with Zod schemas

---

## File Structure

### Feature Structure (WAJIB)

Every feature MUST have `agents/` and `settings/` folders:

```
frontend/features/{slug}/
├── config.ts           # SSOT - Single Source of Truth
├── agents/             # 🔴 WAJIB - AI agent registration
│   └── index.ts        # registerXxxAgent() function
├── settings/           # 🔴 WAJIB - Feature settings
│   ├── index.ts
│   ├── XxxSettings.tsx
│   └── useXxxSettings.ts
├── components/
├── hooks/
├── views/
├── init.ts             # Feature initialization
└── page.tsx

convex/features/{slug}/
├── queries.ts
├── mutations.ts
├── schema.ts
├── agents/             # 🔴 WAJIB - Server-side tool handlers
└── shared/
```

### agents/ Pattern
```typescript
import { subAgentRegistry } from "@/frontend/features/ai/agents"
export function registerXxxAgent() {
  subAgentRegistry.register({
    id: "xxx-agent",
    name: "Xxx Agent",
    featureId: "xxx",
    tools: [/* ... */],
    canHandle: (query) => query.includes("xxx") ? 0.5 : 0,
  }, { priority: 5, enabled: true })
}
```

### settings/ Pattern
- `index.ts` - Re-exports all settings
- `XxxSettings.tsx` - Settings UI component
- `useXxxSettings.ts` - Settings hook for persistence

---

## Convex Mutation Pattern

EVERY mutation follows this 6-step pattern:

```typescript
export const create = mutation({
  args: { workspaceId: v.id('workspaces'), title: v.string() },
  handler: async (ctx, args) => {
    // 1. Permission check (FIRST)
    const { membership } = await requirePermission(ctx, args.workspaceId, 'resource.create')
    
    // 2. Input validation
    if (!args.title) throw new Error('Title required')
    
    // 3. Business logic
    const id = await ctx.db.insert('resources', { ... })
    
    // 4. Audit log (LAST)
    await logAuditEvent(ctx, { action: 'RESOURCE_CREATED', ... })
    
    return id
  }
})
```

---

## Dev Commands

```bash
# Development
pnpm dev                    # Next.js on :3000
npx convex dev              # Convex backend

# Feature Management
pnpm run create:feature {slug}
pnpm run sync:all           # Sync features

# Validation
pnpm run validate:all       # Validate schemas
pnpm test                   # Run tests
```

---

## Documentation

| File | Purpose |
|------|---------|
| `docs/00_BASE_KNOWLEDGE.md` | Essential knowledge |
| `docs/features/00-ROADMAP.md` | All 19 features |
| `docs/rules/01-FEATURE-RULES.md` | Development rules |
| `docs/rules/02-MUTATION-GUIDE.md` | Convex patterns |
| `PROJECT_STATUS.md` | Quick status |

---

## Don't Do

- ❌ Hardcode feature lists
- ❌ Skip permission checks
- ❌ Skip audit logging
- ❌ Create circular imports
- ❌ Bypass auto-discovery system
- ❌ Edit generated files (registry.ts, manifest)

## Always Do

- ✅ Use `requirePermission()` on all handlers
- ✅ Use `logAuditEvent()` on all mutations
- ✅ Validate inputs with Zod
- ✅ Use TypeScript with proper types
- ✅ Follow three-tier sharing model
- ✅ Run `pnpm run sync:all` after config changes

---

**Last Updated:** 2025-12-15
