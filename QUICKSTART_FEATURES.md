# 🚀 Quick Start: Installing Features

> **Get started with optional features in 2 minutes**

---

## Option 1: Install from Menu Store (Easiest)

### Steps:

1. **Navigate to Menu Store**
   ```
   Dashboard → Menu Store
   ```

2. **Click "Available Features" tab**

3. **Click "Install" on any feature:**
   - 📅 Calendar
   - 📊 Reports
   - ✅ Tasks
   - 📚 Wiki
   - 💬 Chat
   - 📄 Documents

4. **Done!** Feature appears in your sidebar immediately

---

## Option 2: Install Programmatically (Developer)

### Quick Install (Copy & Paste):

```typescript
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"

// In your component:
const installFeatures = useMutation(api["menu/store/menuItems"].installFeatureMenus)

// Install all productivity features
await installFeatures({
  workspaceId: "YOUR_WORKSPACE_ID",
  featureSlugs: ["calendar", "tasks", "wiki", "documents"]
})
```

---

## Available Feature Slugs

```typescript
// Stable (Ready Now)
"chat"       // Alternative chat interface
"documents"  // Collaborative document editor

// Development (Preview Available)
"calendar"   // Team calendar - Q1 2025
"reports"    // Analytics dashboard - Q1 2025
"tasks"      // Task management - Q2 2025
"wiki"       // Knowledge base - Q2 2025
```

---

## What You Get

### ✅ Stable Features
- Full functionality
- Production-ready
- Real-time collaboration

### 🚧 Development Features
- Preview UI showcasing design
- "Feature Not Ready" component
- List of upcoming capabilities
- Can be installed and explored
- Full features coming Q1-Q2 2025

---

## Example: Install All Features

```typescript
// Install everything at once
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

---

## Need Help?

📚 **Full Documentation:**
- [Installation Guide](./docs/FEATURE_INSTALLATION_GUIDE.md)
- [Feature Slugs Reference](./docs/FEATURE_SLUGS_REFERENCE.md)
- [Implementation Summary](./docs/FEATURE_IMPLEMENTATION_SUMMARY.md)

🎯 **Quick Reference:**
- Menu Store Path: `/dashboard/menus`
- Total Features: 17 (11 default + 6 optional)
- Installation: One-click from UI
- Status: Production-ready ✅

---

**That's it! Start installing features now! 🎉**
