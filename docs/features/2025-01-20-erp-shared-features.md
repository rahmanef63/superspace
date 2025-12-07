# ERP Shared Features Technical Specification

## Overview

This document defines the shared features and utilities that will be used across all ERP modules in the SuperSpace system. These shared components ensure consistency, reduce code duplication, and provide a unified experience across the entire ERP suite.

## Architecture

All shared features are located in `convex/shared/` to maintain zero hardcoding and enable dynamic resolution across modules.

## 1. Advanced Search & Filters (shared-search)

### 1.1 Purpose
Provide a powerful, unified search and filtering system that works across all ERP modules.

### 1.2 Features
- Full-text search across entities
- Saved search configurations
- Advanced filter builder
- Search result ranking
- Search analytics
- Auto-suggestions
- Search history

### 1.3 Implementation

```typescript
// convex/shared/search/index.ts
import { v } from "convex/values"
import { query, mutation } from "./_generated/server"
import { getViewerId } from "./auth"

export const searchEntities = query({
  args: {
    query: v.string(),
    entities: v.array(v.string()),
    filters: v.optional(v.array(v.any())),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const viewerId = await getViewerId(ctx)

    // Search across specified entities
    const results = await Promise.all(
      args.entities.map(entity => {
        return ctx.db
          .query(entity)
          .withSearchIndex("search_text", q =>
            q.search("searchText", args.query)
          )
          .take(args.limit || 50)
      })
    )

    // Rank and merge results
    return rankResults(results, args.query)
  },
})

export const saveSearch = mutation({
  args: {
    name: v.string(),
    query: v.string(),
    filters: v.array(v.any()),
    entities: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const viewerId = await getViewerId(ctx)

    return ctx.db.insert("savedSearches", {
      ...args,
      userId: viewerId,
      createdAt: Date.now(),
    })
  },
})
```

### 1.4 Usage in Modules

```typescript
// In any module
import { api } from "@/convex/_generated/api"
import { useQuery } from "convex/react"

function CustomerSearch() {
  const { data, isLoading } = useQuery(api.shared.search.searchEntities, {
    query: "John Doe",
    entities: ["customers", "contacts", "leads"],
    filters: [
      { field: "status", operator: "equals", value: "active" }
    ],
    limit: 20,
  })

  return <SearchResults data={data} />
}
```

## 2. Bulk Operations (shared-bulk)

### 2.1 Purpose
Enable efficient bulk operations across all ERP modules with consistent behavior and permissions checking.

### 2.2 Features
- Bulk create, update, delete
- Operation progress tracking
- Rollback capabilities
- Validation before execution
- Operation logging
- Permission checking

### 2.3 Implementation

```typescript
// convex/shared/bulk/operations.ts
import { v } from "convex/values"
import { mutation } from "./_generated/server"
import { requirePermission } from "./permissions"

export const bulkUpdate = mutation({
  args: {
    entity: v.string(),
    ids: v.array(v.id("users")), // Generic ID
    updates: v.array(v.any()),
    validateOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Check permission for bulk operation
    await requirePermission(ctx, args.workspaceId, `${args.entity}.bulk_update`)

    if (args.validateOnly) {
      // Validate all updates
      const validationResults = await Promise.all(
        args.ids.map(async (id, index) => {
          const entity = await ctx.db.get(id)
          if (!entity) return { id, valid: false, error: "Not found" }

          return validateUpdate(entity, args.updates[index])
        })
      )

      return { validated: true, results: validationResults }
    }

    // Execute updates in a transaction
    const results = []
    for (let i = 0; i < args.ids.length; i++) {
      const result = await ctx.db.patch(args.ids[i], args.updates[i])
      results.push(result)

      // Log the operation
      await logAuditEvent(ctx, {
        action: "bulk_update",
        entityType: args.entity,
        entityId: args.ids[i],
        changes: args.updates[i],
      })
    }

    return { success: true, results }
  },
})

export const bulkDelete = mutation({
  args: {
    entity: v.string(),
    ids: v.array(v.id("users")),
    softDelete: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, `${args.entity}.bulk_delete`)

    const results = []
    for (const id of args.ids) {
      if (args.softDelete) {
        await ctx.db.patch(id, { deletedAt: Date.now(), status: "deleted" })
      } else {
        await ctx.db.delete(id)
      }

      results.push({ id, deleted: true })

      await logAuditEvent(ctx, {
        action: "bulk_delete",
        entityType: args.entity,
        entityId: id,
      })
    }

    return { success: true, results }
  },
})
```

## 3. Import/Export (shared-data-transfer)

### 3.1 Purpose
Provide standardized import/export functionality for all ERP modules with support for multiple formats.

### 3.2 Features
- CSV, Excel, JSON import/export
- Template generation
- Field mapping
- Validation rules
- Progress tracking
- Error handling

### 3.3 Implementation

```typescript
// convex/shared/dataTransfer/exports.ts
import { v } from "convex/values"
import { query, mutation } from "./_generated/server"
import { requirePermission } from "./permissions"

export const exportData = mutation({
  args: {
    entity: v.string(),
    fields: v.array(v.string()),
    filters: v.optional(v.array(v.any())),
    format: v.union(v.literal("csv"), v.literal("excel"), v.literal("json")),
    options: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, `${args.entity}.export`)

    // Fetch data
    const data = await ctx.db
      .query(args.entity)
      .filter(q => {
        if (!args.filters) return true
        // Apply filters
        return applyFilters(q, args.filters)
      })
      .collect()

    // Transform data based on fields
    const transformed = data.map(item => {
      const result = {}
      args.fields.forEach(field => {
        result[field] = getNestedValue(item, field)
      })
      return result
    })

    // Generate export file
    const exportId = await ctx.db.insert("exports", {
      entityId: null, // Will be set by caller
      entity: args.entity,
      format: args.format,
      status: "processing",
      createdBy: await getViewerId(ctx),
      createdAt: Date.now(),
    })

    // Process in background
    await processExport(ctx, exportId, transformed, args)

    return exportId
  },
})

export const importData = mutation({
  args: {
    entity: v.string(),
    fileId: v.id("_storage"),
    mapping: v.array(v.any()),
    options: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, `${args.entity}.import`)

    // Get import file
    const file = await ctx.storage.get(args.fileId)
    if (!file) throw new Error("File not found")

    // Parse file based on type
    const data = await parseImportFile(file, args.options?.format)

    // Validate and transform data
    const validated = await validateImportData(ctx, data, args.mapping)

    // Create import job
    const importId = await ctx.db.insert("imports", {
      entityId: null,
      entity: args.entity,
      totalRecords: validated.length,
      status: "processing",
      mapping: args.mapping,
      createdBy: await getViewerId(ctx),
      createdAt: Date.now(),
    })

    // Process import
    await processImport(ctx, importId, validated, args.entity)

    return importId
  },
})
```

## 4. Custom Fields (shared-custom-fields)

### 4.1 Purpose
Allow modules to define custom fields dynamically without hardcoding schemas.

### 4.2 Features
- Dynamic field definition
- Field types (text, number, date, select, etc.)
- Validation rules
- Field groups
- Field permissions
- Field usage tracking

### 4.3 Implementation

```typescript
// convex/shared/customFields/definition.ts
import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

export const defineCustomFields = mutation({
  args: {
    entity: v.string(),
    fields: v.array(v.object({
      id: v.string(),
      name: v.string(),
      type: v.string(),
      required: v.optional(v.boolean()),
      defaultValue: v.optional(v.any()),
      options: v.optional(v.array(v.string())),
      validation: v.optional(v.any()),
      permissions: v.optional(v.array(v.string())),
    })),
  },
  handler: async (ctx, args) => {
    const viewerId = await getViewerId(ctx)

    // Save field definitions
    for (const field of args.fields) {
      await ctx.db.insert("customFieldDefinitions", {
        entity: args.entity,
        ...field,
        createdBy: viewerId,
        createdAt: Date.now(),
      })
    }

    return { success: true }
  },
})

export const getCustomFields = query({
  args: {
    entity: v.string(),
    context: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    return ctx.db
      .query("customFieldDefinitions")
      .withIndex("by_entity", q => q.eq("entity", args.entity))
      .collect()
  },
})
```

## 5. Automation Rules (shared-automation)

### 5.1 Purpose
Provide a flexible automation engine that can trigger actions based on events across modules.

### 5.2 Features
- Rule-based triggers
- Event sources
- Action execution
- Condition evaluation
- Rule chaining
- Audit logging

### 5.3 Implementation

```typescript
// convex/shared/automation/engine.ts
import { v } from "convex/values"
import { mutation, action } from "./_generated/server"
import { internal } from "./_generated/api"

export const createRule = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    trigger: v.any(),
    conditions: v.array(v.any()),
    actions: v.array(v.any()),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const viewerId = await getViewerId(ctx)

    return ctx.db.insert("automationRules", {
      ...args,
      createdBy: viewerId,
      createdAt: Date.now(),
    })
  },
})

export const executeRule = action({
  args: {
    ruleId: v.id("automationRules"),
    triggerData: v.any(),
  },
  handler: async (ctx, args) => {
    const rule = await ctx.runQuery(
      internal.shared.automation.getRule,
      { ruleId: args.ruleId }
    )

    if (!rule || !rule.isActive) return

    // Evaluate conditions
    const conditionsMet = await evaluateConditions(
      rule.conditions,
      args.triggerData
    )

    if (conditionsMet) {
      // Execute actions
      for (const action of rule.actions) {
        await executeAction(ctx, action, args.triggerData)
      }

      // Log execution
      await ctx.runMutation(
        internal.shared.automation.logExecution,
        {
          ruleId: rule._id,
          triggerData: args.triggerData,
          success: true,
        }
      )
    }
  },
})
```

## 6. Mobile Responsiveness (shared-mobile)

### 6.1 Purpose
Provide mobile-optimized components and utilities for all ERP modules.

### 6.2 Features
- Mobile detection
- Touch gestures
- Offline support
- Push notifications
- Mobile layouts

### 6.3 Implementation

```typescript
// frontend/shared/foundation/mobile/index.ts
import { useEffect, useState } from 'react'
import { Capacitor } from '@capacitor/core'

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(
        Capacitor.isNativePlatform() ||
        window.innerWidth < 768 ||
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        )
      )
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return isMobile
}

export function useOfflineMode() {
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    const handleOffline = () => setIsOffline(true)
    const handleOnline = () => setIsOffline(false)

    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)

    return () => {
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
    }
  }, [])

  return { isOffline }
}
```

## 7. Version History (shared-versioning)

### 7.1 Purpose
Track version history for all entities across ERP modules.

### 7.2 Features
- Automatic version tracking
- Change logging
- Diff generation
- Rollback capability
- Version comparison

### 7.3 Implementation

```typescript
// convex/shared/versioning/tracker.ts
import { v } from "convex/values"
import { mutation } from "./_generated/server"

export const trackVersion = mutation({
  args: {
    entityType: v.string(),
    entityId: v.id("users"), // Generic ID
    changes: v.array(v.any()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const current = await ctx.db.get(args.entityId)
    if (!current) throw new Error("Entity not found")

    // Create version snapshot
    const versionId = await ctx.db.insert("entityVersions", {
      entityType: args.entityType,
      entityId: args.entityId,
      versionNumber: (current.version || 0) + 1,
      data: current,
      changes: args.changes,
      metadata: args.metadata,
      createdBy: await getViewerId(ctx),
      createdAt: Date.now(),
    })

    // Update entity with version number
    await ctx.db.patch(args.entityId, {
      version: (current.version || 0) + 1,
      updatedAt: Date.now(),
    })

    return versionId
  },
})

export const getVersionHistory = query({
  args: {
    entityType: v.string(),
    entityId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return ctx.db
      .query("entityVersions")
      .withIndex("by_entity", q =>
        q
          .eq("entityType", args.entityType)
          .eq("entityId", args.entityId)
      )
      .order("desc")
      .take(args.limit || 10)
  },
})
```

## 8. Comments & Notes (shared-comments)

### 8.1 Purpose
Provide a unified commenting and notes system for all ERP entities.

### 8.2 Features
- Threaded comments
- @mentions
- Rich text editing
- Attachments
- Comment permissions
- Activity feeds

### 8.3 Implementation

```typescript
// convex/shared/comments/index.ts
import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

export const addComment = mutation({
  args: {
    entityType: v.string(),
    entityId: v.id("users"),
    content: v.string(),
    parentCommentId: v.optional(v.id("comments")),
    mentions: v.optional(v.array(v.string())),
    attachments: v.optional(v.array(v.id("_storage"))),
  },
  handler: async (ctx, args) => {
    const viewerId = await getViewerId(ctx)

    const commentId = await ctx.db.insert("comments", {
      ...args,
      authorId: viewerId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    })

    // Create notifications for mentions
    if (args.mentions) {
      for (const mentionId of args.mentions) {
        await ctx.db.insert("notifications", {
          userId: mentionId,
          type: "mention",
          commentId,
          createdAt: Date.now(),
        })
      }
    }

    // Update entity activity
    await updateEntityActivity(ctx, args.entityType, args.entityId, {
      type: "comment_added",
      commentId,
      userId: viewerId,
    })

    return commentId
  },
})
```

## 9. File Attachments (shared-attachments)

### 9.1 Purpose
Unified file management system for all ERP modules.

### 9.2 Features
- File upload/download
- Version control
- Preview generation
- Storage optimization
- Security scanning
- File permissions

### 9.3 Implementation

```typescript
// convex/shared/attachments/index.ts
import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

export const uploadAttachment = mutation({
  args: {
    entityType: v.string(),
    entityId: v.id("users"),
    file: v.id("_storage"),
    name: v.string(),
    type: v.string(),
    size: v.number(),
    category: v.optional(v.string()),
    permissions: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const viewerId = await getViewerId(ctx)

    const attachmentId = await ctx.db.insert("attachments", {
      ...args,
      uploadedBy: viewerId,
      uploadedAt: Date.now(),
      version: 1,
    })

    // Generate preview if applicable
    if (isImageOrPdf(args.type)) {
      await generatePreview(ctx, attachmentId, args.file)
    }

    // Update entity attachment count
    await updateAttachmentCount(ctx, args.entityType, args.entityId, 1)

    return attachmentId
  },
})
```

## 10. Activity Feeds (shared-activity)

### 10.1 Purpose
Track and display activity feeds for all entities across ERP modules.

### 10.2 Features
- Real-time activity tracking
- Filterable feeds
- Activity types
- Entity aggregation
- Privacy controls
- Activity analytics

### 10.3 Implementation

```typescript
// convex/shared/activity/feed.ts
import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

export const trackActivity = mutation({
  args: {
    entityType: v.string(),
    entityId: v.id("users"),
    type: v.string(),
    actorId: v.id("users"),
    data: v.optional(v.any()),
    visibility: v.union(
      v.literal("public"),
      v.literal("team"),
      v.literal("private")
    ),
  },
  handler: async (ctx, args) => {
    const activityId = await ctx.db.insert("activities", {
      ...args,
      timestamp: Date.now(),
    })

    // Update entity's last activity
    await ctx.db.patch(args.entityId, {
      lastActivityAt: Date.now(),
      lastActivityType: args.type,
    })

    // Trigger real-time updates
    await ctx.scheduler.runAfter(0, internal.shared.notifications.broadcastActivity, {
      activityId,
    })

    return activityId
  },
})
```

## 11. Favorites/Bookmarks (shared-favorites)

### 11.1 Purpose
Allow users to bookmark entities across all ERP modules for quick access.

### 11.2 Features
- Entity bookmarking
- Folder organization
- Quick access panel
- Sharing bookmarks
- Bookmark analytics

### 11.3 Implementation

```typescript
// convex/shared/favorites/index.ts
import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

export const toggleFavorite = mutation({
  args: {
    entityType: v.string(),
    entityId: v.id("users"),
    folderId: v.optional(v.id("favoriteFolders")),
  },
  handler: async (ctx, args) => {
    const viewerId = await getViewerId(ctx)

    // Check if already favorited
    const existing = await ctx.db
      .query("favorites")
      .withIndex("by_user_entity", q =>
        q
          .eq("userId", viewerId)
          .eq("entityType", args.entityType)
          .eq("entityId", args.entityId)
      )
      .first()

    if (existing) {
      // Remove favorite
      await ctx.db.delete(existing._id)
      return { favorited: false }
    } else {
      // Add favorite
      await ctx.db.insert("favorites", {
        userId: viewerId,
        entityType: args.entityType,
        entityId: args.entityId,
        folderId: args.folderId,
        createdAt: Date.now(),
      })
      return { favorited: true }
    }
  },
})
```

## 12. Print Templates (shared-printing)

### 12.1 Purpose
Provide standardized printing templates for documents across ERP modules.

### 12.2 Features
- Template management
- Dynamic data binding
- Multiple layouts
- PDF generation
- Batch printing
- Print history

### 12.3 Implementation

```typescript
// convex/shared/printing/templates.ts
import { v } from "convex/values"
import { mutation, query } from "./_generated/server"

export const createTemplate = mutation({
  args: {
    name: v.string(),
    entityType: v.string(),
    layout: v.string(), // HTML template
    css: v.optional(v.string()),
    variables: v.array(v.object({
      name: v.string(),
      type: v.string(),
      source: v.string(),
    })),
    isDefault: v.boolean(),
  },
  handler: async (ctx, args) => {
    const viewerId = await getViewerId(ctx)

    // If setting as default, unset previous default
    if (args.isDefault) {
      const existing = await ctx.db
        .query("printTemplates")
        .withIndex("by_entity_default", q =>
          q.eq("entityType", args.entityType).eq("isDefault", true)
        )
        .first()

      if (existing) {
        await ctx.db.patch(existing._id, { isDefault: false })
      }
    }

    return ctx.db.insert("printTemplates", {
      ...args,
      createdBy: viewerId,
      createdAt: Date.now(),
    })
  },
})
```

## Usage Guidelines

### 1. Import Shared Features

```typescript
// In any module
import { api } from "@/convex/_generated/api"
import { useQuery, useMutation } from "convex/react"

// Use shared search
const search = useQuery(api.shared.search.searchEntities, { ... })

// Use bulk operations
const bulkUpdate = useMutation(api.shared.bulk.bulkUpdate)

// Use custom fields
const customFields = useQuery(api.shared.customFields.getCustomFields, {
  entity: "customers"
})
```

### 2. Extend Shared Features

Modules can extend shared features by:

1. Adding module-specific field definitions
2. Implementing custom validation rules
3. Adding module-specific actions
4. Creating specialized UI components

### 3. Performance Considerations

- Use shared features efficiently
- Implement proper caching
- Batch operations when possible
- Monitor shared feature usage

## Benefits

1. **Consistency**: Unified behavior across modules
2. **Maintainability**: Single source of truth
3. **Scalability**: Reusable components
4. **Flexibility**: Configurable features
5. **Zero Hardcoding**: Dynamic configuration

## Migration Path

Existing modules can gradually adopt shared features:

1. Identify duplications
2. Map to shared features
3. Refactor implementations
4. Test thoroughly
5. Deploy incrementally

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-01-20 | ERP Team | Initial specification |

## Sign-off

- [ ] Technical Lead
- [ ] Architecture Lead
- [ ] ERP Development Team