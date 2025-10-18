# Feature Installation Guide

> **Complete guide for installing and managing features in SuperSpace**

This guide explains how to install optional features from the Menu Store, both from the frontend UI and programmatically via the Convex API.

---

## Table of Contents

1. [Overview](#overview)
2. [Installing Features from Frontend](#installing-features-from-frontend)
3. [Available Optional Features](#available-optional-features)
4. [Programmatic Installation](#programmatic-installation)
5. [Feature Slugs Reference](#feature-slugs-reference)
6. [Troubleshooting](#troubleshooting)

---

## Overview

SuperSpace features are divided into two categories:

### Default Features
**Automatically installed** in every workspace:
- ✅ Overview
- ✅ WhatsApp (with 8 sub-features)
- ✅ Members
- ✅ Friends
- ✅ Pages
- ✅ Databases
- ✅ Canvas
- ✅ Menu Store
- ✅ Invitations
- ✅ Profile
- ✅ Settings

### Optional Features
**Install on-demand** from the Menu Store:
- 📦 Chat
- 📦 Documents
- 📦 Calendar (Development)
- 📦 Reports (Development)
- 📦 Tasks (Development)
- 📦 Wiki (Development)

---

## Installing Features from Frontend

### Step 1: Navigate to Menu Store

1. Open your workspace
2. Go to **Dashboard** → **Menu Store**
3. You'll see three tabs:
   - **Installed Menus**: Features currently installed
   - **Available Features**: Features you can install
   - **Import Menu**: Import shared menus

### Step 2: Browse Available Features

1. Click on the **"Available Features"** tab
2. Browse the catalog of available features
3. Each feature card shows:
   - Feature name and icon
   - Description
   - Version number
   - Category badge
   - Development status (if applicable)

### Step 3: Install a Feature

1. Find the feature you want to install
2. Click the **"Install"** button
3. Wait for the installation to complete (you'll see a loading spinner)
4. Once installed, the feature will:
   - Appear in your workspace navigation menu
   - Be accessible from the sidebar
   - Show up in the "Installed Menus" tab

### Step 4: Access Your New Feature

1. Look for the new menu item in your workspace sidebar
2. Click on it to access the feature
3. Features in development will show a preview UI with upcoming capabilities

---

## Available Optional Features

### 1. Chat
**Status:** ✅ Stable
**Category:** Communication
**Version:** 1.0.0

Alternative chat interface with AI assistant capabilities.

**Installation:**
```typescript
// Feature slug: "chat"
```

### 2. Documents
**Status:** ✅ Stable
**Category:** Productivity
**Version:** 1.2.0

Collaborative document editor with real-time synchronization.

**Installation:**
```typescript
// Feature slug: "documents"
```

### 3. Calendar
**Status:** 🚧 Development
**Category:** Productivity
**Version:** 1.0.0
**Expected Release:** Q1 2025

Team calendar with event management, scheduling, and integrations.

**Upcoming Features:**
- Event creation and management
- Team calendar sharing
- Meeting scheduling
- Calendar integrations
- Recurring events
- Event reminders and notifications

**Installation:**
```typescript
// Feature slug: "calendar"
```

### 4. Reports
**Status:** 🚧 Development
**Category:** Analytics
**Version:** 1.0.0
**Expected Release:** Q1 2025
**Requires Permission:** `VIEW_REPORTS`

Analytics and reporting dashboard for workspace insights.

**Upcoming Features:**
- Custom report builder
- Data visualization
- Export capabilities
- Scheduled reports
- Team performance metrics

**Installation:**
```typescript
// Feature slug: "reports"
```

### 5. Tasks
**Status:** 🚧 Development
**Category:** Productivity
**Version:** 1.0.0
**Expected Release:** Q2 2025

Task management and project tracking system.

**Upcoming Features:**
- Task creation and assignment
- Project boards and kanban views
- Task dependencies and subtasks
- Time tracking and estimates
- Team collaboration
- Progress reports and analytics

**Installation:**
```typescript
// Feature slug: "tasks"
```

### 6. Wiki
**Status:** 🚧 Development
**Category:** Productivity
**Version:** 1.0.0
**Expected Release:** Q2 2025

Knowledge base and documentation management.

**Upcoming Features:**
- Rich text editing with markdown support
- Page hierarchies and organization
- Version history and revisions
- Collaborative editing
- Page templates
- Full-text search and tagging

**Installation:**
```typescript
// Feature slug: "wiki"
```

---

## Programmatic Installation

### Using Convex Mutations

You can install features programmatically using the Convex API:

```typescript
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"

function MyComponent() {
  const installFeatures = useMutation(api["menu/store/menuItems"].installFeatureMenus)

  const handleInstall = async (workspaceId: Id<"workspaces">) => {
    try {
      // Install a single feature
      await installFeatures({
        workspaceId,
        featureSlugs: ["calendar"]
      })

      // Or install multiple features at once
      await installFeatures({
        workspaceId,
        featureSlugs: ["calendar", "tasks", "wiki"]
      })

      console.log("Features installed successfully!")
    } catch (error) {
      console.error("Installation failed:", error)
    }
  }

  return (
    <button onClick={() => handleInstall(workspaceId)}>
      Install Features
    </button>
  )
}
```

### Installation Options

```typescript
interface InstallFeaturesArgs {
  workspaceId: Id<"workspaces">  // Required: Target workspace
  featureSlugs: string[]         // Required: Array of feature slugs to install
  forceUpdate?: boolean          // Optional: Force reinstall if already exists
}
```

### Batch Installation

Install all optional features at once:

```typescript
const installAllFeatures = async (workspaceId: Id<"workspaces">) => {
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
}
```

---

## Feature Slugs Reference

Use these slugs when installing features programmatically:

| Feature | Slug | Status |
|---------|------|--------|
| Chat | `chat` | ✅ Stable |
| Documents | `documents` | ✅ Stable |
| Calendar | `calendar` | 🚧 Development |
| Reports | `reports` | 🚧 Development |
| Tasks | `tasks` | 🚧 Development |
| Wiki | `wiki` | 🚧 Development |

---

## Troubleshooting

### Feature Not Appearing After Installation

**Problem:** Installed feature doesn't show in the navigation menu.

**Solutions:**
1. **Refresh the page** - Sometimes the UI needs a refresh
2. **Check permissions** - Ensure you have the required role permissions
3. **Verify installation** - Go to Menu Store → Installed Menus to confirm
4. **Check workspace** - Ensure you're in the correct workspace

### Installation Failed

**Problem:** Error message during installation.

**Common Causes:**
1. **Insufficient permissions** - You need `MANAGE_MENUS` permission
2. **Feature already installed** - Feature might already exist
3. **Network issues** - Check your internet connection
4. **Invalid slug** - Verify the feature slug is correct

**Solutions:**
```typescript
// Use forceUpdate to reinstall
await installFeatures({
  workspaceId,
  featureSlugs: ["calendar"],
  forceUpdate: true  // Force reinstall
})
```

### Permission Denied

**Problem:** Cannot access installed feature.

**Solutions:**
1. Check if the feature requires specific permissions (e.g., `VIEW_REPORTS`)
2. Contact workspace admin to grant necessary permissions
3. Verify your role has access to the feature

### Development Features Not Working

**Problem:** Calendar, Tasks, Wiki, or Reports showing "Feature Not Ready" message.

**This is expected!** These features are in active development:
- ✅ Can be installed and will appear in navigation
- ✅ Show preview UI with upcoming features
- ⏳ Full functionality coming in Q1-Q2 2025
- 📝 UI components are placeholders for demonstration

---

## Feature Management

### Checking Installed Features

Query all features in a workspace:

```typescript
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"

function MyComponent() {
  const menuItems = useQuery(
    api["menu/store/menuItems"].getWorkspaceMenuItems,
    { workspaceId }
  )

  console.log("Installed features:", menuItems)
}
```

### Checking Available Features

Get features available for installation:

```typescript
const availableFeatures = useQuery(
  api["menu/store/menuItems"].getAvailableFeatureMenus,
  { workspaceId }
)

console.log("Available features:", availableFeatures)
```

---

## Next Steps

1. ✅ **Install features** you need from the Menu Store
2. 📚 **Explore features** - Check out the preview UIs
3. 🎨 **Customize navigation** - Organize your menu items
4. 👥 **Share with team** - Let others know about new features
5. 📊 **Track development** - Watch for updates on development features

---

## Related Documentation

- [Feature Development Playbook](./feature-playbook.md)
- [Feature System Summary](./feature-system-summary.md)
- [FEATURES.md](../FEATURES.md)
- [Menu Store Features](../frontend/shared/layout/menus/MENUSTORE_FEATURES.md)

---

**Last Updated:** 2025-01-18
**Version:** 1.0.0
