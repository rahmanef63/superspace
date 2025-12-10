# 3. Modular Architecture

> **Deep dive into SuperSpace's 3-tier modular system**

**Last Updated:** 2025-11-01

---

## 📐 Architecture Principles

SuperSpace uses a **3-tier modular system**:

1. **Feature-Level** - Self-contained features dengan sub-features
2. **Feature-Shared** - Shared dalam satu feature (`feature/shared/`)
3. **Global-Shared** - Shared across all features (`frontend/shared/`, `convex/shared/`)

### Key Benefits

✅ **Maximum Modularity** - Features are completely independent
✅ **Nested Features** - Sub-features untuk complex features
✅ **Scoped Sharing** - Share components within feature or globally
✅ **No Hardcoding** - Auto-discovery eliminates manual registration
✅ **Type-Safe** - Full TypeScript + Zod validation

---

## 🎯 Tier 1: Feature-Level

### Basic Feature Structure

**Minimal feature:**
```
frontend/features/{feature-slug}/
├── config.ts              # SSOT - Feature config
├── {FeatureName}Page.tsx  # Main page
└── components/            # Feature components
    └── {Component}.tsx
```

**Convex mirror:**
```
convex/features/{feature-slug}/
├── queries.ts             # Convex queries
└── mutations.ts           # Convex mutations
```

### Advanced Feature Structure

**Complex feature with nested sub-features:**
```
frontend/features/{feature-slug}/
├── config.ts              # Feature config (SSOT)
├── components/            # Main components
│   ├── {Component1}.tsx
│   ├── {Component2}.tsx
│   └── {Component3}.tsx
├── contexts/              # React contexts
│   ├── {Context1}Context.tsx
│   └── {Context2}Context.tsx
├── hooks/                 # Custom hooks
│   ├── use{Hook1}.ts
│   └── use{Hook2}.ts
├── pages/                 # Page components
│   ├── {Page1}.tsx
│   └── {Page2}.tsx
├── features/              # 🎯 Nested sub-features
│   └── {sub-feature}/     # Sub-feature
│       ├── components/
│       │   ├── {SubComponent1}.tsx
│       │   └── {SubComponent2}.tsx
│       └── pages/
│           └── {SubPage}.tsx
├── shared/                # 🎯 Feature-level shared
│   ├── components/        # Shared across this feature
│   │   ├── {SharedComp}.tsx
│   │   └── {SharedComp2}.tsx
│   ├── hooks/
│   │   └── use{SharedHook}.ts
│   └── utils/
│       └── {utils}.ts
├── settings/              # Feature-specific settings
│   ├── {GeneralSettings}.tsx
│   └── {AdvancedSettings}.tsx
└── types/                 # TypeScript types
    ├── {type1}.ts
    └── {type2}.ts
```

### Convex Mirror for Complex Feature

```
convex/features/{feature_slug}/
├── {domain-1}/            # Domain 1
│   ├── api/
│   │   ├── queries.ts
│   │   ├── mutations.ts
│   │   └── schema.ts
│   └── README.md
├── {domain-2}/            # Domain 2
│   └── api/
│       ├── queries.ts
│       ├── mutations.ts
│       └── schema.ts
├── features/              # 🎯 Sub-features backend
│   └── api/
│       ├── queries.ts
│       └── mutations.ts
├── shared/                # 🎯 Feature-level shared
│   ├── audit.ts           # Feature-specific audit
│   ├── auth.ts            # Feature-specific auth
│   └── schema.ts          # Shared schemas
├── queries.ts             # Aggregated queries
├── mutations.ts           # Aggregated mutations
└── schema.ts              # Main schema
```

---

## 🔗 Tier 2: Feature-Shared

### Purpose

**Feature-shared** digunakan untuk kode yang:
- Dipakai oleh **multiple sub-features** dalam satu feature
- Tidak generic enough untuk global shared
- Tightly coupled dengan domain feature

### Frontend Feature-Shared

```
frontend/features/{feature-slug}/shared/
├── components/            # Shared UI components
│   ├── {SharedComponent1}.tsx  # Used by multiple parts
│   └── {SharedComponent2}.tsx  # Used across feature
├── hooks/                 # Shared hooks
│   ├── use{SharedHook1}.ts
│   └── use{SharedHook2}.ts
└── utils/                 # Shared utilities
    ├── {util1}.ts
    └── {util2}.ts
```

**Usage example:**
```typescript
// In features/{feature-slug}/features/{sub-feature}/components/{Component}.tsx
import { SharedComponent } from '@/features/{feature-slug}/shared/components/SharedComponent'
import { useSharedHook } from '@/features/{feature-slug}/shared/hooks/useSharedHook'

// This component is shared WITHIN this feature
```

### Convex Feature-Shared

```
convex/features/{feature_slug}/shared/
├── audit.ts               # Feature-specific audit
├── auth.ts                # Feature auth helpers
└── schema.ts              # Shared schemas
```

**Usage example:**
```typescript
// In convex/features/{feature_slug}/{domain}/api/mutations.ts
import { logFeatureAudit } from '../shared/audit'
import { requireFeaturePermission } from '../shared/auth'

export const createResource = mutation({
  handler: async (ctx, args) => {
    await requireFeaturePermission(ctx, 'resource.create')
    const resourceId = await ctx.db.insert('resources', args)
    await logFeatureAudit(ctx, 'RESOURCE_CREATED', resourceId)
    return resourceId
  }
})
```

---

## 🌍 Tier 3: Global-Shared

### Purpose

**Global-shared** untuk kode yang:
- Dipakai oleh **multiple features**
- Generic & reusable
- Not domain-specific

### Frontend Global-Shared

```
frontend/shared/
├── builder/               # 🎨 Builder system
│   ├── blocks/            # Building blocks
│   ├── canvas/            # Canvas system
│   ├── elements/          # Form elements
│   ├── flows/             # Multi-step flows
│   ├── inspector/         # Inspector UI
│   ├── library/           # Template library
│   ├── sections/          # Page sections
│   └── templates/         # Page templates
│
├── communications/        # 💬 Communications
│   ├── chat/              # Chat platform
│   ├── notifications/     # Notifications
│   └── comments/          # Comment system
│
├── context/               # 🔄 Global contexts
│   ├── WorkspaceContext.tsx
│   ├── UserContext.tsx
│   └── ThemeContext.tsx
│
├── foundation/            # 🧱 Core utilities
│   ├── hooks/             # Global hooks
│   ├── utils/             # Helper functions
│   └── types/             # Shared types
│
├── settings/              # ⚙️ Global settings
│   ├── account/           # Account settings
│   ├── chats/             # Chat settings
│   ├── general/           # General settings
│   ├── notifications/     # Notification settings
│   ├── personalization/   # Personalization
│   ├── storage/           # Storage settings
│   ├── video-voice/       # Video/voice settings
│   └── workspace/         # Workspace settings
│
└── ui/                    # 🎨 UI components
    ├── button.tsx         # shadcn/ui Button
    ├── input.tsx          # shadcn/ui Input
    └── ...                # Other shadcn components
```

### Convex Global-Shared

```
convex/shared/
├── permissions/           # RBAC system
│   ├── roles.ts
│   ├── permissions.ts
│   └── helpers.ts
├── audit/                 # Audit logging
│   ├── logger.ts
│   └── types.ts
└── utils/                 # Shared utilities
    ├── validation.ts
    └── helpers.ts
```

**Usage example:**
```typescript
// ANY feature can use global shared
import { requirePermission } from '@/convex/shared/permissions/helpers'
import { logAuditEvent } from '@/convex/shared/audit/logger'
```

---

## 🎭 Decision Tree: Where to Put Code?

### Frontend Decision Tree

```
Is this code used by multiple features?
│
├─ YES → Put in frontend/shared/
│         Example: Button, Card, useAuth
│
└─ NO → Is it used by multiple sub-features within ONE feature?
        │
        ├─ YES → Put in frontend/features/{feature}/shared/
        │         Example: {feature}/shared/SharedComponent
        │
        └─ NO → Put directly in the feature/sub-feature
                  Example: {feature}/features/{sub-feature}/Component
```

### Convex Decision Tree

```
Is this code used by multiple features?
│
├─ YES → Put in convex/shared/
│         Example: requirePermission, logAuditEvent
│
└─ NO → Is it used by multiple domains within ONE feature?
        │
        ├─ YES → Put in convex/features/{feature}/shared/
        │         Example: {feature_slug}/shared/audit.ts
        │
        └─ NO → Put directly in the domain
                  Example: {feature_slug}/{domain}/api/queries.ts
```

---

## 📋 Real-World Examples (Boilerplate)

### Example 1: Simple Feature

**Simple feature (no nested structure needed):**
```
frontend/features/{feature-slug}/
├── config.ts              # Feature config
├── {FeatureName}Page.tsx  # Main page
├── components/            # Feature components
│   ├── {List}.tsx
│   └── {Item}.tsx
├── shared/                # Feature-specific shared
│   ├── hooks/
│   │   └── use{Feature}.ts  # Used across components
│   └── utils/
│       └── {utils}.ts
└── settings/              # Feature settings
    └── {FeatureName}Settings.tsx

convex/features/{feature-slug}/
├── queries.ts             # Queries
├── mutations.ts           # Mutations
└── shared/                # Feature-specific shared
    └── helpers.ts         # Feature helpers
```

### Example 2: Complex Feature

**Complex feature (nested sub-features):**
```
frontend/features/{feature-slug}/
├── config.ts              # Feature config
├── components/            # Main components
├── contexts/              # Contexts
├── hooks/                 # Hooks
├── features/              # 🎯 Sub-features
│   └── {sub-feature}/     # Sub-feature
│       ├── components/
│       │   ├── {Form}.tsx
│       │   └── {List}.tsx
│       └── pages/
│           └── {Dashboard}.tsx
├── shared/                # 🎯 Feature shared
│   ├── components/
│   │   ├── {SharedUploader}.tsx  # Used by multiple parts
│   │   └── {SharedEditor}.tsx    # Used everywhere
│   └── hooks/
│       └── use{SharedHook}.ts
└── settings/              # Feature settings

convex/features/{feature_slug}/
├── {domain-1}/            # Domain 1
│   └── api/
├── {domain-2}/            # Domain 2
│   └── api/
├── features/              # 🎯 Sub-features backend
│   └── api/
└── shared/                # 🎯 Feature shared
    ├── audit.ts
    ├── auth.ts
    └── schema.ts
```

### Example 3: Settings System

**Global Settings (shared across ALL features):**
```
frontend/shared/settings/
├── account/               # Account settings
│   ├── AccountSettings.tsx
│   └── ProfileSettings.tsx
├── workspace/             # Workspace settings
│   ├── WorkspaceSettings.tsx
│   └── MembersSettings.tsx
└── ...
```

**Feature Settings (specific to ONE feature):**
```
frontend/features/{feature-slug}/settings/
├── GeneralSettings.tsx    # Feature-specific settings
└── AdvancedSettings.tsx
```

---

## ⚙️ Settings Architecture

### Settings Registry

**Location:** `frontend/shared/settings/featureSettingsRegistry.ts`

```typescript
export const FEATURE_SETTINGS_REGISTRY = {
  '{feature-slug}': {
    id: '{feature-slug}',
    label: '{Feature Name} Settings',
    component: lazy(() => import('@/features/{feature-slug}/settings/Settings'))
  },
}
```

### Global vs Feature Settings

**Global Settings:**
- In `frontend/shared/settings/`
- Accessible from top-level settings UI
- Examples: Account, Workspace, Notifications

**Feature Settings:**
- In `frontend/features/{feature}/settings/`
- Accessible from feature's settings tab
- Examples: Feature-specific configuration

---

## 🔄 Migration Path

### Adding Nested Features to Existing Feature

**Before (simple feature):**
```
frontend/features/{feature-slug}/
├── config.ts
├── {FeatureName}Page.tsx
└── components/
```

**After (complex with nested features):**
```
frontend/features/{feature-slug}/
├── config.ts
├── {FeatureName}Page.tsx
├── components/
├── features/              # 🆕 Add sub-features
│   ├── {sub-feature-1}/
│   └── {sub-feature-2}/
└── shared/                # 🆕 Extract shared code
    ├── components/
    └── hooks/
```

**Steps:**
1. Create `features/` folder
2. Move sub-feature code into `features/{sub-feature}/`
3. Extract common code to `shared/`
4. Update imports

---

## 📖 Best Practices

### DO ✅

1. **Use feature-shared for domain-specific code**
   ```typescript
   // {feature}/shared/hooks/useFeatureHook.ts
   // Only used within this feature
   ```

2. **Use global-shared for cross-feature code**
   ```typescript
   // frontend/shared/ui/button.tsx
   // Used by ALL features
   ```

3. **Create sub-features for complex domains**
   ```
   {feature}/features/{sub-feature-1}/
   {feature}/features/{sub-feature-2}/
   ```

4. **Mirror structure in Convex**
   ```
   Frontend: frontend/features/{feature}/shared/
   Convex:   convex/features/{feature}/shared/
   ```

### DON'T ❌

1. **Don't put feature-specific code in global shared**
   ```typescript
   // ❌ WRONG: frontend/shared/{feature}/Component.tsx
   // ✅ RIGHT: frontend/features/{feature}/shared/components/Component.tsx
   ```

2. **Don't duplicate code across features**
   ```typescript
   // ❌ WRONG: Same code in {feature-1}/ and {feature-2}/
   // ✅ RIGHT: Extract to frontend/shared/
   ```

3. **Don't create deep nesting**
   ```
   // ❌ WRONG: features/sub1/features/sub2/features/sub3/
   // ✅ RIGHT: Max 2 levels (feature/sub-feature)
   ```

---

## 🔍 Import Patterns

### Import from Feature-Shared

```typescript
// In {feature}/features/{sub-feature}/{Component}.tsx
import { SharedComponent } from '@/features/{feature}/shared/components/SharedComponent'
import { useSharedHook } from '@/features/{feature}/shared/hooks/useSharedHook'
```

### Import from Global-Shared

```typescript
// In ANY feature
import { Button } from '@/frontend/shared/ui/button'
import { useAuthed } from '@/frontend/shared/foundation'
```

### Import from Convex Shared

```typescript
// In ANY convex feature
import { requirePermission } from '@/convex/shared/permissions/helpers'
import { logAuditEvent } from '@/convex/shared/audit/logger'
```

---

## 📊 Summary

| Level | Location | Scope | Use For |
|-------|----------|-------|---------|
| **Feature** | `features/{feature}/` | Single feature | Feature-specific code |
| **Feature-Shared** | `features/{feature}/shared/` | Within feature | Shared across sub-features |
| **Global-Shared** | `frontend/shared/` | All features | Cross-feature code |

---

## 📖 See Also

- **[System Overview](./1_SYSTEM_OVERVIEW.md)** - High-level architecture
- **[Developer Guide](./2_DEVELOPER_GUIDE.md)** - How to build features
- **[Feature Reference](./5_FEATURE_REFERENCE.md)** - Feature catalog

---

**Last Updated:** 2025-11-01
