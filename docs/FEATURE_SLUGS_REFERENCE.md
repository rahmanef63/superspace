# Feature Slugs Quick Reference

> **Quick reference for installing features programmatically**

---

## Installation Command

```typescript
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"

// Install features
const installFeatures = useMutation(api["menu/store/menuItems"].installFeatureMenus)

await installFeatures({
  workspaceId: "<your-workspace-id>",
  featureSlugs: ["calendar", "tasks", "wiki"]
})
```

---

## Available Feature Slugs

### ✅ Stable Features (Ready for Production)

| Slug | Feature Name | Category | Version |
|------|--------------|----------|---------|
| `chat` | Chat | Communication | 1.0.0 |
| `documents` | Documents | Productivity | 1.2.0 |

### 🚧 Development Features (Preview Available)

| Slug | Feature Name | Category | Version | Expected Release |
|------|--------------|----------|---------|------------------|
| `calendar` | Calendar | Productivity | 1.0.0 | Q1 2025 |
| `reports` | Reports | Analytics | 1.0.0 | Q1 2025 |
| `tasks` | Tasks | Productivity | 1.0.0 | Q2 2025 |
| `wiki` | Wiki | Productivity | 1.0.0 | Q2 2025 |

---

## Quick Install Examples

### Install Single Feature

```typescript
// Install Calendar
await installFeatures({
  workspaceId,
  featureSlugs: ["calendar"]
})
```

### Install Multiple Features

```typescript
// Install productivity suite
await installFeatures({
  workspaceId,
  featureSlugs: ["calendar", "tasks", "wiki", "documents"]
})
```

### Install All Optional Features

```typescript
// Install everything
await installFeatures({
  workspaceId,
  featureSlugs: [
    "chat",
    "documents",
    "calendar",
    "reports",
    "tasks",
    "wiki"
  ]
})
```

### Force Reinstall

```typescript
// Reinstall existing features
await installFeatures({
  workspaceId,
  featureSlugs: ["calendar"],
  forceUpdate: true  // Force reinstall even if already exists
})
```

---

## Feature Details

### chat
```typescript
{
  slug: "chat",
  name: "Chat",
  description: "Alternative chat interface with AI assistant",
  category: "communication",
  version: "1.0.0",
  status: "stable",
  icon: "MessageSquare",
  path: "/dashboard/chat"
}
```

### documents
```typescript
{
  slug: "documents",
  name: "Documents",
  description: "Collaborative document editor with real-time sync",
  category: "productivity",
  version: "1.2.0",
  status: "stable",
  icon: "FileText",
  path: "/dashboard/documents"
}
```

### calendar
```typescript
{
  slug: "calendar",
  name: "Calendar",
  description: "Team calendar with event management",
  category: "productivity",
  version: "1.0.0",
  status: "development",
  isReady: false,
  expectedRelease: "Q1 2025",
  icon: "Calendar",
  path: "/dashboard/calendar",
  tags: ["scheduling", "events"]
}
```

### reports
```typescript
{
  slug: "reports",
  name: "Reports",
  description: "Analytics and reporting dashboard",
  category: "analytics",
  version: "1.0.0",
  status: "development",
  isReady: false,
  expectedRelease: "Q1 2025",
  icon: "BarChart",
  path: "/dashboard/reports",
  requiresPermission: "VIEW_REPORTS"
}
```

### tasks
```typescript
{
  slug: "tasks",
  name: "Tasks",
  description: "Task management and tracking",
  category: "productivity",
  version: "1.0.0",
  status: "development",
  isReady: false,
  expectedRelease: "Q2 2025",
  icon: "CheckSquare",
  path: "/dashboard/tasks",
  tags: ["productivity", "project-management"]
}
```

### wiki
```typescript
{
  slug: "wiki",
  name: "Wiki",
  description: "Knowledge base and documentation",
  category: "productivity",
  version: "1.0.0",
  status: "development",
  isReady: false,
  expectedRelease: "Q2 2025",
  icon: "Book",
  path: "/dashboard/wiki",
  tags: ["documentation", "knowledge-base"]
}
```

---

## Copy-Paste Templates

### React Component with Installation

```tsx
"use client"

import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export function InstallFeaturesButton({ workspaceId }) {
  const installFeatures = useMutation(
    api["menu/store/menuItems"].installFeatureMenus
  )

  const handleInstall = async () => {
    try {
      await installFeatures({
        workspaceId,
        featureSlugs: ["calendar", "tasks", "wiki"]
      })
      toast.success("Features installed successfully!")
    } catch (error) {
      toast.error("Failed to install features")
      console.error(error)
    }
  }

  return (
    <Button onClick={handleInstall}>
      Install Productivity Suite
    </Button>
  )
}
```

### Batch Installation Script

```typescript
// Install features in batches
const FEATURE_BATCHES = {
  communication: ["chat"],
  productivity: ["documents", "calendar", "tasks", "wiki"],
  analytics: ["reports"]
}

async function installFeatureBatch(
  workspaceId: Id<"workspaces">,
  batchName: keyof typeof FEATURE_BATCHES
) {
  const features = FEATURE_BATCHES[batchName]

  await installFeatures({
    workspaceId,
    featureSlugs: features
  })

  console.log(`Installed ${batchName} features:`, features)
}

// Usage
await installFeatureBatch(workspaceId, "productivity")
```

---

## Verification

### Check Installation Status

```typescript
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"

function FeatureStatus({ workspaceId }) {
  const installed = useQuery(
    api["menu/store/menuItems"].getWorkspaceMenuItems,
    { workspaceId }
  )

  const available = useQuery(
    api["menu/store/menuItems"].getAvailableFeatureMenus,
    { workspaceId }
  )

  return (
    <div>
      <h3>Installed: {installed?.length || 0}</h3>
      <h3>Available: {available?.length || 0}</h3>
    </div>
  )
}
```

---

## Notes

- ✅ All feature slugs are **lowercase** and **kebab-case**
- ✅ Feature slugs are **unique** across the entire system
- ✅ Slugs are used for **routing**, **identification**, and **installation**
- ✅ Changing a slug requires **database migration**
- 🚧 Development features are **functional** but show preview UI
- 📝 Features require appropriate **permissions** to access

---

**Last Updated:** 2025-01-18
**Auto-generated from:** `features.config.ts`
