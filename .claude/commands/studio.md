---
description: Studio visual builder skill — analyze, fix, and extend Studio components
---

# Studio Feature Skill

You are working on the **Studio** feature — SuperSpace's unified visual builder combining UI design (CMS Builder) and workflow automation into one canvas.

## Key Architecture

- **Mode**: `ui` | `workflow` | `unified`
- **Widget Registry**: `frontend/features/studio/ui/widgets/registry.ts` — all widgets as `WidgetConfig` with `render()` + `inspector.fields`
- **Node Registry**: `frontend/features/studio/workflow/nodes/registry.ts` — 26+ automation nodes
- **JSON Schema**: Schema v0.4 — `{ version, root, nodes: { id: { type, props, children } } }`
- **Renderer**: `frontend/features/studio/ui/slices/renderer/components/Renderer.tsx`
- **Inspector**: `frontend/shared/builder/inspector/` — DynamicInspector + InspectorTabs (Properties / Layers / AI)
- **Library**: `frontend/shared/builder/library/UnifiedLibrary.tsx`
- **Header**: `frontend/features/studio/views/header/StudioGlobalHeader.tsx` — single unified toolbar
- **Settings**: `frontend/features/studio/settings/` — Builder + Automation + LLM settings

## Common Tasks

### Add a new widget
1. Create `frontend/features/studio/ui/widgets/[category]/[name]/manifest.tsx` with `WidgetConfig`
2. Register it in `frontend/features/studio/ui/widgets/registry.ts`
3. Test: TypeScript check + run `pnpm run validate:features`

### Add a new automation node
1. Create `frontend/features/studio/workflow/nodes/[category]/[name]/manifest.ts` with `NodeManifest`
2. Export from `frontend/features/studio/workflow/nodes/[category]/index.ts`
3. Add to `allNodeManifests` in `frontend/features/studio/workflow/nodes/registry.ts`

### Add a new block
1. Create `frontend/features/studio/ui/widgets/blocks/[Name]/[Name]Block.tsx`
2. Create `manifest.tsx` in same folder
3. Register in `registry.ts` with key `[name]Block`
4. Export from `blocks/index.ts`

### Generate a Studio JSON layout
See `docs/studio-json-template.md` for full schema reference and AI prompt template.

### Fix inspector fields
Inspector fields follow `InspectorField` type from `frontend/shared/foundation`.
Use `createCustomField()` from `standardFields.ts` for convenience.

## File Structure
```
frontend/features/studio/
├── config.ts              # hasConvex: true, hasUI: true
├── agents/index.ts        # registerStudioAgent()
├── settings/index.ts      # Builder + Automation + LLM settings
├── init.ts                # registerFeatureSettings + registerStudioAgent
├── pages/StudioPage.tsx   # Main layout
├── views/header/StudioGlobalHeader.tsx  # Single-row toolbar
├── views/StudioLeftPanel.tsx   # Library / Templates / Settings panel
├── views/StudioRightPanel.tsx  # Inspector panel
├── ui/widgets/registry.ts # cmsWidgetRegistry (89+ widgets)
├── ui/slices/renderer/    # Live JSON → React renderer
├── workflow/nodes/        # 26+ automation node manifests
├── components/StudioDocsDialog.tsx  # JSON schema docs dialog
└── registry/studioRegistry.ts      # Unified component registry
```

## Steps for this task
$ARGUMENTS

If no argument given:
1. Run `pnpm exec tsc --noEmit 2>&1 | grep "studio"` to find TS errors
2. Run studio tests: `pnpm exec vitest run frontend/features/studio`
3. Report any issues found
