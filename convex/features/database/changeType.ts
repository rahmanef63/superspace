/**
 * Change Property Type Mutation
 * 
 * This mutation handles changing a database field's type AND transforming all existing data
 * Uses the dataTransformer utility to convert values from old type to new type
 */

import { mutation } from "../../_generated/server";
import { v } from "convex/values";
import type { Id } from "../../_generated/dataModel";
import { ensureUser, requirePermission } from "../../auth/helpers";
import { PERMISSIONS } from "../../workspace/permissions";

// Import transformation logic (we'll implement this in Convex)
function transformValue(fromType: string, toType: string, value: any): any {
  // Text → Number: Extract numeric values
  if (fromType === 'text' && toType === 'number') {
    if (value === null || value === undefined || value === "") {
      return null;
    }
    
    const str = String(value).trim();
    
    // Try direct parse first
    const directNum = Number(str);
    if (!isNaN(directNum)) {
      return directNum;
    }
    
    // Extract numeric part: keep digits, decimal point, minus sign
    const numericStr = str.replace(/[^0-9.-]/g, '');
    
    if (numericStr === '' || numericStr === '-' || numericStr === '.') {
      return null;
    }
    
    const num = Number(numericStr);
    return isNaN(num) ? null : num;
  }
  
  // Number → Text: Convert and trim
  if (fromType === 'number' && toType === 'text') {
    if (value === null || value === undefined) {
      return "";
    }
    return String(value).trim();
  }
  
  // Text → Text: Trim whitespace (for type refresh or same-type transformation)
  if (fromType === 'text' && toType === 'text') {
    if (value === null || value === undefined) {
      return "";
    }
    return String(value).trim();
  }
  
  // Add more transformations as needed
  // For now, keep value as-is for unsupported transformations
  return value;
}

export const changeFieldType = mutation({
  args: {
    fieldId: v.id("dbFields"),
    newType: v.string(),
    transformData: v.optional(v.boolean()), // Whether to transform existing data
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx);

    // Get the field
    const field = await ctx.db.get(args.fieldId);
    if (!field) {
      throw new Error("Field not found");
    }

    // Get the table to check workspace permission
    const table = await ctx.db.get(field.tableId);
    if (!table) {
      throw new Error("Table not found");
    }

    // RBAC: Check permission  
    await requirePermission(ctx, table.workspaceId, PERMISSIONS.DATABASE_UPDATE);

    const oldType = field.type;
    
    // Update ONLY the field type - preserve position, options, and other fields
    // Note: Options might need to be cleared for incompatible types (e.g., select→number)
    // but we preserve them here for flexibility. Frontend should handle validation.
    await ctx.db.patch(args.fieldId, {
      type: args.newType as any, // Cast to any to allow string
    });

    // Transform existing data if requested
    if (args.transformData !== false) {
      // Get all rows for this table
      const rows = await ctx.db
        .query("dbRows")
        .withIndex("by_table", (q) => q.eq("tableId", field.tableId))
        .collect();

      // Transform each row's value for this field
      for (const row of rows) {
        const data = row.data as Record<string, any>;
        const fieldKey = String(args.fieldId);
        
        if (data && fieldKey in data) {
          const oldValue = data[fieldKey];
          const newValue = transformValue(oldType, args.newType, oldValue);
          
          // Only update if value changed
          if (newValue !== oldValue) {
            await ctx.db.patch(row._id, {
              data: {
                ...data,
                [fieldKey]: newValue,
              },
            });
          }
        }
      }
    }

    return {
      success: true,
      field: await ctx.db.get(args.fieldId),
    };
  },
});
