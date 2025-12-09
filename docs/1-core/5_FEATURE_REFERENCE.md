# 5. Feature Reference

> **How to discover and reference features dynamically**

**Last Updated:** 2025-11-01

---

## 📋 Dynamic Feature Discovery

**SuperSpace uses AUTO-DISCOVERY** - No hardcoded feature lists!

### List All Features

```bash
# List all registered features
pnpm run list:features

# Analyze specific feature
pnpm run analyze:feature {feature-slug}

# Analyze with documentation output
pnpm run analyze:feature {feature-slug} --save
```

**Output location:** `docs/features/{YYYY-MM-DD}-{feature-slug}.md`

---

## 🏗️ Feature Structure Reference

### Minimal Feature (Boilerplate)

```
frontend/features/{feature-slug}/
├── config.ts              # Feature config (SSOT)
├── {FeatureName}Page.tsx  # Main page
└── components/            # Feature components
    └── {Component}.tsx

convex/features/{feature-slug}/
├── queries.ts             # Convex queries
├── mutations.ts           # Convex mutations
└── schema.ts              # Convex schema
```

### Complex Feature (Boilerplate)

```
frontend/features/{feature-slug}/
├── config.ts              # Feature config (SSOT)
├── components/            # Main components
├── contexts/              # React contexts
├── hooks/                 # Custom hooks
├── features/              # 🎯 Nested sub-features
│   └── {sub-feature}/
│       ├── components/
│       └── pages/
├── shared/                # 🎯 Feature-level shared
│   ├── components/
│   ├── hooks/
│   └── utils/
├── settings/              # Feature settings
└── types/                 # TypeScript types

convex/features/{feature-slug}/
├── {domain-1}/            # Domain 1
│   └── api/
│       ├── queries.ts
│       ├── mutations.ts
│       └── schema.ts
├── {domain-2}/            # Domain 2
│   └── api/
├── features/              # 🎯 Sub-features backend
│   └── api/
└── shared/                # 🎯 Feature-shared
    ├── audit.ts
    ├── auth.ts
    └── schema.ts
```

---

## 📝 Feature Config Schema

**Location:** `frontend/features/{feature-slug}/config.ts`

```typescript
import { defineFeature } from '@/lib/features/defineFeature'

export default defineFeature({
  // Basic Info
  id: '{feature-id}',
  name: '{Feature Name}',
  description: '{Feature description}',

  // UI Config
  ui: {
    icon: '{LucideIconName}',          // From lucide-react
    path: '/dashboard/{feature-slug}',
    component: '{FeatureName}Page',
    category: '{category}',             // See categories below
    order: 100,                         // Menu order (lower = higher)
  },

  // Technical Config
  technical: {
    featureType: 'optional',            // default | optional | experimental
    hasUI: true,
    hasConvex: true,
    hasTests: true,
    version: '1.0.0',
  },

  // Development Status
  status: {
    state: 'stable',                    // development | beta | stable | deprecated
    isReady: true,
  },

  // Optional Fields
  permissions: ['{permission-key}'],    // Required permissions
  tags: ['{tag1}', '{tag2}'],          // Searchable tags
})
```

---

## 🏷️ Feature Categories

Available categories (defined in schema):

| Category | Purpose | Examples |
|----------|---------|----------|
| `communication` | Messaging, chat | Messaging features |
| `productivity` | Work & tasks | Task management |
| `collaboration` | Teamwork | Shared docs |
| `administration` | Settings & control | User management |
| `social` | Social features | Contacts, profiles |
| `creativity` | Creative tools | Design, content |
| `analytics` | Data & insights | Dashboards |

---

## 🎯 Feature Types

### Default Features
- **Auto-installed:** ✅ Yes
- **User can uninstall:** ❌ No
- **Use case:** Core workspace features

```typescript
technical: {
  featureType: 'default',
  // ...
}
```

### Optional Features
- **Auto-installed:** ❌ No
- **User can uninstall:** ✅ Yes
- **Use case:** Installable from Menu Store

```typescript
technical: {
  featureType: 'optional',
  // ...
}
```

### Experimental Features
- **Auto-installed:** ❌ No
- **User can uninstall:** ✅ Yes
- **Use case:** Beta testing

```typescript
technical: {
  featureType: 'experimental',
  // ...
}
```

---

## 🔍 Programmatic Access

### Frontend: Get Features

```typescript
import { FEATURES } from '@/lib/features/registry'

// Get all features
const allFeatures = FEATURES

// Get feature by ID
const feature = FEATURES.find(f => f.id === '{feature-id}')

// Get features by category
const communicationFeatures = FEATURES.filter(
  f => f.ui.category === 'communication'
)

// Get features by type
const optionalFeatures = FEATURES.filter(
  f => f.technical.featureType === 'optional'
)
```

### Node.js: Get Features

```typescript
import { getFeatures } from '@/lib/features/registry.server'

// Get all features
const features = await getFeatures()

// Get feature by ID
const feature = features.find(f => f.id === '{feature-id}')
```

### Convex: Get Features

```typescript
import { query } from './_generated/server'
import { MENU_MANIFEST } from './menu/store/menu_manifest_data'

// Get all features
export const getFeatures = query({
  handler: async (ctx) => {
    return MENU_MANIFEST
  }
})

// Get available features (for Menu Store)
export const getAvailableFeatures = query({
  handler: async (ctx, args) => {
    // Returns features with featureType="optional"
    return MENU_MANIFEST.filter(
      f => f.featureType === 'optional'
    )
  }
})
```

---

## 📊 Feature Analysis

### Analyze Feature Structure

```bash
# Analyze single feature
pnpm run analyze:feature {feature-slug}

# Analyze and save to docs
pnpm run analyze:feature {feature-slug} --save

# Interactive selection
pnpm run analyze:feature --list
```

**Output includes:**
- Basic info (ID, name, description, status)
- Capabilities (UI, Convex, Tests, Settings)
- Frontend structure (components, hooks, types)
- Convex backend (queries, mutations, actions)
- Dependencies & exports

---

## 🔧 Feature Validation

### Validate All Features

```bash
# Validate all feature configs
pnpm run validate:features

# Validate specific feature
pnpm run validate:feature {feature-slug}
```

**Checks:**
- Config schema valid (Zod validation)
- Required fields present
- Valid category & feature type
- Icon exists in lucide-react
- No duplicate IDs or paths

---

## 📦 Feature Installation (User-Facing)

### Install Optional Feature

```typescript
// Frontend: Install feature via Menu Store
import { useMutation } from 'convex/react'
import { api } from '@/convex/_generated/api'

const installFeature = useMutation(api.menu.store.installFeatureMenus)

// Install
await installFeature({
  workspaceId,
  featureSlugs: ['{feature-slug}']
})
```

### Uninstall Optional Feature

```typescript
const uninstallFeature = useMutation(api.menu.store.uninstallFeatureMenus)

// Uninstall
await uninstallFeature({
  workspaceId,
  menuItemIds: [menuItemId]
})
```

---

## 🎨 Feature UI Patterns

### Basic Feature Page

```typescript
// frontend/features/{feature-slug}/{FeatureName}Page.tsx
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'

export function {FeatureName}Page() {
  const data = useQuery(api.features.{feature_slug}.queries.getData, {
    workspaceId: currentWorkspace._id
  })

  return (
    <div>
      <h1>{Feature Name}</h1>
      {/* Your UI */}
    </div>
  )
}
```

### Feature with Settings

```typescript
// frontend/features/{feature-slug}/settings/{FeatureName}Settings.tsx
export function {FeatureName}Settings() {
  return (
    <div>
      <h2>{Feature Name} Settings</h2>
      {/* Settings UI */}
    </div>
  )
}

// Register in settings registry
// frontend/shared/settings/featureSettingsRegistry.ts
export const FEATURE_SETTINGS_REGISTRY = {
  '{feature-slug}': {
    id: '{feature-slug}',
    label: '{Feature Name} Settings',
    component: lazy(() => import('@/features/{feature-slug}/settings/{FeatureName}Settings'))
  },
}
```

---

## 🔐 RBAC Patterns

### Query with Permission Check

```typescript
// convex/features/{feature-slug}/queries.ts
import { query } from '../../_generated/server'
import { v } from 'convex/values'
import { requirePermission } from '@/convex/shared/permissions/helpers'

export const getData = query({
  args: { workspaceId: v.id('workspaces') },
  handler: async (ctx, args) => {
    // ✅ REQUIRED: Permission check
    await requirePermission(ctx, args.workspaceId, '{feature}.view')

    return await ctx.db
      .query('{table-name}')
      .withIndex('by_workspace', q => q.eq('workspaceId', args.workspaceId))
      .collect()
  }
})
```

### Mutation with Audit Log

```typescript
// convex/features/{feature-slug}/mutations.ts
import { mutation } from '../../_generated/server'
import { v } from 'convex/values'
import { requirePermission } from '@/convex/shared/permissions/helpers'
import { logAuditEvent } from '@/convex/shared/audit/logger'

export const createData = mutation({
  args: {
    workspaceId: v.id('workspaces'),
    data: v.object({/* fields */})
  },
  handler: async (ctx, args) => {
    // ✅ REQUIRED: Permission check
    const { membership } = await requirePermission(
      ctx,
      args.workspaceId,
      '{feature}.create'
    )

    // Insert data
    const id = await ctx.db.insert('{table-name}', {
      workspaceId: args.workspaceId,
      ...args.data,
      createdBy: membership.userId,
      createdAt: Date.now(),
    })

    // ✅ REQUIRED: Audit log
    await logAuditEvent(ctx, {
      workspaceId: args.workspaceId,
      userId: membership.userId,
      action: '{FEATURE_ACTION_CREATED}',
      resourceType: '{resource-type}',
      resourceId: id,
      metadata: args.data,
    })

    return id
  }
})
```

---

## 📖 See Also

- **[System Overview](./1_SYSTEM_OVERVIEW.md)** - Architecture patterns
- **[Developer Guide](./2_DEVELOPER_GUIDE.md)** - Build features
- **[Modular Architecture](./3_MODULAR_ARCHITECTURE.md)** - Code organization
- **[Feature Rules](./FEATURE_RULES.md)** - Enforcement rules

---

**Last Updated:** 2025-11-01
