# Universal View System 🎯

**✅ SSOT (Single Source of Truth) for all view-related functionality**

Flexible, registry-based view system for displaying data in 18+ different layouts.

Perfect for content areas in super apps like Windows Explorer, Notion, or Airtable.

---

## 📁 **File Structure (SSOT)**

```
view-system/                    ← SSOT for all views
├── types.ts                    ← Type definitions
├── registry.ts                 ← View registration
├── provider.tsx                ← State management
├── renderer.tsx                ← Dynamic renderer
├── ViewToolbar.tsx             ← ✅ NEW: Toolbar controls
├── index.ts                    ← Public API
├── README.md                   ← This file
└── views/                      ← All view implementations
    ├── Table/
    │   └── TableView.tsx       ← ✅ Advanced table (TanStack)
    ├── GridView.tsx            ← ✅ Card grid layout
    ├── ListView.tsx            ← ✅ Vertical list with grouping
    ├── CompactListView.tsx     ← ✅ Dense list view
    ├── KanbanView.tsx          ← ✅ Kanban board with drag-drop
    ├── GalleryView.tsx         ← ✅ Image gallery with lightbox
    ├── CalendarView.tsx        ← ✅ Month/week/day calendar
    ├── TimelineView.tsx        ← ✅ Chronological timeline
    ├── TreeView.tsx            ← ✅ Hierarchical tree
    └── [9 more pending]
```

---

## 🎯 **Philosophy**

The View System handles the **content display** aspect of super apps.
It is completely independent from sidebar and toolbar systems.

Two main layout types:
1. **Secondary Sidebar Layout** - Sidebar + Content (chat, documents)
2. **View System** ← **THIS!** - Switchable content displays

---

## 📦 **Available View Types (18 Total)**

### **✅ Fully Implemented (9/18)**

| View | Icon | Description | Status |
|------|------|-------------|--------|
| `table` | 📊 | Traditional data table with TanStack | ✅ Complete |
| `grid` | ⬜ | Responsive card grid | ✅ Complete |
| `list` | 📋 | Vertical list with grouping | ✅ Complete |
| `compact` | 📑 | Dense list for many items | ✅ Complete |
| `kanban` | 📌 | Kanban board with drag-drop | ✅ Complete |
| `gallery` | 🖼️ | Image gallery with lightbox | ✅ Complete |
| `calendar` | 📅 | Month/week/day calendar | ✅ Complete |
| `timeline` | ⏳ | Chronological timeline | ✅ Complete |
| `tree` | 🌲 | Hierarchical tree | ✅ Complete |

### **🔜 Pending (9/18)**

| View | Icon | Description | Status |
|------|------|-------------|--------|
| `tiles` | 🔲 | Compact tile grid | 🔜 Pending |
| `masonry` | 🧱 | Pinterest-style layout | 🔜 Pending |
| `board` | 📋 | Generic board | 🔜 Pending |
| `gantt` | 📊 | Gantt chart | 🔜 Pending |
| `nested` | 📂 | Nested lists | 🔜 Pending |
| `map` | 🗺️ | Geographic map | 🔜 Pending |
| `chart` | 📈 | Data visualization | 🔜 Pending |
| `feed` | 📰 | Social media feed | 🔜 Pending |
| `inbox` | 📨 | Email/message inbox | 🔜 Pending |

---

## 🚀 **Quick Start**

### **Basic Usage**

```tsx
import { 
  ViewProvider, 
  ViewRenderer, 
  ViewType 
} from '@/frontend/shared/ui/layout/view-system'

function MyFeaturePage() {
  const tasks = useQuery(api.tasks.list)
  
  return (
    <ViewProvider
      data={tasks || []}
      config={{
        id: "tasks-view",
        type: ViewType.TABLE,
        label: "Tasks",
        fields: [
          { id: "title", label: "Title", type: "text" },
          { id: "status", label: "Status", type: "select" },
          { id: "assignee", label: "Assignee", type: "user" },
        ],
      }}
      storageKey="tasks.view"
    >
      <ViewRenderer />
    </ViewProvider>
  )
}
```

### **With View Toolbar**

```tsx
import { 
  ViewProvider, 
  ViewRenderer, 
  ViewToolbar,
  ViewType 
} from '@/frontend/shared/ui/layout/view-system'

function TasksPage() {
  const tasks = useQuery(api.tasks.list)
  
  return (
    <ViewProvider
      data={tasks || []}
      config={{
        id: "tasks",
        type: ViewType.TABLE,
        label: "Tasks",
        fields: [...],
        settings: {
          selectable: true,
          sortable: true,
          filterable: true,
        },
      }}
      storageKey="tasks.view"
    >
      <div className="flex flex-col h-full">
        {/* Toolbar */}
        <div className="flex items-center gap-2 p-2 border-b">
          <ViewToolbar.Switcher />
          <ViewToolbar.Search />
          <ViewToolbar.Filters />
          <ViewToolbar.Sort />
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-auto">
          <ViewRenderer />
        </div>
      </div>
    </ViewProvider>
  )
}
```

---

## 📚 **View Examples**

### **Table View**

```tsx
const config = {
  id: "tasks-table",
  type: ViewType.TABLE,
  label: "Tasks Table",
  
  columns: [
    { id: "title", label: "Title", accessorKey: "title", sortable: true },
    { id: "status", label: "Status", accessorKey: "status", sortable: true },
    { id: "assignee", label: "Assignee", accessorKey: "assignee" },
  ],
  
  actions: [
    { id: "edit", label: "Edit", icon: Edit, onClick: handleEdit },
    { id: "delete", label: "Delete", icon: Trash, onClick: handleDelete, variant: "destructive" },
  ],
  
  settings: {
    density: "comfortable",
    showPagination: true,
    selectable: true,
  },
}
```

### **Kanban View**

```tsx
const config = {
  id: "tasks-kanban",
  type: ViewType.KANBAN,
  label: "Tasks Board",
  
  groups: [
    { id: "todo", label: "To Do", accessor: "status" },
    { id: "in-progress", label: "In Progress", accessor: "status" },
    { id: "done", label: "Done", accessor: "status" },
  ],
  
  onItemDrag: async (task, targetGroup) => {
    await updateTask({ id: task._id, status: targetGroup })
  },
  
  settings: {
    wipLimit: 5, // Max items per column
    draggable: true,
  },
}
```

### **Calendar View**

```tsx
const config = {
  id: "events-calendar",
  type: ViewType.CALENDAR,
  label: "Events",
  
  fields: [
    { id: "title", label: "Title", type: "text" },
    { id: "date", label: "Date", type: "date" },
    { id: "type", label: "Type", type: "select" },
  ],
  
  settings: {
    defaultView: "month",
    firstDayOfWeek: 1, // Monday
  },
}
```

### **Gallery View**

```tsx
const config = {
  id: "photos-gallery",
  type: ViewType.GALLERY,
  label: "Photo Gallery",
  
  settings: {
    gridColumns: 4,
    showLightbox: true,
  },
}
```

### **Timeline View**

```tsx
const config = {
  id: "activity-timeline",
  type: ViewType.TIMELINE,
  label: "Activity Log",
  
  fields: [
    { id: "title", label: "Title", type: "text" },
    { id: "date", label: "Date", type: "date" },
    { id: "description", label: "Description", type: "text" },
  ],
  
  settings: {
    timelineGrouping: "day", // "none" | "day" | "week" | "month" | "year"
  },
}
```

### **Tree View**

```tsx
const config = {
  id: "file-tree",
  type: ViewType.TREE,
  label: "File Browser",
  
  // Data can have children or parentId
  // Both structures are supported
}
```

---

## 🧰 **ViewToolbar Components**

The `ViewToolbar` provides compound components for view controls:

```tsx
import { ViewToolbar } from '@/frontend/shared/ui/layout/view-system'

// View Switcher - switch between view types
<ViewToolbar.Switcher
  options={[
    { type: ViewType.TABLE, icon: Table, label: "Table" },
    { type: ViewType.KANBAN, icon: Kanban, label: "Kanban" },
  ]}
  variant="toggle" // "dropdown" | "buttons" | "toggle"
/>

// Search - filter data
<ViewToolbar.Search
  placeholder="Search..."
  expandable={true} // starts as icon
  debounce={300}
/>

// Filters - add/remove filters
<ViewToolbar.Filters
  filterOptions={[
    { field: "status", label: "Status", values: ["todo", "done"] },
    { field: "assignee", label: "Assignee" },
  ]}
/>

// Sort - toggle sort direction
<ViewToolbar.Sort />

// Pagination
<ViewToolbar.Pagination />
```

---

## 🪝 **Hooks**

### **useViewContext**

```tsx
import { useViewContext } from '@/frontend/shared/ui/layout/view-system'

function MyComponent() {
  const { data, config, state, actions } = useViewContext<Task>()
  
  return (
    <div>
      <p>View: {state.activeView}</p>
      <p>Selected: {state.selectedIds.size}</p>
      <button onClick={() => actions.setView(ViewType.KANBAN)}>
        Switch to Kanban
      </button>
    </div>
  )
}
```

### **useViewState**

```tsx
import { useViewState } from '@/frontend/shared/ui/layout/view-system'

function MyFeature() {
  const { activeView, setView, filters, setFilter } = useViewState({
    initialView: ViewType.TABLE,
    storageKey: "my.view",
  })
}
```

### **useViewActions**

```tsx
import { useViewActions } from '@/frontend/shared/ui/layout/view-system'

function SelectionControls() {
  const actions = useViewActions()
  
  return (
    <>
      <button onClick={() => actions.selectAll()}>Select All</button>
      <button onClick={() => actions.deselectAll()}>Clear Selection</button>
    </>
  )
}
```

---

## 🎨 **Type Reference**

### **ViewField**

```tsx
{
  id: string
  label: string
  type: "text" | "number" | "date" | "boolean" | "select" | "multiselect" |
        "image" | "file" | "url" | "email" | "phone" | "color" |
        "rating" | "progress" | "tag" | "user" | "relation"
  accessor?: (item: T) => any
  render?: (item: T, value: any) => ReactNode
  editable?: boolean
  required?: boolean
  hidden?: boolean
  options?: Array<{ label, value, icon?, color? }>
}
```

### **ViewAction**

```tsx
{
  id: string
  label: string
  icon?: LucideIcon
  onClick: (item: T) => void | Promise<void>
  variant?: "default" | "outline" | "ghost" | "destructive" | "secondary"
  disabled?: boolean | ((item: T) => boolean)
  hidden?: boolean | ((item: T) => boolean)
  confirm?: { title: string, description: string }
}
```

### **ViewSettings**

```tsx
{
  // Display
  density?: "compact" | "comfortable" | "spacious"
  showHeader?: boolean
  showPagination?: boolean
  
  // Behavior
  selectable?: boolean
  multiSelect?: boolean
  draggable?: boolean
  sortable?: boolean
  filterable?: boolean
  
  // Grid/Gallery
  gridColumns?: number | "auto"
  gap?: number
  
  // Kanban
  wipLimit?: number
  
  // Calendar
  defaultView?: "month" | "week" | "day"
  firstDayOfWeek?: 0 | 1
  
  // Timeline
  timelineGrouping?: "none" | "day" | "week" | "month" | "year"
}
```

---

## 🔧 **Custom View Type**

```tsx
import { viewRegistry, createView, type ViewComponentProps } from '@/frontend/shared/ui/layout/view-system'
import { CustomIcon } from 'lucide-react'

// 1. Create component
function MyCustomView<T>({ data, config, state, actions }: ViewComponentProps<T>) {
  return <div>{/* Your implementation */}</div>
}

// 2. Register
viewRegistry.register(
  createView(
    "custom" as ViewType,
    "Custom View",
    CustomIcon,
    MyCustomView,
    {
      description: "My custom view",
      supportedFeatures: {
        sorting: true,
        filtering: true,
      },
    }
  )
)

// 3. Use
<ViewProvider config={{ type: "custom" as ViewType, ... }}>
  <ViewRenderer />
</ViewProvider>
```

---

## ✅ **Best Practices**

1. **Choose the right view**
   - Table: Many columns, need sorting/filtering
   - Kanban: Status-based workflows
   - Calendar: Time-based events
   - Gallery: Visual/image content
   - Tree: Hierarchical data

2. **Configure properly**
   ```tsx
   settings: {
     density: isMobile ? "compact" : "comfortable",
     gridColumns: isMobile ? 1 : "auto",
   }
   ```

3. **Persist view state**
   ```tsx
   <ViewProvider storageKey="my-feature.view">
   ```

4. **Preload views**
   ```tsx
   import { preloadView } from '@/frontend/shared/ui/layout/view-system'
   onMouseEnter={() => preloadView(ViewType.KANBAN)}
   ```

---

**Happy viewing! 🎉**
