/**
 * Database Import/Export API
 * Features #112-115 - CSV and JSON import/export for database tables
 */

import { v } from "convex/values";
import { mutation, query, action } from "../../_generated/server";
import { internal } from "../../_generated/api";

// =============================================================================
// Queries
// =============================================================================

/**
 * Get all import/export jobs for a table
 */
export const getJobs = query({
  args: {
    tableId: v.id("dbTables"),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("dbImportExportJobs")
      .withIndex("by_table", (q) => q.eq("tableId", args.tableId))
      .order("desc")
      .collect();
  },
});

/**
 * Get all jobs for a workspace
 */
export const getWorkspaceJobs = query({
  args: {
    workspaceId: v.id("workspaces"),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("processing"),
        v.literal("completed"),
        v.literal("failed"),
        v.literal("cancelled")
      )
    ),
  },
  handler: async (ctx, args) => {
    let jobs = await ctx.db
      .query("dbImportExportJobs")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .order("desc")
      .collect();

    if (args.status) {
      jobs = jobs.filter((j) => j.status === args.status);
    }

    return jobs;
  },
});

/**
 * Get a specific job
 */
export const getJob = query({
  args: {
    jobId: v.id("dbImportExportJobs"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.jobId);
  },
});

/**
 * Get recent jobs
 */
export const getRecentJobs = query({
  args: {
    workspaceId: v.id("workspaces"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const jobs = await ctx.db
      .query("dbImportExportJobs")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .order("desc")
      .take(args.limit || 10);

    return jobs;
  },
});

// =============================================================================
// Mutations
// =============================================================================

/**
 * Create an import job
 */
export const createImportJob = mutation({
  args: {
    tableId: v.id("dbTables"),
    workspaceId: v.id("workspaces"),
    jobType: v.union(
      v.literal("import_csv"),
      v.literal("import_json"),
      v.literal("import_excel")
    ),
    fileName: v.optional(v.string()),
    config: v.optional(
      v.object({
        fieldMapping: v.optional(v.record(v.string(), v.string())),
        skipFirstRow: v.optional(v.boolean()),
        dateFormat: v.optional(v.string()),
        nullValues: v.optional(v.array(v.string())),
        updateMode: v.optional(
          v.union(
            v.literal("insert_only"),
            v.literal("update_only"),
            v.literal("upsert")
          )
        ),
        matchField: v.optional(v.id("dbFields")),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const jobId = await ctx.db.insert("dbImportExportJobs", {
      tableId: args.tableId,
      workspaceId: args.workspaceId,
      jobType: args.jobType,
      config: args.config,
      fileName: args.fileName,
      status: "pending",
      createdById: user._id,
      createdAt: Date.now(),
    });

    return jobId;
  },
});

/**
 * Create an export job
 */
export const createExportJob = mutation({
  args: {
    tableId: v.id("dbTables"),
    workspaceId: v.id("workspaces"),
    jobType: v.union(
      v.literal("export_csv"),
      v.literal("export_json"),
      v.literal("export_excel")
    ),
    config: v.optional(
      v.object({
        includeFields: v.optional(v.array(v.id("dbFields"))),
        excludeFields: v.optional(v.array(v.id("dbFields"))),
        filters: v.optional(v.any()),
        sortBy: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const jobId = await ctx.db.insert("dbImportExportJobs", {
      tableId: args.tableId,
      workspaceId: args.workspaceId,
      jobType: args.jobType,
      config: args.config,
      status: "pending",
      createdById: user._id,
      createdAt: Date.now(),
    });

    return jobId;
  },
});

/**
 * Update job progress
 */
export const updateJobProgress = mutation({
  args: {
    jobId: v.id("dbImportExportJobs"),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("processing"),
        v.literal("completed"),
        v.literal("failed"),
        v.literal("cancelled")
      )
    ),
    totalRows: v.optional(v.number()),
    processedRows: v.optional(v.number()),
    successRows: v.optional(v.number()),
    failedRows: v.optional(v.number()),
    errors: v.optional(
      v.array(
        v.object({
          row: v.number(),
          field: v.optional(v.string()),
          error: v.string(),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const { jobId, ...updates } = args;

    const job = await ctx.db.get(jobId);
    if (!job) {
      throw new Error("Job not found");
    }

    await ctx.db.patch(jobId, updates);
    return jobId;
  },
});

/**
 * Complete a job
 */
export const completeJob = mutation({
  args: {
    jobId: v.id("dbImportExportJobs"),
    successRows: v.number(),
    failedRows: v.number(),
    fileId: v.optional(v.id("_storage")),
    downloadUrl: v.optional(v.string()),
    errors: v.optional(
      v.array(
        v.object({
          row: v.number(),
          field: v.optional(v.string()),
          error: v.string(),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (!job) {
      throw new Error("Job not found");
    }

    await ctx.db.patch(args.jobId, {
      status: args.failedRows > 0 && args.successRows === 0 ? "failed" : "completed",
      successRows: args.successRows,
      failedRows: args.failedRows,
      processedRows: args.successRows + args.failedRows,
      fileId: args.fileId,
      downloadUrl: args.downloadUrl,
      errors: args.errors,
      completedAt: Date.now(),
    });

    return args.jobId;
  },
});

/**
 * Cancel a job
 */
export const cancelJob = mutation({
  args: {
    jobId: v.id("dbImportExportJobs"),
  },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);
    if (!job) {
      throw new Error("Job not found");
    }

    if (job.status !== "pending" && job.status !== "processing") {
      throw new Error("Cannot cancel job in current state");
    }

    await ctx.db.patch(args.jobId, {
      status: "cancelled",
      completedAt: Date.now(),
    });

    return true;
  },
});

/**
 * Process CSV import
 */
export const processCSVImport = mutation({
  args: {
    jobId: v.id("dbImportExportJobs"),
    csvData: v.array(v.record(v.string(), v.any())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const job = await ctx.db.get(args.jobId);
    if (!job) {
      throw new Error("Job not found");
    }

    // Update job status
    await ctx.db.patch(args.jobId, {
      status: "processing",
      startedAt: Date.now(),
      totalRows: args.csvData.length,
    });

    // Get fields for the table
    const fields = await ctx.db
      .query("dbFields")
      .withIndex("by_table", (q) => q.eq("tableId", job.tableId))
      .collect();

    const fieldMap = new Map(fields.map((f) => [f.name.toLowerCase(), f]));
    
    let successCount = 0;
    let failCount = 0;
    const errors: Array<{ row: number; field?: string; error: string }> = [];

    // Process each row
    for (let i = 0; i < args.csvData.length; i++) {
      const rowData = args.csvData[i];

      try {
        // Map CSV columns to field names
        const mappedData: Record<string, any> = {};

        for (const [key, value] of Object.entries(rowData)) {
          const normalizedKey = key.toLowerCase().trim();
          
          // Use field mapping from config if available
          let targetFieldName = normalizedKey;
          if (job.config?.fieldMapping) {
            targetFieldName = job.config.fieldMapping[key] || normalizedKey;
          }

          const field = fieldMap.get(targetFieldName);
          if (field) {
            // Convert value based on field type
            mappedData[field.name] = convertValue(value, field.type);
          }
        }

        // Get next position
        const existingRows = await ctx.db
          .query("dbRows")
          .withIndex("by_table", (q) => q.eq("tableId", job.tableId))
          .collect();
        const nextPosition = existingRows.length + successCount;

        // Insert the row
        await ctx.db.insert("dbRows", {
          tableId: job.tableId,
          workspaceId: job.workspaceId,
          data: mappedData,
          position: nextPosition,
          createdById: user._id,
          updatedById: user._id,
          createdAt: Date.now(),
        });

        successCount++;
      } catch (error) {
        failCount++;
        errors.push({
          row: i + 1,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    // Complete the job
    await ctx.db.patch(args.jobId, {
      status: failCount > 0 && successCount === 0 ? "failed" : "completed",
      processedRows: successCount + failCount,
      successRows: successCount,
      failedRows: failCount,
      errors: errors.length > 0 ? errors : undefined,
      completedAt: Date.now(),
    });

    return {
      success: true,
      successCount,
      failCount,
      errors,
    };
  },
});

/**
 * Process JSON import
 */
export const processJSONImport = mutation({
  args: {
    jobId: v.id("dbImportExportJobs"),
    jsonData: v.array(v.record(v.string(), v.any())),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();

    if (!user) {
      throw new Error("User not found");
    }

    const job = await ctx.db.get(args.jobId);
    if (!job) {
      throw new Error("Job not found");
    }

    // Update job status
    await ctx.db.patch(args.jobId, {
      status: "processing",
      startedAt: Date.now(),
      totalRows: args.jsonData.length,
    });

    // Get fields for the table
    const fields = await ctx.db
      .query("dbFields")
      .withIndex("by_table", (q) => q.eq("tableId", job.tableId))
      .collect();

    const fieldNames = new Set(fields.map((f) => f.name));

    let successCount = 0;
    let failCount = 0;
    const errors: Array<{ row: number; field?: string; error: string }> = [];

    // Process each row
    for (let i = 0; i < args.jsonData.length; i++) {
      const rowData = args.jsonData[i];

      try {
        // Filter to only known fields
        const filteredData: Record<string, any> = {};
        for (const [key, value] of Object.entries(rowData)) {
          if (fieldNames.has(key)) {
            filteredData[key] = value;
          }
        }

        // Get next position
        const existingRows = await ctx.db
          .query("dbRows")
          .withIndex("by_table", (q) => q.eq("tableId", job.tableId))
          .collect();
        const nextPosition = existingRows.length + successCount;

        // Insert the row
        await ctx.db.insert("dbRows", {
          tableId: job.tableId,
          workspaceId: job.workspaceId,
          data: filteredData,
          position: nextPosition,
          createdById: user._id,
          updatedById: user._id,
          createdAt: Date.now(),
        });

        successCount++;
      } catch (error) {
        failCount++;
        errors.push({
          row: i + 1,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    // Complete the job
    await ctx.db.patch(args.jobId, {
      status: failCount > 0 && successCount === 0 ? "failed" : "completed",
      processedRows: successCount + failCount,
      successRows: successCount,
      failedRows: failCount,
      errors: errors.length > 0 ? errors : undefined,
      completedAt: Date.now(),
    });

    return {
      success: true,
      successCount,
      failCount,
      errors,
    };
  },
});

/**
 * Generate CSV export data
 */
export const generateCSVExport = query({
  args: {
    tableId: v.id("dbTables"),
    fieldIds: v.optional(v.array(v.id("dbFields"))),
  },
  handler: async (ctx, args) => {
    // Get table
    const table = await ctx.db.get(args.tableId);
    if (!table) {
      throw new Error("Table not found");
    }

    // Get fields
    let fields = await ctx.db
      .query("dbFields")
      .withIndex("by_table", (q) => q.eq("tableId", args.tableId))
      .collect();

    // Filter fields if specified
    if (args.fieldIds && args.fieldIds.length > 0) {
      const fieldIdSet = new Set(args.fieldIds);
      fields = fields.filter((f) => fieldIdSet.has(f._id));
    }

    // Sort by position
    fields.sort((a, b) => a.position - b.position);

    // Get all rows
    const rows = await ctx.db
      .query("dbRows")
      .withIndex("by_table", (q) => q.eq("tableId", args.tableId))
      .collect();

    // Build CSV header
    const headers = fields.map((f) => f.name);

    // Build CSV rows
    const csvRows = rows.map((row) => {
      return fields.map((field) => {
        const value = row.data[field.name];
        return formatCSVValue(value);
      });
    });

    return {
      headers,
      rows: csvRows,
      totalRows: rows.length,
    };
  },
});

/**
 * Generate JSON export data
 */
export const generateJSONExport = query({
  args: {
    tableId: v.id("dbTables"),
    fieldIds: v.optional(v.array(v.id("dbFields"))),
    includeMetadata: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Get table
    const table = await ctx.db.get(args.tableId);
    if (!table) {
      throw new Error("Table not found");
    }

    // Get fields
    let fields = await ctx.db
      .query("dbFields")
      .withIndex("by_table", (q) => q.eq("tableId", args.tableId))
      .collect();

    // Filter fields if specified
    if (args.fieldIds && args.fieldIds.length > 0) {
      const fieldIdSet = new Set(args.fieldIds);
      fields = fields.filter((f) => fieldIdSet.has(f._id));
    }

    const fieldNames = new Set(fields.map((f) => f.name));

    // Get all rows
    const rows = await ctx.db
      .query("dbRows")
      .withIndex("by_table", (q) => q.eq("tableId", args.tableId))
      .collect();

    // Build JSON data
    const jsonData = rows.map((row) => {
      const filteredData: Record<string, any> = {};
      
      for (const [key, value] of Object.entries(row.data)) {
        if (fieldNames.has(key)) {
          filteredData[key] = value;
        }
      }

      if (args.includeMetadata) {
        return {
          _id: row._id,
          _createdAt: row.createdAt,
          ...filteredData,
        };
      }

      return filteredData;
    });

    return {
      tableName: table.name,
      fields: fields.map((f) => ({
        name: f.name,
        type: f.type,
      })),
      data: jsonData,
      totalRows: rows.length,
    };
  },
});

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Convert a value based on field type
 */
function convertValue(value: any, type: string): any {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  switch (type) {
    case "number":
      const num = Number(value);
      return isNaN(num) ? null : num;

    case "checkbox":
      if (typeof value === "boolean") return value;
      if (typeof value === "string") {
        const lower = value.toLowerCase();
        return lower === "true" || lower === "yes" || lower === "1";
      }
      return Boolean(value);

    case "date":
      if (typeof value === "number") return value;
      const date = new Date(value);
      return isNaN(date.getTime()) ? null : date.getTime();

    case "select":
    case "status":
      return String(value);

    case "multiSelect":
      if (Array.isArray(value)) return value.map(String);
      if (typeof value === "string") {
        return value.split(",").map((s) => s.trim());
      }
      return [String(value)];

    case "text":
    case "email":
    case "phone":
    case "url":
    default:
      return String(value);
  }
}

/**
 * Format a value for CSV output
 */
function formatCSVValue(value: any): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (Array.isArray(value)) {
    return value.join(", ");
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}
