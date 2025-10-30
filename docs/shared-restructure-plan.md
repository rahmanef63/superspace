# 🏗️ Frontend Shared Restructure Plan

**Date**: 2025-10-29
**Status**: Planning
**Estimated Effort**: 1-2 days
**Risk Level**: Medium (329 files, 55+ feature imports)

---

## 📋 Executive Summary

Restructure `frontend/shared/` from flat structure into domain-based subfolders to improve:
- **Clarity**: Clear domain boundaries
- **Maintainability**: Easier to find related code
- **Migration Path**: Foundation for future domain-driven architecture
- **Import Control**: Facade pattern prevents deep imports

---

## 🎯 Goals

### Primary Goals
1. ✅ Organize 329 shared files into 5 domain folders
2. ✅ Create facade exports (`index.ts`) for each domain
3. ✅ Enable path aliases: `@/frontend/shared/builder`, `@/frontend/shared/ui`, etc.
4. ✅ Prevent deep imports via lint rules
5. ✅ Zero breaking changes to feature imports

### Secondary Goals
1. Document domain boundaries clearly
2. Establish patterns for future migrations
3. Set foundation for full domain-driven design

---

## 🗺️ Current Structure Analysis

### Current State
```
frontend/shared/
├── auth/              (16 files)
├── blocks/            (4 files)
├── canvas/            (13 files)
├── chat/              (87 files) ⚠️ Should be in communications
├── components/        (120+ files)
├── elements/          (3 files)
├── flows/             (2 files)
├── hooks/             (8 files)
├── icons/             (5 files)
├── layout/            (45 files)
├── lib/               (25 files)
├── manifest/          (2 files)
├── registry/          (2 files)
├── sections/          (3 files)
├── settings/          (30 files)
├── templates/         (2 files)
├── types/             (8 files)
```

**Total**: 329 files across 17 top-level directories

### Import Analysis
- **55+ files** in `frontend/features/` import from `@/frontend/shared/`
- **High risk**: Chat, Canvas, Settings, Components
- **Need**: Import validation tests before migration

---

## 🎨 Target Structure

### New Domain-Based Structure

```
frontend/shared/
├── builder/                    # Canvas, Inspector, Templates
│   ├── canvas/
│   │   ├── core/              (SharedCanvasProvider, DnD, hooks)
│   │   └── nodes/             (BaseNode, DatabaseNode, etc.)
│   ├── inspector/
│   │   ├── CompositeInspector.tsx
│   │   ├── SmartInspector.tsx
│   │   ├── DynamicInspector.tsx
│   │   └── controls/          (Property controls)
│   ├── library/
│   │   └── TemplateLibrary.tsx
│   ├── blocks/                (Block components)
│   ├── elements/              (Form elements)
│   ├── sections/              (Section components)
│   ├── templates/             (Template components)
│   ├── flows/                 (Flow components)
│   └── index.ts               # 🎯 FACADE

├── settings/                   # Settings, Registry, Menus
│   ├── account/
│   ├── general/
│   ├── help/
│   ├── notifications/
│   ├── personalization/
│   ├── shortcuts/
│   ├── storage/
│   ├── video-voice/
│   ├── workspace/
│   ├── components/            (Settings UI components)
│   ├── hooks/                 (Settings hooks)
│   ├── registry/
│   │   └── featureSettingsRegistry.ts
│   ├── menus/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   └── types/
│   └── index.ts               # 🎯 FACADE

├── communications/             # Chat, Comments, Collaboration
│   ├── chat/
│   │   ├── components/        (87 files from current shared/chat)
│   │   ├── hooks/
│   │   ├── types/
│   │   ├── config/
│   │   ├── constants/
│   │   └── lib/
│   ├── comments/
│   │   └── components/
│   ├── collaboration/
│   │   └── components/
│   ├── notifications/
│   │   ├── api/
│   │   └── components/
│   └── index.ts               # 🎯 FACADE

├── ui/                         # Generic UI Components
│   ├── Badge/
│   ├── Button/
│   ├── Card/
│   ├── Container/
│   ├── Image/
│   ├── Input/
│   ├── Label/
│   ├── Text/
│   ├── Textarea/
│   ├── navigation/
│   ├── data-display/
│   ├── loading/
│   ├── error/
│   ├── pages/
│   ├── preview/
│   ├── charts/
│   ├── controls/
│   ├── performance/
│   ├── assets/
│   ├── user/
│   ├── shadcn/                (from components/ui/)
│   ├── icons/
│   ├── sidebar/               (from layout/sidebar/)
│   ├── view/                  (from layout/view/)
│   └── index.ts               # 🎯 FACADE

├── foundation/                 # Utils, Hooks, Types, Auth
│   ├── auth/
│   │   ├── components/
│   │   └── hooks/
│   ├── hooks/                 (Generic hooks)
│   ├── utils/
│   │   ├── converters/
│   │   ├── errors/
│   │   ├── export/
│   │   ├── import/
│   │   ├── grouping/
│   │   ├── validation/
│   │   ├── registry/
│   │   └── componentFactory.ts
│   ├── types/                 (Shared types)
│   ├── manifest/
│   └── index.ts               # 🎯 FACADE
```

---

## 📦 Domain Mappings

### 1. `shared/builder/` Domain
**Purpose**: All canvas/editor building functionality

**Includes**:
- `canvas/*` → `builder/canvas/`
- `components/inspector/*` → `builder/inspector/`
- `components/library/*` → `builder/library/`
- `components/canvas/*` → `builder/canvas/ui/`
- `blocks/*` → `builder/blocks/`
- `elements/*` → `builder/elements/`
- `sections/*` → `builder/sections/`
- `templates/*` → `builder/templates/`
- `flows/*` → `builder/flows/`

**Facade Exports** (`builder/index.ts`):
```typescript
// Canvas
export * from './canvas/core'
export * from './canvas/nodes'

// Inspector
export { SmartInspector } from './inspector/SmartInspector'
export { CompositeInspector } from './inspector/CompositeInspector'
export { DynamicInspector } from './inspector/DynamicInspector'

// Library
export { TemplateLibrary } from './library/TemplateLibrary'
export type { TemplateProvider } from './library/TemplateLibrary'

// Building blocks
export * from './blocks'
export * from './elements'
export * from './sections'
export * from './templates'
export * from './flows'
```

**Usage**:
```typescript
// ✅ Allowed
import { SharedCanvasProvider, SmartInspector, TemplateLibrary } from '@/frontend/shared/builder'

// ❌ Blocked by lint
import { SharedCanvasProvider } from '@/frontend/shared/builder'
```

---

### 2. `shared/settings/` Domain
**Purpose**: Settings pages, registry, menu system, theming

**Includes**:
- `settings/*` → `settings/pages/`
- `lib/registry/*` → `settings/registry/`
- `layout/menus/*` → `settings/menus/`

**Facade Exports** (`settings/index.ts`):
```typescript
// Registry
export {
  registerFeatureSettings,
  getFeatureSettingsBuilder
} from './registry/featureSettingsRegistry'

// Settings pages
export { WorkspaceSettings } from './pages/workspace/WorkspaceSettings'
export { AccountSettings } from './pages/account/AccountSettings'
export { GeneralSettings } from './pages/general/GeneralSettings'
// ... other settings

// Menu system
export * from './menus/context'
export * from './menus/hooks'
export type * from './menus/types'

// Settings hooks
export { useWorkspaceSettings } from './hooks/useWorkspaceSettings'
```

**Usage**:
```typescript
// ✅ Allowed
import { registerFeatureSettings, WorkspaceSettings } from '@/frontend/shared/settings'

// ❌ Blocked
import { registerFeatureSettings } from '@/frontend/shared/settings/registry/featureSettingsRegistry'
```

---

### 3. `shared/communications/` Domain
**Purpose**: Real-time communications (chat, comments, notifications)

**Includes**:
- `chat/*` → `communications/chat/`
- `components/comments/*` → `communications/comments/`
- `components/collaboration/*` → `communications/collaboration/`
- `layout/notifications/*` → `communications/notifications/`

**Facade Exports** (`communications/index.ts`):
```typescript
// Chat
export { ChatContainer } from './chat/components/ChatContainer'
export { ChatComposer } from './chat/components/ChatComposer'
export { ChatMessage } from './chat/components/ChatMessage'
export { ChatSidebar } from './chat/components/ChatSidebar'
export { useChatState } from './chat/hooks/useChatState'
export type * from './chat/types'

// Comments
export { CommentsPanel } from './comments/components/CommentsPanel'

// Collaboration
export { CollaborationCursor } from './collaboration/components/CollaborationCursor'

// Notifications
export { NotificationBell } from './notifications/components/NotificationBell'
export { NotificationFeed } from './notifications/components/NotificationFeed'
```

**Usage**:
```typescript
// ✅ Allowed
import { ChatContainer, ChatSidebar, useChatState } from '@/frontend/shared/communications'

// ❌ Blocked
import { ChatContainer } from '@/frontend/shared/communications/components/ChatContainer'
```

---

### 4. `shared/ui/` Domain
**Purpose**: Generic, reusable UI components (no business logic)

**Includes**:
- `components/Badge/*` → `ui/Badge/`
- `components/Button/*` → `ui/Button/`
- `components/Card/*` → `ui/Card/`
- `components/Container/*` → `ui/Container/`
- `components/Image/*` → `ui/Image/`
- `components/Input/*` → `ui/Input/`
- `components/Label/*` → `ui/Label/`
- `components/Text/*` → `ui/Text/`
- `components/Textarea/*` → `ui/Textarea/`
- `components/ui/*` → `ui/shadcn/` (shadcn components)
- `components/navigation/*` → `ui/navigation/`
- `components/data-display/*` → `ui/data-display/`
- `components/loading/*` → `ui/loading/`
- `components/error/*` → `ui/error/`
- `components/pages/*` → `ui/pages/`
- `components/preview/*` → `ui/preview/`
- `components/charts/*` → `ui/charts/`
- `components/controls/*` → `ui/controls/`
- `components/performance/*` → `ui/performance/`
- `components/assets/*` → `ui/assets/`
- `components/user/*` → `ui/user/`
- `components/icons/*` → `ui/icons/`
- `icons/*` → `ui/icons/`
- `layout/sidebar/*` → `ui/sidebar/`
- `layout/view/*` → `ui/view/`

**Facade Exports** (`ui/index.ts`):
```typescript
// Basic components
export { TextComponent } from './Text/Text.component'
export { ContainerComponent } from './Container/Container.component'
export { ImageComponent } from './Image/Image.component'
export { ButtonComponent } from './Button/Button.component'
export { CardComponent } from './Card/Card.component'
export { InputComponent } from './Input/Input.component'
export { LabelComponent } from './Label/Label.component'
export { TextareaComponent } from './Textarea/Textarea.component'
export { BadgeComponent } from './Badge/Badge.component'

// Shadcn UI
export * from './shadcn/ui/button'
export * from './shadcn/ui/card'
export * from './shadcn/ui/input'
// ... other shadcn exports

// Layout components
export { Sidebar } from './sidebar/Sidebar'
export { Navigation } from './navigation/Navigation'

// Data display
export { DataTable } from './data-display/table/DataTable'

// Loading/Error
export { LoadingSpinner } from './loading/LoadingSpinner'
export { ErrorBoundary } from './error/ErrorBoundary'

// Icons
export * from './icons'
```

**Usage**:
```typescript
// ✅ Allowed
import { TextComponent, ContainerComponent, Button } from '@/frontend/shared/ui'

// ❌ Blocked
import { TextComponent } from '@/frontend/shared/ui/Text/Text.component'
```

---

### 5. `shared/foundation/` Domain
**Purpose**: Core utilities, hooks, types, authentication (foundational layer)

**Includes**:
- `auth/*` → `foundation/auth/`
- `hooks/*` → `foundation/hooks/`
- `lib/converters/*` → `foundation/utils/converters/`
- `lib/errors/*` → `foundation/utils/errors/`
- `lib/export/*` → `foundation/utils/export/`
- `lib/import/*` → `foundation/utils/import/`
- `lib/grouping/*` → `foundation/utils/grouping/`
- `lib/validation/*` → `foundation/utils/validation/`
- `lib/registry/*` → `foundation/utils/registry/`
- `components/utils/*` → `foundation/utils/`
- `types/*` → `foundation/types/`
- `manifest/*` → `foundation/manifest/`
- `registry/*` → `foundation/registry/`

**Facade Exports** (`foundation/index.ts`):
```typescript
// Auth
export { AuthModal } from './auth/components/AuthModal'
export { SignInForm } from './auth/components/SignInForm'
export { useAuthed } from './auth/hooks/useAuthed'

// Hooks
export { useDebounce } from './hooks/useDebounce'
export { useLocalStorage } from './hooks/useLocalStorage'
export { useMediaQuery } from './hooks/useMediaQuery'
// ... other hooks

// Utils
export * from './utils/converters'
export * from './utils/errors'
export * from './utils/export'
export * from './utils/import'
export * from './utils/grouping'
export * from './utils/validation'
export * from './utils/registry'
export { createComponent } from './utils/componentFactory'

// Types
export type * from './types'

// Registry
export { RegistryLoader } from './registry/RegistryLoader'
```

**Usage**:
```typescript
// ✅ Allowed
import { useDebounce, createComponent, AuthModal } from '@/frontend/shared/foundation'

// ❌ Blocked
import { useDebounce } from '@/frontend/shared/foundation/hooks/useDebounce'
```

---

## 🔧 Implementation Strategy

### Phase 1: Preparation (Day 1 Morning)
**Duration**: 2-3 hours

1. ✅ **Create this plan document**
2. ✅ **Create import validation tests**
   - Test suite: `tests/shared/import-validation.test.ts`
   - Validates all 55+ feature imports work correctly
   - Baseline before migration
3. ✅ **Backup current state**
   - Git commit current working state
   - Tag: `pre-shared-restructure`

### Phase 2: Create New Structure (Day 1 Afternoon)
**Duration**: 3-4 hours

1. **Create domain folders**
   ```bash
   mkdir -p frontend/shared/builder/{canvas,inspector,library,blocks,elements,sections,templates,flows}
   mkdir -p frontend/shared/settings/{pages,registry,menus,components,hooks}
   mkdir -p frontend/shared/communications/{chat,comments,collaboration,notifications}
   mkdir -p frontend/shared/ui/{Badge,Button,Card,Container,Image,Input,Label,Text,Textarea,shadcn,navigation,data-display,loading,error,pages,preview,charts,controls,performance,assets,user,icons,sidebar,view}
   mkdir -p frontend/shared/foundation/{auth,hooks,utils,types,manifest,registry}
   ```

2. **Move files to new locations**
   - Use git mv to preserve history
   - Follow domain mappings above
   - Keep folder-by-folder for safety

3. **Create facade index.ts files**
   - `builder/index.ts`
   - `settings/index.ts`
   - `communications/index.ts`
   - `ui/index.ts`
   - `foundation/index.ts`

### Phase 3: Update Path Aliases (Day 1 Evening)
**Duration**: 1 hour

1. **Update `tsconfig.json`**
   ```json
   {
     "compilerOptions": {
       "paths": {
         "@/frontend/shared/builder": ["./frontend/shared/builder/index.ts"],
         "@/frontend/shared/builder/*": ["./frontend/shared/builder/*"],
         "@/frontend/shared/settings": ["./frontend/shared/settings/index.ts"],
         "@/frontend/shared/settings/*": ["./frontend/shared/settings/*"],
         "@/frontend/shared/communications": ["./frontend/shared/communications/index.ts"],
         "@/frontend/shared/communications/*": ["./frontend/shared/communications/*"],
         "@/frontend/shared/ui": ["./frontend/shared/ui/index.ts"],
         "@/frontend/shared/ui/*": ["./frontend/shared/ui/*"],
         "@/frontend/shared/foundation": ["./frontend/shared/foundation/index.ts"],
         "@/frontend/shared/foundation/*": ["./frontend/shared/foundation/*"]
       }
     }
   }
   ```

2. **Update `next.config.js` (if needed)**

### Phase 4: Update Imports (Day 2 Morning)
**Duration**: 3-4 hours

1. **Automated find/replace for common patterns**
   ```bash
   # Example: Update chat imports
   find frontend/features -type f -name "*.tsx" -o -name "*.ts" | \
     xargs sed -i "s|@/frontend/shared/chat/|@/frontend/shared/communications|g"
   ```

2. **Manual verification of complex imports**
   - Focus on 55+ files identified earlier
   - Update one feature at a time
   - Test after each feature

3. **Update internal shared imports**
   - Files within shared/ importing from other shared domains
   - Must use facade imports

### Phase 5: Add Lint Rules (Day 2 Afternoon)
**Duration**: 1-2 hours

1. **ESLint rule to prevent deep imports**
   - Create custom rule or use `no-restricted-imports`
   - Block imports like `@/frontend/shared/builder/canvas/core/...`
   - Allow only facade imports: `@/frontend/shared/builder`

2. **Add to `.eslintrc.js`**
   ```javascript
   module.exports = {
     rules: {
       'no-restricted-imports': ['error', {
         patterns: [
           {
             group: ['@/frontend/shared/builder/*/*'],
             message: 'Use facade import: @/frontend/shared/builder'
           },
           {
             group: ['@/frontend/shared/settings/*/*'],
             message: 'Use facade import: @/frontend/shared/settings'
           },
           {
             group: ['@/frontend/shared/communications/*/*'],
             message: 'Use facade import: @/frontend/shared/communications'
           },
           {
             group: ['@/frontend/shared/ui/*/*'],
             message: 'Use facade import: @/frontend/shared/ui'
           },
           {
             group: ['@/frontend/shared/foundation/*/*'],
             message: 'Use facade import: @/frontend/shared/foundation'
           }
         ]
       }]
     }
   }
   ```

### Phase 6: Testing & Validation (Day 2 Evening)
**Duration**: 2-3 hours

1. ✅ **Run import validation tests**
   - All 55+ feature imports should pass
   - Compare with baseline from Phase 1

2. ✅ **Run full test suite**
   - `pnpm test`
   - All existing tests must pass
   - No regressions

3. ✅ **Manual smoke testing**
   - Test CMS builder (heavy canvas usage)
   - Test workspace settings (settings domain)
   - Test chat (communications domain)
   - Test UI components

4. ✅ **TypeScript compilation**
   - `pnpm build`
   - No type errors

---

## ✅ Success Criteria

### Must Pass (Blocking)
- [ ] All 92 existing tests pass
- [ ] All 55+ feature imports work correctly
- [ ] TypeScript builds without errors
- [ ] No runtime errors in dev mode
- [ ] Import validation tests pass

### Should Pass (High Priority)
- [ ] ESLint rules enforce facade imports
- [ ] All facade exports properly typed
- [ ] Documentation updated
- [ ] Zero deep imports from features

### Nice to Have
- [ ] Performance metrics unchanged
- [ ] Bundle size unchanged or improved
- [ ] Developer experience improved

---

## 🚨 Risk Assessment

### High Risks

1. **Breaking Feature Imports (55+ files)**
   - **Mitigation**: Import validation tests, incremental migration
   - **Rollback**: Git revert to `pre-shared-restructure` tag

2. **Circular Dependencies**
   - **Mitigation**: Domain boundaries prevent cross-domain imports
   - **Detection**: TypeScript compilation will fail

3. **Missing Exports in Facades**
   - **Mitigation**: Gradual facade building, test after each
   - **Detection**: Import errors during testing

### Medium Risks

1. **Type Resolution Issues**
   - **Mitigation**: Explicit type exports in facades
   - **Detection**: TypeScript compiler

2. **Build Configuration Issues**
   - **Mitigation**: Test build after path alias updates
   - **Detection**: Build failures

### Low Risks

1. **Performance Impact**
   - **Mitigation**: Re-exports are optimized by bundler
   - **Detection**: Bundle analysis

---

## 📚 Documentation Updates

### Files to Update

1. **README.md** in each domain folder
   - Explain domain purpose
   - List main exports
   - Usage examples

2. **docs/INTEGRATION_GUIDE.md**
   - Update import examples
   - Add section on domain structure
   - Migration guide for existing code

3. **Component documentation**
   - Update all import paths in examples

---

## 🔄 Rollback Plan

If critical issues found:

1. **Immediate Rollback**
   ```bash
   git reset --hard pre-shared-restructure
   ```

2. **Partial Rollback**
   - Keep new structure
   - Revert problematic imports
   - Fix issues incrementally

3. **Post-Rollback Actions**
   - Document what went wrong
   - Update plan
   - Retry with fixes

---

## 📊 Progress Tracking

### Checklist

**Phase 1: Preparation**
- [ ] Plan document created
- [ ] Import validation tests created
- [ ] Baseline test results recorded
- [ ] Git tagged `pre-shared-restructure`

**Phase 2: Structure Creation**
- [ ] Domain folders created
- [ ] Files moved to new locations
- [ ] Facade `index.ts` files created
- [ ] All facades export correctly

**Phase 3: Path Aliases**
- [ ] `tsconfig.json` updated
- [ ] Build configuration updated
- [ ] TypeScript resolves new paths

**Phase 4: Import Updates**
- [ ] Feature imports updated (55+ files)
- [ ] Internal shared imports updated
- [ ] All imports resolve correctly

**Phase 5: Lint Rules**
- [ ] ESLint rules added
- [ ] Deep import patterns blocked
- [ ] Lint passes on all files

**Phase 6: Testing**
- [ ] Import validation tests pass
- [ ] Full test suite passes (92 tests)
- [ ] TypeScript builds successfully
- [ ] Manual smoke tests pass
- [ ] No regressions detected

---

## 📝 Notes

### Design Decisions

1. **Why 5 domains?**
   - Balance between too granular and too coarse
   - Aligns with actual usage patterns
   - Prepares for future domain-driven design

2. **Why facade pattern?**
   - Simplifies imports for consumers
   - Allows internal refactoring without breaking changes
   - Enforces clean API boundaries
   - Foundation for future module federation

3. **Why keep flat structure within domains initially?**
   - Minimize file moves in first iteration
   - Reduce risk of breaking imports
   - Can further organize within domains later

### Future Improvements

1. **Domain-Driven Design (DDD)**
   - Each domain becomes independent module
   - Could extract to separate packages
   - Enables micro-frontend architecture

2. **Module Federation**
   - Shared domains as federated modules
   - Load on demand
   - Share across multiple apps

3. **Stricter Boundaries**
   - Prevent cross-domain imports
   - Each domain has clear interface
   - Easier testing and maintenance

---

## 🎯 Next Steps After Completion

1. **Monitor for Issues**
   - Watch for import errors in production
   - Monitor bundle size
   - Check performance metrics

2. **Developer Education**
   - Team meeting to explain new structure
   - Update onboarding docs
   - Code review guidelines

3. **Continuous Improvement**
   - Refine facade exports based on usage
   - Add missing exports as needed
   - Further organize within domains

---

**Document Version**: 1.0
**Last Updated**: 2025-10-29
**Owner**: Development Team
**Status**: Pending Agent Alpha Review
