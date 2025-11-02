# Layout Architecture

## 🎯 **Core Principle: Separation of Concerns**

Sistem layout terdiri dari **3 entitas independent** yang bisa di-compose sesuai kebutuhan:

---

## 📦 **3 Independent Entities**

### **1. Secondary Sidebar** 
**Path**: `frontend/shared/ui/layout/sidebar/secondary/`

**Purpose**: Navigasi hierarchical dengan tree/list di sidebar

**Components**:
- `<SecondarySidebarLayout>` - Layout with sidebar
- `<SecondarySidebar>` - Sidebar component
- `<SecondarySidebarTools>` - Search, filters, etc

**Use Cases**:
- Document tree navigation
- Chat conversations list
- File explorer
- Folder structure

**Independence**: ✅ Tidak depend pada view-system

---

### **2. View System**
**Path**: `frontend/shared/ui/layout/view-system/`

**Purpose**: Content area yang bisa di-switch antara 14+ view types

**Components**:
- `<ViewProvider>` - State management
- `<ViewRenderer>` - View router
- `<TableView>`, `<KanbanView>`, `<CalendarView>`, etc

**Use Cases**:
- Data tables with sorting/filtering
- Kanban boards
- Calendar events
- Gallery images
- Timeline projects

**Independence**: ✅ Tidak depend pada secondary-sidebar

---

### **3. Universal Toolbar**
**Path**: `frontend/shared/ui/layout/toolbar/`

**Purpose**: Unified toolbar dengan search, sort, filter, view switcher, actions

**Components**:
- `<UniversalToolbar>` - Main toolbar
- Built-in tools: search, sort, filter, view, actions, tabs, breadcrumb

**Use Cases**:
- View switching controls
- Search and filters
- Action buttons
- Navigation breadcrumbs

**Independence**: ✅ Tidak depend pada sidebar atau view-system (hanya provide tools)

---

## 🧩 **Composition Patterns**

### **Pattern 1: View-Only**
```tsx
// Example: Simple data table
<div className="h-full flex flex-col">
  <UniversalToolbar tools={[search, sort, filter, view]} />
  
  <ViewProvider data={items} config={tableConfig}>
    <ViewRenderer />
  </ViewProvider>
</div>
```
**Use Cases**: 
- Members list (table/card toggle)
- Settings pages
- Simple data displays

---

### **Pattern 2: Sidebar-Only**
```tsx
// Example: Document tree without views
<SecondarySidebarLayout
  sidebar={<DocumentTree />}
  tools={<SecondarySidebarTools />}
>
  <DocumentEditor />
</SecondarySidebarLayout>
```
**Use Cases**:
- Document editor with navigation
- File browser with preview
- Email with folder list

---

### **Pattern 3: Sidebar + View (Combined)**
```tsx
// Example: Documents with both tree navigation and view switching
<SecondarySidebarLayout
  sidebar={<DocumentTree />}
  tools={<SecondarySidebarTools />}
>
  <div className="h-full flex flex-col">
    <UniversalToolbar tools={[view, actions]} />
    
    <ViewProvider data={documents} config={viewConfig}>
      <ViewRenderer />
    </ViewProvider>
  </div>
</SecondarySidebarLayout>
```
**Use Cases**:
- Documents: tree navigation + table/card views
- Projects: folder structure + kanban/timeline views
- Media library: folders + gallery/grid views

---

### **Pattern 4: Switchable (Sidebar ↔ View)**
```tsx
// Example: Toggle between tree navigation and flat list views
<LayoutSwitcher
  mode={layoutMode} // "sidebar" | "view"
  onModeChange={setLayoutMode}
>
  {layoutMode === "sidebar" ? (
    <SecondarySidebarLayout
      sidebar={<DocumentTree />}
    >
      <DocumentEditor />
    </SecondarySidebarLayout>
  ) : (
    <ViewProvider data={documents} config={viewConfig}>
      <ViewRenderer />
    </ViewProvider>
  )}
</LayoutSwitcher>
```
**Use Cases**:
- Explorer: tree view ↔ list/grid view
- Email: folder list ↔ inbox view
- Tasks: hierarchical ↔ kanban

---

### **Pattern 5: Three-Column (Sidebar + View + Inspector)**
```tsx
// Example: Full-featured layout
<div className="flex h-full">
  {/* Column 1: Sidebar */}
  <SecondarySidebar>
    <DocumentTree />
  </SecondarySidebar>
  
  {/* Column 2: View System */}
  <div className="flex-1 flex flex-col">
    <UniversalToolbar tools={[view, actions]} />
    <ViewProvider data={items} config={config}>
      <ViewRenderer />
    </ViewProvider>
  </div>
  
  {/* Column 3: Inspector */}
  <div className="w-80 border-l">
    <Inspector />
  </div>
</div>
```
**Use Cases**:
- Documents: tree + editor + metadata
- Database: tables list + view + record inspector
- Design: layers + canvas + properties

---

## 📁 **Directory Structure**

```
frontend/shared/ui/layout/
├── LAYOUT_ARCHITECTURE.md          ← THIS FILE
│
├── sidebar/                         ← ENTITY 1
│   └── secondary/
│       ├── SecondarySidebarLayout.tsx
│       ├── SecondarySidebar.tsx
│       ├── SecondarySidebarTools.tsx
│       └── README.md
│
├── view-system/                     ← ENTITY 2
│   ├── types.ts
│   ├── registry.ts
│   ├── provider.tsx                 (to create)
│   ├── renderer.tsx                 (to create)
│   ├── hooks.ts                     (to create)
│   ├── components/
│   │   ├── TableView.tsx
│   │   ├── KanbanView.tsx
│   │   ├── CalendarView.tsx
│   │   └── ... (11 more views)
│   └── README.md
│
├── toolbar/                         ← ENTITY 3
│   ├── components/
│   ├── lib/
│   ├── examples.tsx
│   └── README.md
│
├── compositions/                    ← COMPOSITION HELPERS
│   ├── LayoutSwitcher.tsx
│   ├── SecondarySidebarWithView.tsx
│   ├── ViewWithToggleSidebar.tsx
│   ├── ThreeColumnLayout.tsx
│   └── README.md
│
└── index.ts                         ← PUBLIC API
```

---

## 🔌 **Integration Points**

### **How They Connect (Without Tight Coupling)**

#### **1. Toolbar ↔ View System**
```tsx
// Toolbar provides view switching UI
<UniversalToolbar
  tools={[
    {
      id: "view",
      type: toolType.view,
      params: {
        currentView: viewState.activeView,
        onChange: viewActions.setView, // ← Callback
      }
    }
  ]}
/>

// View system manages its own state
<ViewProvider {...}>
  <ViewRenderer />
</ViewProvider>
```
**Connection**: Callback functions (loose coupling)

---

#### **2. Sidebar ↔ View System**
```tsx
// Sidebar doesn't know about views
<SecondarySidebarLayout sidebar={<Tree />}>
  {/* Children can be ANYTHING */}
  <ViewProvider {...}>
    <ViewRenderer />
  </ViewProvider>
</SecondarySidebarLayout>
```
**Connection**: Composition (no direct dependency)

---

#### **3. All Three Together**
```tsx
// Composition component orchestrates
<SecondarySidebarWithView
  sidebar={<DocumentTree />}
  viewConfig={viewConfig}
  data={documents}
  toolbarTools={[search, sort, filter, view]}
/>
```
**Connection**: Higher-order composition component

---

## 🎨 **Feature Examples**

### **Documents Feature**
```tsx
// Can use all 3 entities
<SecondarySidebarLayout
  sidebar={<DocumentTree />}  // ← Sidebar entity
>
  <UniversalToolbar />          // ← Toolbar entity
  <ViewProvider>               // ← View system entity
    <ViewRenderer />
  </ViewProvider>
</SecondarySidebarLayout>
```

### **Members Feature**
```tsx
// View-only (no sidebar needed)
<UniversalToolbar />          // ← Toolbar entity
<ViewProvider>               // ← View system entity
  <ViewRenderer />
</ViewProvider>
```

### **Database Feature**
```tsx
// All 3 + custom layout
<ThreeColumnLayout>
  {/* Column 1: Sidebar */}
  <DatabaseTablesList />    // ← Uses sidebar internally
  
  {/* Column 2: View System */}
  <UniversalToolbar />      // ← Toolbar entity
  <ViewProvider>           // ← View system entity
    <ViewRenderer />
  </ViewProvider>
  
  {/* Column 3: Inspector */}
  <RecordInspector />
</ThreeColumnLayout>
```

### **Chat Feature**
```tsx
// Sidebar-only (no view switching needed)
<SecondarySidebarLayout
  sidebar={<ConversationsList />}  // ← Sidebar entity
>
  <ChatMessages />  // Not using view system
</SecondarySidebarLayout>
```

---

## ✅ **Benefits of This Architecture**

### **1. True Modularity**
- ✅ Each entity can be used independently
- ✅ No circular dependencies
- ✅ Clear separation of concerns

### **2. Flexibility**
- ✅ Features choose what they need
- ✅ Easy to compose new patterns
- ✅ No forced coupling

### **3. Maintainability**
- ✅ Changes to one entity don't affect others
- ✅ Easy to test in isolation
- ✅ Clear boundaries

### **4. Reusability**
- ✅ Sidebar can be used without views
- ✅ Views can be used without sidebar
- ✅ Toolbar works with both

### **5. Scalability**
- ✅ Add new views without touching sidebar
- ✅ Add new sidebar types without touching views
- ✅ Extend toolbar without breaking anything

---

## 🚀 **Implementation Checklist**

### **Phase 1: Ensure Independence** ✅
- [x] Secondary sidebar has no view-system imports
- [x] View-system has no secondary-sidebar imports
- [x] Toolbar has no hard dependencies

### **Phase 2: Build View System**
- [ ] Create ViewProvider
- [ ] Create ViewRenderer
- [ ] Create hooks (useViewContext, useViewState)
- [ ] Port existing views (Table, Grid, List)

### **Phase 3: Create Composition Helpers**
- [ ] LayoutSwitcher component
- [ ] SecondarySidebarWithView component
- [ ] ViewWithToggleSidebar component
- [ ] ThreeColumnLayout component

### **Phase 4: Integrate with Features**
- [ ] Database: Port to view-system
- [ ] Documents: Use composition pattern
- [ ] Members: Simple view-only pattern
- [ ] Tasks: Kanban + calendar views

### **Phase 5: Documentation**
- [ ] Composition examples
- [ ] Migration guide
- [ ] Best practices

---

## 📚 **Key Concepts**

### **Composition over Inheritance**
```tsx
// ❌ BAD: Tight coupling
class ViewSystemWithSidebar extends SecondarySidebarLayout {
  // Hard to separate, rigid
}

// ✅ GOOD: Composition
<SecondarySidebarLayout>
  <ViewProvider>
    <ViewRenderer />
  </ViewProvider>
</SecondarySidebarLayout>
```

### **Dependency Inversion**
```tsx
// ❌ BAD: Direct dependency
import { SecondarySidebarLayout } from '../sidebar'

// ✅ GOOD: Accept as children/props
function ViewSystem({ children }) {
  return <div>{children}</div>
}
```

### **Single Responsibility**
- **Sidebar**: Navigation only
- **View System**: Data display only  
- **Toolbar**: Controls only
- **Composition**: Orchestration only

---

## 🎯 **Decision Guide**

### **When to use what?**

| Scenario | Pattern | Entities |
|----------|---------|----------|
| Simple data list | View-only | Toolbar + View System |
| Tree navigation + editor | Sidebar-only | Secondary Sidebar |
| Data with multiple views | View-only | Toolbar + View System |
| Documents with tree | Sidebar + View | All 3 |
| Explorer (switchable) | Switchable | Composition |
| Database tables | Three-column | All 3 + Custom |
| Chat | Sidebar-only | Secondary Sidebar |
| Calendar events | View-only | Toolbar + View System |

---

**Summary**: 
- 🔷 **3 independent entities** (Sidebar, View System, Toolbar)
- 🔶 **5 composition patterns** (View-only, Sidebar-only, Combined, Switchable, Three-column)
- 🔸 **No tight coupling** (Loose integration via callbacks/composition)
- ✨ **Maximum flexibility** (Features choose what they need)
