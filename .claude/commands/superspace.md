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

## ⚠️ Critical Error Patterns (session-learned)

### React Context: "must be used within Provider" errors
**Cause**: Using a context hook in a component that renders ABOVE or OUTSIDE the provider.
**Example**: `useThreeColumnLayout()` called in `StudioGlobalHeader` which renders above `<ThreeColumnLayoutAdvanced>`.
**Fix pattern**: Lift state up to the parent that owns both the provider and the consumer component. Pass state as regular props. Never call context hooks outside their provider boundary.

### Markdown rendered as raw text
**Fix**: Use `react-markdown` + `remark-gfm`. Static `.md` files must be in `public/` directory for Next.js static serving.

### Inspector style changes not visible in preview
**Cause**: Widget `render()` functions may not apply all CSS props from `data.props`. The Renderer wrapper div was not applying styles.
**Fix**: Add `propsToStyle(props)` helper in Renderer to convert inspector-controlled props (color, fontSize, padding, etc.) into inline CSS on the wrapper div.

### "pin node" / state stored but never consumed
**Pattern**: Always trace the full data flow — storing state (e.g., `pinnedIds`) is not enough. Find every consumer and ensure the state is passed/used (e.g., as `rootId` on `<Renderer>`).

### Empty callback stubs in JSX
**Pattern**: `onOpen={() => {}}` — always wire callbacks to actual handlers. Empty stubs make features silently non-functional.

## Task
$ARGUMENTS

If no argument:
1. Run `pnpm run list:features` to see all features
2. Run `pnpm exec tsc --noEmit 2>&1 | head -30` for TS errors
3. Report status
