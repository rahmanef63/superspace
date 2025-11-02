# UI Quick Reference Cheatsheet

> **Fast lookup for common UI patterns in SuperSpace**

---

## Component Imports

```tsx
// shadcn/ui components
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

// Shared components
import { PageContainer } from '@/frontend/shared/ui/components/pages/PageContainer'
import { PageHeader } from '@/frontend/shared/ui/components/pages/PageHeader'
import { SecondarySidebarLayout, SecondaryList, itemVariant, registerBuiltInVariants } from '@/frontend/shared/ui/layout/sidebar/secondary'

// Icons
import { Plus, Edit, Trash, Save, X } from 'lucide-react'
```

---

## Page Template

```tsx
'use client'

import { PageContainer } from '@/frontend/shared/ui/components/pages/PageContainer'
import { PageHeader } from '@/frontend/shared/ui/components/pages/PageHeader'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

export default function Page() {
  return (
    <PageContainer maxWidth="full" padding={true}>
      <PageHeader
        title="Page Title"
        subtitle="Optional description"
        actions={<Button><Plus className="h-4 w-4 mr-2" />New</Button>}
      />
      <div className="space-y-6">
        {/* Content */}
      </div>
    </PageContainer>
  )
}
```

---

## Button Variants

```tsx
<Button>Primary</Button>
<Button variant="outline">Outline</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="destructive">Delete</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon"><Icon /></Button>

// With icon
<Button>
  <Plus className="h-4 w-4 mr-2" />
  New Item
</Button>
```

---

## Card Layouts

```tsx
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card'

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

---

## Forms

```tsx
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
    <Button type="button" variant="outline">Cancel</Button>
    <Button type="submit">Save</Button>
  </div>
</form>
```

---

## Loading State

```tsx
import { Skeleton } from '@/components/ui/skeleton'

{loading ? (
  <div className="space-y-2">
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-3/4" />
  </div>
) : (
  <div>{content}</div>
)}
```

---

## Error State

```tsx
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertDescription>{error.message}</AlertDescription>
</Alert>
```

---

## Empty State

```tsx
<div className="flex flex-col items-center justify-center py-12 text-center">
  <Icon className="h-12 w-12 text-muted-foreground mb-4" />
  <h3 className="text-lg font-medium">No items found</h3>
  <p className="text-sm text-muted-foreground mt-1">Description</p>
  <Button className="mt-4">Create New</Button>
</div>
```

---

## Grid Layouts

```tsx
// 1-2-3 responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {items.map(item => <Card key={item.id}>...</Card>)}
</div>

// 1-2 responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {items.map(item => <Card key={item.id}>...</Card>)}
</div>
```

---

## Tables

```tsx
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'

<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {items.map(item => (
      <TableRow key={item.id}>
        <TableCell>{item.name}</TableCell>
        <TableCell>
          <Badge>{item.status}</Badge>
        </TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

---

## Dialogs

```tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'

const [open, setOpen] = useState(false)

<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
    </DialogHeader>
    <div>
      {/* Content */}
    </div>
    <DialogFooter>
      <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
      <Button onClick={handleSave}>Save</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

## Badges

```tsx
import { Badge } from '@/components/ui/badge'

<Badge>Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="destructive">Destructive</Badge>
<Badge variant="outline">Outline</Badge>
```

---

## Color Classes

```tsx
// Backgrounds
bg-background      // Main background
bg-card            // Card background
bg-muted           // Subtle background
bg-primary         // Primary action
bg-secondary       // Secondary action
bg-accent          // Accent
bg-destructive     // Danger

// Text
text-foreground
text-muted-foreground
text-primary
text-destructive

// Borders
border-border
border-input
```

---

## Spacing

```tsx
// Padding
p-2   // 0.5rem (8px)
p-4   // 1rem (16px)
p-6   // 1.5rem (24px)

// Margin
m-2, m-4, m-6

// Gap (flexbox/grid)
gap-2  // 0.5rem
gap-4  // 1rem
gap-6  // 1.5rem

// Space between (vertical)
space-y-2  // 0.5rem
space-y-4  // 1rem
space-y-6  // 1.5rem
```

---

## Typography

```tsx
// Headings
<h1 className="text-2xl font-bold">Title</h1>
<h2 className="text-xl font-semibold">Section</h2>
<h3 className="text-lg font-medium">Subsection</h3>

// Body text
<p className="text-sm text-muted-foreground">Description</p>
```

---

## Responsive Design

```tsx
// Mobile-first
<div className="text-sm md:text-base lg:text-lg">
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
<div className="flex flex-col md:flex-row">
```

---

## Common Patterns

### Delete Confirmation
```tsx
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'

<AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
      <AlertDialogDescription>
        This action cannot be undone.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

### Toast Notification
```tsx
import { useToast } from '@/hooks/use-toast'

const { toast } = useToast()

toast({
  title: "Success",
  description: "Item saved successfully",
})

toast({
  title: "Error",
  description: "Failed to save item",
  variant: "destructive",
})
```

### Secondary Sidebar
```tsx
import { SecondarySidebarLayout } from '@/frontend/shared/ui/layout/sidebar/secondary'

<SecondarySidebarLayout
  headerProps={{
    title: "Title",
    subtitle: "Description"
  }}
  sidebarProps={{
    sections: [{
      title: "Section",
      items: [{ id: '1', label: 'Item 1' }]
    }]
  }}
>
  <div className="p-6">
    {/* Main content */}
  </div>
</SecondarySidebarLayout>
```

---

## Variant Registry System

### Setup Registry (Once per feature)
```tsx
import { registerBuiltInVariants } from '@/frontend/shared/ui/layout/sidebar/secondary'

// Call once when feature loads
registerBuiltInVariants()
```

### Chat Items
```tsx
import { SecondaryList, itemVariant } from '@/frontend/shared/ui/layout/sidebar/secondary'

const items = conversations.map(conv => ({
  id: conv.id,
  label: conv.name,
  variantId: itemVariant.chat,
  href: `/chat/${conv.id}`,
  params: {
    summary: conv.lastMessage,
    lastAt: conv.updatedAt,
    unread: conv.unreadCount,
    avatarUrl: conv.avatar,
    ai: conv.isAI,
    online: conv.isOnline,
  }
}))

<SecondaryList items={items} loading={loading} onAction={(id) => router.push(`/chat/${id}`)} />
```

### Call Items
```tsx
const items = calls.map(call => ({
  id: call.id,
  label: call.contactName,
  variantId: itemVariant.call,
  params: {
    direction: 'in', // 'in' | 'out' | 'missed'
    medium: 'voice', // 'voice' | 'video'
    duration: '5:32',
    timestamp: '2 hours ago',
    avatarUrl: call.avatar, // Optional avatar URL
    group: false,
    ongoing: false,
  }
}))

<SecondaryList items={items} />
```

### Document Items
```tsx
const items = documents.map(doc => ({
  id: doc.id,
  label: doc.name,
  variantId: itemVariant.doc,
  params: {
    summary: doc.description,
    updatedAt: doc.updatedAt,
    fileType: 'pdf', // 'pdf' | 'doc' | 'sheet' | 'image' | 'other'
    size: '2.5 MB',
  }
}))

<SecondaryList items={items} />
```

### Menu Items (Hierarchical)
```tsx
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

### Status Items
```tsx
const items = users.map(user => ({
  id: user.id,
  label: user.name,
  variantId: itemVariant.status,
  params: {
    status: 'online', // 'online' | 'away' | 'busy' | 'offline'
    lastSeen: '2 hours ago',
    avatarUrl: user.avatar,
  }
}))

<SecondaryList items={items} />
```

### Custom Variant
```tsx
import { createVariant, itemVariantRegistry } from '@/frontend/shared/ui/layout/sidebar/secondary'
import { z } from 'zod'

// 1. Define variant
const TaskParams = z.object({
  priority: z.enum(['low', 'medium', 'high']),
  dueDate: z.string(),
  completed: z.boolean(),
})

const taskVariant = createVariant({
  id: 'task',
  paramsSchema: TaskParams,
  render: ({ item, params }) => (
    <button className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-accent rounded-md">
      <span className={params.completed ? 'line-through' : ''}>{item.label}</span>
      <Badge>{params.priority}</Badge>
    </button>
  ),
})

// 2. Register variant
itemVariantRegistry.register(taskVariant)

// 3. Use variant
const items = tasks.map(task => ({
  id: task.id,
  label: task.name,
  variantId: itemVariant.custom('task'),
  params: {
    priority: task.priority,
    dueDate: task.dueDate,
    completed: task.completed,
  }
}))

<SecondaryList items={items} />
```

### With States
```tsx
<SecondaryList
  items={items}
  loading={items === undefined}
  error={error}
  emptyState={
    <div className="text-center py-8">
      <p className="text-sm text-muted-foreground">No items found</p>
      <Button className="mt-4">Create New</Button>
    </div>
  }
  onAction={(id, action) => {
    if (action === 'select') handleSelect(id)
  }}
/>
```

**Full Documentation:** [Variant Registry System](./6_DESIGN_SYSTEM.md#variant-registry-system)

---

## All States Template

```tsx
export default function Page() {
  const data = useQuery(api.{domain}.list)

  // Loading
  if (data === undefined) {
    return (
      <PageContainer>
        <Skeleton className="h-64 w-full" />
      </PageContainer>
    )
  }

  // Error
  if (data.error) {
    return (
      <PageContainer>
        <Alert variant="destructive">
          <AlertDescription>{data.error}</AlertDescription>
        </Alert>
      </PageContainer>
    )
  }

  // Empty
  if (data.length === 0) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center py-12 text-center">
          <Icon className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No items</h3>
          <Button className="mt-4">Create New</Button>
        </div>
      </PageContainer>
    )
  }

  // Success
  return (
    <PageContainer>
      <PageHeader title="Title" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map(item => <Card key={item.id}>...</Card>)}
      </div>
    </PageContainer>
  )
}
```

---

**Full Documentation:** [6_DESIGN_SYSTEM.md](./6_DESIGN_SYSTEM.md)
