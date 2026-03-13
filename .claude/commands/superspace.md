---
description: SuperSpace global skill — architecture overview, patterns, and cross-feature tasks
---

# SuperSpace Global Skill

SuperSpace is a Notion-like SaaS platform. **Notion-like** means: workspaces, pages, databases, and a modular feature system.

## Architecture at a Glance

```
frontend/features/{slug}/
├── config.ts          # SSOT: id, name, ui, technical, status, permissions
├── agents/index.ts    # registerXxxAgent() — sub-agent for the feature
├── settings/index.ts  # Feature settings exports
├── init.ts            # registerFeatureSettings() + registerXxxAgent()
└── page.tsx / pages/  # UI entry point

convex/features/{slug}/
├── queries.ts         # Convex queries (RBAC-checked)
├── mutations.ts       # Convex mutations (RBAC + audit log)
└── schema.ts          # Feature-specific Convex schema
```

## Key Patterns

### Auto-Discovery
Features are auto-discovered from `frontend/features/*/config.ts`.
Never hardcode feature lists — always use `defineFeature()`.

### RBAC Levels
```
0 = Owner  | 10 = Admin  | 20 = Manager
30 = Member | 50 = Viewer | 90 = Guest
```
Every Convex mutation must call `checkPermission(ctx, workspaceId, requiredLevel)`.

### Audit Logging
Every mutation must call `logAuditEvent(ctx, { action, workspaceId, entityType, entityId })`.
Never skip this — it's compliance-critical.

### Settings Registration
```ts
// init.ts (module-level)
registerFeatureSettings("feature-slug", () => [
  { id: "...", label: "...", icon: Icon, order: N, component: SettingsComponent }
]);
```

### Agent Registration
```ts
// agents/index.ts
export function registerMyFeatureAgent() {
  subAgentRegistry.register({ id: "...", featureId: "my-feature", ... });
}
```

## Tech Stack
- **Frontend**: Next.js 15 App Router, React 19, TypeScript
- **Backend**: Convex (real-time serverless)
- **UI**: TailwindCSS v4, shadcn/ui, Radix UI
- **Auth**: Clerk
- **Testing**: Vitest + convex-test
- **Package Manager**: pnpm

## Validation Commands
```bash
pnpm run validate:features   # Feature config validation
pnpm run list:features       # List all 35 features
pnpm exec tsc --noEmit       # TypeScript check
pnpm exec vitest run         # All tests
pnpm run analyze:feature studio --save  # Analyze + document a feature
```

## Definition of Done
1. Zod validation on all inputs
2. RBAC checks on all mutations
3. Audit events logged
4. Workspace isolation enforced
5. Tests green
6. No hardcoding
7. Full TypeScript coverage
8. `validate:features` passes

## Task
$ARGUMENTS

If no argument:
1. Run `pnpm run list:features` to see all features
2. Run `pnpm exec tsc --noEmit 2>&1 | head -30` for TS errors
3. Report status
