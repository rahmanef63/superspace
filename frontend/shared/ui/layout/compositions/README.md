# Layout Compositions

**Higher-order components that combine Secondary Sidebar, View System, and Universal Toolbar.**

---

## 🎯 **Purpose**

Composition components provide ready-to-use patterns for common layout scenarios. Instead of manually combining entities, use these pre-built compositions.

---

## 📦 **Available Compositions**

### **1. LayoutSwitcher**
**Purpose**: Switch between different layout modes dynamically

**Use Case**: Features that can show data in fundamentally different structures
- File explorer: tree view ↔ flat list view
- Email: folder list ↔ inbox view
- Tasks: hierarchical ↔ kanban

**Example**:
```tsx
import { LayoutSwitcher, useLayoutMode } from '@/frontend/shared/ui/layout'

function DocumentsPage() {
  const [mode, setMode] = useLayoutMode("documents.layout", "view")
  
  return (
    <LayoutSwitcher
      mode={mode}
      onModeChange={setMode}
      showToggle
      togglePosition="top-right"
    >
      {mode === "sidebar" ? (
        <SecondarySidebarLayout sidebar={<DocumentTree />}>
          <DocumentEditor />
        </SecondarySidebarLayout>
      ) : (
        <ViewProvider data={documents} config={viewConfig}>
          <ViewRenderer />
        </ViewProvider>
      )}
    </LayoutSwitcher>
  )
}
```

**Props**:
```tsx
interface LayoutSwitcherProps {
  children: ReactNode
  mode?: "sidebar" | "view" | "both"
  onModeChange?: (mode: LayoutMode) => void
  storageKey?: string                    // LocalStorage key
  showToggle?: boolean                   // Show toggle buttons
  togglePosition?: "top-left" | "top-right" | "bottom-left" | "bottom-right"
  className?: string
}
```

---

### **2. SecondarySidebarWithView**
**Purpose**: Combine sidebar navigation with view system

**Use Case**: Features with hierarchical navigation AND multiple view modes
- Documents: tree navigation + table/card views
- Projects: folder structure + kanban/timeline
- Media: folders + gallery/grid views

**Example**:
```tsx
import { SecondarySidebarWithView } from '@/frontend/shared/ui/layout'

function DocumentsPage() {
  return (
    <SecondarySidebarWithView
      sidebar={<DocumentTree />}
      header={<SecondarySidebarHeader title="Documents" />}
      viewToolbar={
        <UniversalToolbar
          tools={[
            {
              id: "view",
              type: toolType.view,
              params: {
                options: [
                  { label: "Table", value: ViewType.TABLE, icon: Table },
                  { label: "Grid", value: ViewType.GRID, icon: Grid3x3 },
                ],
                currentView: viewMode,
                onChange: setViewMode,
              }
            }
          ]}
        />
      }
      viewContent={
        <ViewProvider data={documents} config={viewConfig}>
          <ViewRenderer />
        </ViewProvider>
      }
    />
  )
}
```

**Props**:
```tsx
interface SecondarySidebarWithViewProps {
  sidebar?: ReactNode              // Sidebar content (tree, list)
  header?: ReactNode               // Header content
  viewContent: ReactNode           // View system content
  viewToolbar?: ReactNode          // Toolbar above view
  showToolbarBorder?: boolean      // Border below toolbar
  className?: string
  sidebarClassName?: string
  contentClassName?: string
}
```

---

### **3. ThreeColumnLayout**
**Purpose**: Three-column layout with collapsible panels

**Use Case**: Full-featured applications with complex data
- Documents: tree + editor + metadata inspector
- Database: tables list + data view + record inspector
- Design: layers panel + canvas + properties panel

**Example**:
```tsx
import { ThreeColumnLayout, useThreeColumnLayout } from '@/frontend/shared/ui/layout'

function DatabasePage() {
  const layout = useThreeColumnLayout()
  
  return (
    <ThreeColumnLayout
      {...layout.props}
      sidebar={<DatabaseTablesList />}
      content={
        <>
          <UniversalToolbar tools={[...]} />
          <ViewProvider data={records} config={viewConfig}>
            <ViewRenderer />
          </ViewProvider>
        </>
      }
      inspector={<RecordInspector />}
      sidebarWidth="w-80"
      inspectorWidth="w-96"
    />
  )
}
```

**Props**:
```tsx
interface ThreeColumnLayoutProps {
  sidebar: ReactNode                    // Column 1: Navigation/list
  content: ReactNode                    // Column 2: Main content
  inspector?: ReactNode                 // Column 3: Details/properties
  
  // Column widths (Tailwind classes)
  sidebarWidth?: string                 // Default: "w-80"
  inspectorWidth?: string               // Default: "w-80"
  
  // Collapsible
  sidebarCollapsible?: boolean
  inspectorCollapsible?: boolean
  defaultSidebarCollapsed?: boolean
  defaultInspectorCollapsed?: boolean
  
  // Callbacks
  onSidebarCollapsedChange?: (collapsed: boolean) => void
  onInspectorCollapsedChange?: (collapsed: boolean) => void
  
  // Styling
  showBorders?: boolean
  className?: string
  sidebarClassName?: string
  contentClassName?: string
  inspectorClassName?: string
}
```

**Hook**: `useThreeColumnLayout()`
```tsx
const layout = useThreeColumnLayout({
  sidebarCollapsed: false,
  inspectorCollapsed: false,
})

// Provides:
layout.sidebarCollapsed
layout.inspectorCollapsed
layout.setSidebarCollapsed()
layout.setInspectorCollapsed()
layout.toggleSidebar()
layout.toggleInspector()
layout.props  // Spread directly to component
```

---

## 🎨 **Complete Examples**

### **Example 1: Documents Feature**

```tsx
import {
  SecondarySidebarWithView,
  UniversalToolbar,
  toolType,
  ViewSystem,
} from '@/frontend/shared/ui/layout'

function DocumentsFeature() {
  const documents = useQuery(api.documents.list)
  const [viewMode, setViewMode] = useState(ViewSystem.ViewType.TABLE)
  
  return (
    <SecondarySidebarWithView
      sidebar={
        <DocumentTree
          documents={documents}
          onSelect={handleSelect}
        />
      }
      header={
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Documents</h2>
          <p className="text-sm text-muted-foreground">
            {documents?.length || 0} documents
          </p>
        </div>
      }
      viewToolbar={
        <UniversalToolbar
          tools={[
            {
              id: "search",
              type: toolType.search,
              params: {
                value: search,
                onChange: setSearch,
                placeholder: "Search documents...",
              }
            },
            {
              id: "view",
              type: toolType.view,
              params: {
                options: [
                  { label: "Table", value: ViewSystem.ViewType.TABLE, icon: Table },
                  { label: "Grid", value: ViewSystem.ViewType.GRID, icon: Grid3x3 },
                  { label: "Gallery", value: ViewSystem.ViewType.GALLERY, icon: Image },
                ],
                currentView: viewMode,
                onChange: setViewMode,
              }
            },
            {
              id: "actions",
              type: toolType.actions,
              params: {
                actions: [
                  { label: "New Document", icon: Plus, onClick: handleCreate },
                  { label: "Export", icon: Download, onClick: handleExport },
                ],
              }
            }
          ]}
          sticky
          border="bottom"
        />
      }
      viewContent={
        <ViewSystem.ViewProvider
          data={documents || []}
          config={{
            id: "documents",
            type: viewMode,
            label: "Documents",
            columns: [
              { id: "title", label: "Title", accessorKey: "title", sortable: true },
              { id: "author", label: "Author", accessorKey: "author", sortable: true },
              { id: "modified", label: "Modified", accessorKey: "lastModified", sortable: true },
            ],
            rowActions: [
              { id: "edit", label: "Edit", icon: Edit, onClick: handleEdit },
              { id: "delete", label: "Delete", icon: Trash, onClick: handleDelete, variant: "destructive" },
            ],
          }}
          storageKey="documents.view"
        >
          <ViewSystem.ViewRenderer />
        </ViewSystem.ViewProvider>
      }
    />
  )
}
```

---

### **Example 2: Database Feature**

```tsx
import {
  ThreeColumnLayout,
  useThreeColumnLayout,
  UniversalToolbar,
  ViewSystem,
} from '@/frontend/shared/ui/layout'

function DatabaseFeature() {
  const layout = useThreeColumnLayout()
  const tables = useQuery(api.tables.list)
  const [selectedTable, setSelectedTable] = useState<string | null>(null)
  const records = useQuery(api.records.list, { tableId: selectedTable })
  
  return (
    <ThreeColumnLayout
      {...layout.props}
      
      // Column 1: Tables List
      sidebar={
        <div className="p-4">
          <h3 className="font-semibold mb-4">Tables</h3>
          <div className="space-y-1">
            {tables?.map(table => (
              <Button
                key={table._id}
                variant={selectedTable === table._id ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setSelectedTable(table._id)}
              >
                <Table className="h-4 w-4 mr-2" />
                {table.name}
              </Button>
            ))}
          </div>
        </div>
      }
      
      // Column 2: Data View
      content={
        <div className="h-full flex flex-col">
          <UniversalToolbar
            tools={[
              {
                id: "view",
                type: toolType.view,
                params: {
                  options: [
                    { label: "Table", value: ViewSystem.ViewType.TABLE, icon: Table },
                    { label: "Kanban", value: ViewSystem.ViewType.KANBAN, icon: Kanban },
                    { label: "Calendar", value: ViewSystem.ViewType.CALENDAR, icon: Calendar },
                    { label: "Timeline", value: ViewSystem.ViewType.TIMELINE, icon: Clock },
                  ],
                  currentView: viewMode,
                  onChange: setViewMode,
                }
              }
            ]}
          />
          
          <div className="flex-1 overflow-auto">
            <ViewSystem.ViewProvider
              data={records || []}
              config={{
                id: "database-records",
                type: viewMode,
                label: "Records",
                // ... config
              }}
            >
              <ViewSystem.ViewRenderer />
            </ViewSystem.ViewProvider>
          </div>
        </div>
      }
      
      // Column 3: Record Inspector
      inspector={
        selectedRecord && (
          <RecordInspector record={selectedRecord} />
        )
      }
      
      sidebarWidth="w-64"
      inspectorWidth="w-96"
    />
  )
}
```

---

### **Example 3: Switchable Layout**

```tsx
import {
  LayoutSwitcher,
  useLayoutMode,
  SecondarySidebarLayout,
  ViewSystem,
} from '@/frontend/shared/ui/layout'

function FilesFeature() {
  const [layoutMode, setLayoutMode] = useLayoutMode("files.layout", "sidebar")
  const files = useQuery(api.files.list)
  
  return (
    <LayoutSwitcher
      mode={layoutMode}
      onModeChange={setLayoutMode}
      showToggle
      togglePosition="top-right"
    >
      {layoutMode === "sidebar" ? (
        // Tree view with editor
        <SecondarySidebarLayout
          sidebar={
            <FileTree files={files} onSelect={handleSelect} />
          }
        >
          <FileEditor file={selectedFile} />
        </SecondarySidebarLayout>
      ) : (
        // Flat view with grid/list toggle
        <>
          <UniversalToolbar
            tools={[
              {
                id: "view",
                type: toolType.view,
                params: {
                  options: [
                    { label: "Grid", value: ViewSystem.ViewType.GRID, icon: Grid3x3 },
                    { label: "List", value: ViewSystem.ViewType.LIST, icon: List },
                  ],
                  currentView: viewMode,
                  onChange: setViewMode,
                }
              }
            ]}
          />
          
          <ViewSystem.ViewProvider data={files} config={viewConfig}>
            <ViewSystem.ViewRenderer />
          </ViewSystem.ViewProvider>
        </>
      )}
    </LayoutSwitcher>
  )
}
```

---

## 🎯 **When to Use What?**

| Scenario | Composition | Entities Used |
|----------|-------------|---------------|
| Simple data table | None (just ViewProvider) | View System + Toolbar |
| Tree navigation + editor | None (just SecondarySidebarLayout) | Secondary Sidebar |
| Tree + multiple views | **SecondarySidebarWithView** | All 3 |
| Complex 3-panel UI | **ThreeColumnLayout** | All 3 + Custom |
| Switchable structure | **LayoutSwitcher** | Any combination |

---

## ✅ **Benefits**

### **1. Less Boilerplate**
```tsx
// ❌ Without composition (manual)
<div className="flex h-full">
  <SecondarySidebarLayout sidebar={...}>
    <div className="flex flex-col">
      <UniversalToolbar />
      <ViewProvider>
        <ViewRenderer />
      </ViewProvider>
    </div>
  </SecondarySidebarLayout>
</div>

// ✅ With composition
<SecondarySidebarWithView
  sidebar={...}
  viewToolbar={<UniversalToolbar />}
  viewContent={<ViewProvider><ViewRenderer /></ViewProvider>}
/>
```

### **2. Consistent Behavior**
- All compositions handle responsive behavior
- Consistent collapse/expand animations
- Standard spacing and borders

### **3. Easy to Customize**
- Props for common customizations
- ClassNames for styling
- Callbacks for state management

### **4. Type-Safe**
- Full TypeScript support
- IntelliSense for all props
- Compile-time validation

---

## 🔧 **Advanced Usage**

### **Custom Composition**

If none of the built-in compositions fit your needs, create a custom one:

```tsx
function MyCustomComposition({ data, config }: MyProps) {
  return (
    <div className="custom-layout">
      <SecondarySidebarLayout sidebar={...}>
        <UniversalToolbar tools={...} />
        <ViewSystem.ViewProvider data={data} config={config}>
          <ViewSystem.ViewRenderer />
        </ViewSystem.ViewProvider>
      </SecondarySidebarLayout>
    </div>
  )
}
```

---

**Summary**:
- 🔷 **3 compositions** (LayoutSwitcher, SecondarySidebarWithView, ThreeColumnLayout)
- 🔶 **Ready-to-use patterns** for common scenarios
- 🔸 **Type-safe** with full TypeScript support
- ✨ **Flexible** - customize via props and classNames
