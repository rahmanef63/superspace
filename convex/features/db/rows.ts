import { query, mutation } from "../../_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { assertWorkspaceAccess, hasWorkspaceAccess, nextOrderValue } from "./utils";

interface ViewSettings {
  filters?: Array<{
    fieldId: string;
    operator: "equals" | "contains" | "isEmpty" | "isNotEmpty";
    value?: unknown;
  }>;
  sorts?: Array<{
    fieldId: string;
    direction: "asc" | "desc";
  }>;
}

export const list = query({
  args: {
    tableId: v.id("dbTables"),
    viewId: v.optional(v.id("dbViews")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const table = await ctx.db.get(args.tableId);
    if (!table) {
      return [];
    }

    const allowed = await hasWorkspaceAccess(ctx, table.workspaceId, userId);
    if (!allowed) {
      return [];
    }

    let rows = await ctx.db
      .query("dbRows")
      .withIndex("by_table", (q) => q.eq("tableId", args.tableId))
      .collect();

    if (args.viewId) {
      const view = await ctx.db.get(args.viewId);
      const settings = (view?.settings as ViewSettings | undefined) ?? {};

      const filters = settings.filters ?? [];
      const sorts = settings.sorts ?? [];

      for (const filter of filters) {
        rows = rows.filter((row) => {
          const value = row.data?.[filter.fieldId];
          switch (filter.operator) {
            case "equals":
              return value === filter.value;
            case "contains":
              return typeof value === "string" && typeof filter.value === "string"
                ? value.toLowerCase().includes(filter.value.toLowerCase())
                : false;
            case "isEmpty":
              return value === undefined || value === null || value === "";
            case "isNotEmpty":
              return value !== undefined && value !== null && value !== "";
            default:
              return true;
          }
        });
      }

      if (sorts.length > 0) {
        rows.sort((a, b) => {
          for (const sort of sorts) {
            const aVal = a.data?.[sort.fieldId];
            const bVal = b.data?.[sort.fieldId];

            if (aVal === bVal) {
              continue;
            }

            const comparison = aVal === undefined || aVal === null
              ? -1
              : bVal === undefined || bVal === null
              ? 1
              : aVal < bVal
              ? -1
              : 1;

            return sort.direction === "desc" ? -comparison : comparison;
          }
          return 0;
        });
      }
    }

    return rows.sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  },
});

export const get = query({
  args: { id: v.id("dbRows") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const row = await ctx.db.get(args.id);
    if (!row) {
      return null;
    }

    const allowed = await hasWorkspaceAccess(ctx, row.workspaceId, userId);
    if (!allowed) {
      return null;
    }

    return row;
  },
});

export const create = mutation({
  args: {
    tableId: v.id("dbTables"),
    data: v.record(v.string(), v.any()),
    docId: v.optional(v.id("documents")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const table = await ctx.db.get(args.tableId);
    if (!table) {
      throw new Error("Table not found");
    }

    await assertWorkspaceAccess(ctx, table.workspaceId, userId);

    const existingRows = await ctx.db
      .query("dbRows")
      .withIndex("by_table", (q) => q.eq("tableId", args.tableId))
      .collect();

    const nextPosition = nextOrderValue(existingRows);

    return ctx.db.insert("dbRows", {
      tableId: args.tableId,
      workspaceId: table.workspaceId,
      docId: args.docId,
      data: args.data,
      createdById: userId,
      updatedById: userId,
      position: nextPosition,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("dbRows"),
    data: v.record(v.string(), v.any()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const row = await ctx.db.get(args.id);
    if (!row) {
      throw new Error("Row not found");
    }

    await assertWorkspaceAccess(ctx, row.workspaceId, userId);

    await ctx.db.patch(args.id, {
      data: { ...row.data, ...args.data },
      updatedById: userId,
    });
  },
});

export const deleteRow = mutation({
  args: { id: v.id("dbRows") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const row = await ctx.db.get(args.id);
    if (!row) {
      throw new Error("Row not found");
    }

    await assertWorkspaceAccess(ctx, row.workspaceId, userId);

    if (row.docId) {
      // Swallow missing docs gracefully.
      const doc = await ctx.db.get(row.docId);
      if (doc) {
        await ctx.db.delete(row.docId);
      }
    }

    await ctx.db.delete(args.id);
  },
});
