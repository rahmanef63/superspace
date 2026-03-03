/**
 * Soft Delete & Restore API (Features #80, #81, #82)
 * Trash bin functionality with restore capability
 */
import { query, mutation, internalMutation } from "../../_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { ensureUser, requirePermission } from "../../auth/helpers";
import { PERMISSIONS } from "../../workspace/permissions";
import { logAuditEvent } from "../../shared/audit";

// Default retention period: 30 days
const DEFAULT_RETENTION_DAYS = 30;

/**
 * Soft delete a row (move to trash)
 */
export const softDeleteRow = mutation({
  args: {
    rowId: v.id("dbRows"),
    retentionDays: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);

    const row = await ctx.db.get(args.rowId);
    if (!row) throw new Error("Row not found");

    await requirePermission(ctx, row.workspaceId, PERMISSIONS.DATABASE_DELETE);

    const now = Date.now();
    const retentionDays = args.retentionDays ?? DEFAULT_RETENTION_DAYS;
    const expiresAt = now + retentionDays * 24 * 60 * 60 * 1000;

    // Create trash entry
    const deletedRowId = await ctx.db.insert("dbDeletedRows", {
      originalRowId: args.rowId as string,
      tableId: row.tableId,
      workspaceId: row.workspaceId,
      data: row.data,
      computed: row.computed,
      position: row.position,
      deletedById: userId,
      deletedAt: now,
      expiresAt,
    });

    // Delete the original row
    await ctx.db.delete(args.rowId);

    await logAuditEvent(ctx, {
      action: "row.softDelete",
      resourceType: "dbRows",
      resourceId: args.rowId,
      workspaceId: row.workspaceId,
      userId,
      metadata: {
        tableName: (await ctx.db.get(row.tableId))?.name,
        retentionDays,
        expiresAt,
      },
    });

    return { deletedRowId, expiresAt };
  },
});

/**
 * Soft delete multiple rows
 */
export const softDeleteRows = mutation({
  args: {
    rowIds: v.array(v.id("dbRows")),
    retentionDays: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);

    if (args.rowIds.length === 0) return { deleted: 0 };

    const now = Date.now();
    const retentionDays = args.retentionDays ?? DEFAULT_RETENTION_DAYS;
    const expiresAt = now + retentionDays * 24 * 60 * 60 * 1000;

    let deleted = 0;
    let workspaceId: string | null = null;

    for (const rowId of args.rowIds) {
      const row = await ctx.db.get(rowId);
      if (!row) continue;

      // Permission check on first row
      if (!workspaceId) {
        workspaceId = row.workspaceId as string;
        await requirePermission(ctx, row.workspaceId, PERMISSIONS.DATABASE_DELETE);
      }

      // Create trash entry
      await ctx.db.insert("dbDeletedRows", {
        originalRowId: rowId as string,
        tableId: row.tableId,
        workspaceId: row.workspaceId,
        data: row.data,
        computed: row.computed,
        position: row.position,
        deletedById: userId,
        deletedAt: now,
        expiresAt,
      });

      // Delete the original
      await ctx.db.delete(rowId);
      deleted++;
    }

    if (workspaceId) {
      await logAuditEvent(ctx, {
        action: "row.bulkSoftDelete",
        resourceType: "dbRows",
        resourceId: args.rowIds[0],
        workspaceId: workspaceId as any,
        userId,
        metadata: { count: deleted, retentionDays },
      });
    }

    return { deleted, expiresAt };
  },
});

/**
 * List deleted rows (trash)
 */
export const listDeletedRows = query({
  args: {
    workspaceId: v.id("workspaces"),
    tableId: v.optional(v.id("dbTables")),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    let queryBuilder;

    if (args.tableId) {
      queryBuilder = ctx.db
        .query("dbDeletedRows")
        .withIndex("by_table", (q) => q.eq("tableId", args.tableId!));
    } else {
      queryBuilder = ctx.db
        .query("dbDeletedRows")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId));
    }

    const deletedRows = await queryBuilder
      .order("desc")
      .take(args.limit ?? 100);

    // Filter out expired and restored rows
    const now = Date.now();
    const activeDeleted = deletedRows.filter(
      (row) => row.expiresAt > now && !row.restoredAt
    );

    // Enrich with table and user info
    const enriched = await Promise.all(
      activeDeleted.map(async (row) => {
        const table = await ctx.db
          .query("dbTables")
          .filter((q) => q.eq(q.field("_id"), row.tableId))
          .first();
        const deletedBy = await ctx.db
          .query("users")
          .filter((q) => q.eq(q.field("_id"), row.deletedById))
          .first();
        return {
          ...row,
          tableName: table?.name ?? "Unknown",
          deletedByName: deletedBy?.name ?? "Unknown",
          daysUntilPurge: Math.ceil(
            (row.expiresAt - now) / (24 * 60 * 60 * 1000)
          ),
        };
      })
    );

    return enriched;
  },
});

/**
 * Restore a deleted row
 */
export const restoreRow = mutation({
  args: {
    deletedRowId: v.id("dbDeletedRows"),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);

    const deletedRow = await ctx.db.get(args.deletedRowId);
    if (!deletedRow) throw new Error("Deleted row not found");
    if (deletedRow.restoredAt) throw new Error("Row already restored");

    await requirePermission(
      ctx,
      deletedRow.workspaceId,
      PERMISSIONS.DATABASE_CREATE
    );

    // Check if table still exists
    const table = await ctx.db.get(deletedRow.tableId);
    if (!table) throw new Error("Original table no longer exists");

    // Calculate new position
    const existingRows = await ctx.db
      .query("dbRows")
      .withIndex("by_table", (q) => q.eq("tableId", deletedRow.tableId))
      .collect();
    const maxPosition = Math.max(0, ...existingRows.map((r) => r.position ?? 0));

    // Recreate the row
    const newRowId = await ctx.db.insert("dbRows", {
      tableId: deletedRow.tableId,
      workspaceId: deletedRow.workspaceId,
      data: deletedRow.data,
      computed: deletedRow.computed,
      docId: undefined,
      createdById: userId,
      updatedById: userId,
      position: maxPosition + 1,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Mark as restored
    await ctx.db.patch(args.deletedRowId, {
      restoredAt: Date.now(),
      restoredById: userId,
    });

    await logAuditEvent(ctx, {
      action: "row.restore",
      resourceType: "dbRows",
      resourceId: newRowId,
      workspaceId: deletedRow.workspaceId,
      userId,
      metadata: {
        tableName: table.name,
        originalRowId: deletedRow.originalRowId,
      },
    });

    return { newRowId, success: true };
  },
});

/**
 * Restore multiple rows
 */
export const restoreRows = mutation({
  args: {
    deletedRowIds: v.array(v.id("dbDeletedRows")),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);

    if (args.deletedRowIds.length === 0) return { restored: 0 };

    let restored = 0;
    let workspaceId: string | null = null;

    for (const deletedRowId of args.deletedRowIds) {
      const deletedRow = await ctx.db.get(deletedRowId);
      if (!deletedRow || deletedRow.restoredAt) continue;

      // Permission check on first row
      if (!workspaceId) {
        workspaceId = deletedRow.workspaceId as string;
        await requirePermission(
          ctx,
          deletedRow.workspaceId,
          PERMISSIONS.DATABASE_CREATE
        );
      }

      const table = await ctx.db.get(deletedRow.tableId);
      if (!table) continue;

      // Calculate new position
      const existingRows = await ctx.db
        .query("dbRows")
        .withIndex("by_table", (q) => q.eq("tableId", deletedRow.tableId))
        .collect();
      const maxPosition = Math.max(0, ...existingRows.map((r) => r.position ?? 0));

      // Recreate the row
      await ctx.db.insert("dbRows", {
        tableId: deletedRow.tableId,
        workspaceId: deletedRow.workspaceId,
        data: deletedRow.data,
        computed: deletedRow.computed,
        docId: undefined,
        createdById: userId,
        updatedById: userId,
        position: maxPosition + restored + 1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      // Mark as restored
      await ctx.db.patch(deletedRowId, {
        restoredAt: Date.now(),
        restoredById: userId,
      });

      restored++;
    }

    if (workspaceId) {
      await logAuditEvent(ctx, {
        action: "row.bulkRestore",
        resourceType: "dbRows",
        resourceId: args.deletedRowIds[0],
        workspaceId: workspaceId as any,
        userId,
        metadata: { count: restored },
      });
    }

    return { restored };
  },
});

/**
 * Permanently delete (hard delete) from trash
 */
export const hardDeleteRow = mutation({
  args: {
    deletedRowId: v.id("dbDeletedRows"),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);

    const deletedRow = await ctx.db.get(args.deletedRowId);
    if (!deletedRow) throw new Error("Deleted row not found");

    await requirePermission(
      ctx,
      deletedRow.workspaceId,
      PERMISSIONS.DATABASE_DELETE
    );

    await ctx.db.delete(args.deletedRowId);

    await logAuditEvent(ctx, {
      action: "row.hardDelete",
      resourceType: "dbDeletedRows",
      resourceId: args.deletedRowId,
      workspaceId: deletedRow.workspaceId,
      userId,
      metadata: {
        originalRowId: deletedRow.originalRowId,
      },
    });

    return { success: true };
  },
});

/**
 * Empty trash (delete all expired or all)
 */
export const emptyTrash = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    tableId: v.optional(v.id("dbTables")),
    deleteAll: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);

    await requirePermission(ctx, args.workspaceId, PERMISSIONS.DATABASE_DELETE);

    let queryBuilder;
    if (args.tableId) {
      queryBuilder = ctx.db
        .query("dbDeletedRows")
        .withIndex("by_table", (q) => q.eq("tableId", args.tableId!));
    } else {
      queryBuilder = ctx.db
        .query("dbDeletedRows")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId));
    }

    const deletedRows = await queryBuilder.collect();
    const now = Date.now();

    let deleted = 0;
    for (const row of deletedRows) {
      // Skip restored rows
      if (row.restoredAt) continue;

      // If not deleteAll, only delete expired
      if (!args.deleteAll && row.expiresAt > now) continue;

      await ctx.db.delete(row._id);
      deleted++;
    }

    await logAuditEvent(ctx, {
      action: "trash.empty",
      resourceType: "dbDeletedRows",
      resourceId: args.tableId ?? args.workspaceId,
      workspaceId: args.workspaceId,
      userId,
      metadata: { count: deleted, deleteAll: args.deleteAll ?? false },
    });

    return { deleted };
  },
});

/**
 * Scheduled job to purge expired trash (called by cron)
 */
export const purgeExpiredTrash = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();

    const expiredRows = await ctx.db
      .query("dbDeletedRows")
      .withIndex("by_expires", (q) => q.lt("expiresAt", now))
      .take(1000); // Process in batches

    let purged = 0;
    for (const row of expiredRows) {
      if (!row.restoredAt) {
        await ctx.db.delete(row._id);
        purged++;
      }
    }

    return { purged };
  },
});
