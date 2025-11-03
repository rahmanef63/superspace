# Layout System - Quick Reference

> 🎯 **New Structure**: Compound components, no boolean props, extensible registry

## 📦 Import

```tsx
import { 
  // Chrome
  HeaderBar,
  StatusBar,
  
  // Sidebars
  PrimarySidebar,
  SecondarySidebar,
  
  // Lists
  SecondaryList,
  variantRegistry,
  
  // Tools
  Sort,
  Filter,
  ViewToggle,
} from "@/frontend/shared/ui/layout";
```

## 🎨 Common Patterns

### Pattern 1: Chat Sidebar (Full)
```tsx
<SecondarySidebar>
  <SecondarySidebar.Header>
    <SecondarySidebar.Search 
      value={search}
      onChange={setSearch}
      placeholder="Search..."
    />
    <SecondarySidebar.Tools>
      <Sort options={sortOpts} value={sort} onChange={setSort} />
      <Filter options={filterOpts} value={filters} onChange={setFilters} />
    </SecondarySidebar.Tools>
  </SecondarySidebar.Header>
  
  <SecondarySidebar.Content>
    <SecondaryList items={items} variant="chat" onAction={handleAction} />
  </SecondarySidebar.Content>
  
  <SecondarySidebar.Footer>
    <StatusBar left={<>Count: {items.length}</>} />
  </SecondarySidebar.Footer>
</SecondarySidebar>
```

### Pattern 2: Minimal Sidebar
```tsx
<SecondarySidebar variant="minimal">
  <SecondarySidebar.Header variant="minimal">
    <SecondarySidebar.Search placeholder="Search..." />
  </SecondarySidebar.Header>
  <SecondarySidebar.Content variant="minimal">
    <SecondaryList items={items} variant="document" />
  </SecondarySidebar.Content>
</SecondarySidebar>
```

### Pattern 3: Full Page Layout
```tsx
<div className="flex h-screen">
  {/* Primary nav */}
  <PrimarySidebar />
  
  {/* Secondary list */}
  <div className="w-80 border-r">
    <SecondarySidebar>...</SecondarySidebar>
  </div>

  {/* Main content */}
  <div className="flex-1 flex flex-col">
    <HeaderBar 
      title="Page"
      breadcrumbs={[{label:"Home",href:"/"},{label:"Page"}]}
      actions={<Button>Action</Button>}
    />
    <main className="flex-1">...</main>
    <StatusBar left="Status info" />
  </div>
</div>
```

## 🛠️ Components API

### HeaderBar
```tsx
<HeaderBar
  title="Page Title"
  breadcrumbs={[
    { label: "Home", href: "/" },
    { label: "Current" }
  ]}
  actions={<Button>Action</Button>}
  search={<SearchInput />}
  left={<Logo />}
  right={<UserMenu />}
  variant="default" // or "minimal"
/>
```

### StatusBar
```tsx
<StatusBar 
  left={<>Left content</>}
  center={<>Center</>}
  right={<>Right</>}
/>

// Or single child
<StatusBar>Custom status content</StatusBar>
```

### SecondarySidebar
```tsx
// Root
<SecondarySidebar variant="panel|minimal" className="...">

// Compound components
<SecondarySidebar.Header variant="panel|minimal" className="...">
<SecondarySidebar.Content variant="panel|minimal" className="...">
<SecondarySidebar.Footer variant="panel|minimal" className="...">

// Search
<SecondarySidebar.Search 
  value={string}
  onChange={(v) => void}
  placeholder={string}
/>

// Tools container
<SecondarySidebar.Tools align="start|end|between|center">
  {children}
</SecondarySidebar.Tools>
```

### Tool Components
```tsx
// Sort
<Sort 
  options={[
    { value: "recent", label: "Recent" },
    { value: "name", label: "Name" }
  ]}
  value={string}
  onChange={(v) => void}
/>

// Filter (multi-select)
<Filter
  options={[
    { value: "active", label: "Active" },
    { value: "archived", label: "Archived" }
  ]}
  value={string[]}
  onChange={(v) => void}
/>

// ViewToggle
<ViewToggle 
  value="list|grid"
  onChange={(v) => void}
/>
```

### SecondaryList
```tsx
<SecondaryList
  items={ItemBase[]}
  variant="chat|call|document|menu|default|custom"
  onAction={(id, action, extra?) => void}
  virtualize={boolean}
  emptyState={ReactNode}
  className={string}
/>
```

## 🎭 Built-in Variants

### Chat
```tsx
items={[
  {
    id: "1",
    label: "John Doe",
    avatarUrl: "/avatar.jpg",
    params: {
      lastMessage: "Hey there!",
      timestamp: "2m ago",
      unread: 3
    }
  }
]}
variant="chat"
```

### Call
```tsx
items={[
  {
    id: "1",
    label: "Alice",
    avatarUrl: "/alice.jpg",
    params: {
      duration: "5m 23s",
      status: "missed|ended|ongoing"
    }
  }
]}
variant="call"
```

### Document
```tsx
items={[
  {
    id: "1",
    label: "Report.pdf",
    icon: FileText,
    params: {
      modified: "2h ago",
      size: "2.4 MB"
    }
  }
]}
variant="document"
```

### Menu
```tsx
items={[
  {
    id: "1",
    label: "Inbox",
    icon: Mail,
    active: true,
    params: {
      badge: "5"
    }
  }
]}
variant="menu"
```

## 🔧 Custom Variant

```tsx
import { variantRegistry, asVariantId } from "@/frontend/shared/ui/layout";

variantRegistry.register({
  id: asVariantId("custom"),
  title: "Custom Variant",
  render: ({ item, onAction, utils }) => (
    <button onClick={() => onAction?.(item.id, "click")}>
      {item.label}
    </button>
  ),
});

// Use it
<SecondaryList items={items} variant="custom" />
```

## 🎯 Item Base Type

```tsx
type ItemBase = {
  id: string;
  label?: string;
  icon?: React.ElementType | string;
  avatarUrl?: string;
  href?: string;
  active?: boolean;
  disabled?: boolean;
  meta?: Record<string, unknown>;
  params?: any; // variant-specific data
};
```

## 📐 Sizing

```tsx
// Full height sidebar
<div className="h-screen w-80 border-r">
  <SecondarySidebar>...</SecondarySidebar>
</div>

// Constrained height
<div className="h-[600px] w-80 border rounded-lg">
  <SecondarySidebar>...</SecondarySidebar>
</div>

// Responsive width
<div className="w-full md:w-80 lg:w-96">
  <SecondarySidebar>...</SecondarySidebar>
</div>
```

## 🎨 Theming

All components use CSS variables from your theme:

```tsx
// Light/dark mode automatically handled
<SecondarySidebar>
  {/* Uses --background, --foreground, --border, etc */}
</SecondarySidebar>

// Custom colors via className
<SecondarySidebar className="bg-primary/5 border-primary">
  <SecondarySidebar.Header className="border-primary/20">
    ...
  </SecondarySidebar.Header>
</SecondarySidebar>
```

## ✅ Best Practices

1. **Use compound components** for flexibility
2. **Register custom variants** instead of inline logic
3. **Manage state at page level**, pass down as props
4. **Use emptyState** for better UX
5. **Add className** for custom styling, don't fork components

## 🔗 Full Documentation

- [Layout System Reorganization](../../docs/archive/LAYOUT_SYSTEM_REORGANIZATION.md)
- [SecondarySidebar README](./sidebars/SecondarySidebar/README.md)
- [Variant Registry](./lists/registry.tsx)

---

**Backward Compatible**: Old imports still work  
**New Imports**: `@/frontend/shared/ui/layout`
