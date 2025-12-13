import { defineTable } from "convex/server";
import { v } from "convex/values";

export const dbTables = defineTable({
  workspaceId: v.id("workspaces"),
  name: v.string(),
  description: v.optional(v.string()),
  icon: v.optional(v.string()),
  coverUrl: v.optional(v.string()),
  isPublic: v.optional(v.boolean()),
  // Feature type for feature-specific databases (calendar, crm, tasks, etc.)
  featureType: v.optional(v.union(
    v.literal("calendar"),
    v.literal("crm"),
    v.literal("tasks"),
    v.literal("projects"),
    v.literal("inventory"),
  )),
  createdById: v.id("users"),
  updatedById: v.id("users"),
  isTemplate: v.boolean(),
  settings: v.object({
    showProperties: v.boolean(),
    wrapCells: v.boolean(),
    showCalculations: v.boolean(),
  }),
  createdAt: v.optional(v.number()),
  updatedAt: v.optional(v.number()),
})
  .index("by_workspace", ["workspaceId"])
  .index("by_feature", ["workspaceId", "featureType"]);

export const dbFields = defineTable({
  tableId: v.id("dbTables"),
  name: v.string(),
  type: v.union(
    v.literal("text"),
    v.literal("number"),
    v.literal("select"),
    v.literal("multiSelect"),
    v.literal("date"),
    v.literal("person"),
    v.literal("files"),
    v.literal("checkbox"),
    v.literal("url"),
    v.literal("email"),
    v.literal("phone"),
    v.literal("formula"),
    v.literal("relation"),
    v.literal("rollup"),
  ),
  options: v.optional(
    v.object({
      selectOptions: v.optional(
        v.array(
          v.object({
            id: v.string(),
            name: v.string(),
            color: v.string(),
          }),
        ),
      ),
      dateFormat: v.optional(v.string()),
      numberFormat: v.optional(v.string()),
      formula: v.optional(v.string()),
    }),
  ),
  isRequired: v.boolean(),
  isPrimary: v.optional(v.boolean()),
  position: v.number(),
  createdAt: v.optional(v.number()),
  updatedAt: v.optional(v.number()),
}).index("by_table", ["tableId"]);

export const dbViews = defineTable({
  tableId: v.id("dbTables"),
  name: v.string(),
  type: v.union(
    v.literal("table"),
    v.literal("board"),
    v.literal("calendar"),
    v.literal("gallery"),
    v.literal("list"),
    v.literal("timeline"),
  ),
  settings: v.object({
    filters: v.array(
      v.object({
        fieldId: v.string(),
        operator: v.union(
          v.literal("equals"),
          v.literal("contains"),
          v.literal("isEmpty"),
          v.literal("isNotEmpty"),
        ),
        value: v.optional(v.any()),
      }),
    ),
    sorts: v.array(
      v.object({
        fieldId: v.string(),
        direction: v.union(v.literal("asc"), v.literal("desc")),
      }),
    ),
    visibleFields: v.array(v.id("dbFields")),
    fieldWidths: v.optional(v.record(v.string(), v.number())),
  }),
  createdById: v.id("users"),
  isDefault: v.boolean(),
  position: v.optional(v.number()),
  createdAt: v.optional(v.number()),
  updatedAt: v.optional(v.number()),
}).index("by_table", ["tableId"]);

export const dbRows = defineTable({
  tableId: v.id("dbTables"),
  workspaceId: v.id("workspaces"),
  data: v.record(v.string(), v.any()),
  computed: v.optional(v.record(v.string(), v.any())),
  docId: v.optional(v.id("documents")),
  createdById: v.id("users"),
  updatedById: v.id("users"),
  position: v.number(),
  createdAt: v.optional(v.number()),
  updatedAt: v.optional(v.number()),
})
  .index("by_table", ["tableId"])
  .index("by_doc", ["docId"]);

/**
 * Universal Database Table (v2.0)
 * Stores databases using the Universal Database specification
 * @see docs/UNIVERSAL_DATABASE_SPEC.md
 */
export const universalDatabases = defineTable({
  workspaceId: v.id("workspaces"),
  name: v.string(),

  // Complete Universal Database spec as JSON
  universalSpec: v.any(),

  // Version tracking
  version: v.string(),

  // Audit fields
  createdById: v.id("users"),
  updatedById: v.id("users"),
  createdAt: v.number(),
  updatedAt: v.number(),
})
  .index("by_workspace", ["workspaceId"])
  .index("by_workspace_name", ["workspaceId", "name"]);

export const databaseTables = {
  dbTables,
  dbFields,
  dbViews,
  dbRows,
  universalDatabases,
};

export type DatabaseTables = typeof databaseTables;
