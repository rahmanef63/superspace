# Quick Start Guide - Database Feature

> Get up and running with the Database feature in 5 minutes

**Last Updated:** November 6, 2025  
**For:** New Developers

---

## 🚀 Setup

### 1. Prerequisites

```bash
# Required
- Node.js 18+
- pnpm 8+
- Convex account
- VS Code (recommended)

# Recommended Extensions
- ESLint
- Prettier
- TypeScript
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Start Development

```bash
# Terminal 1: Start Convex backend
pnpm convex dev

# Terminal 2: Start Next.js
pnpm dev
```

### 4. Navigate to Database

Open browser: `http://localhost:3000/dashboard/database`

---

## 📁 File Structure

```
frontend/features/database/
├── components/              ← UI components
│   ├── PropertyMenu/       ← Property menu system
│   ├── views/              ← View components (Table, Board, etc.)
│   └── ...
├── properties/             ← Property type implementations
│   ├── select/            ← Select property
│   ├── number/            ← Number property
│   ├── date/              ← Date property
│   ├── menu-registry.ts   ← Property menu registry
│   └── ...
├── views/                  ← Page-level views
│   └── DatabasePage.tsx   ← Main database page
├── hooks/                  ← Custom React hooks
│   └── useDatabase.ts     ← Database mutations/queries
├── types/                  ← TypeScript types
└── docs/                   ← Documentation (you are here!)

convex/features/database/
├── mutations.ts            ← Convex mutations
├── queries.ts             ← Convex queries
├── schema.ts              ← Database schema
├── tables.ts              ← Table operations
├── fields.ts              ← Field operations
├── rows.ts                ← Row operations
└── views.ts               ← View operations
```

---

## 🎯 Common Tasks

### Task 1: View All Tables

**Location:** `/dashboard/database`

```typescript
// Data flow:
DatabasePage → useDatabaseSidebar() → Convex query → tables list
```

### Task 2: Create New Row

**Click:** "+ New page" button at bottom of table

```typescript
// Code path:
DatabasePage.handleAddRow() 
  → useDatabaseMutations().createRow() 
  → Convex mutation 
  → Real-time update
```

### Task 3: Edit Cell Inline

**Click:** Any cell in table view

```typescript
// Inline editing:
TableCell → PropertyCell → {Type}Editor (e.g., SelectEditor)
  → onPropertyUpdate callback
  → DatabasePage.handleUpdateCell()
  → Convex mutation
  → UI updates automatically (reactive query)
```

### Task 4: Reorder Rows

**Drag:** Drag handle (⋮⋮) on left of row

```typescript
// DnD flow:
SortableRow (useSortable) 
  → handleRowDragEnd 
  → onReorderRows callback
  → reorderRow mutation
  → Position updates in DB
```

### Task 5: Add Property

**Click:** "+" button in table header

```typescript
// Property creation:
DatabaseToolbar.onAddProperty()
  → DatabasePage.handleAddProperty()
  → createField mutation
  → New column appears
```

---

## 💡 Key Concepts

### 1. Property Types

Database supports 20+ property types:

```typescript
// Basic
- text          // Plain text
- title         // Page title (required)
- rich_text     // Formatted text
- number        // Numeric values
- checkbox      // Boolean
- date          // Date/time
- url           // Web links
- email         // Email addresses
- phone         // Phone numbers

// Select
- select        // Single choice
- multi_select  // Multiple choices
- status        // Workflow status

// Relations
- people        // User references
- relation      // Link to other tables
- rollup        // Aggregate from relations

// Advanced
- formula       // Computed values
- files         // File attachments
- place         // Location data

// Auto
- created_time  // Auto timestamp
- created_by    // Auto user
- last_edited_time
- last_edited_by
- unique_id     // Auto-increment ID
```

### 2. View Types

7 different ways to visualize data:

```typescript
- table         // Spreadsheet (default)
- board         // Kanban board
- calendar      // Calendar view
- gallery       // Card gallery
- list          // Simplified list
- timeline      // Gantt chart
- form          // Single record form
```

### 3. State Management

**Single Source of Truth:** Convex Reactive Queries

```typescript
// ❌ DON'T: Manage local state
const [data, setData] = useState([]);

// ✅ DO: Use Convex queries
const data = useQuery(api.features.database.queries.list, { tableId });
// Auto-updates when data changes!
```

### 4. Property Menu System

Each property type has its own menu configuration:

```typescript
// Get menu config for a property
import { getPropertyMenuConfig } from '@/frontend/features/database/properties/menu-registry';

const config = getPropertyMenuConfig('number');
// Returns type-specific menu items, overrides, hidden/disabled items
```

---

## 🔍 Debugging Tips

### Issue: Cell not updating after edit

**Check:**
1. Is mutation being called? (Console logs)
2. Is Convex backend running? (`pnpm convex dev`)
3. Is there a TypeScript error? (Check terminal)

**Solution:**
```typescript
// Ensure callback chain is complete:
Editor → PropertyCell → DatabaseTableView → DatabasePage → Mutation
```

### Issue: Property menu not showing

**Check:**
1. Is property type registered in `menu-registry.ts`?
2. Is `PropertyMenu` component imported?
3. Are menu items visible for this type?

**Solution:**
```typescript
import { isMenuItemVisible } from '@/frontend/features/database/properties/menu-registry';
const visible = isMenuItemVisible(propertyType, 'delete');
```

### Issue: Row DnD not working

**Check:**
1. Is `SortableRow` being used?
2. Is drag handle wired to `{...listeners} {...attributes}`?
3. Is `DndContext` wrapping `TableBody`?

**Solution:**
```typescript
// Check component hierarchy:
<DndContext sensors={rowSensors} onDragEnd={handleRowDragEnd}>
  <SortableContext items={rowIds} strategy={verticalListSortingStrategy}>
    <TableBody>
      {rows.map(row => <SortableRow key={row.id} row={row} />)}
    </TableBody>
  </SortableContext>
</DndContext>
```

---

## 📚 Next Steps

### 1. Read Architecture Docs
- **[Architecture Overview](../architecture/overview.md)** - Understand the system

### 2. Explore Property System
- **[Property Types](../property-system/property-types.md)** - All property types
- **[Property Menu](../property-system/property-menu.md)** - Menu configuration

### 3. Study Views
- **[Table View](../views/table-view.md)** - Most feature-rich
- **[Board View](../views/board-view.md)** - Kanban board

### 4. Backend Deep Dive
- **[Convex Schema](../backend/convex-schema.md)** - Database structure
- **[Mutations](../backend/mutations.md)** - All mutations
- **[Queries](../backend/queries.md)** - All queries

---

## 🎓 Learning Path

### Beginner (Week 1)
1. ✅ Setup development environment
2. ✅ Understand file structure
3. ✅ Create/edit/delete rows
4. ✅ Add/remove properties
5. ✅ Switch between views

### Intermediate (Week 2)
1. ✅ Understand property system
2. ✅ Modify property types
3. ✅ Customize property menu
4. ✅ Add inline editing
5. ✅ Understand state management

### Advanced (Week 3)
1. ✅ Create new property type
2. ✅ Create new view type
3. ✅ Optimize queries
4. ✅ Add new mutations
5. ✅ Write comprehensive tests

---

## 💻 Code Examples

### Example 1: Get All Tables

```typescript
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

function MyComponent() {
  const tables = useQuery(
    api.features.database.queries.listTables,
    { workspaceId: 'workspace_123' }
  );
  
  return (
    <div>
      {tables?.map(table => (
        <div key={table._id}>{table.name}</div>
      ))}
    </div>
  );
}
```

### Example 2: Create New Row

```typescript
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

function MyComponent() {
  const createRow = useMutation(api.features.database.mutations.createRow);
  
  const handleCreate = async () => {
    await createRow({
      tableId: 'table_123',
      data: {
        title: 'New Row',
        status: 'todo',
        priority: 'high',
      },
    });
  };
  
  return <button onClick={handleCreate}>Create Row</button>;
}
```

### Example 3: Update Cell

```typescript
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

function MyComponent() {
  const updateRow = useMutation(api.features.database.mutations.updateRow);
  
  const handleUpdate = async (rowId: string, field: string, value: any) => {
    await updateRow({
      id: rowId,
      data: {
        [field]: value,
      },
    });
  };
  
  return <input onChange={(e) => handleUpdate('row_123', 'title', e.target.value)} />;
}
```

### Example 4: Get Property Menu Config

```typescript
import { getPropertyMenuConfig } from '@/frontend/features/database/properties/menu-registry';

function buildMenu(propertyType: string) {
  const config = getPropertyMenuConfig(propertyType);
  
  console.log('Type-specific items:', config.typeSpecificItems);
  // [{ id: 'setFormat', label: 'Number format', ... }]
  
  console.log('Overrides:', config.overrides);
  // { calculate: { submenu: [...] } }
  
  console.log('Hidden items:', config.hidden);
  // ['delete'] for title property
  
  console.log('Disabled items:', config.disabled);
  // ['toggleRequired'] for auto properties
}
```

---

## 🔗 Quick Links

- **[README](../README.md)** - Feature overview
- **[Changelog](../changelog/README.md)** - Recent changes
- **[API Reference](../api-reference/components.md)** - Component API
- **[Troubleshooting](./troubleshooting.md)** - Common issues

---

## 📞 Get Help

**Questions?**
1. Check **[Troubleshooting Guide](./troubleshooting.md)**
2. Review **[API Reference](../api-reference/components.md)**
3. See **[Changelog](../changelog/README.md)** for recent updates
4. Ask team members on Slack

**Found a Bug?**
1. Check if it's already fixed in latest changes
2. Try reproducing in clean environment
3. Document steps to reproduce
4. Create GitHub issue with details

---

**Happy Coding!** 🚀

**Last Updated:** November 6, 2025  
**Maintained By:** Development Team
