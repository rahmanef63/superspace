import { query, mutation } from "../../_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
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
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

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
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

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
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

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
