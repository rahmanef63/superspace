# Database Feature → View-System Migration Plan

**Created:** 2025-11-02
**Status:** Planning Phase
**Goal:** Migrate database feature to use the universal view-system while maintaining backward compatibility and enabling any feature to have database-like capabilities (like Notion)

---

## Executive Summary

This migration plan will:
1. ✅ Integrate database feature with the view-system architecture
2. ✅ Maintain full backward compatibility (no breaking changes)
3. ✅ Create a unified schema JSON that works across all features
4. ✅ Enable any feature to have database/table capabilities
5. ✅ Support seamless view switching between features

**Migration Strategy:** Gradual, phased approach with feature flags

---

## Current State Analysis

### Database Feature (Current)
- **5 custom views:** Table, Gantt, Calendar, Kanban, List
- **Custom types:** `DatabaseField`, `DatabaseViewType`, `DatabaseViewModel`
- **Manual view switching:** Switch statement in `DatabasePage.tsx` (750 lines)
- **Separate state management:** Local `useState` hooks
- **Custom toolbar:** `DatabaseToolbar` component
- **14 field types:** text, number, select, date, person, files, etc.

### View-System (Target)
- **18 standardized views:** table, grid, kanban, calendar, timeline, gantt, etc.
- **Universal types:** `ViewField<T>`, `ViewColumn<T>`, `ViewConfig<T>`
- **Dynamic rendering:** `ViewRenderer` with registry-based loading
- **Centralized state:** `ViewProvider` with localStorage persistence
- **Universal toolbar:** Supports all view types
- **Type-safe:** Generic `<T>` for any data shape

### Gap Analysis

| Aspect | Database (Current) | View-System | Migration Need |
|--------|-------------------|-------------|----------------|
| **View Types** | 5 custom | 18 standardized | ✅ Map existing to standard |
| **Field System** | 14 field types | ViewField generic | ✅ Create adapter layer |
| **State Management** | Local useState | ViewProvider | ✅ Refactor to use provider |
| **Type System** | Custom types | Generic `<T>` | ✅ Create type mappings |
| **Toolbar** | DatabaseToolbar | UniversalToolbar | ✅ Migrate to universal |
| **Registry** | Switch statement | viewRegistry | ✅ Register views |
| **Persistence** | Convex only | localStorage + backend | ✅ Hybrid approach |

---

## The "Notion-like" Vision

**Goal:** Any feature can have table/database capabilities with consistent schema

### Universal Data Model (Unified Schema)

```typescript
/**
 * Universal Schema for Database-like Features
 * This schema works across ALL features (documents, tasks, calls, etc.)
 */

interface UniversalRecord<T = any> {
  // Identity
  _id: Id<any>;
  _creationTime: number;

  // Workspace context
  workspaceId: Id<"workspaces">;

  // Record metadata
  type: string;                    // "document" | "task" | "call" | "database_row"
  title: string;
  description?: string;

  // Visual
  icon?: string;
  coverUrl?: string;
  color?: string;

  // Properties (database fields)
  properties: Record<string, PropertyValue>;

  // Views configuration
  views: ViewConfiguration[];

  // Relationships
  parentId?: Id<any>;
  documentId?: Id<"documents">;   // Link to full document

  // Audit
  createdById: Id<"users">;
  updatedById: Id<"users">;
  updatedAt: number;

  // Permissions
  isPublic: boolean;
  permissions: RecordPermissions;

  // Feature-specific data
  featureData?: T;                 // Type-safe extension point
}

interface PropertyDefinition {
  id: string;
  name: string;
  type: PropertyType;
  options?: PropertyOptions;
  isRequired: boolean;
  isPrimary?: boolean;
  position: number;
}

type PropertyType =
  | "text" | "number" | "select" | "multiSelect"
  | "date" | "dateRange" | "person" | "files"
  | "checkbox" | "url" | "email" | "phone"
  | "formula" | "relation" | "rollup"
  | "status" | "priority" | "tags"
  | "createdTime" | "updatedTime"
  | "createdBy" | "updatedBy";

interface PropertyValue {
  type: PropertyType;
  value: any;                      // Type depends on PropertyType
  computed?: any;                  // For formulas/rollups
}

interface ViewConfiguration {
  id: string;
  name: string;
  type: ViewType;                  // From view-system
  settings: ViewSettings;          // From view-system
  filters: ViewFilter[];
  sorts: ViewSort[];
  visibleProperties: string[];
  isDefault: boolean;
  position: number;
}
```

### Benefits of Unified Schema

1. **Cross-feature consistency:** All features use same property types
2. **Easy view switching:** Same data, different views
3. **Type safety:** Single source of truth for types
4. **Reusable components:** Property renderers work everywhere
5. **Notion-like flexibility:** Any record can become a database

---

## Migration Phases

### Phase 1: Foundation (Week 1) - NON-BREAKING

**Goal:** Create adapters and unified types without touching existing code

#### 1.1 Create Universal Schema
- [ ] Create `frontend/shared/types/universal-schema.ts`
- [ ] Define `UniversalRecord<T>` interface
- [ ] Define `PropertyDefinition` and `PropertyValue` types
- [ ] Create type utilities for conversion

#### 1.2 Create Adapter Layer
- [ ] Create `frontend/features/database/adapters/view-system-adapter.ts`
- [ ] Implement `DatabaseFieldToViewField` converter
- [ ] Implement `DatabaseViewToViewConfig` converter
- [ ] Implement `DatabaseRecordToUniversalRecord` mapper
- [ ] Create bidirectional sync functions

#### 1.3 Register Database Views
- [ ] Register Table view in `viewRegistry`
- [ ] Register Gantt view in `viewRegistry`
- [ ] Register Calendar view in `viewRegistry`
- [ ] Register Kanban view in `viewRegistry`
- [ ] Register List view in `viewRegistry`

**Deliverables:**
- ✅ Adapter functions working
- ✅ Types compiled without errors
- ✅ Database views registered in view-system
- ✅ Zero changes to existing database UI

---

### Phase 2: Parallel Implementation (Week 2) - FEATURE FLAG

**Goal:** Create new view-system based implementation alongside existing

#### 2.1 Create New Database Page (Parallel)
- [ ] Create `frontend/features/database/views/DatabasePageV2.tsx`
- [ ] Wrap with `ViewProvider` using adapted data
- [ ] Use `ViewRenderer` for view switching
- [ ] Integrate with `UniversalToolbar`
- [ ] Add feature flag: `USE_DATABASE_VIEW_SYSTEM`

#### 2.2 Create View Adapters
- [ ] Create `DatabaseTableViewAdapter.tsx` (wraps existing TableView)
- [ ] Create `DatabaseGanttViewAdapter.tsx`
- [ ] Create `DatabaseCalendarViewAdapter.tsx`
- [ ] Create `DatabaseKanbanViewAdapter.tsx`
- [ ] Create `DatabaseListViewAdapter.tsx`

#### 2.3 Update Convex Schema (Backward Compatible)
- [ ] Add `viewSystemConfig` field to `dbViews` (optional)
- [ ] Add migration function for existing views
- [ ] Create `universalRecords` table (optional, for cross-feature)
- [ ] Add indexes for performance

**Deliverables:**
- ✅ V2 implementation working behind feature flag
- ✅ Both old and new systems functional
- ✅ Database backward compatible
- ✅ Users can opt-in to test

---

### Phase 3: Testing & Refinement (Week 3) - BETA

**Goal:** Test new implementation, gather feedback, fix issues

#### 3.1 User Testing
- [ ] Enable feature flag for beta users
- [ ] Collect feedback on performance
- [ ] Identify edge cases
- [ ] Compare feature parity

#### 3.2 Performance Optimization
- [ ] Optimize data transformations (use memo/cache)
- [ ] Lazy load view components
- [ ] Virtual scrolling for large datasets
- [ ] Benchmark vs old implementation

#### 3.3 Feature Parity Check
- [ ] All 5 views render correctly
- [ ] All 14 field types supported
- [ ] Inline editing works
- [ ] Drag & drop works
- [ ] Filtering/sorting works
- [ ] View settings persist

**Deliverables:**
- ✅ Beta tested with real users
- ✅ Performance on par or better
- ✅ No missing features
- ✅ Bug fixes deployed

---

### Phase 4: Migration & Rollout (Week 4) - GRADUAL ROLLOUT

**Goal:** Migrate all users to new system, deprecate old

#### 4.1 Data Migration
- [ ] Create migration script for `dbViews` table
- [ ] Convert old view settings to new format
- [ ] Backfill `viewSystemConfig` for existing views
- [ ] Test migration on staging

#### 4.2 Code Migration
- [ ] Replace `DatabasePage.tsx` with V2
- [ ] Update feature config to use new page
- [ ] Remove old view components (or move to deprecated/)
- [ ] Update imports and exports

#### 4.3 Documentation
- [ ] Update database feature documentation
- [ ] Create migration guide for other features
- [ ] Document universal schema usage
- [ ] Update architecture diagrams

**Deliverables:**
- ✅ 100% of users on new system
- ✅ Old code removed/deprecated
- ✅ Documentation updated
- ✅ Clean codebase

---

### Phase 5: Universal Rollout (Week 5+) - ENABLE OTHER FEATURES

**Goal:** Enable other features to use database capabilities

#### 5.1 Documents Feature Enhancement
- [ ] Add "View as Table" option to documents
- [ ] Allow adding properties to documents
- [ ] Enable filtering/sorting document lists
- [ ] Support database views in document collections

#### 5.2 Other Features
- [ ] Enable table views in Calls feature
- [ ] Enable table views in Chat feature
- [ ] Create property templates for common use cases

#### 5.3 Template System
- [ ] Create "Database Template" feature
- [ ] Allow creating database from template
- [ ] Support importing/exporting configurations

**Deliverables:**
- ✅ All features can optionally use database views
- ✅ Consistent experience across features
- ✅ Template library available

---

## Implementation Details

### 1. Adapter Pattern

```typescript
// frontend/features/database/adapters/view-system-adapter.ts

/**
 * Converts database field definition to view-system field
 */
export function databaseFieldToViewField(
  field: DatabaseField
): ViewField<UniversalRecord> {
  const baseField: ViewField<UniversalRecord> = {
    id: field._id,
    label: field.name,
    type: mapFieldType(field.type),
    accessor: (record) => record.properties[field._id]?.value,
    editable: true,
  };

  // Map field-specific options
  if (field.type === "select" || field.type === "multiSelect") {
    baseField.options = field.options?.selectOptions?.map((opt) => ({
      label: opt.name,
      value: opt.id,
      color: opt.color,
    }));
  }

  return baseField;
}

/**
 * Converts database view to view-system config
 */
export function databaseViewToViewConfig(
  view: DatabaseView,
  fields: DatabaseField[],
  rows: DatabaseRow[]
): ViewConfig<UniversalRecord> {
  const viewFields = fields.map(databaseFieldToViewField);

  return {
    id: view._id,
    type: mapViewType(view.type),
    label: view.name,
    fields: viewFields,
    settings: {
      selectable: true,
      density: "comfortable",
      showPagination: true,
      pageSize: 50,
      ...mapViewSettings(view.settings),
    },
    defaultFilters: view.settings.filters.map(mapFilter),
    defaultSort: view.settings.sorts[0] ? mapSort(view.settings.sorts[0]) : undefined,
  };
}

/**
 * Maps database view types to view-system types
 */
function mapViewType(dbType: DatabaseViewType): ViewType {
  const mapping: Record<DatabaseViewType, ViewType> = {
    table: ViewType.TABLE,
    board: ViewType.KANBAN,
    calendar: ViewType.CALENDAR,
    list: ViewType.LIST,
    timeline: ViewType.GANTT,
    gallery: ViewType.GRID,
  };
  return mapping[dbType] || ViewType.TABLE;
}

/**
 * Maps database field types to view-system field types
 */
function mapFieldType(dbType: DatabaseFieldType): ViewFieldType {
  const mapping: Record<DatabaseFieldType, ViewFieldType> = {
    text: "text",
    number: "number",
    select: "select",
    multiSelect: "multiSelect",
    date: "date",
    checkbox: "boolean",
    person: "user",
    files: "file",
    url: "url",
    email: "email",
    phone: "phone",
    formula: "computed",
    relation: "relation",
    rollup: "computed",
  };
  return mapping[dbType] || "text";
}
```

### 2. New Database Page (V2)

```typescript
// frontend/features/database/views/DatabasePageV2.tsx

import { ViewProvider, ViewRenderer, useViewContext } from "@/frontend/shared/ui/layout/view-system";
import { UniversalToolbar } from "@/frontend/shared/ui/layout/toolbar";
import { databaseViewToViewConfig } from "../adapters/view-system-adapter";

export function DatabasePageV2({ workspaceId }: { workspaceId: Id<"workspaces"> }) {
  // Fetch database data using existing hooks
  const { record, viewModel, isLoading } = useDatabaseRecord(tableId);

  // Get active view configuration
  const activeView = record?.views.find((v) => v.isDefault) || record?.views[0];

  // Convert to view-system format
  const viewConfig = useMemo(() => {
    if (!activeView || !record) return null;
    return databaseViewToViewConfig(activeView, record.fields, record.rows);
  }, [activeView, record]);

  // Convert rows to universal records
  const universalData = useMemo(() => {
    return record?.rows.map((row) => databaseRowToUniversalRecord(row, record.table));
  }, [record]);

  if (isLoading) return <LoadingState />;
  if (!viewConfig || !universalData) return <EmptyState />;

  return (
    <DatabaseShell header={<DatabaseHeader />} sidebar={<DatabaseSidebar />}>
      <ViewProvider
        data={universalData}
        config={viewConfig}
        storageKey={`database.${tableId}.view`}
        onStateChange={handleViewStateChange}
      >
        <DatabaseToolbarV2 />
        <ViewRenderer />
      </ViewProvider>
    </DatabaseShell>
  );
}

function DatabaseToolbarV2() {
  const { state, actions, config } = useViewContext();

  return (
    <UniversalToolbar
      views={availableViews}
      activeView={state.activeView}
      onViewChange={actions.setView}
      onFilter={actions.setFilters}
      onSort={actions.setSort}
      customActions={[
        { id: "export", label: "Export", icon: Download, onClick: handleExport },
        { id: "import", label: "Import", icon: Upload, onClick: handleImport },
      ]}
    />
  );
}
```

### 3. Feature Flag Implementation

```typescript
// lib/features/flags.ts

export const FEATURE_FLAGS = {
  USE_DATABASE_VIEW_SYSTEM: {
    key: "database.useViewSystem",
    defaultValue: false,
    description: "Use universal view-system for database feature",
    rolloutPercentage: 0, // Gradual rollout: 0% → 10% → 50% → 100%
  },
} as const;

// Usage in page.tsx
import { useFeatureFlag } from "@/lib/features/flags";

export default function DatabaseFeaturePage({ workspaceId }) {
  const useViewSystem = useFeatureFlag("USE_DATABASE_VIEW_SYSTEM");

  if (useViewSystem) {
    return <DatabasePageV2 workspaceId={workspaceId} />;
  }

  return <DatabasePage workspaceId={workspaceId} />;
}
```

### 4. Convex Schema Migration

```typescript
// convex/features/database/api/schema.ts

// Add to existing dbViews table
export const dbViews = defineTable({
  // ... existing fields ...

  // NEW: View-system configuration (optional during migration)
  viewSystemConfig: v.optional(v.object({
    type: v.string(),              // ViewType from view-system
    settings: v.any(),             // ViewSettings
    filters: v.array(v.any()),     // ViewFilter[]
    sorts: v.array(v.any()),       // ViewSort[]
  })),

  // NEW: Migration tracking
  migratedToViewSystem: v.optional(v.boolean()),
  migrationDate: v.optional(v.number()),
})
  .index("by_table", ["tableId"])
  .index("by_migrated", ["migratedToViewSystem"]);

// NEW: Universal records table (for cross-feature database capabilities)
export const universalRecords = defineTable({
  workspaceId: v.id("workspaces"),
  type: v.string(),                // "document" | "task" | "call" | "database_row"
  title: v.string(),
  description: v.optional(v.string()),

  // Properties (database fields)
  properties: v.object({}),        // Dynamic properties
  propertyDefinitions: v.array(v.object({
    id: v.string(),
    name: v.string(),
    type: v.string(),
    options: v.optional(v.any()),
    isRequired: v.boolean(),
    position: v.number(),
  })),

  // Views
  views: v.array(v.object({
    id: v.string(),
    name: v.string(),
    type: v.string(),
    settings: v.any(),
    isDefault: v.boolean(),
  })),

  // Relationships
  parentId: v.optional(v.id("universalRecords")),
  linkedRecordId: v.optional(v.union(
    v.id("documents"),
    v.id("dbRows"),
    v.id("messages"),
  )),

  // Audit
  createdById: v.id("users"),
  updatedById: v.id("users"),
  createdAt: v.number(),
  updatedAt: v.number(),

  // Permissions
  isPublic: v.boolean(),
})
  .index("by_workspace", ["workspaceId"])
  .index("by_type", ["workspaceId", "type"])
  .index("by_parent", ["parentId"]);
```

### 5. Migration Script

```typescript
// scripts/migrate-database-views.ts

/**
 * Migrates existing database views to view-system format
 */

import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const migrateDatabaseViews = mutation({
  args: { dryRun: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    const views = await ctx.db.query("dbViews").collect();
    const results = [];

    for (const view of views) {
      // Skip if already migrated
      if (view.migratedToViewSystem) {
        results.push({ id: view._id, status: "already_migrated" });
        continue;
      }

      // Convert to view-system format
      const viewSystemConfig = {
        type: mapViewType(view.type),
        settings: convertSettings(view.settings),
        filters: convertFilters(view.settings.filters),
        sorts: convertSorts(view.settings.sorts),
      };

      if (!args.dryRun) {
        await ctx.db.patch(view._id, {
          viewSystemConfig,
          migratedToViewSystem: true,
          migrationDate: Date.now(),
        });
      }

      results.push({
        id: view._id,
        status: args.dryRun ? "would_migrate" : "migrated",
        config: viewSystemConfig,
      });
    }

    return {
      total: views.length,
      migrated: results.filter((r) => r.status === "migrated").length,
      results,
    };
  },
});

function mapViewType(dbType: string): string {
  const mapping = {
    table: "table",
    board: "kanban",
    calendar: "calendar",
    list: "list",
    timeline: "gantt",
    gallery: "grid",
  };
  return mapping[dbType] || "table";
}

function convertSettings(oldSettings: any): any {
  return {
    selectable: true,
    density: "comfortable",
    showPagination: true,
    pageSize: 50,
    visibleFields: oldSettings.visibleFields || [],
    fieldWidths: oldSettings.fieldWidths || {},
  };
}
```

---

## Risk Assessment & Mitigation

### High Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **Data loss during migration** | 🔴 Critical | 🟡 Medium | • Dry-run migrations<br>• Full database backups<br>• Rollback plan<br>• Incremental migration |
| **Performance degradation** | 🟡 High | 🟡 Medium | • Benchmark before/after<br>• Optimize adapters with memoization<br>• Lazy load views<br>• Virtual scrolling |
| **Breaking changes for users** | 🟡 High | 🟢 Low | • Feature flags<br>• Parallel implementation<br>• Gradual rollout<br>• Beta testing |
| **Missing feature parity** | 🟡 High | 🟡 Medium | • Comprehensive testing<br>• Feature checklist<br>• User feedback loop |

### Medium Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **Complex adapter logic** | 🟡 Medium | 🟡 Medium | • Unit tests for adapters<br>• Clear documentation<br>• Type safety |
| **View-system bugs** | 🟡 Medium | 🟢 Low | • Thorough testing<br>• Error boundaries<br>• Fallback components |
| **Developer confusion** | 🟢 Low | 🟡 Medium | • Clear documentation<br>• Migration guide<br>• Code examples |

---

## Success Metrics

### Technical Metrics
- ✅ **Zero data loss:** All existing data migrates successfully
- ✅ **Performance:** New system performs ≥95% of old system speed
- ✅ **Feature parity:** 100% of old features work in new system
- ✅ **Test coverage:** ≥80% coverage for new code
- ✅ **Type safety:** Zero TypeScript errors

### User Metrics
- ✅ **Zero downtime:** Migration happens without service interruption
- ✅ **User satisfaction:** No increase in support tickets
- ✅ **Adoption:** 100% of users migrated within 2 weeks
- ✅ **Feedback:** Positive feedback from beta testers

### Business Metrics
- ✅ **Code reduction:** 30% reduction in database feature code
- ✅ **Reusability:** At least 2 other features adopt database views
- ✅ **Maintainability:** Easier to add new view types
- ✅ **Time to market:** New features ship 50% faster

---

## Rollback Plan

If critical issues arise, we can rollback safely:

### Phase 1-3 Rollback (Easy)
- Simply disable feature flag
- Zero database changes needed
- Instant rollback

### Phase 4+ Rollback (Moderate)
1. Re-enable old `DatabasePage.tsx` code
2. Feature flag back to old system
3. Database already has both old and new formats
4. Gradual rollback over 1-2 days

### Emergency Rollback (Critical)
1. Git revert to last stable commit
2. Database restore from backup (if needed)
3. Notify users of temporary rollback
4. Investigate issues, fix, re-deploy

---

## Timeline Summary

| Phase | Duration | Start | End | Status |
|-------|----------|-------|-----|--------|
| **Phase 1: Foundation** | 1 week | Week 1 | Week 1 | 🔜 Pending |
| **Phase 2: Parallel Implementation** | 1 week | Week 2 | Week 2 | 🔜 Pending |
| **Phase 3: Testing & Refinement** | 1 week | Week 3 | Week 3 | 🔜 Pending |
| **Phase 4: Migration & Rollout** | 1 week | Week 4 | Week 4 | 🔜 Pending |
| **Phase 5: Universal Rollout** | 2+ weeks | Week 5 | Week 6+ | 🔜 Pending |

**Total Estimated Time:** 5-6 weeks for complete migration

---

## Next Steps

### Immediate Actions (This Week)
1. ✅ Review this migration plan
2. ✅ Get stakeholder approval
3. ✅ Set up feature flag infrastructure
4. ✅ Create adapter prototypes

### Week 1 Tasks
1. Create universal schema types
2. Implement adapter functions
3. Register database views in view-system
4. Write unit tests for adapters

### Questions to Resolve
- [ ] Do we want to migrate documents feature in parallel?
- [ ] Should universal schema be required or optional?
- [ ] What's the rollout percentage schedule? (0% → 10% → 50% → 100%)
- [ ] Do we need A/B testing metrics?

---

## Appendix

### A. Related Documentation
- [View-System README](../frontend/shared/ui/layout/view-system/README.md)
- [Database Feature Config](../frontend/features/database/config.ts)
- [View-System Types](../frontend/shared/ui/layout/view-system/types.ts)
- [Database Schema](../convex/features/database/api/schema.ts)

### B. Similar Migrations
- Documents feature to view-system (pending)
- Calls feature to view-system (pending)

### C. Contact & Support
- **Technical Lead:** [TBD]
- **Product Owner:** [TBD]
- **Migration Team:** [TBD]

---

**Document Version:** 1.0.0
**Last Updated:** 2025-11-02
**Status:** Draft - Awaiting Approval
