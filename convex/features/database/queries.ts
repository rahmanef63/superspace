import { query } from "../../_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { Doc, Id } from "../../_generated/dataModel";
import { assertWorkspaceAccess, hasWorkspaceAccess } from "./utils";

const sortByPosition = <T extends { position?: number }>(a: T, b: T) =>
  (a.position ?? 0) - (b.position ?? 0);

const sortByUpdated = <T extends { updatedAt?: number; createdAt?: number; _creationTime?: number }>(
  a: T,
  b: T,
) => {
  const aTime = a.updatedAt ?? a.createdAt ?? a._creationTime ?? 0;
  const bTime = b.updatedAt ?? b.createdAt ?? b._creationTime ?? 0;
  return bTime - aTime;
};

export type DatabaseWithRelations = {
  table: Doc<"dbTables">;
  fields: Doc<"dbFields">[];
  views: Doc<"dbViews">[];
  rows: Doc<"dbRows">[];
  stats: {
    totalRows: number;
    totalFields: number;
    totalViews: number;
    lastUpdatedAt: number | null;
  };
};

export const list = query({
  args: {
    workspaceId: v.id("workspaces"),
    limit: v.optional(v.number()),
  },
  returns: v.array(v.any()),
  handler: async (ctx, { workspaceId, limit = 100 }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const allowed = await hasWorkspaceAccess(ctx, workspaceId, userId);
    if (!allowed) {
      return [];
    }

    // Performance: Add reasonable limit to prevent large scans
    const tables = await ctx.db
      .query("dbTables")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
      .take(Math.min(limit, 500)); // Max 500 tables per workspace

    return tables.sort(sortByUpdated);
  },
});

export const search = query({
  args: {
    workspaceId: v.id("workspaces"),
    term: v.string(),
    limit: v.optional(v.number()),
  },
  returns: v.array(v.any()),
  handler: async (ctx, { workspaceId, term, limit = 12 }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const allowed = await hasWorkspaceAccess(ctx, workspaceId, userId);
    if (!allowed) {
      return [];
    }

    const value = term.trim().toLowerCase();
    if (!value) {
      return [];
    }

    // Performance: Limit query results to prevent large scans
    const tables = await ctx.db
      .query("dbTables")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
      .take(500); // Prevent unbounded table scans

    return tables
      .filter((table) => table.name.toLowerCase().includes(value))
      .sort(sortByUpdated)
      .slice(0, Math.min(limit, 50)); // Max 50 search results
  },
});

export const get = query({
  args: { id: v.id("dbTables") },
  returns: v.union(v.any(), v.null()),
  handler: async (ctx, { id }): Promise<DatabaseWithRelations | null> => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const table = await ctx.db.get(id);
    if (!table) {
      return null;
    }

    await assertWorkspaceAccess(ctx, table.workspaceId, userId);

    const [fields, rows, views] = await Promise.all([
      ctx.db
        .query("dbFields")
        .withIndex("by_table", (q) => q.eq("tableId", id))
        .collect()
        .then((items) => items.sort(sortByPosition)),
      ctx.db
        .query("dbRows")
        .withIndex("by_table", (q) => q.eq("tableId", id))
        .collect()
        .then((items) => items.sort(sortByPosition)),
      ctx.db
        .query("dbViews")
        .withIndex("by_table", (q) => q.eq("tableId", id))
        .collect()
        .then((items) => items.sort(sortByPosition)),
    ]);

    const lastUpdatedCandidate = [
      table.updatedAt ?? table._creationTime,
      ...rows.map((row) => row.updatedAt ?? row.createdAt ?? row._creationTime ?? 0),
      ...fields.map((field) => field.updatedAt ?? field.createdAt ?? field._creationTime ?? 0),
    ].filter((value): value is number => typeof value === "number");

    return {
      table,
      fields,
      rows,
      views,
      stats: {
        totalRows: rows.length,
        totalFields: fields.length,
        totalViews: views.length,
        lastUpdatedAt:
          lastUpdatedCandidate.length > 0
            ? Math.max(...lastUpdatedCandidate)
            : null,
      },
    };
  },
});

export const getRow = query({
  args: { id: v.id("dbRows") },
  returns: v.union(v.any(), v.null()),
  handler: async (ctx, { id}) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const row = await ctx.db.get(id);
    if (!row) {
      return null;
    }

    await assertWorkspaceAccess(ctx, row.workspaceId, userId);
    return row;
  },
});

export const listRows = query({
  args: {
    tableId: v.id("dbTables"),
    limit: v.optional(v.number()),
  },
  returns: v.array(v.any()),
  handler: async (ctx, { tableId, limit = 1000 }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const table = await ctx.db.get(tableId);
    if (!table) {
      return [];
    }

    await assertWorkspaceAccess(ctx, table.workspaceId, userId);

    // Performance: Add reasonable limit to prevent large scans
    const rows = await ctx.db
      .query("dbRows")
      .withIndex("by_table", (q) => q.eq("tableId", tableId))
      .take(Math.min(limit, 10000)); // Max 10k rows per query

    return rows.sort(sortByPosition);
  },
});

export const listFields = query({
  args: { tableId: v.id("dbTables") },
  returns: v.array(v.any()),
  handler: async (ctx, { tableId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const table = await ctx.db.get(tableId);
    if (!table) {
      return [];
    }

    await assertWorkspaceAccess(ctx, table.workspaceId, userId);

    const fields = await ctx.db
      .query("dbFields")
      .withIndex("by_table", (q) => q.eq("tableId", tableId))
      .collect();

    return fields.sort(sortByPosition);
  },
});

export const listViews = query({
  args: { tableId: v.id("dbTables") },
  returns: v.array(v.any()),
  handler: async (ctx, { tableId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const table = await ctx.db.get(tableId);
    if (!table) {
      return [];
    }

    await assertWorkspaceAccess(ctx, table.workspaceId, userId);

    const views = await ctx.db
      .query("dbViews")
      .withIndex("by_table", (q) => q.eq("tableId", tableId))
      .collect();

    return views.sort(sortByPosition);
  },
});
