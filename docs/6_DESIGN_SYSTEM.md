# 6. Design System & UI Guidelines

> **Comprehensive design system for building consistent, accessible UI in SuperSpace**

**Last Updated:** 2025-11-02

---

## Table of Contents

1. [Design Principles](#design-principles)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Spacing & Layout](#spacing--layout)
5. [Component Library](#component-library)
6. [Layout Patterns](#layout-patterns)
7. [Variant Registry System](#variant-registry-system)
8. [Common Patterns](#common-patterns)
9. [Best Practices](#best-practices)
10. [Accessibility](#accessibility)

---

## Design Principles

### Core Values

1. **Consistency** - Same patterns across all features
2. **Accessibility** - WCAG 2.1 AA compliant
3. **Performance** - Lightweight, optimized components
4. **Composability** - Build complex UIs from simple components
5. **Type Safety** - Full TypeScript support

### Design Tokens

All design values should use CSS variables (design tokens) instead of hardcoded values:

```tsx
// ❌ DON'T: Hardcoded values
<div className="bg-gray-100 text-gray-900">

// ✅ DO: Use design tokens
<div className="bg-background text-foreground">
<div className="bg-muted text-muted-foreground">
```

---

## Color System

### Design Tokens

SuperSpace uses a semantic color system based on CSS variables defined in `app/globals.css`:

#### Light Mode (Default)

```css
--background: oklch(1 0 0)           /* Main background */
--foreground: oklch(0.145 0 0)      /* Main text color */
--card: oklch(1 0 0)                /* Card background */
--card-foreground: oklch(0.145 0 0) /* Card text */
--primary: oklch(0.205 0 0)         /* Primary brand color */
--primary-foreground: oklch(0.985 0 0)
--secondary: oklch(0.97 0 0)
--secondary-foreground: oklch(0.205 0 0)
--muted: oklch(0.97 0 0)            /* Subtle backgrounds */
--muted-foreground: oklch(0.556 0 0)
--accent: oklch(50.228% 0.21197 280.216 / 0.703)
--accent-foreground: oklch(0.205 0 0)
--destructive: oklch(0.577 0.245 27.325)
--border: oklch(0.922 0 0)
--input: oklch(0.922 0 0)
--ring: oklch(0.708 0 0)            /* Focus ring */
```

#### Dark Mode

Dark mode automatically switches when `.dark` class is applied to the root element.

### Usage in Tailwind

```tsx
// Background colors
bg-background      // Main background
bg-card            // Card background
bg-muted           // Subtle background
bg-primary         // Primary action
bg-secondary       // Secondary action
bg-accent          // Accent highlights
bg-destructive     // Danger/error

// Text colors
text-foreground
text-muted-foreground
text-primary
text-card-foreground

// Border colors
border-border
border-input
```

### Sidebar Color System

Special tokens for sidebar components:

```css
--sidebar: oklch(0.985 0 0)
--sidebar-foreground: oklch(0.145 0 0)
--sidebar-primary: oklch(0.205 0 0)
--sidebar-accent: oklch(0.97 0 0)
--sidebar-border: oklch(0.922 0 0)
```

### Chart Colors

For data visualization:

```css
--chart-1 through --chart-5
```

---

## Typography

### Font System

SuperSpace uses system fonts for optimal performance:

```tsx
// Default font stack (set in layout.tsx)
font-sans  // System sans-serif
font-mono  // Monospace for code
```

### Text Sizes

```tsx
text-xs     // 0.75rem (12px)
text-sm     // 0.875rem (14px)
text-base   // 1rem (16px)
text-lg     // 1.125rem (18px)
text-xl     // 1.25rem (20px)
text-2xl    // 1.5rem (24px)
text-3xl    // 1.875rem (30px)
text-4xl    // 2.25rem (36px)
```

### Font Weights

```tsx
font-normal    // 400
font-medium    // 500
font-semibold  // 600
font-bold      // 700
```

### Headings Standard

```tsx
<h1 className="text-2xl font-bold text-foreground">Page Title</h1>
<h2 className="text-xl font-semibold text-foreground">Section Title</h2>
<h3 className="text-lg font-medium text-foreground">Subsection</h3>
<p className="text-sm text-muted-foreground">Description text</p>
```

---

## Spacing & Layout

### Spacing Scale

```tsx
p-0   // 0
p-1   // 0.25rem (4px)
p-2   // 0.5rem (8px)
p-3   // 0.75rem (12px)
p-4   // 1rem (16px)
p-6   // 1.5rem (24px)
p-8   // 2rem (32px)
p-12  // 3rem (48px)
```

### Gap Scale (Flexbox/Grid)

```tsx
gap-2   // 0.5rem (8px)
gap-4   // 1rem (16px)
gap-6   // 1.5rem (24px)
gap-8   // 2rem (32px)
```

### Border Radius

```tsx
rounded-sm   // --radius-sm (calc(--radius - 4px))
rounded-md   // --radius-md (calc(--radius - 2px))
rounded-lg   // --radius-lg (--radius, 0.625rem)
rounded-xl   // --radius-xl (calc(--radius + 4px))
rounded-full // 9999px (circular)
```

### Container Max Widths

```tsx
max-w-sm    // 24rem (384px)
max-w-md    // 28rem (448px)
max-w-lg    // 32rem (512px)
max-w-xl    // 36rem (576px)
max-w-2xl   // 42rem (672px)
max-w-full  // 100%
```

---

## Component Library

SuperSpace uses **shadcn/ui** components located in `components/ui/`:

### Available Components

#### Form Components
- `Button` - Primary, secondary, outline, ghost variants
- `Input` - Text input with validation states
- `Textarea` - Multi-line text input
- `Select` - Dropdown select
- `Checkbox` - Boolean input
- `RadioGroup` - Radio button group
- `Switch` - Toggle switch
- `Slider` - Range input
- `Label` - Form labels

#### Layout Components
- `Card` - Content container with header/footer
- `Separator` - Horizontal/vertical divider
- `Tabs` - Tabbed interface
- `Accordion` - Collapsible sections
- `ResizablePanel` - Resizable layout panels
- `ScrollArea` - Custom scrollable area

#### Feedback Components
- `Alert` - Informational messages
- `AlertDialog` - Confirmation dialogs
- `Dialog` - Modal dialogs
- `Sheet` - Slide-out panels
- `Toast` / `Sonner` - Notifications
- `Skeleton` - Loading placeholder
- `Progress` - Progress indicator

#### Navigation Components
- `Sidebar` - Application sidebar
- `Breadcrumb` - Breadcrumb navigation
- `DropdownMenu` - Dropdown menus
- `ContextMenu` - Right-click menus
- `Command` - Command palette

#### Data Display
- `Table` - Data tables
- `Badge` - Status badges
- `Avatar` - User avatars
- `Tooltip` - Contextual tooltips
- `Chart` - Data visualization

### Custom Shared Components

Located in `frontend/shared/ui/components/`:

#### Page Components
- `PageContainer` - Consistent page wrapper
- `PageHeader` - Page title & actions

#### Layout Components
- `SecondarySidebarLayout` - Nested sidebar layout
- `SecondarySidebar` - Secondary navigation
- `SecondarySidebarHeader` - Sidebar header
- `SecondaryList` - Registry-based dynamic list renderer

---

## Layout Patterns

### Standard Page Layout

Every feature page should follow this structure:

```tsx
import { PageContainer } from '@/frontend/shared/ui/components/pages/PageContainer'
import { PageHeader } from '@/frontend/shared/ui/components/pages/PageHeader'

export default function {FeatureName}Page() {
  return (
    <PageContainer maxWidth="full" padding={true}>
      <PageHeader
        title="Feature Name"
        subtitle="Optional description"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Feature Name' }
        ]}
        actions={
          <Button>Action Button</Button>
        }
      />

      <div className="space-y-6">
        {/* Main content */}
      </div>
    </PageContainer>
  )
}
```

### Nested Sidebar Layout

For features with secondary navigation:

```tsx
import { SecondarySidebarLayout } from '@/frontend/shared/ui/layout/sidebar/secondary'

export default function {FeatureName}Page() {
  return (
    <SecondarySidebarLayout
      headerProps={{
        title: "Feature Name",
        subtitle: "Description",
        actions: [
          { label: "Action", onClick: handleAction }
        ]
      }}
      sidebarProps={{
        sections: [
          {
            title: "Section 1",
            items: [
              { id: '1', label: 'Item 1', icon: IconComponent }
            ]
          }
        ]
      }}
    >
      {/* Main content with independent scroll */}
      <div className="p-6 space-y-6">
        {/* Content */}
      </div>
    </SecondarySidebarLayout>
  )
}
```

### Card-Based Layout

For dashboard/grid layouts:

```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <Card>
    <CardHeader>
      <CardTitle>Card Title</CardTitle>
    </CardHeader>
    <CardContent>
      {/* Content */}
    </CardContent>
  </Card>
</div>
```

---

## Variant Registry System

### Overview

The **Variant Registry System** is an extensible pattern for rendering dynamic lists with different item types without hardcoding switch/case logic. It's particularly useful for secondary sidebar lists where items can be chats, calls, documents, menus, etc.

**Key Benefits:**
- **Type-Safe**: Zod schema validation for parameters
- **Extensible**: Add custom variants without touching core code
- **DRY**: Reusable across features
- **Maintainable**: Each variant is self-contained

### When to Use

Use the variant registry pattern when:
- You have lists with multiple item types (chat, call, doc, menu, etc.)
- Each item type has different visual rendering and data requirements
- You want to avoid long switch statements or if/else chains
- You need runtime validation of item parameters
- You want features to define custom item types

**Don't use** for:
- Simple homogeneous lists (use standard map)
- Static menus (use regular components)
- Single-type data tables

### Core Concepts

#### 1. Variant Definition

Each variant defines its shape and rendering:

```tsx
import { createVariant, itemVariant } from '@/frontend/shared/ui/layout/sidebar/secondary'
import { z } from 'zod'

// Define parameter schema
const MyParamsSchema = z.object({
  summary: z.string().optional(),
  count: z.number().optional(),
})

// Create variant
export const myCustomVariant = createVariant({
  id: "my-custom",
  title: "My Custom Item Type",
  description: "Description of what this variant renders",
  paramsSchema: MyParamsSchema,
  render: ({ item, params, onAction, utils, slots }) => (
    <button className="w-full flex items-center gap-3 px-3 py-2.5">
      <span className="text-sm font-medium">{item.label}</span>
      {params.count && <Badge>{params.count}</Badge>}
    </button>
  ),
})
```

#### 2. Registering Variants

```tsx
import { itemVariantRegistry, registerBuiltInVariants } from '@/frontend/shared/ui/layout/sidebar/secondary'
import { myCustomVariant } from './variants'

// Register built-in variants (chat, call, doc, menu, status, list)
registerBuiltInVariants()

// Register custom variant
itemVariantRegistry.register(myCustomVariant)
```

#### 3. Using SecondaryList

```tsx
import { SecondaryList, itemVariant } from '@/frontend/shared/ui/layout/sidebar/secondary'

const items = [
  {
    id: '1',
    label: 'Team Chat',
    variantId: itemVariant.chat,
    params: {
      summary: 'Last message preview',
      lastAt: new Date().toISOString(),
      unread: 3,
    }
  },
  {
    id: '2',
    label: 'My Custom Item',
    variantId: itemVariant.custom('my-custom'),
    params: {
      summary: 'Custom data',
      count: 5,
    }
  },
]

<SecondaryList
  items={items}
  loading={false}
  onAction={(id, action, extra) => {
    console.log('Action:', action, 'on item:', id)
  }}
/>
```

### Built-in Variants

#### 1. Chat Variant

For conversation/chat items:

```tsx
{
  variantId: itemVariant.chat,
  params: {
    summary: 'Message preview',
    lastMessage: 'Alternative to summary',
    lastAt: '2025-11-02T10:30:00Z',
    avatarUrl: '/avatar.jpg',
    ai: true,              // Show AI badge
    unread: 3,             // Unread count
    online: true,          // Online status
  }
}
```

**Renders:**
- Avatar (circular)
- Name with AI badge (if applicable)
- Message preview
- Timestamp
- Unread badge (if count > 0)

#### 2. Call Variant

For call/meeting items:

```tsx
{
  variantId: itemVariant.call,
  params: {
    direction: 'in',       // 'in' | 'out' | 'missed'
    medium: 'voice',       // 'voice' | 'video'
    duration: '5:32',      // Optional duration string
    timestamp: '2 hours ago', // Or ISO date string
    avatarUrl: '/avatar.jpg', // Optional avatar URL
    group: false,          // Optional: is group call
    ongoing: false,        // Optional: is call ongoing
  }
}
```

**Renders:**
- Avatar with initials (or image if avatarUrl provided)
- Name
- Call icon (phone/video) with status
- Call direction (Incoming/Outgoing/Missed)
- Duration (if available)
- Timestamp
- Join button (if ongoing)

**Schema Details:**
- `direction`: "in" (incoming), "out" (outgoing), "missed" (missed call)
- `medium`: "voice" or "video"
- `duration`: Optional duration string (e.g., "5:32", "1:23:45")
- `timestamp`: Time string or ISO date
- `avatarUrl`: Optional URL for avatar image
- `group`: Optional boolean for group calls
- `ongoing`: Optional boolean, shows "Join" button if true

#### 3. Doc Variant

For documents/files:

```tsx
{
  variantId: itemVariant.doc,
  params: {
    summary: 'Document description',
    updatedAt: '2025-11-02T10:30:00Z',
    fileType: 'pdf',       // 'pdf' | 'doc' | 'sheet' | 'image' | 'other'
    size: '2.5 MB',        // Optional file size
  }
}
```

**Renders:**
- File type icon
- Document name
- Summary/description
- Last updated time
- File size (if provided)

#### 4. Menu Variant

For hierarchical menu items:

```tsx
{
  variantId: itemVariant.menu,
  params: {
    depth: 0,              // Indentation level (0, 1, 2)
    hasChildren: true,     // Show chevron
    expanded: false,       // Is expanded
    count: 5,              // Optional item count
  }
}
```

**Renders:**
- Indented based on depth
- Icon
- Label
- Expand/collapse chevron
- Optional count badge

#### 5. Status Variant

For status indicators:

```tsx
{
  variantId: itemVariant.status,
  params: {
    status: 'online',      // 'online' | 'away' | 'busy' | 'offline'
    lastSeen: '2 hours ago',
    avatarUrl: '/avatar.jpg',
  }
}
```

**Renders:**
- Avatar with status dot
- Name
- Status text
- Last seen time

#### 6. List Variant

Generic list item:

```tsx
{
  variantId: itemVariant.list,
  params: {
    description: 'Item description',
    meta: 'Additional info',
    showIcon: true,
  }
}
```

**Renders:**
- Icon (if provided and showIcon true)
- Label
- Description
- Meta info

### Creating Custom Variants

#### Step 1: Define Schema and Variant

Create `frontend/features/{feature}/variants/myVariant.tsx`:

```tsx
import { createVariant } from '@/frontend/shared/ui/layout/sidebar/secondary'
import { z } from 'zod'
import { Badge } from '@/components/ui/badge'

const MyVariantParams = z.object({
  priority: z.enum(['low', 'medium', 'high']),
  dueDate: z.string(),
  completed: z.boolean(),
})

export const taskVariant = createVariant({
  id: 'task',
  title: 'Task Item',
  description: 'Renders task items with priority and due date',
  paramsSchema: MyVariantParams,
  render: ({ item, params, onAction, utils }) => {
    const priorityColors = {
      low: 'bg-blue-100 text-blue-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800',
    }

    return (
      <button
        onClick={() => onAction?.(item.id, 'select')}
        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-accent rounded-md"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`text-sm font-medium ${params.completed ? 'line-through text-muted-foreground' : ''}`}>
              {item.label}
            </span>
            <Badge className={priorityColors[params.priority]} variant="outline">
              {params.priority}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Due: {utils.formatTime(params.dueDate)}
          </p>
        </div>
      </button>
    )
  },
})
```

#### Step 2: Register Variant

In your feature initialization:

```tsx
import { itemVariantRegistry } from '@/frontend/shared/ui/layout/sidebar/secondary'
import { taskVariant } from './variants/myVariant'

// Register once (e.g., in feature config or main component)
itemVariantRegistry.register(taskVariant)
```

#### Step 3: Use in Components

```tsx
import { SecondaryList, itemVariant } from '@/frontend/shared/ui/layout/sidebar/secondary'

const tasks = [
  {
    id: '1',
    label: 'Complete design system docs',
    variantId: itemVariant.custom('task'),
    params: {
      priority: 'high',
      dueDate: new Date().toISOString(),
      completed: false,
    }
  },
]

<SecondaryList items={tasks} />
```

### Advanced Features

#### Custom Slots

Inject additional content at specific positions:

```tsx
<SecondaryList
  items={items}
  slots={{
    leading: <Badge>Premium</Badge>,
    trailing: <Button size="sm">Action</Button>,
    badge: <span className="bg-red-500 text-white px-2 py-0.5 rounded">New</span>,
  }}
/>
```

#### Custom Utilities

Override default utility functions:

```tsx
<SecondaryList
  items={items}
  utils={{
    formatTime: (iso) => new Intl.DateTimeFormat('id-ID').format(new Date(iso)),
    truncate: (str, len) => str.length > len ? str.slice(0, len) + '...' : str,
  }}
/>
```

#### Empty & Error States

```tsx
<SecondaryList
  items={items}
  loading={isLoading}
  error={error}
  emptyState={
    <div className="text-center py-8">
      <p className="text-sm text-muted-foreground">No items found</p>
    </div>
  }
/>
```

#### Custom Unknown Renderer

Handle items with unregistered variants:

```tsx
<SecondaryList
  items={items}
  renderUnknown={(ctx) => (
    <div className="px-3 py-2 text-sm text-destructive">
      Unknown variant: {ctx.item.variantId}
    </div>
  )}
/>
```

### Migration from Old Pattern

#### Before (Hardcoded Switch)

```tsx
// ❌ Old pattern: Switch statement
{items.map(item => {
  switch (item.type) {
    case 'chat':
      return <ChatItem key={item.id} {...item} />
    case 'call':
      return <CallItem key={item.id} {...item} />
    case 'doc':
      return <DocItem key={item.id} {...item} />
    default:
      return null
  }
})}
```

#### After (Registry Pattern)

```tsx
// ✅ New pattern: Registry-based
import { SecondaryList, itemVariant, registerBuiltInVariants } from '@/frontend/shared/ui/layout/sidebar/secondary'

// One-time registration
registerBuiltInVariants()

// Transform data
const items = rawItems.map(item => ({
  id: item.id,
  label: item.name,
  variantId: itemVariant[item.type], // chat, call, doc, etc.
  params: item.metadata,
}))

// Render
<SecondaryList items={items} onAction={handleAction} />
```

### Best Practices

#### 1. Type Safety

Always use Zod schemas for params:

```tsx
// ✅ DO: Strong typing with Zod
const ParamsSchema = z.object({
  count: z.number().min(0),
  status: z.enum(['active', 'inactive']),
})

// ❌ DON'T: Any type
paramsSchema: z.any()
```

#### 2. Consistent Rendering

Keep visual consistency across variants:

```tsx
// ✅ DO: Consistent padding, gaps, and hover states
<button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-accent rounded-md">

// ❌ DON'T: Inconsistent spacing
<div className="p-2">  // Different from other variants
```

#### 3. Accessible Markup

Use semantic HTML and ARIA attributes:

```tsx
// ✅ DO: Proper button with aria-label
<button
  aria-label={`Select ${item.label}`}
  onClick={() => onAction?.(item.id, 'select')}
>
```

#### 4. Error Handling

Validate params in render function if needed:

```tsx
render: ({ item, params }) => {
  // Params are already validated by Zod schema
  // But you can add runtime checks if needed
  if (!params.count) {
    return <div>Invalid params</div>
  }

  return <div>{/* Normal render */}</div>
}
```

#### 5. Performance

For large lists (>100 items), consider virtualization:

```tsx
import { Virtuoso } from 'react-virtuoso'

<Virtuoso
  data={items}
  itemContent={(index, item) => {
    const def = itemVariantRegistry.get(item.variantId)
    return def?.render({ item, params: item.params, ... })
  }}
/>
```

### Examples

#### Chat Feature Example

```tsx
'use client'

import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { SecondaryList, itemVariant, registerBuiltInVariants } from '@/frontend/shared/ui/layout/sidebar/secondary'
import { SecondarySidebarLayout } from '@/frontend/shared/ui/layout/sidebar/secondary'

// Register variants once
registerBuiltInVariants()

export default function ChatPage() {
  const conversations = useQuery(api.chat.listConversations)

  const items = conversations?.map(conv => ({
    id: conv._id,
    label: conv.name,
    variantId: itemVariant.chat,
    href: `/chat/${conv._id}`,
    active: conv.isActive,
    params: {
      summary: conv.lastMessage,
      lastAt: conv.updatedAt,
      avatarUrl: conv.avatar,
      ai: conv.isAI,
      unread: conv.unreadCount,
      online: conv.isOnline,
    }
  })) ?? []

  return (
    <SecondarySidebarLayout
      headerProps={{ title: 'Messages' }}
      sidebar={
        <SecondaryList
          items={items}
          loading={conversations === undefined}
          onAction={(id, action) => {
            if (action === 'select') {
              router.push(`/chat/${id}`)
            }
          }}
        />
      }
    >
      {/* Chat content */}
    </SecondarySidebarLayout>
  )
}
```

#### Menu Store Example

```tsx
import { SecondaryList, itemVariant, registerBuiltInVariants } from '@/frontend/shared/ui/layout/sidebar/secondary'
import { menuVariant } from './variants/menuVariant'

// Register variants
registerBuiltInVariants()
itemVariantRegistry.register(menuVariant)

const items = [
  {
    id: '1',
    label: 'Products',
    icon: ShoppingBag,
    variantId: itemVariant.menu,
    params: {
      depth: 0,
      hasChildren: true,
      expanded: true,
      count: 12,
    }
  },
  {
    id: '1-1',
    label: 'Electronics',
    variantId: itemVariant.menu,
    params: {
      depth: 1,
      hasChildren: false,
      count: 5,
    }
  },
]

<SecondaryList items={items} />
```

---

## Common Patterns

### Loading States

```tsx
import { Skeleton } from '@/components/ui/skeleton'

// Loading skeleton
{loading ? (
  <div className="space-y-2">
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-3/4" />
  </div>
) : (
  <div>{content}</div>
)}
```

### Empty States

```tsx
<div className="flex flex-col items-center justify-center py-12 text-center">
  <IconComponent className="h-12 w-12 text-muted-foreground mb-4" />
  <h3 className="text-lg font-medium text-foreground">No items found</h3>
  <p className="text-sm text-muted-foreground mt-1">
    Get started by creating your first item.
  </p>
  <Button className="mt-4">Create Item</Button>
</div>
```

### Error States

```tsx
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>
    {error.message}
  </AlertDescription>
</Alert>
```

### Form Layout

```tsx
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

<form onSubmit={handleSubmit} className="space-y-4">
  <div className="space-y-2">
    <Label htmlFor="name">Name</Label>
    <Input
      id="name"
      type="text"
      placeholder="Enter name"
      value={form.name}
      onChange={(e) => setForm({ ...form, name: e.target.value })}
    />
  </div>

  <div className="flex justify-end gap-2">
    <Button type="button" variant="outline" onClick={handleCancel}>
      Cancel
    </Button>
    <Button type="submit">Save</Button>
  </div>
</form>
```

### Data Table

```tsx
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {items.map(item => (
      <TableRow key={item.id}>
        <TableCell>{item.name}</TableCell>
        <TableCell>
          <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>
            {item.status}
          </Badge>
        </TableCell>
        <TableCell>
          <Button size="sm" variant="ghost">Edit</Button>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

---

## Best Practices

### 1. Import Organization

```tsx
// ✅ DO: Organize imports in this order
// 1. React/Next.js
import { useState, useEffect } from 'react'
import Link from 'next/link'

// 2. Third-party libraries
import { useQuery } from 'convex/react'

// 3. UI Components (@/components/ui)
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

// 4. Shared components
import { PageContainer } from '@/frontend/shared/ui/components/pages/PageContainer'

// 5. Feature-specific
import { useBackend } from '../shared/hooks/useBackend'

// 6. Icons (last)
import { Plus, Edit, Trash } from 'lucide-react'
```

### 2. Use Absolute Imports

```tsx
// ❌ DON'T: Relative imports
import { Button } from '../../../shared/components/Button'

// ✅ DO: Absolute imports
import { Button } from '@/components/ui/button'
import { PageContainer } from '@/frontend/shared/ui/components/pages/PageContainer'
```

### 3. Consistent Spacing

```tsx
// ✅ DO: Use consistent spacing
<div className="space-y-6">        {/* Vertical spacing between sections */}
  <div className="space-y-4">      {/* Spacing within section */}
    <div className="flex gap-2">   {/* Spacing between inline elements */}
      <Button>Action 1</Button>
      <Button>Action 2</Button>
    </div>
  </div>
</div>
```

### 4. Semantic HTML

```tsx
// ✅ DO: Use semantic HTML
<header>
  <h1>Title</h1>
</header>

<main>
  <section>
    <article>
      {/* Content */}
    </article>
  </section>
</main>

// ❌ DON'T: Div soup
<div>
  <div className="title">Title</div>
  <div>
    <div>Content</div>
  </div>
</div>
```

### 5. Loading & Error Handling

```tsx
// ✅ DO: Handle all states
export default function Page() {
  const data = useQuery(api.{domain}.list)

  if (data === undefined) {
    return <Skeleton className="h-64 w-full" />
  }

  if (data.error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{data.error}</AlertDescription>
      </Alert>
    )
  }

  return <div>{/* Render data */}</div>
}
```

### 6. Responsive Design

```tsx
// ✅ DO: Mobile-first responsive design
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Content */}
</div>

<div className="flex flex-col md:flex-row gap-4">
  {/* Content */}
</div>

<h1 className="text-xl md:text-2xl lg:text-3xl">Title</h1>
```

### 7. Consistent Button Variants

```tsx
// Primary action
<Button>Save</Button>

// Secondary action
<Button variant="outline">Cancel</Button>

// Destructive action
<Button variant="destructive">Delete</Button>

// Ghost/subtle action
<Button variant="ghost">Edit</Button>

// Link-style button
<Button variant="link">Learn More</Button>
```

### 8. Use Design Tokens

```tsx
// ❌ DON'T: Hardcode colors
<div className="bg-blue-500 text-white">

// ✅ DO: Use design tokens
<div className="bg-primary text-primary-foreground">

// ❌ DON'T: Hardcode spacing
<div style={{ padding: '16px', margin: '8px' }}>

// ✅ DO: Use Tailwind classes
<div className="p-4 m-2">
```

---

## Accessibility

### Focus States

All interactive elements must have visible focus states:

```tsx
// Already built into shadcn components via --ring color
<Button>I have focus ring</Button>

// For custom elements
<div className="focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
```

### ARIA Labels

```tsx
// Icon-only buttons need labels
<Button aria-label="Close dialog">
  <X className="h-4 w-4" />
</Button>

// Decorative icons should be hidden
<Icon aria-hidden="true" />
```

### Keyboard Navigation

```tsx
// Use semantic HTML for automatic keyboard support
<button>Keyboard accessible</button>

// For custom interactive elements
<div
  role="button"
  tabIndex={0}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick()
    }
  }}
>
```

### Color Contrast

All text must meet WCAG AA contrast requirements:
- Normal text: 4.5:1 minimum
- Large text: 3:1 minimum

```tsx
// ✅ DO: Use semantic colors with proper contrast
<p className="text-foreground">Good contrast</p>
<p className="text-muted-foreground">Subtle but still readable</p>

// ❌ DON'T: Use colors with poor contrast
<p className="text-gray-300">Too light on white</p>
```

---

## Checklist for New Features

When creating a new feature UI:

### Layout & Structure
- [ ] Use `PageContainer` and `PageHeader` for consistent layout
- [ ] Import components from `@/components/ui/` (absolute imports)
- [ ] For secondary navigation, use `SecondarySidebarLayout`
- [ ] For dynamic lists with multiple item types, use `SecondaryList` with variant registry

### Styling & Design
- [ ] Use design tokens (no hardcoded colors)
- [ ] Ensure responsive design (mobile-first)
- [ ] Consistent spacing (space-y-6, gap-4, etc.)

### States & Validation
- [ ] Implement loading states with `Skeleton`
- [ ] Implement error states with `Alert`
- [ ] Implement empty states
- [ ] Add proper TypeScript types

### Variant Registry (if using SecondaryList)
- [ ] Register built-in variants with `registerBuiltInVariants()`
- [ ] Create custom variants if needed (with Zod schema)
- [ ] Use branded `variantId` types (e.g., `itemVariant.chat`)
- [ ] Validate params with Zod schemas
- [ ] Handle unknown variants with `renderUnknown`

### Accessibility
- [ ] Test keyboard navigation
- [ ] Verify focus states are visible
- [ ] Check color contrast (WCAG AA)
- [ ] Add proper ARIA labels for icon buttons
- [ ] Use semantic HTML (button, nav, article, etc.)

---

## Examples

### Complete Page Example

```tsx
'use client'

import { useState, useEffect } from 'react'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'

// UI Components
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'

// Shared Components
import { PageContainer } from '@/frontend/shared/ui/components/pages/PageContainer'
import { PageHeader } from '@/frontend/shared/ui/components/pages/PageHeader'

// Icons
import { Plus, AlertCircle } from 'lucide-react'

export default function {FeatureName}Page() {
  const items = useQuery(api.{domain}.list)

  // Loading state
  if (items === undefined) {
    return (
      <PageContainer>
        <Skeleton className="h-12 w-64 mb-6" />
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </PageContainer>
    )
  }

  // Error state
  if (items.error) {
    return (
      <PageContainer>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{items.error}</AlertDescription>
        </Alert>
      </PageContainer>
    )
  }

  // Empty state
  if (items.length === 0) {
    return (
      <PageContainer>
        <PageHeader title="Feature Name" />
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Plus className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No items yet</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Get started by creating your first item.
          </p>
          <Button className="mt-4">
            <Plus className="h-4 w-4 mr-2" />
            Create Item
          </Button>
        </div>
      </PageContainer>
    )
  }

  // Success state
  return (
    <PageContainer maxWidth="full" padding={true}>
      <PageHeader
        title="Feature Name"
        subtitle="Manage your items"
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Feature Name' }
        ]}
        actions={
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create New
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {items.map(item => (
          <Card key={item.id}>
            <CardHeader>
              <CardTitle>{item.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{item.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageContainer>
  )
}
```

---

## Resources

### Documentation
- [shadcn/ui Documentation](https://ui.shadcn.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev/)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

### Internal Files
- `app/globals.css` - Design tokens
- `components/ui/` - shadcn/ui components
- `frontend/shared/ui/` - Shared custom components
- `lib/utils.ts` - Utility functions (cn, etc.)

---

**Questions?** Check [Troubleshooting](./4_TROUBLESHOOTING.md) or ask the team.

**Last Updated:** 2025-11-02
