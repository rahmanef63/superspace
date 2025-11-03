# Layout System - SSOT Architecture

> 🎯 **Single Source of Truth** - Clean, organized, no duplicates

## 📦 Import

```tsx
import { 
  // Chrome
  HeaderBar,
  StatusBar,
  
  // Sidebars
  AppSidebar,
  SecondarySidebar,
  SecondaryList,
  itemVariant,
  
  // Views
  TableView,
  GridView,
  
  // Toolbar
  Toolbar,
  
} from "@/frontend/shared/ui/layout";
```

## 📁 Structure (SSOT)

```
layout/
├── chrome/           # HeaderBar, StatusBar
├── sidebar/          # ⭐ SSOT for sidebars
│   ├── primary/     # AppSidebar, Nav components
│   └── secondary/   # SecondarySidebar, SecondaryList, variants
├── toolbar/          # ⭐ SSOT for toolbars
├── view-system/      # ⭐ SSOT for views
├── compositions/     # High-level layouts
├── menus/            # Menu system
└── notifications/    # Notifications
```

## 🎨 Common Patterns

### Pattern 1: Full Page Layout
```tsx
import { AppSidebar, SecondarySidebar, SecondaryList } from "@/frontend/shared/ui/layout";

<div className="flex h-screen">
  <AppSidebar />
  
  <div className="w-80 border-r">
    <SecondarySidebar>
      <SecondarySidebarHeader>
        <Search />
      </SecondarySidebarHeader>
      <SecondaryList items={items} />
    </SecondarySidebar>
  </div>

  <main className="flex-1">
    {/* Content */}
  </main>
</div>
```

### Pattern 2: With View System
```tsx
import { SecondarySidebar, ViewSystem } from "@/frontend/shared/ui/layout";

<ViewSystem.Provider initialView="table">
  <SecondarySidebar>...</SecondarySidebar>
  <ViewSystem.Renderer data={data} />
</ViewSystem.Provider>
```

## ✅ SSOT Rules

1. **Sidebars** → Import from `sidebar/`
2. **Views** → Import from `view-system/`
3. **Toolbars** → Import from `toolbar/`
4. **NO duplicate folders** - one source of truth per domain

## � Documentation

- [**LAYOUT_SSOT_STRUCTURE.md**](../../docs/archive/LAYOUT_SSOT_STRUCTURE.md) - Full SSOT guide (archived)
- [**sidebar/README.md**](./sidebar/README.md) - Sidebar system
- [**view-system/README.md**](./view-system/README.md) - View system
- [**toolbar/README.md**](./toolbar/README.md) - Toolbar system

---

**Status**: ✅ Clean, organized, SSOT compliant
