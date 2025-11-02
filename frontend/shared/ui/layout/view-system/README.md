# Universal View System 🎯

**✅ SSOT (Single Source of Truth) for all view-related functionality**

Flexible, registry-based view system for displaying data in 18+ different layouts.

Perfect for content areas in super apps like Windows Explorer, Notion, or Airtable.

---

## 📁 **File Structure (SSOT)**

```
view-system/                    ← SSOT for all views
├── types.ts                    ← Type definitions (385 lines)
├── registry.ts                 ← View registration (536 lines)
├── provider.tsx                ← State management (370 lines)
├── renderer.tsx                ← Dynamic renderer (241 lines)
├── index.ts                    ← Public API
├── README.md                   ← This file
└── views/                      ← All view implementations
    ├── Table/
    │   └── TableView.tsx       ← ✅ Advanced table (TanStack)
    ├── GridView.tsx            ← ✅ Card grid layout
    ├── DetailListView.tsx      ← ✅ Detailed list
    ├── CardView.tsx            ← ✅ Card/Gallery view
    └── [14 more to implement]
```

### ⚠️ **Deprecated: `../view/` folder**
The legacy `view/` folder is deprecated. Use `view-system/` instead.
- ❌ Old: `import { TableView } from '@/frontend/shared/ui/layout/view'`
- ✅ New: `import { TableView } from '@/frontend/shared/ui/layout/view-system'`

---

## 🎯 **Philosophy**

There are 2 main layout types in super apps:

### 1. **Secondary Sidebar Layout**
- Sidebar + Content (chat, documents with tree navigation)
- Uses `SecondarySidebarLayout` component

### 2. **View System** ← **THIS!**
- Content area that can switch between various display formats
- Table, Kanban, Calendar, Timeline, Gallery, etc.
- Uses `ViewProvider` + `ViewRenderer`

---

## 📦 **Available View Types (18 Total)**

### **✅ Implemented (4/18)**
| View | Icon | Description | Best For |
|------|------|-------------|----------|
| `table` | 📊 | Traditional data table | Spreadsheet-like data, many columns |
| `list` | 📋 | Vertical list with dividers | Simple lists, messages |
| `compact` | 📑 | Dense list | Small screens, many items |

### **Card-Based Views**
| View | Icon | Description | Best For |
|------|------|-------------|----------|
| `grid` | ⬜ | Responsive grid of cards | Products, portfolios, projects |
| `gallery` | 🖼️ | Image-focused gallery | Photos, designs, visual content |
| `tiles` | 🔲 | Compact tile grid | Apps, quick navigation |
| `masonry` | 🧱 | Pinterest-style layout | Variable height cards, feeds |

### **Board Views**
| View | Icon | Description | Best For |
|------|------|-------------|----------|
| `kanban` | 📌 | Kanban board | Task management, workflows |
| `board` | 📋 | Generic board | Custom grouping |

### **Time-Based Views**
| View | Icon | Description | Best For |
|------|------|-------------|----------|
| `calendar` | 📅 | Month/week/day calendar | Events, schedules, deadlines |
| `timeline` | ⏳ | Horizontal timeline | Project planning, history |
| `gantt` | 📊 | Gantt chart | Project management |

### **Hierarchical Views**
| View | Icon | Description | Best For |
|------|------|-------------|----------|
| `tree` | 🌲 | Hierarchical tree | File system, org chart |
| `nested` | 📂 | Nested lists | Comments, threads |

### **Specialized Views**
| View | Icon | Description | Best For |
|------|------|-------------|----------|
| `map` | 🗺️ | Geographic map | Locations, stores, offices |
| `chart` | 📈 | Data visualization | Analytics, dashboards |
| `feed` | 📰 | Social media feed | Activity, news |
| `inbox` | 📨 | Email/message inbox | Messages, notifications |

---

## 🚀 **Quick Start**

### **Basic Usage**

```tsx
import { ViewProvider, ViewRenderer, ViewType } from '@/frontend/shared/ui/layout/view-system'
import { useQuery } from 'convex/react'
import { api } from '@convex/_generated/api'

function MyFeaturePage() {
  const tasks = useQuery(api.tasks.list)
  
  return (
    <ViewProvider
      data={tasks || []}
      config={{
        id: "tasks-view",
        type: ViewType.TABLE,
        label: "Tasks",
        columns: [
          { id: "title", label: "Title", accessorKey: "title" },
          { id: "status", label: "Status", accessorKey: "status" },
          { id: "assignee", label: "Assignee", accessorKey: "assignee" },
        ],
      }}
      storageKey="tasks.view"
    >
      <ViewRenderer />
    </ViewProvider>
  )
}
```

### **With Toolbar Integration**

```tsx
import { ViewProvider, ViewRenderer, ViewType } from '@/frontend/shared/ui/layout/view-system'
import { UniversalToolbar, toolType } from '@/frontend/shared/ui/layout/toolbar'

function TasksPage() {
  const tasks = useQuery(api.tasks.list)
  
  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <UniversalToolbar
        tools={[
          {
            id: "view",
            type: toolType.view,
            params: {
              options: [
                { label: "Table", value: ViewType.TABLE, icon: Table },
                { label: "Kanban", value: ViewType.KANBAN, icon: Kanban },
                { label: "Calendar", value: ViewType.CALENDAR, icon: Calendar },
              ],
              currentView: "table", // Will be synced with ViewProvider
              onChange: (view) => {}, // Handled by ViewProvider
            }
          }
        ]}
      />
      
      {/* View Content */}
      <div className="flex-1 overflow-auto">
        <ViewProvider
          data={tasks || []}
          config={{
            id: "tasks",
            type: ViewType.TABLE,
            label: "Tasks",
            columns: [...],
          }}
          storageKey="tasks.view"
        >
          <ViewRenderer />
        </ViewProvider>
      </div>
    </div>
  )
}
```

---

## 📚 **Complete Examples**

### **Example 1: Table View with Actions**

```tsx
import { ViewProvider, ViewRenderer, ViewType, type ViewConfig } from '@/frontend/shared/ui/layout/view-system'
import { Edit, Trash, Eye } from 'lucide-react'

interface Task {
  _id: string
  title: string
  status: "todo" | "in-progress" | "done"
  assignee: string
  dueDate: string
}

function TasksTable() {
  const tasks = useQuery(api.tasks.list)
  
  const config: ViewConfig<Task> = {
    id: "tasks-table",
    type: ViewType.TABLE,
    label: "Tasks Table",
    
    columns: [
      {
        id: "title",
        label: "Title",
        accessorKey: "title",
        sortable: true,
        filterable: true,
      },
      {
        id: "status",
        label: "Status",
        accessorKey: "status",
        sortable: true,
        render: (task, value) => (
          <Badge variant={
            value === "done" ? "success" :
            value === "in-progress" ? "warning" :
            "default"
          }>
            {value}
          </Badge>
        ),
      },
      {
        id: "assignee",
        label: "Assignee",
        accessorKey: "assignee",
        sortable: true,
      },
      {
        id: "dueDate",
        label: "Due Date",
        accessorKey: "dueDate",
        sortable: true,
        render: (task, value) => formatDate(value),
      },
    ],
    
    rowActions: [
      {
        id: "view",
        label: "View",
        icon: Eye,
        onClick: (task) => console.log("View", task),
      },
      {
        id: "edit",
        label: "Edit",
        icon: Edit,
        onClick: (task) => console.log("Edit", task),
      },
      {
        id: "delete",
        label: "Delete",
        icon: Trash,
        onClick: (task) => console.log("Delete", task),
        variant: "destructive",
        confirm: {
          title: "Delete task?",
          description: "This action cannot be undone.",
        },
      },
    ],
    
    settings: {
      density: "comfortable",
      showPagination: true,
      pageSize: 20,
      selectable: true,
      multiSelect: true,
    },
  }
  
  return (
    <ViewProvider data={tasks || []} config={config} storageKey="tasks.table">
      <ViewRenderer />
    </ViewProvider>
  )
}
```

### **Example 2: Kanban Board**

```tsx
import { ViewProvider, ViewRenderer, ViewType, type ViewConfig } from '@/frontend/shared/ui/layout/view-system'

function TasksKanban() {
  const tasks = useQuery(api.tasks.list)
  
  const config: ViewConfig<Task> = {
    id: "tasks-kanban",
    type: ViewType.KANBAN,
    label: "Tasks Board",
    
    groups: [
      {
        id: "todo",
        label: "To Do",
        accessor: "status",
        color: "gray",
        icon: Circle,
      },
      {
        id: "in-progress",
        label: "In Progress",
        accessor: "status",
        color: "blue",
        icon: Clock,
      },
      {
        id: "done",
        label: "Done",
        accessor: "status",
        color: "green",
        icon: CheckCircle,
      },
    ],
    
    renderCard: (task) => (
      <Card>
        <CardHeader>
          <CardTitle>{task.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{task.assignee}</p>
          <p className="text-xs text-muted-foreground">{formatDate(task.dueDate)}</p>
        </CardContent>
      </Card>
    ),
    
    onItemDrag: async (task, targetGroup) => {
      // Update task status
      await updateTask({
        id: task._id,
        status: targetGroup as Task["status"],
      })
    },
    
    settings: {
      swimlanes: false,
      wipLimit: 5, // Max 5 items per column
      draggable: true,
    },
  }
  
  return (
    <ViewProvider data={tasks || []} config={config} storageKey="tasks.kanban">
      <ViewRenderer />
    </ViewProvider>
  )
}
```

### **Example 3: Calendar View**

```tsx
import { ViewProvider, ViewRenderer, ViewType, type ViewConfig } from '@/frontend/shared/ui/layout/view-system'

interface Event {
  _id: string
  title: string
  startDate: string
  endDate: string
  type: "meeting" | "deadline" | "event"
}

function EventsCalendar() {
  const events = useQuery(api.events.list)
  
  const config: ViewConfig<Event> = {
    id: "events-calendar",
    type: ViewType.CALENDAR,
    label: "Events Calendar",
    
    fields: [
      {
        id: "title",
        label: "Title",
        type: "text",
      },
      {
        id: "startDate",
        label: "Start Date",
        type: "date",
      },
      {
        id: "endDate",
        label: "End Date",
        type: "date",
      },
      {
        id: "type",
        label: "Type",
        type: "select",
        options: [
          { label: "Meeting", value: "meeting", color: "blue" },
          { label: "Deadline", value: "deadline", color: "red" },
          { label: "Event", value: "event", color: "green" },
        ],
      },
    ],
    
    renderItem: (event) => (
      <div className={cn(
        "p-2 rounded text-xs",
        event.type === "meeting" && "bg-blue-100 text-blue-900",
        event.type === "deadline" && "bg-red-100 text-red-900",
        event.type === "event" && "bg-green-100 text-green-900",
      )}>
        {event.title}
      </div>
    ),
    
    settings: {
      defaultView: "month",
      firstDayOfWeek: 1, // Monday
    },
  }
  
  return (
    <ViewProvider data={events || []} config={config} storageKey="events.calendar">
      <ViewRenderer />
    </ViewProvider>
  )
}
```

### **Example 4: Gallery View**

```tsx
import { ViewProvider, ViewRenderer, ViewType, type ViewConfig } from '@/frontend/shared/ui/layout/view-system'

interface Photo {
  _id: string
  url: string
  title: string
  author: string
  likes: number
}

function PhotoGallery() {
  const photos = useQuery(api.photos.list)
  
  const config: ViewConfig<Photo> = {
    id: "photos-gallery",
    type: ViewType.GALLERY,
    label: "Photo Gallery",
    
    renderCard: (photo) => (
      <div className="group relative overflow-hidden rounded-lg">
        <img
          src={photo.url}
          alt={photo.title}
          className="h-full w-full object-cover transition group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/60 opacity-0 transition group-hover:opacity-100 flex flex-col justify-end p-4">
          <h3 className="text-white font-semibold">{photo.title}</h3>
          <p className="text-white/80 text-sm">{photo.author}</p>
          <div className="flex items-center gap-2 mt-2">
            <Heart className="h-4 w-4 text-white" />
            <span className="text-white text-sm">{photo.likes}</span>
          </div>
        </div>
      </div>
    ),
    
    settings: {
      gridColumns: "auto",
      gap: 4,
      cardWidth: 300,
    },
  }
  
  return (
    <ViewProvider data={photos || []} config={config} storageKey="photos.gallery">
      <ViewRenderer />
    </ViewProvider>
  )
}
```

---

## 🎨 **View Configuration Options**

### **Column Configuration** (Table/List)

```tsx
{
  id: string                    // Unique column ID
  label: string                 // Column header label
  accessorKey?: keyof T         // Direct property access
  accessor?: (item: T) => any   // Custom accessor function
  render?: (item, value) => ReactNode  // Custom cell renderer
  sortable?: boolean            // Enable sorting
  filterable?: boolean          // Enable filtering
  width?: string | number       // Fixed width
  minWidth?: string | number    // Minimum width
  maxWidth?: string | number    // Maximum width
  align?: "left" | "center" | "right"  // Text alignment
  sticky?: boolean              // Sticky column
  hidden?: boolean              // Hide column
  resizable?: boolean           // Resizable column
}
```

### **Field Configuration** (Forms/Cards)

```tsx
{
  id: string
  label: string
  type: "text" | "number" | "date" | "boolean" | "select" | "multiselect" | 
        "image" | "file" | "url" | "email" | "phone" | "color" | 
        "rating" | "progress" | "tag" | "user" | "relation"
  accessor?: (item: T) => any
  render?: (item, value) => ReactNode
  editable?: boolean
  required?: boolean
  placeholder?: string
  options?: Array<{ label, value, icon?, color? }>
  validation?: (value) => string | undefined
  defaultValue?: any
  hidden?: boolean
}
```

### **Group Configuration** (Kanban/Board)

```tsx
{
  id: string
  label: string
  accessor: keyof T | string | ((item: T) => string)
  color?: string
  icon?: LucideIcon
  collapsible?: boolean
  defaultCollapsed?: boolean
  count?: number
}
```

### **Action Configuration**

```tsx
{
  id: string
  label: string
  icon?: LucideIcon
  onClick: (item: T) => void | Promise<void>
  variant?: "default" | "outline" | "ghost" | "destructive" | "secondary"
  disabled?: boolean | ((item: T) => boolean)
  hidden?: boolean | ((item: T) => boolean)
  confirm?: {
    title: string
    description: string
  }
}
```

### **View Settings**

```tsx
{
  // Display
  density?: "compact" | "comfortable" | "spacious"
  showHeader?: boolean
  showFooter?: boolean
  showSearch?: boolean
  showFilters?: boolean
  showGrouping?: boolean
  showPagination?: boolean
  
  // Behavior
  selectable?: boolean
  multiSelect?: boolean
  draggable?: boolean
  resizable?: boolean
  sortable?: boolean
  filterable?: boolean
  
  // Pagination
  pageSize?: number
  pageSizeOptions?: number[]
  
  // Card/Grid
  cardWidth?: number | "auto"
  gridColumns?: number | "auto"
  gap?: number
  
  // Kanban
  swimlanes?: boolean
  wipLimit?: number
  
  // Calendar
  defaultView?: "month" | "week" | "day" | "agenda"
  firstDayOfWeek?: 0 | 1
  
  // Timeline
  timeScale?: "day" | "week" | "month" | "quarter" | "year"
  startDate?: Date
  endDate?: Date
}
```

---

## 🪝 **Hooks**

### **useViewContext**

Access view state and actions from any child component:

```tsx
import { useViewContext } from '@/frontend/shared/ui/layout/view-system'

function MyComponent() {
  const { data, config, state, actions } = useViewContext<Task>()
  
  return (
    <div>
      <p>View: {state.activeView}</p>
      <p>Selected: {state.selectedIds.size} items</p>
      <button onClick={() => actions.selectAll()}>
        Select All
      </button>
    </div>
  )
}
```

### **useViewState**

Custom hook for view state management:

```tsx
import { useViewState } from '@/frontend/shared/ui/layout/view-system'

function MyFeature() {
  const viewState = useViewState({
    initialView: ViewType.TABLE,
    storageKey: "my-feature.view",
  })
  
  return (
    <div>
      <button onClick={() => viewState.setView(ViewType.KANBAN)}>
        Switch to Kanban
      </button>
    </div>
  )
}
```

---

## 🔧 **Advanced Usage**

### **Custom View Type**

Register your own view type:

```tsx
import { viewRegistry, createView, ViewType } from '@/frontend/shared/ui/layout/view-system'
import { CustomIcon } from 'lucide-react'

// 1. Create custom view component
function MyCustomView({ data, config, state, actions }: ViewComponentProps<Task>) {
  return (
    <div>
      {/* Your custom view implementation */}
    </div>
  )
}

// 2. Register custom view
viewRegistry.register(
  createView(
    "custom" as ViewType,
    "Custom View",
    CustomIcon,
    MyCustomView,
    {
      description: "My custom view implementation",
      defaultSettings: {
        // Custom settings
      },
      supportedFeatures: {
        sorting: true,
        filtering: true,
        // ...
      },
    }
  )
)

// 3. Use it
<ViewProvider
  data={tasks}
  config={{
    id: "custom",
    type: "custom" as ViewType,
    // ...
  }}
>
  <ViewRenderer />
</ViewProvider>
```

### **Dynamic View Switching**

```tsx
import { useViewContext, ViewType } from '@/frontend/shared/ui/layout/view-system'

function ViewSwitcher() {
  const { state, actions } = useViewContext()
  
  const views = [
    { type: ViewType.TABLE, label: "Table", icon: Table },
    { type: ViewType.KANBAN, label: "Kanban", icon: Kanban },
    { type: ViewType.CALENDAR, label: "Calendar", icon: Calendar },
  ]
  
  return (
    <div className="flex gap-2">
      {views.map(view => (
        <Button
          key={view.type}
          variant={state.activeView === view.type ? "default" : "outline"}
          onClick={() => actions.setView(view.type)}
        >
          <view.icon className="h-4 w-4 mr-2" />
          {view.label}
        </Button>
      ))}
    </div>
  )
}
```

---

## 🎯 **Best Practices**

### **1. Choose the Right View**
- **Table**: Many columns, need sorting/filtering
- **Kanban**: Status-based workflows
- **Calendar**: Time-based events
- **Gallery**: Visual/image content
- **List**: Simple lists, mobile-friendly

### **2. Configure Settings**
```tsx
// Mobile: use compact density
settings: {
  density: isMobile ? "compact" : "comfortable",
  gridColumns: isMobile ? 1 : "auto",
}

// Large datasets: enable pagination
settings: {
  showPagination: true,
  pageSize: 50,
}

// Kanban: limit WIP
settings: {
  wipLimit: 5,
  draggable: true,
}
```

### **3. Performance Optimization**
```tsx
// Lazy load view components
const ViewRenderer = lazy(() => import('./ViewRenderer'))

// Memoize config
const config = useMemo(() => ({
  id: "tasks",
  type: ViewType.TABLE,
  columns: [...],
}), [])

// Virtual scrolling for large lists
settings: {
  virtualScroll: true, // For 1000+ items
}
```

### **4. Consistent Actions**
```tsx
// Define reusable action configs
const commonActions: ViewAction[] = [
  {
    id: "edit",
    label: "Edit",
    icon: Edit,
    onClick: handleEdit,
  },
  {
    id: "delete",
    label: "Delete",
    icon: Trash,
    variant: "destructive",
    onClick: handleDelete,
    confirm: {
      title: "Delete item?",
      description: "This cannot be undone.",
    },
  },
]
```

---

## 🔄 **Migration from Legacy ViewSwitcher**

### **Before (Legacy)**
```tsx
<ViewSwitcher
  storageKey="tasks.view"
  mode="table"
  data={tasks}
  config={{
    columns: [...],
    actions: [...],
  }}
/>
```

### **After (New System)**
```tsx
<ViewProvider
  data={tasks}
  config={{
    id: "tasks",
    type: ViewType.TABLE,
    label: "Tasks",
    columns: [...],
    rowActions: [...],
  }}
  storageKey="tasks.view"
>
  <ViewRenderer />
</ViewProvider>
```

---

## 📖 **API Reference**

See individual files:
- `types.ts` - All TypeScript types
- `registry.ts` - View registration system
- `provider.tsx` - ViewProvider component
- `hooks.ts` - React hooks
- `components/` - View implementations

---

## 🤝 **Contributing**

Want to add a new view type?

1. Create component in `components/[ViewName]View.tsx`
2. Register in `registry.ts`
3. Add example to this README
4. Update types if needed

---

**Happy viewing! 🎉**
