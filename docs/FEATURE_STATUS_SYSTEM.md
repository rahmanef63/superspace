# Feature Status System

> **Date:** 2025-01-18
> **Purpose:** Documentation for feature development status tracking and user communication
> **Status:** ✅ Implemented

---

## 🎯 Overview

The Feature Status System provides a comprehensive way to:
1. ✅ Track feature development status
2. ✅ Display badges to users (Development, Beta, Stable, etc.)
3. ✅ Show friendly "Feature Not Ready" screens
4. ✅ Communicate expected release dates
5. ✅ Prevent user confusion about incomplete features

---

## 📊 Feature Statuses

| Status | Badge Color | Meaning | Use Case |
|--------|-------------|---------|----------|
| **stable** | 🟢 Green | Fully implemented, production-ready | Default features, completed optional features |
| **beta** | 🔵 Blue | Feature functional but may have bugs | Testing new features with users |
| **development** | 🟡 Yellow | Actively being built | Reports, Calendar, Tasks, Wiki (currently) |
| **experimental** | 🟣 Purple | Experimental, may not work | Cutting-edge features, proof-of-concepts |
| **deprecated** | 🔴 Red | Will be removed in future | Old features being phased out |

---

## 🔧 Implementation

### 1. features.config.ts

```typescript
{
  slug: "reports",
  name: "Reports",
  description: "Analytics and reporting dashboard",
  featureType: "optional",
  category: "analytics",
  // ... other fields

  // ✨ Status fields
  status: "development",      // Feature development status
  isReady: false,             // Whether fully implemented
  expectedRelease: "Q1 2025", // When it will be ready
}
```

### 2. Schema (convex/schema.ts)

```typescript
menuItems: defineTable({
  // ... other fields
  metadata: v.optional(
    v.object({
      // ... other metadata
      status: v.optional(v.union(
        v.literal("stable"),
        v.literal("beta"),
        v.literal("development"),
        v.literal("experimental"),
        v.literal("deprecated")
      )),
      isReady: v.optional(v.boolean()),
      expectedRelease: v.optional(v.string()),
    }),
  ),
})
```

### 3. Frontend Components

#### FeatureBadge Component

```tsx
import FeatureBadge from "@/frontend/shared/components/FeatureBadge"

<FeatureBadge status="development" showTooltip={true} />
```

**Props:**
- `status`: "stable" | "beta" | "development" | "experimental" | "deprecated"
- `showTooltip`: boolean (default: true)
- `className`: string (optional)

#### FeatureNotReady Component

```tsx
import FeatureNotReady from "@/frontend/shared/components/FeatureNotReady"

<FeatureNotReady
  featureName="Reports"
  featureSlug="reports"
  status="development"
  message="Custom message (optional)"
  expectedRelease="Q1 2025"
  docsUrl="/docs/features/reports"
  onGoBack={() => window.history.back()}
/>
```

**Props:**
- `featureName`: string - Display name
- `featureSlug`: string - URL slug
- `status`: "development" | "beta" | "coming-soon" | "error"
- `message`: string (optional) - Custom message
- `expectedRelease`: string (optional) - Expected completion date
- `docsUrl`: string (optional) - Link to documentation
- `onGoBack`: function (optional) - Go back handler

---

## 🎨 Usage Examples

### Example 1: Feature Page with Status Check

```tsx
// frontend/features/reports/views/ReportsPage.tsx
"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import FeatureNotReady from "@/frontend/shared/components/FeatureNotReady"
import FeatureBadge from "@/frontend/shared/components/FeatureBadge"

export default function ReportsPage({ workspaceId }: Props) {
  // Get menu item to check status
  const menuItem = useQuery(api.menu.store.menuItems.getMenuItemBySlug, {
    workspaceId,
    slug: "reports",
  })

  const isReady = menuItem?.metadata?.isReady !== false
  const status = menuItem?.metadata?.status || "stable"
  const expectedRelease = menuItem?.metadata?.expectedRelease

  // If not ready, show FeatureNotReady component
  if (!isReady) {
    return (
      <FeatureNotReady
        featureName="Reports"
        featureSlug="reports"
        status={status as any}
        expectedRelease={expectedRelease}
        message="The Reports feature is currently under development."
        onGoBack={() => window.history.back()}
      />
    )
  }

  // Normal feature implementation
  return (
    <div>
      <div className="flex items-center gap-2">
        <h1>Reports</h1>
        {status !== "stable" && <FeatureBadge status={status as any} />}
      </div>
      {/* Feature content */}
    </div>
  )
}
```

### Example 2: Menu Store - Show Status Badges

```tsx
// In Menu Store catalog display
{availableFeatures.map((feature) => (
  <Card key={feature.slug}>
    <CardHeader>
      <div className="flex items-center justify-between">
        <CardTitle>{feature.name}</CardTitle>
        {feature.status && feature.status !== "stable" && (
          <FeatureBadge status={feature.status} />
        )}
      </div>
    </CardHeader>
    <CardContent>
      <p>{feature.description}</p>
      {!feature.isReady && (
        <Alert className="mt-4">
          <Construction className="h-4 w-4" />
          <AlertDescription>
            In Development - Expected: {feature.expectedRelease}
          </AlertDescription>
        </Alert>
      )}
    </CardContent>
  </Card>
))}
```

---

## 🔄 Workflow

### Adding a New Feature in Development

**Step 1: Define in features.config.ts**

```typescript
{
  slug: "analytics",
  name: "Analytics",
  description: "Advanced analytics dashboard",
  featureType: "optional",
  category: "analytics",
  // ... other required fields

  status: "development",
  isReady: false,
  expectedRelease: "Q2 2025",
}
```

**Step 2: Sync Features**

```bash
pnpm run sync:features
```

This generates:
- `convex/menu/store/optional_features_catalog.ts` (updated with status)
- `convex/menu/store/menu_manifest_data.ts` (if default feature)

**Step 3: Implement Feature Page**

```tsx
// frontend/features/analytics/views/AnalyticsPage.tsx
export default function AnalyticsPage({ workspaceId }: Props) {
  const menuItem = useQuery(api.menu.store.menuItems.getMenuItemBySlug, {
    workspaceId,
    slug: "analytics",
  })

  if (menuItem?.metadata?.isReady === false) {
    return (
      <FeatureNotReady
        featureName="Analytics"
        featureSlug="analytics"
        status={menuItem.metadata.status as any}
        expectedRelease={menuItem.metadata.expectedRelease}
      />
    )
  }

  // Feature implementation
}
```

**Step 4: Users See Development Badge**

When installed from Menu Store:
- ✅ Feature shows "DEV" badge
- ✅ Clicking opens FeatureNotReady screen
- ✅ Shows expected release date
- ✅ Professional, transparent communication

### Promoting Feature to Stable

**Step 1: Update features.config.ts**

```typescript
{
  slug: "analytics",
  // ... other fields

  status: "stable",  // ← Changed from "development"
  isReady: true,     // ← Changed from false
  // expectedRelease removed (no longer needed)
}
```

**Step 2: Sync**

```bash
pnpm run sync:features
```

**Step 3: Deploy**

Feature now shows as stable, badge removed automatically.

---

## 📋 Current Feature Statuses

| Feature | Type | Status | Is Ready | Expected Release |
|---------|------|--------|----------|------------------|
| Overview | default | stable | ✅ | - |
| WhatsApp | default | stable | ✅ | - |
| Members | default | stable | ✅ | - |
| Friends | default | stable | ✅ | - |
| Pages | default | stable | ✅ | - |
| Databases | default | stable | ✅ | - |
| Canvas | default | stable | ✅ | - |
| Menu Store | default | stable | ✅ | - |
| Chat | optional | stable | ✅ | - |
| Documents | optional | stable | ✅ | - |
| **Calendar** | optional | 🟡 development | ❌ | Q1 2025 |
| **Reports** | optional | 🟡 development | ❌ | Q1 2025 |
| **Tasks** | optional | 🟡 development | ❌ | Q2 2025 |
| **Wiki** | optional | 🟡 development | ❌ | Q2 2025 |

---

## 🎨 Visual Examples

### Development Badge

```
┌──────────────────────────────┐
│ Reports          [🟡 Dev]    │
│ Analytics and reporting      │
│                              │
│ ⚠️  In Development           │
│ Expected: Q1 2025            │
└──────────────────────────────┘
```

### Feature Not Ready Screen

```
┌────────────────────────────────────────┐
│  🚧  Reports                           │
│      Slug: reports          [DEV]      │
├────────────────────────────────────────┤
│                                        │
│  ⚠️  Feature in Development            │
│  This feature is currently under       │
│  active development.                   │
│                                        │
│  Expected Release: Q1 2025             │
│                                        │
│  📋 Development Status                 │
│  • Backend API endpoints incomplete    │
│  • UI components being refined         │
│  • Features may change                 │
│                                        │
│  [Go Back]  [View Docs]  [Report]     │
│                                        │
└────────────────────────────────────────┘
```

---

## 🚀 Benefits

### For Users
- ✅ **Transparency** - Clear communication about feature status
- ✅ **Expectations** - Know when features will be ready
- ✅ **Professional** - Polished "coming soon" experience
- ✅ **No Confusion** - Won't wonder if feature is broken

### For Developers
- ✅ **Organized** - Clear tracking of development status
- ✅ **Automated** - Badges/screens update via sync script
- ✅ **Flexible** - Easy to promote features to stable
- ✅ **Documented** - Status visible in config file

---

## 🔗 Related Files

| File | Purpose |
|------|---------|
| [features.config.ts](../features.config.ts) | Feature definitions with status |
| [FeatureBadge.tsx](../frontend/shared/components/FeatureBadge.tsx) | Status badge component |
| [FeatureNotReady.tsx](../frontend/shared/components/FeatureNotReady.tsx) | "Not ready" screen component |
| [ReportsPage.Enhanced.tsx](../frontend/features/reports/views/ReportsPage.Enhanced.tsx) | Example implementation |
| [convex/schema.ts](../convex/schema.ts#L171-L179) | Schema with status fields |

---

## 📝 Changelog

| Date | Change |
|------|--------|
| 2025-01-18 | Initial implementation of feature status system |
| 2025-01-18 | Added FeatureBadge and FeatureNotReady components |
| 2025-01-18 | Updated schema with status, isReady, expectedRelease fields |
| 2025-01-18 | Marked Reports, Calendar, Tasks, Wiki as development |

---

**Last Updated:** 2025-01-18
**Maintained by:** Development Team
