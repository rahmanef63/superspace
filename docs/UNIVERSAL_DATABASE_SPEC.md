# Universal Notion Database & Views – Spec (Markdown)

**Version:** 2.0
**Created:** 2025-11-02
**Status:** Specification

---

## 0) Purpose

Single, portable spec to describe a Notion‑like database (properties, views, rows) that can compile to:
- **Notion API** (import/export)
- **Superspace renderers** (table/board/timeline/calendar/gallery/map/chart/feed/form)
- **Any feature** (documents, tasks, calls, etc.)

**Key Principles:**
- Vendor-neutral JSON format
- Type-safe with TypeScript + Zod
- Extensible but strict core
- Backward compatible with existing database feature

---

## 1) Database Property Types (Complete)

### Core Properties (14 existing)
- ✅ **Title** - Primary text field
- ✅ **Rich text** - Formatted text with markdown
- ✅ **Number** - `plain | percent | currency`
- ✅ **Select** - Single choice from options
- ✅ **Multi-select** - Multiple choices
- ✅ **Date** - Start/end date range
- ✅ **People** - User references
- ✅ **Files & media** - Attachments
- ✅ **Checkbox** - Boolean value
- ✅ **URL** - Web link
- ✅ **Email** - Email address
- ✅ **Relation** - Link to other database
- ✅ **Rollup** - Aggregate from relation
- ✅ **Formula** - Computed value

### Extended Properties (7 new)
- 🆕 **Status** - Structured enum with groups (e.g., To do / In progress / Done)
- 🆕 **Phone** - Phone number
- 🆕 **Button** - Trigger actions (open URL, create record, etc.)
- 🆕 **Unique ID** - Auto-generated with prefix (e.g., `TASK-1001`)
- 🆕 **Place** - Address/location (enables Map views)
- ✅ **Created time** - Auto timestamp
- ✅ **Created by** - Auto user reference
- ✅ **Last edited time** - Auto timestamp
- ✅ **Last edited by** - Auto user reference

**Total:** 21 property types

> **Notes:**
> - *Status* is a richer version of *Select* with grouping capabilities
> - *Unique ID* supports prefixing and auto-increment (e.g., `TASK-1001`)
> - *Place* enables Map views with optional lat/lng geocoding
> - Auto properties (created/edited) are system-managed

---

## 2) Database Views / Layouts (Complete)

### Existing Views (5)
- ✅ **Table** - Spreadsheet-like grid
- ✅ **Board** - Kanban board (group by any property)
- ✅ **List** - Compact list view
- ✅ **Timeline** - Gantt-style timeline
- ✅ **Calendar** - Calendar grid

### New Views (5)
- 🆕 **Gallery** - Card grid with cover images
- 🆕 **Map** - Geographic visualization (requires `Place` property)
- 🆕 **Chart** - Data visualization (bar/line/pie/doughnut)
- 🆕 **Feed** - Social media-style stream
- 🆕 **Form** - Form builder for data entry

**Total:** 10 view types

> **Renderer Compatibility:**
> - Renderers may gracefully ignore unsupported views
> - Fallback to Table view if view type not supported
> - View switching should preserve filters/sorts

---

## 3) Universal JSON Schema v2

### 3.1 Complete Schema

```typescript
interface UniversalDatabase {
  schemaVersion: "2.0";
  db: {
    // Identity
    id: string;
    name: string;
    description?: string;
    icon?: string;
    coverUrl?: string;

    // Workspace context
    workspaceId?: string;

    // Properties (columns/fields)
    properties: Property[];

    // Views (layouts)
    views: View[];

    // Rows (records)
    rows: Row[];

    // Metadata
    createdBy?: string;
    createdTime?: number;
    lastEditedBy?: string;
    lastEditedTime?: number;

    // Settings
    settings?: {
      showProperties?: boolean;
      wrapCells?: boolean;
      showCalculations?: boolean;
      isPublic?: boolean;
      isTemplate?: boolean;
    };
  };
}

interface Property {
  key: string;                    // Unique identifier
  name: string;                   // Display name
  type: PropertyType;             // See PropertyType enum
  options?: PropertyOptions;      // Type-specific options
  description?: string;           // Help text
  isRequired?: boolean;           // Validation
  isPrimary?: boolean;            // Primary field (usually title)
  position?: number;              // Display order
}

type PropertyType =
  // Core (14)
  | "title" | "rich_text" | "number" | "select" | "multi_select"
  | "date" | "people" | "files" | "checkbox" | "url"
  | "email" | "relation" | "rollup" | "formula"
  // Extended (7)
  | "status" | "phone" | "button" | "unique_id" | "place"
  | "created_time" | "created_by" | "last_edited_time" | "last_edited_by";

interface View {
  id?: string;
  name: string;
  layout: ViewLayout;
  description?: string;

  // View configuration
  visibleProps?: string[];        // Visible property keys
  filters?: Filter[];
  sorts?: Sort[];
  groupBy?: string;               // Group by property key

  // Layout-specific options
  options?: ViewOptions;          // See ViewOptions by type

  // Metadata
  isDefault?: boolean;
  position?: number;
  createdBy?: string;
  createdTime?: number;
}

type ViewLayout =
  | "table" | "board" | "list" | "timeline" | "calendar"
  | "gallery" | "map" | "chart" | "feed" | "form";

interface Row {
  id: string;
  properties: Record<string, any>;  // Key-value pairs
  position?: number;
  createdBy?: string;
  createdTime?: number;
  lastEditedBy?: string;
  lastEditedTime?: number;
}

interface Filter {
  property: string;               // Property key
  operator: FilterOperator;
  value?: any;
}

type FilterOperator =
  | "equals" | "not_equals" | "contains" | "not_contains"
  | "starts_with" | "ends_with" | "is_empty" | "is_not_empty"
  | "greater_than" | "less_than" | "greater_than_or_equal" | "less_than_or_equal"
  | "before" | "after" | "on_or_before" | "on_or_after"
  | "is_checked" | "is_not_checked";

interface Sort {
  property: string;               // Property key
  direction: "ascending" | "descending";
}
```

### 3.2 Example: Complete Database

```json
{
  "schemaVersion": "2.0",
  "db": {
    "id": "tasks-db",
    "name": "Tasks Database",
    "description": "Project task management",
    "icon": "📋",
    "properties": [
      {
        "key": "name",
        "name": "Task Name",
        "type": "title",
        "isPrimary": true,
        "isRequired": true,
        "position": 0
      },
      {
        "key": "status",
        "name": "Status",
        "type": "status",
        "position": 1,
        "options": {
          "groups": [
            { "name": "To do", "color": "gray", "options": ["Backlog", "Ready"] },
            { "name": "In progress", "color": "blue", "options": ["Working", "Review"] },
            { "name": "Done", "color": "green", "options": ["Completed", "Archived"] }
          ]
        }
      },
      {
        "key": "tags",
        "name": "Tags",
        "type": "multi_select",
        "position": 2,
        "options": {
          "choices": [
            { "name": "UI", "color": "purple" },
            { "name": "Backend", "color": "blue" },
            { "name": "Docs", "color": "green" }
          ]
        }
      },
      {
        "key": "assignee",
        "name": "Assignee",
        "type": "people",
        "position": 3,
        "options": { "multi": true }
      },
      {
        "key": "date",
        "name": "Due Date",
        "type": "date",
        "position": 4,
        "options": { "allowEnd": true, "timezone": "Asia/Jakarta" }
      },
      {
        "key": "location",
        "name": "Location",
        "type": "place",
        "position": 5,
        "options": { "geocode": true }
      },
      {
        "key": "estimate",
        "name": "Estimate (hours)",
        "type": "number",
        "position": 6,
        "options": { "format": "number", "decimals": 1 }
      },
      {
        "key": "dependencies",
        "name": "Dependencies",
        "type": "relation",
        "position": 7,
        "options": { "dbId": "tasks-db", "multi": true }
      },
      {
        "key": "total_time",
        "name": "Total Time",
        "type": "rollup",
        "position": 8,
        "options": {
          "relationKey": "dependencies",
          "property": "estimate",
          "aggregation": "sum"
        }
      },
      {
        "key": "task_id",
        "name": "Task ID",
        "type": "unique_id",
        "position": 9,
        "options": { "prefix": "TASK-", "pad": 4 }
      },
      {
        "key": "open_link",
        "name": "Open",
        "type": "button",
        "position": 10,
        "options": {
          "actions": [
            { "do": "open_url", "url": "https://app.superspace.com/task/{{id}}" }
          ]
        }
      }
    ],
    "views": [
      {
        "name": "All Tasks",
        "layout": "table",
        "isDefault": true,
        "visibleProps": ["name", "status", "assignee", "date", "tags", "estimate"],
        "sorts": [{ "property": "date", "direction": "ascending" }],
        "filters": []
      },
      {
        "name": "Board by Status",
        "layout": "board",
        "groupBy": "status",
        "options": {
          "showEmptyGroups": true,
          "cardCoverProp": "files",
          "subgroupBy": "assignee"
        }
      },
      {
        "name": "Timeline",
        "layout": "timeline",
        "options": {
          "start": "date",
          "end": "date",
          "groupBy": "assignee",
          "zoom": "week"
        }
      },
      {
        "name": "Calendar",
        "layout": "calendar",
        "options": {
          "dateProp": "date",
          "showWeekNumbers": true
        }
      },
      {
        "name": "Gallery",
        "layout": "gallery",
        "options": {
          "coverProp": "files",
          "cardSize": "medium",
          "showTitle": true
        }
      },
      {
        "name": "Map View",
        "layout": "map",
        "options": {
          "placeProp": "location",
          "cluster": true
        }
      },
      {
        "name": "Status Chart",
        "layout": "chart",
        "options": {
          "chart": {
            "type": "bar",
            "x": "status",
            "y": { "agg": "count" },
            "stackBy": "tags"
          }
        }
      },
      {
        "name": "Recent Activity",
        "layout": "feed",
        "options": {
          "card": {
            "title": "name",
            "subtitle": "status",
            "meta": ["assignee", "date", "tags"]
          },
          "orderBy": { "property": "last_edited_time", "direction": "descending" }
        }
      },
      {
        "name": "New Task Form",
        "layout": "form",
        "options": {
          "form": {
            "title": "Create New Task",
            "submitLabel": "Create Task",
            "fields": [
              { "property": "name", "required": true },
              { "property": "status", "default": "To do" },
              { "property": "assignee" },
              { "property": "date" },
              { "property": "tags" },
              { "property": "estimate" }
            ],
            "layout": {
              "columns": 2,
              "sections": [
                {
                  "title": "Task Details",
                  "fields": ["name", "status", "date"]
                },
                {
                  "title": "Assignment",
                  "fields": ["assignee", "tags", "estimate"]
                }
              ]
            }
          }
        }
      }
    ],
    "rows": [],
    "settings": {
      "showProperties": true,
      "wrapCells": false,
      "showCalculations": true,
      "isPublic": false,
      "isTemplate": false
    }
  }
}
```

---

## 4) Property Options Reference

### Number Options
```typescript
{
  format: "number" | "percent" | "currency";
  currency?: "USD" | "EUR" | "IDR" | "SGD" | ...;
  decimals?: number;              // Default: 0
}
```

### Select / Multi-select Options
```typescript
{
  choices: Array<string | { name: string; color?: string; icon?: string }>;
}
```

### Status Options
```typescript
{
  groups: Array<{
    name: string;                 // Group name (e.g., "To do")
    color?: string;               // Group color
    options: string[];            // Options within group
  }>;
}
```

### Date Options
```typescript
{
  allowEnd?: boolean;             // Enable date range
  timezone?: string;              // IANA timezone
  format?: "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD";
}
```

### People Options
```typescript
{
  multi?: boolean;                // Allow multiple users
}
```

### Files Options
```typescript
{
  accept?: string[];              // MIME types or extensions
  maxSize?: number;               // Max file size in bytes
  maxFiles?: number;              // Max number of files
}
```

### Relation Options
```typescript
{
  dbId: string;                   // Target database ID
  multi?: boolean;                // Allow multiple relations
  synced?: boolean;               // Two-way sync
}
```

### Rollup Options
```typescript
{
  relationKey: string;            // Property key of relation
  property: string;               // Property to aggregate
  aggregation: "count" | "sum" | "avg" | "min" | "max" | "unique";
}
```

### Button Options
```typescript
{
  actions: Array<{
    do: "open_url" | "set_property" | "add_relation" | "create_record" | "trigger_webhook";
    // Action-specific parameters
    url?: string;                 // For open_url
    property?: string;            // For set_property
    value?: any;                  // For set_property
    dbId?: string;                // For create_record
    webhookUrl?: string;          // For trigger_webhook
  }>;
  label?: string;                 // Button text
  variant?: "default" | "primary" | "destructive";
}
```

### Unique ID Options
```typescript
{
  prefix?: string;                // Prefix (e.g., "TASK-")
  pad?: number;                   // Zero padding (e.g., 4 → "0001")
  startFrom?: number;             // Starting number
}
```

### Place Options
```typescript
{
  geocode?: boolean;              // Auto-geocode address
  latProp?: string;               // Property for latitude
  lngProp?: string;               // Property for longitude
}
```

---

## 5) View Options Reference

### Table Options
```typescript
{
  visibleProps?: string[];        // Visible columns
  filters?: Filter[];
  sorts?: Sort[];
  wrapLines?: boolean;            // Wrap cell content
  density?: "compact" | "comfortable" | "spacious";
  frozenColumns?: number;         // Number of frozen columns
}
```

### Board Options
```typescript
{
  groupBy: string;                // Property to group by (required)
  showEmptyGroups?: boolean;      // Show groups with no items
  cardCoverProp?: string;         // Property for card cover
  subgroupBy?: string;            // Secondary grouping
  cardLayout?: "default" | "compact" | "expanded";
}
```

### List Options
```typescript
{
  visibleProps?: string[];
  dense?: boolean;                // Compact spacing
  showThumbnails?: boolean;       // Show thumbnails
}
```

### Timeline Options
```typescript
{
  start: string;                  // Start date property (required)
  end?: string;                   // End date property
  groupBy?: string;               // Group by property
  zoom?: "day" | "week" | "month" | "quarter" | "year";
  showWeekends?: boolean;
}
```

### Calendar Options
```typescript
{
  dateProp: string;               // Date property (required)
  showWeekNumbers?: boolean;
  firstDayOfWeek?: 0 | 1;         // 0=Sunday, 1=Monday
  view?: "month" | "week" | "day";
}
```

### Gallery Options
```typescript
{
  coverProp?: string;             // Property for cover image
  cardSize?: "small" | "medium" | "large";
  showTitle?: boolean;
  columns?: number;               // Number of columns
  gap?: number;                   // Gap between cards
}
```

### Map Options
```typescript
{
  placeProp: string;              // Place property (required)
  cluster?: boolean;              // Cluster nearby markers
  zoom?: number;                  // Initial zoom level (1-20)
  center?: { lat: number; lng: number };
}
```

### Chart Options
```typescript
{
  chart: {
    type: "bar" | "line" | "area" | "pie" | "doughnut" | "scatter";
    x: string;                    // X-axis property
    y: {
      agg: "count" | "sum" | "avg" | "min" | "max";
      prop?: string;              // Property to aggregate (if not count)
    };
    stackBy?: string;             // Property to stack by
    colorBy?: string;             // Property for coloring
    showLegend?: boolean;
    showGrid?: boolean;
  };
}
```

### Feed Options
```typescript
{
  card: {
    title: string;                // Property for title
    subtitle?: string;            // Property for subtitle
    meta?: string[];              // Properties to show as metadata
    content?: string;             // Property for content
    image?: string;               // Property for image
  };
  orderBy?: {
    property: string;
    direction: "ascending" | "descending";
  };
  groupBy?: string;               // Group entries
}
```

### Form Options
```typescript
{
  form: {
    title: string;                // Form title
    description?: string;         // Form description
    submitLabel?: string;         // Submit button text
    fields: Array<{
      property: string;           // Property key
      required?: boolean;         // Override property's isRequired
      default?: any;              // Default value
      hidden?: boolean;           // Hide field
      placeholder?: string;       // Placeholder text
    }>;
    layout?: {
      columns?: number;           // Number of columns
      sections?: Array<{
        title: string;
        description?: string;
        fields: string[];         // Property keys
      }>;
    };
    onSubmit?: {
      action: "create" | "update" | "redirect";
      redirect?: string;          // URL to redirect after submit
      message?: string;           // Success message
    };
  };
}
```

---

## 6) Mapping Guidelines

### Principle 1: Strict Core, Loose Options
- Keep `type` and `layout` as strict enums
- Push renderer-specific details to `options`
- Allow unknown options for forward compatibility

### Principle 2: Relations are Symbolic
- Reference other databases via `dbId`/`key`, not hard pointers
- Support cross-workspace relations
- Lazy-load related data

### Principle 3: Normalize Enums
- Define `select/status` options at property-level, not per-row
- Row values reference option IDs, not full objects
- Centralize color/icon definitions

### Principle 4: Views are Projections
- Treat `views[]` as filter/sort/group/visibility presets
- Safe to ignore unsupported views
- Fallback to default view (usually Table)

### Principle 5: No Vendor Lock in Rows
- Keep visual style (icons/colors) in view/options, not in row values
- Row values contain only data, not presentation
- Enable easy data portability

### Principle 6: Progressive Enhancement
- Core features work everywhere
- Advanced features (Map, Chart) degrade gracefully
- Feature detection before rendering

---

## 7) Implementation Strategy

### 7.1 Type System (TypeScript + Zod)

```typescript
// Define strict TypeScript types
import { z } from "zod";

export const PropertyTypeSchema = z.enum([
  "title", "rich_text", "number", "select", "multi_select",
  "date", "people", "files", "checkbox", "url", "email",
  "relation", "rollup", "formula", "status", "phone",
  "button", "unique_id", "place",
  "created_time", "created_by", "last_edited_time", "last_edited_by",
]);

export const ViewLayoutSchema = z.enum([
  "table", "board", "list", "timeline", "calendar",
  "gallery", "map", "chart", "feed", "form",
]);

export const PropertySchema = z.object({
  key: z.string(),
  name: z.string(),
  type: PropertyTypeSchema,
  options: z.record(z.any()).optional(),
  description: z.string().optional(),
  isRequired: z.boolean().optional(),
  isPrimary: z.boolean().optional(),
  position: z.number().optional(),
});

export const ViewSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  layout: ViewLayoutSchema,
  description: z.string().optional(),
  visibleProps: z.array(z.string()).optional(),
  filters: z.array(z.any()).optional(),
  sorts: z.array(z.any()).optional(),
  groupBy: z.string().optional(),
  options: z.record(z.any()).optional(),
  isDefault: z.boolean().optional(),
  position: z.number().optional(),
});

export const UniversalDatabaseSchema = z.object({
  schemaVersion: z.literal("2.0"),
  db: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    icon: z.string().optional(),
    properties: z.array(PropertySchema),
    views: z.array(ViewSchema),
    rows: z.array(z.any()),
    settings: z.record(z.any()).optional(),
  }),
});
```

### 7.2 Compiler Architecture

```
Universal JSON (v2)
        │
        ├─→ Notion Compiler   → Notion API format
        ├─→ Superspace Compiler → View-System format
        ├─→ Export Compiler    → CSV/Excel/JSON
        └─→ Validation Compiler → Zod validation
```

### 7.3 Storage Strategy

```typescript
// Convex schema
export const universalDatabases = defineTable({
  workspaceId: v.id("workspaces"),

  // Universal JSON (full spec)
  spec: v.any(),                  // Store complete JSON

  // Parsed metadata (for querying)
  name: v.string(),
  type: v.string(),               // "database" | "document_collection" | "feature_table"
  propertyCount: v.number(),
  viewCount: v.number(),
  rowCount: v.number(),

  // Audit
  createdById: v.id("users"),
  updatedById: v.id("users"),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_workspace", ["workspaceId"])
  .index("by_type", ["workspaceId", "type"]);
```

---

## 8) Migration from Current Database

### 8.1 Schema Mapping

| Current | Universal v2 | Notes |
|---------|-------------|-------|
| `dbTables` | `universalDatabases.spec.db` | Complete migration |
| `dbFields` | `spec.db.properties[]` | 1:1 mapping |
| `dbViews` | `spec.db.views[]` | Add layout options |
| `dbRows` | `spec.db.rows[]` | Flatten data structure |

### 8.2 Property Type Mapping

| Current Type | Universal Type | Changes |
|--------------|----------------|---------|
| `text` | `title` or `rich_text` | Distinguish primary field |
| `number` | `number` | Add format options |
| `select` | `select` or `status` | Status for grouped enums |
| `multiSelect` | `multi_select` | Rename only |
| `date` | `date` | Add timezone support |
| `person` | `people` | Rename + multi option |
| `files` | `files` | Add accept/maxSize |
| `checkbox` | `checkbox` | No change |
| `url` | `url` | No change |
| `email` | `email` | No change |
| `phone` | `phone` | **New type** |
| `formula` | `formula` | No change |
| `relation` | `relation` | Add synced option |
| `rollup` | `rollup` | No change |

### 8.3 View Type Mapping

| Current View | Universal Layout | Options |
|--------------|------------------|---------|
| `table` | `table` | Add density, frozen columns |
| `board` | `board` | Add subgroupBy, card layout |
| `calendar` | `calendar` | Add week numbers, first day |
| `timeline` | `timeline` | Add zoom levels |
| `list` | `list` | Add thumbnails |
| `gallery` | `gallery` | **New layout** |

---

## 9) Versioning & Evolution

### Version History
- **v1.0** - Initial database feature (5 views, 14 properties)
- **v2.0** - Universal spec (10 views, 21 properties, standardized JSON)

### Backward Compatibility
- v1 databases auto-upgrade to v2 on first access
- v2 databases can export to v1 (lossy)
- Schema version field enables migration detection

### Future Roadmap
- **v2.1** - AI-powered formula assistant
- **v2.2** - Real-time collaboration on forms
- **v2.3** - Advanced chart types (scatter, radar, heatmap)
- **v3.0** - Database templates marketplace

---

## 10) Reference Implementation

See:
- `docs/DATABASE_VIEW_SYSTEM_MIGRATION.md` - Migration plan
- `docs/UNIVERSAL_DATABASE_TODO.md` - Implementation tasks
- `frontend/shared/foundation/types/universal-database.ts` - Type definitions
- `frontend/shared/foundation/utils/converters/database-converter.ts` - Converters
- `convex/features/database/api/universal-schema.ts` - Convex schema

---

**Document Status:** Approved
**Next Steps:** See [UNIVERSAL_DATABASE_TODO.md](./UNIVERSAL_DATABASE_TODO.md) for implementation plan
