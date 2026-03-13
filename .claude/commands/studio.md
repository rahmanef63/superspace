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
- **Docs**: `public/docs/studio-json-template.md` — served statically, shown in StudioDocsDialog with react-markdown

## Canvas Node Types

| Type | File | Purpose |
|------|------|---------|
| `shadcnNode` | `ui/slices/canvas/components/ShadcnNode.tsx` | All UI widgets |
| `groupNode` | `ui/slices/canvas/components/GroupNode.tsx` | SketchUp-style groups |
| `automationNode` | `components/AutomationNode.tsx` | Workflow nodes |

## Group / Focus Mode (SketchUp-style components)

- **Group**: Select 2+ nodes → header "Group" button → creates `groupNode` wrapping them via edges
- **Ungroup**: GroupNode "Ungroup" button → dissolves group, children independent
- **Enter Group / Focus Mode**: GroupNode "Enter" button → `focusedGroupId` set → canvas shows focus banner, preview renders group subtree
- **Save as Block**: GroupNode "Save Block" → marks `savedAsBlock: true` in props
- **Context API**: `groupSelectedNodes()`, `ungroupNode(id)`, `enterGroup(id)`, `exitGroup()`, `focusedGroupId`

## Pin Node → Preview

- `pin(id)` / `unpin(id)` stores in `pinnedIds[]`
- `StudioPage` passes `rootId={pinnedIds[0] ?? focusedGroupId ?? null}` to `<Renderer>`
- Renderer with `rootId` renders only that node's subtree (no sidebar/nav)
- Pinned banner shown in preview with Unpin button

## Inspector Flow

- `StudioRightPanel` always uses `<InspectorTabs>` (3 tabs: Properties / Layers / AI)
- `DynamicInspector` renders widget-specific `WidgetConfig.inspector.fields` at top
- **Style props are applied in Renderer wrapper div** via `propsToStyle()` — changes to fontFamily, color, padding etc. are immediately visible in preview
- `ChildrenManager` (Layers tab): reorder, detach, Explode layout blocks

## Project Settings (localStorage)

- Key: `studio-project-settings` → `{ name, description, author }`
- "Save as Template" saves canvas JSON schema to TemplateLibrary localStorage
- Template key: `cms-asset-templates`

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
See `docs/studio-json-template.md` (also served at `/docs/studio-json-template.md`) for full schema + AI prompt template.

### Fix inspector fields
- `InspectorField` type in `frontend/features/studio/ui/types/index.ts`
- Fields added to `WidgetConfig.inspector.fields` auto-render in the Properties tab
- Style overrides (color, fontSize, etc.) are applied via `propsToStyle()` in Renderer

## ⚠️ Known Error Patterns (don't repeat these)

### 1. `useThreeColumnLayout must be used within ThreeColumnLayoutAdvanced`
**Cause**: Calling `useThreeColumnLayout()` in a component that renders ABOVE `<ThreeColumnLayoutAdvanced>` in the tree.
**Fix**: Lift collapse state to the parent (`StudioPage`), pass as controlled props (`leftCollapsed`, `rightCollapsed`, `onLeftCollapsedChange`, `onRightCollapsedChange`) to `ThreeColumnLayoutAdvanced`, and pass as regular props to the header component.
**Never**: Call `useThreeColumnLayout()` outside the `ThreeColumnLayoutAdvanced` provider.

### 2. Docs dialog shows raw markdown/broken HTML
**Cause**: Rendering markdown in `<pre>` tag without a parser.
**Fix**: Use `react-markdown` + `remark-gfm`. File must be in `public/docs/` for static fetch.

### 3. Inspector style changes don't appear in preview
**Cause**: Inspector saves props to `data.props` but Renderer wrapper div ignores them.
**Fix**: `propsToStyle(p)` in `Renderer.tsx` converts props to inline CSS on the wrapper div.

### 4. Pin node doesn't filter preview
**Cause**: `pinnedIds` state existed but was never passed to Renderer as `rootId`.
**Fix**: `rootId={pinnedIds[0] ?? focusedGroupId ?? null}` on `<Renderer>`.

## File Structure
```
frontend/features/studio/
├── config.ts              # hasConvex: true, hasUI: true
├── agents/index.ts        # registerStudioAgent()
├── settings/index.ts      # Builder + Automation + LLM settings
├── init.ts                # registerFeatureSettings + registerStudioAgent
├── pages/StudioPage.tsx   # Main layout (group state, pin, focus mode)
├── views/header/StudioGlobalHeader.tsx  # Single-row toolbar (group/focus buttons)
├── views/StudioLeftPanel.tsx   # Library / Templates / Settings (localStorage)
├── views/StudioRightPanel.tsx  # InspectorTabs (Properties/Layers/AI)
├── ui/widgets/registry.ts # cmsWidgetRegistry (54+ widgets)
├── ui/slices/canvas/components/
│   ├── ShadcnNode.tsx     # UI widget canvas node
│   └── GroupNode.tsx      # Group/component node (focus mode, ungroup, save as block)
├── ui/slices/renderer/    # Live JSON → React renderer (propsToStyle applied here)
├── workflow/nodes/        # 26+ automation node manifests
├── components/StudioDocsDialog.tsx  # JSON schema docs (react-markdown)
└── registry/studioRegistry.ts      # Unified component registry
```

## Steps for this task
$ARGUMENTS

If no argument given:
1. Run `pnpm exec tsc --noEmit 2>&1 | grep "studio"` to find TS errors
2. Run studio tests: `pnpm exec vitest run frontend/features/studio`
3. Report any issues found
