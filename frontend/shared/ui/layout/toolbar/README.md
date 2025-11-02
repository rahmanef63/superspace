# Universal Toolbar System

A modular, registry-based toolbar system for building dynamic, responsive toolbars with search, sort, filter, view modes, and more.

**Similar to Variant Registry** but for toolbars - DRY, type-safe, and fully customizable.

---

## 📁 Structure

```
frontend/shared/ui/layout/toolbar/
├── lib/
│   ├── types.ts                    # TypeScript type definitions
│   ├── toolbar-registry.ts         # Core registry system
│   ├── built-in-tools.tsx          # Search, Sort, Filter tools
│   └── built-in-tools-part2.tsx    # View, Actions, Tabs, Breadcrumb
├── components/
│   └── UniversalToolbar.tsx        # Main toolbar component
├── hooks/
│   └── useToolbarState.ts          # State management hooks
├── index.ts                        # Public API exports
└── README.md                       # This file
```

---

## ✨ Features

### ✅ **Built-in Tools**
- **Search** - Debounced search input with clear button
- **Sort** - Sort dropdown with direction toggle
- **Filter** - Multi-select filters with active count
- **View** - View mode switcher (grid/list/tiles/detail/etc.)
- **Actions** - Action buttons with overflow menu
- **Tabs** - Tab navigation with count badges
- **Breadcrumb** - Breadcrumb navigation with collapse

### ✅ **Responsive Design**
- **Mobile-first** - All tools adapt automatically
- **Breakpoint control** - Hide/show tools per breakpoint
- **Collapse on mobile** - Dropdown fallbacks for space
- **Touch-friendly** - Proper sizing for mobile

### ✅ **Developer Experience**
- **Type-safe** - Full TypeScript support with Zod validation
- **Registry-based** - Like variant registry pattern
- **Composable** - Mix and match tools freely
- **Customizable** - Override any tool behavior
- **State management** - Built-in hooks with localStorage

---

## 🚀 Quick Start

### Basic Usage

```tsx
import { UniversalToolbar, toolType, viewMode } from '@/frontend/shared/ui/layout/toolbar'
import { Grid3x3, List } from 'lucide-react'

function MyFeature() {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentView, setCurrentView] = useState(viewMode.grid)

  return (
    <UniversalToolbar
      tools={[
        {
          id: "search-1",
          type: toolType.search,
          params: {
            value: searchQuery,
            onChange: setSearchQuery,
            placeholder: "Search items...",
            clearable: true,
          }
        },
        {
          id: "view-1",
          type: toolType.view,
          position: "right",
          params: {
            options: [
              { label: "Grid", value: viewMode.grid, icon: Grid3x3 },
              { label: "List", value: viewMode.list, icon: List }
            ],
            currentView: currentView,
            onChange: setCurrentView
          }
        }
      ]}
      sticky
      border="bottom"
    />
  )
}
```

---

## 🔧 Tool Types

### 1. Search Tool

```tsx
{
  id: "search",
  type: toolType.search,
  params: {
    value: string,
    onChange: (value: string) => void,
    placeholder?: string,           // Default: "Search..."
    debounceMs?: number,            // Default: 300
    clearable?: boolean,            // Show X button
    shortcuts?: string,             // e.g., "Ctrl+K"
  }
}
```

**Responsive:**
- Mobile: Compact input, no shortcuts shown
- Desktop: Full width, keyboard shortcuts visible

---

### 2. Sort Tool

```tsx
{
  id: "sort",
  type: toolType.sort,
  params: {
    options: [
      { label: "Name", value: "name", icon: User },
      { label: "Date", value: "date", icon: Calendar }
    ],
    currentSort?: string,
    currentDirection?: "asc" | "desc",
    onChange: (value: string, direction?: "asc" | "desc") => void,
    showDirection?: boolean,        // Show direction toggle button
  }
}
```

**Responsive:**
- Mobile: Icon-only button
- Desktop: Button with current sort label

---

### 3. Filter Tool

```tsx
{
  id: "filter",
  type: toolType.filter,
  params: {
    options: [
      { label: "Active", value: "active", active: true, count: 5 },
      { label: "Archived", value: "archived", active: false, count: 2 }
    ],
    onToggle: (value: string) => void,
    mode?: "single" | "multiple",  // Default: "multiple"
    showCount?: boolean,            // Show item counts
    showClearAll?: boolean,         // Show clear all button
  }
}
```

**Responsive:**
- Mobile: Icon + badge only
- Desktop: Icon + "Filter" text + badge

---

### 4. View Tool

```tsx
{
  id: "view",
  type: toolType.view,
  params: {
    options: [
      { label: "Grid", value: viewMode.grid, icon: Grid3x3 },
      { label: "List", value: viewMode.list, icon: List },
      { label: "Tiles", value: viewMode.tiles, icon: LayoutGrid }
    ],
    currentView: ViewMode,
    onChange: (value: ViewMode) => void,
    layout?: "buttons" | "dropdown" | "segmented",
    showLabels?: boolean,
  }
}
```

**Available View Modes:**
- `viewMode.grid` - Grid of cards
- `viewMode.list` - List rows  
- `viewMode.tiles` - Compact tiles
- `viewMode.detail` - With detail panel
- `viewMode.thumbnails` - Thumbnail gallery
- `viewMode.content` - Content-focused
- `viewMode.table` - Table view
- `viewMode.kanban` - Kanban board
- `viewMode.calendar` - Calendar view

**Responsive:**
- Mobile: Dropdown for 3+ options
- Tablet: Segmented control
- Desktop: Button group with labels

---

### 5. Actions Tool

```tsx
{
  id: "actions",
  type: toolType.actions,
  params: {
    actions: [
      { 
        label: "Export", 
        icon: Download, 
        onClick: handleExport,
        variant: "outline",
        shortcut: "Ctrl+E"
      },
      { 
        label: "Import", 
        icon: Upload, 
        onClick: handleImport 
      }
    ],
    primary?: "Export",             // Primary action ID
    maxVisible?: number,            // Max before overflow (auto: 1/2/3)
    layout?: "inline" | "dropdown" | "menu"
  }
}
```

**Responsive:**
- Mobile: Shows 1 primary + overflow menu
- Tablet: Shows 2 actions + overflow
- Desktop: Shows 3 actions + overflow

---

### 6. Tabs Tool

```tsx
{
  id: "tabs",
  type: toolType.tabs,
  params: {
    tabs: [
      { label: "All", value: "all", count: 10 },
      { label: "Active", value: "active", icon: CheckCircle, count: 5 },
      { label: "Archived", value: "archived", disabled: true }
    ],
    currentTab: string,
    onChange: (value: string) => void,
    variant?: "default" | "pills" | "underline"
  }
}
```

**Responsive:**
- Mobile: Grid layout with truncated labels
- Desktop: Horizontal tabs with full labels

---

### 7. Breadcrumb Tool

```tsx
{
  id: "breadcrumb",
  type: toolType.breadcrumb,
  params: {
    items: [
      { label: "Home", icon: Home, href: "/" },
      { label: "Documents", onClick: () => navigate("/docs") },
      { label: "Current File" }
    ],
    maxItems?: number,              // Max before collapse (auto: 2/4)
    collapseBefore?: number,        // Collapse from this index
  }
}
```

**Responsive:**
- Mobile: Shows first + last item only
- Desktop: Shows full breadcrumb path

---

## 🎨 Toolbar Configuration

### Layout Options

```tsx
<UniversalToolbar
  tools={[...]}
  layout="horizontal"       // "horizontal" | "vertical" | "wrap"
  position="top"            // "top" | "bottom" | "floating" | "sticky"
  spacing="normal"          // "compact" | "normal" | "relaxed"
  border="bottom"           // "none" | "top" | "bottom" | "both"
  background="transparent"  // "transparent" | "muted" | "card"
  sticky={true}             // Stick to top on scroll
  zIndex={10}               // Z-index for stacking
  className="custom-class"  // Additional className
/>
```

---

## 📱 Responsive Configuration

Control tool visibility per breakpoint:

```tsx
{
  id: "advanced-filter",
  type: toolType.filter,
  responsive: {
    hideMobile: true,        // Hide on mobile (<640px)
    hideTablet: false,       // Show on tablet (640-1024px)
    hideDesktop: false,      // Show on desktop (>1024px)
    collapseOnMobile: true,  // Collapse to dropdown on mobile
  },
  params: {...}
}
```

---

## 🪝 State Management Hooks

### useToolbar (All-in-one)

```tsx
const toolbar = useToolbar({
  storagePrefix: "my-feature",
  initialView: viewMode.grid,
  initialSort: "name",
})

// Access state
toolbar.viewMode           // Current view mode
toolbar.searchValue        // Current search
toolbar.debouncedSearch    // Debounced search value
toolbar.currentSort        // Current sort field
toolbar.sortDirection      // Sort direction
toolbar.filters            // Active filters (Set)
toolbar.activeFilterCount  // Number of active filters

// Update state
toolbar.setViewMode(viewMode.list)
toolbar.setSearchValue("query")
toolbar.setSort("date", "desc")
toolbar.toggleFilter("active")
toolbar.clearFilters()
```

### Individual Hooks

```tsx
// View mode
const [viewMode, setViewMode] = useViewMode("storage-key", "grid")

// Search
const search = useSearchState()
search.value              // Current value
search.debouncedValue     // Debounced value
search.setValue("query")
search.clear()

// Sort
const sort = useSortState("storage-key", "name", "asc")
sort.currentSort
sort.currentDirection
sort.setSort("date", "desc")
sort.toggleDirection()

// Filter
const filter = useFilterState("storage-key", new Set(["active"]))
filter.filters            // Set<string>
filter.toggleFilter("archived")
filter.clearFilters()
filter.hasFilter("active")
filter.activeCount
```

---

## 📦 Complete Example

```tsx
import { UniversalToolbar, toolType, viewMode, useToolbar } from '@/frontend/shared/ui/layout/toolbar'
import { Grid3x3, List, Download, Upload } from 'lucide-react'

function MyFeaturePage() {
  const toolbar = useToolbar({
    storagePrefix: "my-feature",
    initialView: viewMode.grid,
  })

  const handleExport = () => console.log("Exporting...")
  const handleImport = () => console.log("Importing...")

  return (
    <div>
      <UniversalToolbar
        tools={[
          // Search (left)
          {
            id: "search",
            type: toolType.search,
            position: "left",
            params: {
              value: toolbar.searchValue,
              onChange: toolbar.setSearchValue,
              placeholder: "Search items...",
              clearable: true,
            }
          },

          // Sort (left)
          {
            id: "sort",
            type: toolType.sort,
            position: "left",
            params: {
              options: [
                { label: "Name", value: "name" },
                { label: "Date", value: "date" },
              ],
              currentSort: toolbar.currentSort,
              currentDirection: toolbar.sortDirection,
              onChange: toolbar.setSort,
              showDirection: true,
            }
          },

          // Filter (left)
          {
            id: "filter",
            type: toolType.filter,
            position: "left",
            params: {
              options: [
                { label: "Active", value: "active", active: toolbar.hasFilter("active"), count: 5 },
                { label: "Archived", value: "archived", active: toolbar.hasFilter("archived"), count: 2 },
              ],
              onToggle: toolbar.toggleFilter,
              showClearAll: true,
            }
          },

          // View (right)
          {
            id: "view",
            type: toolType.view,
            position: "right",
            params: {
              options: [
                { label: "Grid", value: viewMode.grid, icon: Grid3x3 },
                { label: "List", value: viewMode.list, icon: List },
              ],
              currentView: toolbar.viewMode,
              onChange: toolbar.setViewMode,
              layout: "segmented",
            }
          },

          // Actions (right)
          {
            id: "actions",
            type: toolType.actions,
            position: "right",
            params: {
              actions: [
                { label: "Export", icon: Download, onClick: handleExport },
                { label: "Import", icon: Upload, onClick: handleImport },
              ],
              primary: "Export",
            }
          },
        ]}
        sticky
        border="bottom"
        background="card"
      />

      {/* Your content */}
      <div className="p-6">
        {toolbar.viewMode === viewMode.grid ? (
          <GridView items={filteredItems} />
        ) : (
          <ListView items={filteredItems} />
        )}
      </div>
    </div>
  )
}
```

---

## 🔧 Custom Tools

Create your own tools:

```tsx
import { createTool, toolbarRegistry } from '@/frontend/shared/ui/layout/toolbar'
import { z } from 'zod'

const CustomParamsSchema = z.object({
  myParam: z.string(),
})

export const customTool = createTool({
  id: "my-custom-tool",
  title: "My Custom Tool",
  description: "Does something custom",
  paramsSchema: CustomParamsSchema,
  defaultResponsive: {
    collapseOnMobile: true,
  },
  render: ({ tool, isMobile }) => {
    const params = tool.params as z.infer<typeof CustomParamsSchema>
    
    return (
      <Button size={isMobile ? "sm" : "default"}>
        {params.myParam}
      </Button>
    )
  },
})

// Register it
toolbarRegistry.register(customTool)

// Use it
<UniversalToolbar
  tools={[
    {
      id: "custom-1",
      type: "my-custom-tool" as ToolId,
      params: { myParam: "Hello" }
    }
  ]}
/>
```

---

## 🎯 Best Practices

### 1. **Use Consistent Storage Keys**
```tsx
const toolbar = useToolbar({
  storagePrefix: "feature-name", // e.g., "documents", "contacts"
})
```

### 2. **Position Tools Logically**
- **Left**: Search, Sort, Filter (input/selection tools)
- **Center**: Tabs, Breadcrumb (navigation)
- **Right**: View, Actions (view/action controls)

### 3. **Responsive First**
```tsx
{
  responsive: {
    hideMobile: true,      // Hide complex tools on mobile
    collapseOnMobile: true // Or collapse to dropdown
  }
}
```

### 4. **Use State Hooks**
Don't manage state manually - use provided hooks:
```tsx
const toolbar = useToolbar() // ✅ Good
const [search, setSearch] = useState("") // ❌ Avoid
```

### 5. **Sticky Toolbars**
For scrollable content, use sticky:
```tsx
<UniversalToolbar
  sticky
  zIndex={10}
  background="card"
  border="bottom"
/>
```

---

## 📚 Type Reference

See `lib/types.ts` for full type definitions.

**Key Types:**
- `ToolConfig` - Tool configuration
- `ToolbarConfig` - Toolbar configuration  
- `ViewMode` - View mode values
- `ToolRenderContext` - Context passed to tool renderers
- `ToolDef` - Tool definition with schema

---

## 🔗 Related

- **Variant Registry** - Similar pattern for SecondaryList items
- **SecondarySidebarTools** - Legacy toolbar (use UniversalToolbar instead)
- **ViewSwitcher** - Legacy view switcher (use View Tool instead)

---

## 📝 Migration Guide

### From SecondarySidebarTools

**Before:**
```tsx
<SecondarySidebarTools
  search={{ value, onChange, placeholder }}
  sortOptions={[...]}
  filterOptions={[...]}
  viewOptions={[...]}
/>
```

**After:**
```tsx
<UniversalToolbar
  tools={[
    { id: "s", type: toolType.search, params: { value, onChange, placeholder } },
    { id: "sort", type: toolType.sort, params: { options: [...] } },
    { id: "filter", type: toolType.filter, params: { options: [...] } },
    { id: "view", type: toolType.view, params: { options: [...] } },
  ]}
/>
```

---

**Built by SuperSpace Team** 🚀
**Version:** 1.0.0
**Last Updated:** 2025-11-02
