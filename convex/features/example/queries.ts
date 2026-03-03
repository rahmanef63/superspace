/**
 * ============================================================================
 * EXAMPLE FEATURE - queries.ts (Convex)
 * ============================================================================
 * 
 * Read Operations (Queries)
 * 
 * CONVEX QUERIES:
 * - Are reactive (UI updates automatically when data changes)
 * - Are cached for performance
 * - Should be fast and side-effect free
 * - MUST check permissions (RBAC)
 * 
 * PATTERN:
 * 1. Define args with Convex validators (v.string(), v.id(), etc.)
 * 2. Check user authentication
 * 3. Check permissions (RBAC)
 * 4. Query the database
 * 5. Return data (optionally with joined data)
 * 
 * TIPS:
 * - Use indexes for better performance
 * - Return only the data you need
 * - Consider pagination for large datasets
 */

import { v } from "convex/values"
import { query } from "../../_generated/server"
import { getExistingUserId } from "../../auth/helpers"

// =========================================================================
// GET ALL ITEMS
// =========================================================================

/**
 * Get all example items in a workspace
 * 
 * REACTIVE: This query re-runs automatically when:
 * - New items are added
 * - Existing items are updated
 * - Items are deleted
 * 
 * Usage in React:
 *   const items = useQuery(api.features.example.queries.getItems, {
 *     workspaceId
 *   })
 */
export const getItems = query({
    // =========================================================================
    // ARGUMENTS
    // =========================================================================
    
    /**
     * Define expected arguments with Convex validators
     * 
     * These are type-safe and validated at runtime.
     * TypeScript types are inferred automatically.
     */
    args: {
        workspaceId: v.id("workspaces"),
        completed: v.optional(v.boolean()),
    },
    
    // =========================================================================
    // RETURN TYPE
    // =========================================================================
    
    /**
     * Explicitly define return type for type safety
     * 
     * v.array(v.any()) is permissive - use specific types in production
     */
    returns: v.array(v.any()),
    
    // =========================================================================
    // HANDLER
    // =========================================================================
    
    /**
     * The query implementation
     * 
     * @param ctx - Convex context (db, auth, etc.)
     * @param args - Validated arguments
     */
    handler: async (ctx, args) => {
        // =====================================================================
        // STEP 1: Authentication Check
        // =====================================================================
        
        /**
         * Get the current user ID
         * Returns null if not authenticated
         */
        const userId = await getExistingUserId(ctx)
        if (!userId) {
            // Return empty array for unauthenticated users
            // Alternatively, throw an error
            return []
        }
        
        // =====================================================================
        // STEP 2: Permission Check (RBAC)
        // =====================================================================
        
        /**
         * In production, you should check permissions:
         * 
         *   await requirePermission(ctx, args.workspaceId, 'example.view')
         * 
         * For this example, we skip it to keep things simple.
         * See convex/features/crm/queries.ts for full implementation.
         */
        
        // =====================================================================
        // STEP 3: Query Database
        // =====================================================================
        
        /**
         * Build the query using indexes for performance
         * 
         * Pattern: Start with index, then filter, then collect
         */
        let itemsQuery = ctx.db
            .query("exampleItems")
            .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
        
        // Optional: Filter by completion status
        if (args.completed !== undefined) {
            itemsQuery = itemsQuery.filter((q) => 
                q.eq(q.field("completed"), args.completed)
            )
        }
        
        // Execute query and get results
        const items = await itemsQuery.order("desc").collect()
        
        // =====================================================================
        // STEP 4: Return Data
        // =====================================================================
        
        /**
         * Return items directly, or join with related data if needed
         * 
         * For joined data, see convex/features/crm/queries.ts:
         *   const itemsWithDetails = await Promise.all(
         *     items.map(async (item) => ({
         *       ...item,
         *       creator: await ctx.db.get(item.createdBy),
         *     }))
         *   )
         */
        return items
    },
})

// =========================================================================
// GET SINGLE ITEM
// =========================================================================

/**
 * Get a single example item by ID
 */
export const getItem = query({
    args: {
        itemId: v.id("exampleItems"),
    },
    returns: v.union(v.any(), v.null()),
    handler: async (ctx, args) => {
        const userId = await getExistingUserId(ctx)
        if (!userId) return null
        
        const item = await ctx.db.get(args.itemId)
        return item
    },
})

// =========================================================================
// GET STATS
// =========================================================================

/**
 * Get summary statistics for the example feature
 */
export const getStats = query({
    args: {
        workspaceId: v.id("workspaces"),
    },
    returns: v.object({
        total: v.number(),
        completed: v.number(),
        pending: v.number(),
    }),
    handler: async (ctx, args) => {
        const userId = await getExistingUserId(ctx)
        if (!userId) {
            return { total: 0, completed: 0, pending: 0 }
        }
        
        const items = await ctx.db
            .query("exampleItems")
            .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
            .collect()
        
        const completed = items.filter((i) => i.completed).length
        
        return {
            total: items.length,
            completed,
            pending: items.length - completed,
        }
    },
})
