import { query, mutation } from "../../_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { ensureUser } from "../../auth/helpers";
import type { Id } from "../../_generated/dataModel";
import { assertWorkspaceAccess, hasWorkspaceAccess } from "./utils";

export const list = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const allowed = await hasWorkspaceAccess(ctx, args.workspaceId, userId);
    if (!allowed) {
      return [];
    }

    return ctx.db
      .query("dbTables")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .order("desc")
      .collect();
  },
});

export const get = query({
  args: { id: v.id("dbTables") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const table = await ctx.db.get(args.id);
    if (!table) {
      return null;
    }

    const allowed = await hasWorkspaceAccess(ctx, table.workspaceId, userId);
    if (!allowed) {
      return null;
    }

    return table;
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    workspaceId: v.id("workspaces"),
    icon: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);

    await assertWorkspaceAccess(ctx, args.workspaceId, userId);

    const tableId = await ctx.db.insert("dbTables", {
      name: args.name,
      description: args.description,
      icon: args.icon,
      workspaceId: args.workspaceId,
      createdById: userId,
      updatedById: userId,
      isTemplate: false,
      settings: {
        showProperties: true,
        wrapCells: false,
        showCalculations: false,
      },
    });

    await ctx.db.insert("dbFields", {
      name: "Name",
      type: "text",
      tableId,
      isRequired: true,
      position: 0,
    });

    const defaultFields = await ctx.db
      .query("dbFields")
      .withIndex("by_table", (q) => q.eq("tableId", tableId))
      .collect();

    await ctx.db.insert("dbViews", {
      name: "All",
      type: "table",
      tableId,
      createdById: userId,
      isDefault: true,
      settings: {
        filters: [],
        sorts: [],
        visibleFields: defaultFields.map((f) => f._id),
        fieldWidths: {},
      },
    });

    return tableId;
  },
});

export const update = mutation({
  args: {
    id: v.id("dbTables"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
    settings: v.optional(
      v.object({
        showProperties: v.boolean(),
        wrapCells: v.boolean(),
        showCalculations: v.boolean(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);

    const table = await ctx.db.get(args.id);
    if (!table) {
      throw new Error("Table not found");
    }

    await assertWorkspaceAccess(ctx, table.workspaceId, userId);

    const updates: Record<string, unknown> = { updatedById: userId };
    if (args.name !== undefined) updates.name = args.name;
    if (args.description !== undefined) updates.description = args.description;
    if (args.icon !== undefined) updates.icon = args.icon;
    if (args.settings !== undefined) updates.settings = args.settings;

    await ctx.db.patch(args.id, updates);
  },
});

export const deleteTable = mutation({
  args: { id: v.id("dbTables") },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);

    const table = await ctx.db.get(args.id);
    if (!table) {
      throw new Error("Table not found");
    }

    await assertWorkspaceAccess(ctx, table.workspaceId, userId);

    const fields = await ctx.db
      .query("dbFields")
      .withIndex("by_table", (q) => q.eq("tableId", args.id))
      .collect();

    const views = await ctx.db
      .query("dbViews")
      .withIndex("by_table", (q) => q.eq("tableId", args.id))
      .collect();

    const rows = await ctx.db
      .query("dbRows")
      .withIndex("by_table", (q) => q.eq("tableId", args.id))
      .collect();

    for (const row of rows) {
      if (row.docId) {
        const doc = await ctx.db.get(row.docId);
        if (doc) {
          await ctx.db.delete(row.docId);
        }
      }
      await ctx.db.delete(row._id);
    }

    for (const view of views) {
      await ctx.db.delete(view._id);
    }

    for (const field of fields) {
      await ctx.db.delete(field._id);
    }

    await ctx.db.delete(args.id);
  },
});

export const duplicate = mutation({
  args: {
    id: v.id("dbTables"),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);

    const table = await ctx.db.get(args.id);
    if (!table) {
      throw new Error("Table not found");
    }

    await assertWorkspaceAccess(ctx, table.workspaceId, userId);

    const fields = await ctx.db
      .query("dbFields")
      .withIndex("by_table", (q) => q.eq("tableId", args.id))
      .order("asc")
      .collect();

    const views = await ctx.db
      .query("dbViews")
      .withIndex("by_table", (q) => q.eq("tableId", args.id))
      .order("asc")
      .collect();

    const rows = await ctx.db
      .query("dbRows")
      .withIndex("by_table", (q) => q.eq("tableId", args.id))
      .order("asc")
      .collect();

    const baseName = args.name?.trim() || table.name || "Untitled database";
    const copyName = baseName.endsWith(" copy") || baseName.endsWith(" Copy")
      ? baseName
      : `${baseName} copy`;

    const now = Date.now();

    const newTableId = await ctx.db.insert("dbTables", {
      workspaceId: table.workspaceId,
      name: copyName,
      description: table.description,
      icon: table.icon,
      coverUrl: table.coverUrl,
      isPublic: table.isPublic,
      createdById: userId,
      updatedById: userId,
      isTemplate: table.isTemplate ?? false,
      settings: table.settings,
      createdAt: now,
      updatedAt: now,
    });

    const fieldIdMap = new Map<string, Id<"dbFields">>();

    for (const field of fields) {
      const newFieldId = await ctx.db.insert("dbFields", {
        tableId: newTableId,
        name: field.name,
        type: field.type,
        options: field.options,
        isRequired: field.isRequired,
        isPrimary: field.isPrimary,
        position: field.position,
        createdAt: now,
        updatedAt: now,
      });

      fieldIdMap.set(String(field._id), newFieldId);
    }

    const remapFieldId = (fieldId: string | null | undefined): string | null => {
      if (!fieldId) return null;
      const mapped = fieldIdMap.get(fieldId);
      return mapped ? String(mapped) : null;
    };

    const remapRecordKeys = <T>(record: Record<string, T> | undefined | null) => {
      if (!record) return undefined;
      const next: Record<string, T> = {};
      Object.entries(record).forEach(([key, value]) => {
        const mapped = remapFieldId(key);
        if (mapped) {
          next[mapped] = value;
        }
      });
      return next;
    };

    for (const view of views) {
      const remappedFilters = view.settings.filters.map((filter) => ({
        ...filter,
        fieldId: remapFieldId(filter.fieldId) ?? filter.fieldId,
      }));

      const remappedSorts = view.settings.sorts.map((sort) => ({
        ...sort,
        fieldId: remapFieldId(sort.fieldId) ?? sort.fieldId,
      }));

      const remappedVisibleFields = view.settings.visibleFields
        .map((fieldId) => {
          const mapped = fieldIdMap.get(String(fieldId));
          return mapped ?? null;
        })
        .filter((value): value is Id<"dbFields"> => value !== null);

      const remappedFieldWidths = remapRecordKeys(view.settings.fieldWidths);

      await ctx.db.insert("dbViews", {
        tableId: newTableId,
        name: view.name,
        type: view.type,
        settings: {
          filters: remappedFilters,
          sorts: remappedSorts,
          visibleFields: remappedVisibleFields,
          fieldWidths: remappedFieldWidths,
        },
        createdById: userId,
        isDefault: view.isDefault ?? false,
        position: view.position,
        createdAt: now,
        updatedAt: now,
      });
    }

    const remapDataObject = (data: Record<string, unknown> | undefined | null) => {
      if (!data) return {};
      const next: Record<string, unknown> = {};
      Object.entries(data).forEach(([key, value]) => {
        const mapped = remapFieldId(key);
        if (mapped) {
          next[mapped] = value;
        }
      });
      return next;
    };

    let fallbackPosition = 0;
    for (const row of rows) {
      const position =
        typeof row.position === "number" ? row.position : fallbackPosition++;

      await ctx.db.insert("dbRows", {
        tableId: newTableId,
        workspaceId: table.workspaceId,
        data: remapDataObject(row.data),
        computed: remapDataObject(row.computed),
        docId: undefined,
        createdById: userId,
        updatedById: userId,
        position,
        createdAt: now,
        updatedAt: now,
      });
    }

    // Ensure at least one view exists on duplicate
    const existingViews = await ctx.db
      .query("dbViews")
      .withIndex("by_table", (q) => q.eq("tableId", newTableId))
      .collect();

    if (existingViews.length === 0) {
      await ctx.db.insert("dbViews", {
        tableId: newTableId,
        name: "All",
        type: "table",
        createdById: userId,
        isDefault: true,
        position: 0,
        settings: {
          filters: [],
          sorts: [],
          visibleFields: Array.from(fieldIdMap.values()),
          fieldWidths: {},
        },
        createdAt: now,
        updatedAt: now,
      });
    } else {
      const firstView = existingViews[0];
      if (!existingViews.some((view) => view.isDefault)) {
        await ctx.db.patch(firstView._id, { isDefault: true });
      }
    }

    return newTableId;
  },
});
