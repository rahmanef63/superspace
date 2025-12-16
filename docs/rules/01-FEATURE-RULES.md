# Feature Management Rules

> **Strict Rules for Feature Development**
> **Last Updated:** 2025-01-20

---

## 🚨 Golden Rules (NEVER VIOLATE)

### Rule #1: Zero Hardcoding Outside Feature Folders

**❌ FORBIDDEN:**
- Hardcoding feature lists outside of `frontend/features/*/`, `convex/features/*/`, or `tests/features/*/`
- Manual feature registration in central config files
- Hardcoded component imports in scripts or manifests
- Hardcoded feature IDs in validation or test files
- Hardcoded navigation items outside feature configs

**✅ ALLOWED:**
- Feature-specific code in `frontend/features/{slug}/`
- Feature-specific backend in `convex/features/{slug}/`
- Feature-specific tests in `tests/features/{slug}/`
- Navigation definitions in `config.ts` (using `navigation` property)

**Why:** Hardcoding creates maintenance burden, bugs, and violates DRY principles. Every hardcoded reference is a future breaking point.

---

### Rule #2: Single Source of Truth - config.ts

**Each feature has EXACTLY ONE source of truth:**
```
frontend/features/{slug}/config.ts
```

**This file defines:**
- Feature metadata (id, name, description)
- UI configuration (icon, path, component, order)
- Navigation (route, aliases, patterns)
- Technical specs (type, version, dependencies)
- Status (state, isReady)
- Permissions (required permissions array)
- Tags and categories

**❌ DO NOT:**
- Duplicate feature information in other files
- Create separate configuration files for the same feature
- Store feature metadata in databases or external files

**✅ DO:**
- Edit `config.ts` for ALL feature changes
- Use `pnpm run edit:feature {slug}` to modify configs
- Let auto-discovery system propagate changes

---

### Rule #3: 100% Auto-Discovery

**All features MUST be auto-discovered:**

```typescript
// ✅ CORRECT: Auto-discovery via glob
const featureModules = import.meta.glob('../../frontend/features/*/config.ts', { eager: true })
const features = Object.values(featureModules).map(m => m.default)

// ❌ WRONG: Manual imports
import feature1 from '@/frontend/features/feature1/config'
import feature2 from '@/frontend/features/feature2/config'
const features = [feature1, feature2]
```

**Auto-discovery systems:**
- Browser: `lib/features/registry.ts` (uses `import.meta.glob`)
- Node.js: `lib/features/registry.server.ts` (uses `glob.sync`)

**Why:** Manual imports create maintenance overhead and break when features are added/removed.

---

### Rule #4: Dynamic Everything

**ALL feature references must be dynamic:**

**❌ WRONG (Hardcoded):**
```typescript
const COMPONENT_MAP = {
  'analytics': '@/frontend/features/analytics/page',
  'calendar': '@/frontend/features/calendar/page',
  // ... 50 more hardcoded entries
}
```

**✅ CORRECT (Dynamic):**
```typescript
function getComponentPath(slug: string, component: string) {
  const possiblePaths = [
    `frontend/features/${slug}/views/${component}.tsx`,
    `frontend/features/${slug}/page.tsx`,
    `frontend/features/${slug}/index.tsx`,
  ]
  return possiblePaths.find(p => existsSync(join(rootDir, p)))
}
```

**Why:** Dynamic resolution works for ALL features (current and future) without modification.

---

### Rule #5: CRUD Operations Only

**To manage features, use ONLY these commands:**

```bash
# CREATE
pnpm run create:feature {slug} --type {optional|default|system} --category {category}

# READ
pnpm run list:features
pnpm run list:features --type optional --category analytics

# UPDATE
pnpm run edit:feature {slug}
pnpm run edit:feature {slug} --maintenance --backup

# DELETE
pnpm run delete:feature {slug} --archive --confirm
```

**❌ DO NOT:**
- Manually edit `features.config.ts` (DELETED)
- Manually edit `manifest.config.ts` (DELETED)
- Manually edit generated files
- Bypass the CRUD system

**✅ DO:**
- Use CRUD commands for all feature management
- Run `pnpm run sync:all` after changes
- Validate with `pnpm run validate:features`

---

## 📁 Where Features Can Be Mentioned

### ✅ ALLOWED Locations

#### 1. Feature-Specific Folders
```
frontend/features/{slug}/
├── config.ts           ✅ Single source of truth
├── page.tsx            ✅ Feature implementation
├── components/         ✅ Feature components
├── hooks/              ✅ Feature hooks
└── api/                ✅ Feature API adapters

convex/features/{slug}/
├── index.ts            ✅ Feature handlers
├── queries.ts          ✅ Feature queries
├── mutations.ts        ✅ Feature mutations
└── schema.ts           ✅ Feature schema

tests/features/{slug}/
├── {slug}.test.ts      ✅ Feature tests
└── {slug}.integration.test.ts  ✅ Integration tests
```

#### 2. Auto-Discovery Systems
```
lib/features/
├── registry.ts         ✅ Browser auto-discovery
├── registry.server.ts  ✅ Node.js auto-discovery
└── defineFeature.ts    ✅ Feature definition helper
```

#### 3. Auto-Generated Files
```
frontend/views/manifest.tsx                    ✅ Generated component registry
convex/features/menus/menu_manifest_data.ts       ✅ Generated from registry
frontend/views/static/workspaces/constants/navigation.ts  ✅ Dynamic from registry
```

#### 4. Scripts (Using Registry Only)
```
scripts/features/
├── create.ts           ✅ Uses template, no hardcode
├── list.ts             ✅ Uses getAllFeatures()
├── edit.ts             ✅ Uses getAllFeatures()
├── delete.ts           ✅ Uses getAllFeatures()
├── sync.ts             ✅ Uses getAllFeatures()
└── generate-manifest.ts ✅ Uses getAllFeatures(), dynamic paths
```

#### 5. Tests (100% Dynamic)
```
tests/
├── manifest-content.test.ts            ✅ Iterates over DEFAULT_PAGE_MANIFEST
├── features/navigation-registry.test.ts ✅ Iterates over WORKSPACE_NAVIGATION_ITEMS
└── features/{slug}/                    ✅ Feature-specific tests only
```

---

### ❌ FORBIDDEN Locations

#### Never Hardcode Features In:

**❌ Central Config Files** (ALL DELETED)
```
features.config.ts          ❌ DELETED (was 771 lines)
manifest.config.ts          ❌ DELETED (was 162 lines)
```

**❌ Hardcoded Mappings in Scripts**
```typescript
// scripts/features/generate-manifest.ts
const COMPONENT_IMPORT_OVERRIDES = { ... }  ❌ REMOVED (24 entries)

// scripts/validation/pages.ts
const componentMap = { ... }  ❌ REMOVED (30+ entries)
```

**❌ Hardcoded Lists in Tests**
```typescript
// tests/manifest-content.test.ts
const REQUIRED_FEATURES = [ ... ]  ❌ REMOVED (11 entries)

// tests/features/navigation-registry.test.ts
const REQUIRED_SLUGS = [ ... ]  ❌ REMOVED (20 entries)
```

**❌ Hardcoded Types**
```typescript
// frontend/views/static/workspaces/types/index.ts
type ViewType = "overview" | "chats" | ...  ❌ REMOVED (28 literals)
// Now: type ViewType = string  ✅ DYNAMIC
```

**❌ Application Code Outside Features**
```
app/                    ❌ No feature-specific code
components/             ❌ No feature-specific logic
lib/                    ❌ Only registry/utils, no feature specifics
```

---

## 🎯 Compliance Checklist

Before committing ANY code, verify:

- [ ] No feature IDs hardcoded outside `frontend/features/`, `convex/features/`, `tests/features/`
- [ ] No manual imports of feature configs
- [ ] No hardcoded component paths
- [ ] No hardcoded navigation items
- [ ] No hardcoded test expectations for specific features
- [ ] All feature references use `getAllFeatures()` from registry
- [ ] All path resolution is dynamic (uses file existence checks)
- [ ] All tests iterate over actual data (no hardcoded lists)
- [ ] Changes use CRUD commands, not manual editing
- [ ] `pnpm run validate:features` passes
- [ ] `pnpm test` passes

---

## 🔍 How to Detect Violations

### Automated Checks

```bash
# Check for hardcoded feature imports outside allowed folders
pnpm run lint:features

# Validate all features
pnpm run validate:features

# Run all tests (will fail if hardcoding causes issues)
pnpm test
```

### Manual Review

**Red flags in code review:**

1. **Import statements mentioning specific features outside their folders:**
   ```typescript
   import { AnalyticsPage } from '@/frontend/features/analytics/page'  ❌
   ```

2. **Hardcoded arrays/objects with feature IDs:**
   ```typescript
   const FEATURES = ['analytics', 'calendar', 'chat']  ❌
   ```

3. **Hardcoded component mappings:**
   ```typescript
   const componentMap = {
     analytics: 'AnalyticsPage',
     calendar: 'CalendarPage',
   }  ❌
   ```

4. **Feature-specific code outside feature folders:**
   ```typescript
   // In app/dashboard/page.tsx
   if (slug === 'analytics') {  ❌
     // analytics-specific logic
   }
   ```

5. **Manual registration patterns:**
   ```typescript
   export const FEATURES_REGISTRY = [
     feature1,
     feature2,
     feature3,
   ]  ❌
   ```

---

## 📊 Enforcement Metrics

**Current Status (as of 2025-01-20):**

| Metric | Count |
|--------|-------|
| Hardcoded feature lists | 0 ✅ |
| Central config files | 0 ✅ |
| Manual imports in scripts | 0 ✅ |
| Hardcoded component paths | 0 ✅ |
| Hardcoded test expectations | 0 ✅ |
| Total hardcode removed | 933+ lines ✅ |

**Maintenance:**
- Auto-discovery: 100% ✅
- Dynamic resolution: 100% ✅
- DRY compliance: 100% ✅
- Modular architecture: 100% ✅

---

---

## 🎓 Training & Onboarding

**For New Developers:**

1. **Read This Document First** - Understand the rules before coding
2. **Review Existing Features** - See `frontend/features/*/config.ts` examples
3. **Use CRUD Commands** - Never manually edit configs or manifests
4. **Validate Often** - Run `pnpm run validate:features` frequently
5. **Test Everything** - `pnpm test` should always pass

**Common Mistakes:**

1. ❌ Editing generated files (`manifest.tsx`, `menu_manifest_data.ts`)
2. ❌ Creating central config files
3. ❌ Hardcoding feature IDs in app logic
4. ❌ Bypassing the CRUD system
5. ❌ Not running sync after changes

**Correct Approach:**

1. ✅ Use `pnpm run create:feature` for new features
2. ✅ Edit only `frontend/features/{slug}/config.ts` for metadata
3. ✅ Use registry system for feature lookups
4. ✅ Run `pnpm run sync:all` after config changes
5. ✅ Validate with `pnpm run validate:features`

---

## 📚 Related Documentation

- [System Overview](./1_SYSTEM_OVERVIEW.md) - Architecture and design
- [Developer Guide](./2_DEVELOPER_GUIDE.md) - Development workflows
- [Feature Reference](./5_FEATURE_REFERENCE.md) - Feature catalog
- [scripts/README.md](../scripts/README.md) - CRUD commands reference

---

## 🔄 Version History

| Version | Date | Changes |
|---------|------|---------|
| 2.0.0 | 2025-01-20 | Complete hardcode elimination, 100% dynamic system |
| 1.0.0 | 2025-01-18 | Auto-discovery system implemented |
| 0.1.0 | 2025-01-15 | Old system (features.config.ts) |

---

## ⚖️ Consequences of Violations

**If hardcoding is introduced:**

1. **Immediate Issues:**
   - Breaks auto-discovery system
   - Creates maintenance overhead
   - Violates DRY principles
   - Introduces bugs

2. **Long-term Problems:**
   - Feature additions require multiple file edits
   - Tests become fragile
   - Merge conflicts increase
   - Technical debt accumulates

3. **Required Actions:**
   - Remove hardcoding immediately
   - Refactor to use registry system
   - Add tests to prevent regression
   - Update documentation

**Zero tolerance policy for hardcoding outside allowed folders.**

---

**Last Updated:** 2025-01-20
**Maintainer:** Development Team
**Status:** ✅ Actively Enforced
