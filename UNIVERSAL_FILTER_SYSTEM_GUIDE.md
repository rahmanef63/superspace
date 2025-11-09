# Universal Filter System - Complete Guide

## 🎯 Overview

Sistem filter universal yang dapat diterapkan ke **semua features** dengan cara yang **scalable**, **customizable**, dan **DRY**. Setiap feature cukup menggunakan hook `useFeatureFilters` dengan config yang sesuai.

**Key Features:**
- ✅ **Auto-generate** filter fields dari database properties
- ✅ **Visible filter chips** like FiltersDemo example
- ✅ **Custom options** untuk select/multiselect fields
- ✅ **Grouping** untuk organize filters by category
- ✅ **Persistence** ke localStorage
- ✅ **Backend integration** dengan Convex
- ✅ **Type-safe** dengan full TypeScript support

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Feature                             │
│  (Database, Documents, Tasks, etc)                          │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ├─> useFeatureFilters() hook
                            │   ├─> Auto-generate filter fields
                            │   ├─> Load from localStorage
                            │   ├─> Apply custom config
                            │   └─> Build Convex query
                            │
                            ├─> DatabaseFilters component
                            │   ├─> Filters UI (@reui/filters)
                            │   ├─> Visible filter chips
                            │   └─> Clear all button
                            │
                            └─> Convex Backend
                                ├─> applyConvexFilters()
                                └─> Client-side filtering
```

---

## 📁 File Structure

```
frontend/features/database/filters/
├── types.ts                    # Operator mappings per PropertyType
├── fieldConverters.ts          # Property → FilterField conversion
├── queryBuilder.ts             # Filter → ConvexQuery builder
├── useFilters.ts               # Basic filter hook
├── useFeatureFilters.ts        # ⭐ Main hook untuk features
├── index.ts                    # Public exports
├── README.md                   # Technical documentation
└── EXAMPLES.md                 # Code examples

frontend/features/database/components/
├── DatabaseFilters.tsx         # ⭐ Filter UI component
└── DatabaseToolbar.tsx         # Toolbar dengan filters

convex/lib/
└── filters.ts                  # ⭐ Backend helpers
```

---

## 🚀 Quick Start

### 1. Setup Filter in Feature Component

```tsx
'use client';

import { useState } from 'react';
import { useFeatureFilters } from '@/frontend/features/database/filters';
import { DatabaseFilters } from '@/frontend/features/database/components';
import { createFilter } from '@/components/ui/filters';
import { Calendar, Users, Star } from 'lucide-react';

export function MyFeaturePage() {
  // Your database properties
  const properties = [
    { key: 'name', type: 'text', label: 'Name' },
    { key: 'status', type: 'select', label: 'Status' },
    { key: 'priority', type: 'multiselect', label: 'Priority' },
    { key: 'created_at', type: 'date', label: 'Created' },
  ];
  
  // Setup filters dengan useFeatureFilters
  const databaseFilters = useFeatureFilters({
    featureId: 'my-feature',
    properties,
    
    // Optional: Default filters
    defaultFilters: [
      createFilter('status', 'equals', ['active'])
    ],
    
    // Optional: Custom options untuk select fields
    customOptions: {
      status: [
        { value: 'active', label: 'Active', icon: <Check /> },
        { value: 'inactive', label: 'Inactive', icon: <X /> },
        { value: 'pending', label: 'Pending', icon: <Clock /> },
      ],
      priority: [
        { value: 'low', label: 'Low', icon: <Star /> },
        { value: 'medium', label: 'Medium', icon: <Star /> },
        { value: 'high', label: 'High', icon: <Star /> },
      ],
    },
    
    // Optional: Group filters
    groups: [
      { group: 'Basic Info', fields: ['name', 'email'] },
      { group: 'Status', fields: ['status', 'priority'] },
      { group: 'Dates', fields: ['created_at', 'updated_at'] },
    ],
    
    // Optional: Custom labels & icons
    propertyOverrides: {
      created_at: {
        label: 'Date Created',
        icon: <Calendar />,
      },
    },
    
    // Callback when filters change
    onFiltersChange: (filters, query) => {
      console.log('Filters:', filters);
      console.log('Convex Query:', query);
      // Refresh data dengan filter baru
    },
  });
  
  return (
    <div>
      {/* Display filters */}
      <DatabaseFilters
        properties={properties}
        filters={databaseFilters.filters}
        onFiltersChange={databaseFilters.setFilters}
        variant="outline"
        size="sm"
      />
      
      {/* Your feature content */}
      <div>
        {/* Query akan otomatis updated via onFiltersChange callback */}
      </div>
    </div>
  );
}
```

### 2. Use Filter Query in Convex Backend

```typescript
// convex/myFeature.ts
import { query } from "./_generated/server";
import { v } from "convex/values";
import { applyConvexFilters } from "./lib/filters";

export const listRecords = query({
  args: {
    workspaceId: v.id("workspaces"),
    filter: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // 1. Fetch base data
    let records = await ctx.db
      .query("records")
      .withIndex("by_workspace", q => q.eq("workspaceId", args.workspaceId))
      .collect();
    
    // 2. Apply filters
    if (args.filter) {
      records = applyConvexFilters(records, args.filter);
    }
    
    return records;
  },
});
```

### 3. Connect Filter to Convex Query

```tsx
export function MyFeaturePage() {
  const [filterQuery, setFilterQuery] = useState(null);
  
  // Convex query dengan filter
  const records = useQuery(api.myFeature.listRecords, {
    workspaceId: currentWorkspace,
    filter: filterQuery,
  });
  
  // Setup filters
  const databaseFilters = useFeatureFilters({
    featureId: 'my-feature',
    properties,
    onFiltersChange: (filters, query) => {
      setFilterQuery(query); // ⭐ Update Convex query
    },
  });
  
  return (
    <DatabaseFilters
      properties={properties}
      filters={databaseFilters.filters}
      onFiltersChange={databaseFilters.setFilters}
    />
  );
}
```

---

## 🎨 Customization Examples

### Example 1: Simple Feature dengan Default Filters

```tsx
const filters = useFeatureFilters({
  featureId: 'tasks',
  properties: taskProperties,
  defaultFilters: [
    createFilter('status', 'not_equals', ['completed'])
  ],
});
```

### Example 2: Custom Icons & Labels

```tsx
const filters = useFeatureFilters({
  featureId: 'documents',
  properties: documentProperties,
  propertyOverrides: {
    created_by: {
      label: 'Author',
      icon: <Users />,
    },
    modified_at: {
      label: 'Last Modified',
      icon: <Clock />,
    },
  },
});
```

### Example 3: Grouped Filters with Custom Options

```tsx
const filters = useFeatureFilters({
  featureId: 'projects',
  properties: projectProperties,
  
  customOptions: {
    status: [
      { value: 'planning', label: 'Planning', icon: <Lightbulb /> },
      { value: 'active', label: 'Active', icon: <Play /> },
      { value: 'completed', label: 'Completed', icon: <Check /> },
    ],
    team: [
      { value: 'frontend', label: 'Frontend', icon: <Code /> },
      { value: 'backend', label: 'Backend', icon: <Server /> },
      { value: 'design', label: 'Design', icon: <Palette /> },
    ],
  },
  
  groups: [
    { group: 'Project Info', fields: ['name', 'description'] },
    { group: 'Status & Team', fields: ['status', 'team', 'priority'] },
    { group: 'Dates', fields: ['start_date', 'end_date', 'deadline'] },
  ],
});
```

### Example 4: Disable Persistence

```tsx
const filters = useFeatureFilters({
  featureId: 'temporary-view',
  properties,
  persistFilters: false, // Don't save to localStorage
});
```

### Example 5: Custom Storage Key

```tsx
const filters = useFeatureFilters({
  featureId: 'database',
  properties,
  storageKey: `database-${databaseId}-filters`, // Per-database filters
});
```

---

## 🔧 API Reference

### `useFeatureFilters(config)`

**Parameters:**

```typescript
interface FeatureFilterConfig {
  featureId: string;              // Unique feature ID
  properties: Property[];          // Database properties
  defaultFilters?: UIFilter[];     // Initial filters
  customOptions?: Record<string, OptionConfig[]>;
  propertyOverrides?: Record<string, PropertyOverride>;
  groups?: GroupConfig[];
  onFiltersChange?: (filters, query) => void;
  persistFilters?: boolean;        // Default: true
  storageKey?: string;             // Default: ${featureId}-filters
}
```

**Returns:**

```typescript
interface UseFeatureFiltersReturn {
  filters: UIFilter[];             // Current active filters
  filterFields: FilterFieldConfig[]; // For UI component
  convexQuery: ConvexQueryFilter | null; // For Convex backend
  hasFilters: boolean;
  setFilters: (filters) => void;
  clearFilters: () => void;
  addFilter: (filter) => void;
  removeFilter: (filterId) => void;
  resetToDefaults: () => void;
}
```

### `DatabaseFilters` Component

**Props:**

```typescript
interface DatabaseFiltersProps {
  properties: Property[];
  filters: UIFilter[];
  onFiltersChange: (filters, query) => void;
  variant?: 'solid' | 'outline';   // Default: outline
  size?: 'sm' | 'md' | 'lg';       // Default: sm
  className?: string;
}
```

### Convex Backend Helpers

```typescript
// Apply filters client-side after fetch
function applyConvexFilters<T>(records: T[], filter: ConvexQueryFilter): T[]

// Apply single filter expression
function applyFilterExpression(record: any, filter: FilterExpression): boolean

// Get index-friendly filters
function buildConvexQueryArgs(filter: ConvexQueryFilter): {
  indexableFilters: Array<{ field: string; value: any }>;
  clientFilters: ConvexQueryFilter | null;
  needsClientFiltering: boolean;
}
```

---

## 📋 Checklist: Adding Filters to Any Feature

- [ ] 1. Identify database properties untuk feature
- [ ] 2. Add `useFeatureFilters` hook dengan config
- [ ] 3. Add `DatabaseFilters` component ke UI
- [ ] 4. Add `filter` argument ke Convex query
- [ ] 5. Apply `applyConvexFilters` di backend
- [ ] 6. Test filtering dengan various operators
- [ ] 7. (Optional) Add custom options untuk selects
- [ ] 8. (Optional) Add grouping untuk better UX
- [ ] 9. (Optional) Customize icons & labels

---

## 🎯 Supported Property Types

All 21 PropertyTypes supported dengan operators:

| Type | Operators |
|------|-----------|
| `text`, `email`, `url`, `phone` | contains, not_contains, equals, not_equals, starts_with, ends_with, empty, not_empty |
| `number`, `currency`, `percent` | equals, not_equals, greater_than, less_than, greater_than_or_equal, less_than_or_equal, empty, not_empty |
| `select`, `status` | equals, not_equals, empty, not_empty |
| `multi_select` | contains, not_contains, empty, not_empty |
| `date`, `created_at`, `updated_at` | equals, not_equals, greater_than, less_than, between, empty, not_empty |
| `date_range` | between, empty, not_empty |
| `checkbox` | equals, not_equals |
| `user`, `created_by`, `updated_by` | equals, not_equals, empty, not_empty |
| `relation` | equals, not_equals, empty, not_empty |
| `rich_text` | contains, not_contains, empty, not_empty |
| `file`, `image` | empty, not_empty |
| `formula`, `rollup` | (depends on result type) |
| `auto_number`, `unique_id` | equals, not_equals |

---

## 🔍 Advanced Topics

### Filter Persistence Strategy

Filters otomatis disimpan ke localStorage dengan key pattern:
```
${featureId}-filters
```

Example:
```
database-filters
documents-filters
tasks-filters
database-abc123-filters  // Per-database
```

### Performance Optimization

1. **Client-side filtering**: Convex tidak support complex query operators, jadi filtering dilakukan di client
2. **Index optimization**: Simple equality filters bisa use Convex indexes
3. **Caching**: localStorage untuk persist user preferences
4. **Debouncing**: Consider debounce untuk text input filters

### Multi-level Filtering

```tsx
// Filter di multiple levels
const workspaceFilters = useFeatureFilters({
  featureId: 'workspace-level',
  // ...
});

const databaseFilters = useFeatureFilters({
  featureId: `database-${databaseId}`,
  // ...
});

// Combine queries
const combinedQuery = {
  operation: 'AND',
  filters: [
    workspaceFilters.convexQuery,
    databaseFilters.convexQuery,
  ].filter(Boolean),
};
```

---

## 🐛 Troubleshooting

### Filters not showing?

- Check `properties` array tidak kosong
- Verify `filterFields` dari `useFeatureFilters` ada values
- Check console untuk errors

### Filters not persisting?

- Check `persistFilters` tidak di-set `false`
- Verify localStorage tidak full
- Check browser localStorage permissions

### Backend filtering not working?

- Verify Convex query menerima `filter` argument
- Check `applyConvexFilters` dipanggil dengan benar
- Console.log filter query untuk debug

### Custom options not appearing?

- Check `customOptions` key match dengan property key
- Verify property type adalah `select` atau `multiselect`
- Check format options: `{ value, label, icon? }`

---

## 📚 Related Documentation

- [Filter System Technical README](./filters/README.md)
- [Filter Examples](./filters/EXAMPLES.md)
- [PropertyTypes Documentation](../../../docs/3-universal-database/)
- [@reui/filters Documentation](https://reui.com/filters)

---

## ✅ Summary

**3 Steps to Add Filters ke Any Feature:**

1. **Frontend**: Use `useFeatureFilters` hook + `DatabaseFilters` component
2. **Backend**: Add `filter` arg + use `applyConvexFilters` helper
3. **Connect**: Pass `convexQuery` ke Convex via `onFiltersChange`

**Benefits:**
- ✅ Scalable: Works untuk semua features
- ✅ Customizable: Custom options, icons, groups, labels
- ✅ SSOT: Single filter system untuk entire app
- ✅ DRY: Reusable hook + component
- ✅ Type-safe: Full TypeScript support
- ✅ User-friendly: Visible chips, clear all, persistence

**Result**: Professional filtering UI seperti Notion, Airtable, Linear! 🎉
