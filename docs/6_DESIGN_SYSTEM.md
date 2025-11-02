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
7. [Common Patterns](#common-patterns)
8. [Best Practices](#best-practices)
9. [Accessibility](#accessibility)

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

- [ ] Use `PageContainer` and `PageHeader` for consistent layout
- [ ] Import components from `@/components/ui/` (absolute imports)
- [ ] Use design tokens (no hardcoded colors)
- [ ] Implement loading states with `Skeleton`
- [ ] Implement error states with `Alert`
- [ ] Implement empty states
- [ ] Add proper TypeScript types
- [ ] Ensure responsive design (mobile-first)
- [ ] Test keyboard navigation
- [ ] Verify focus states are visible
- [ ] Check color contrast (WCAG AA)
- [ ] Add proper ARIA labels for icon buttons

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
