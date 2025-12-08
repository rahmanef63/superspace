/**
 * Workspace Hierarchy API
 * 
 * Provides queries and mutations for managing nested workspace relationships.
 * Supports:
 * - Main Workspace: User's personal hub workspace (one per user)
 * - Parent-Child relationships: Workspaces can have direct children
 * - Workspace Links: Workspaces can be linked as children without ownership transfer
 * 
 * @module convex/workspace/hierarchy
 */

import { v } from "convex/values"
import { query, mutation, internalMutation } from "../_generated/server"
import { ensureUser, requirePermission } from "../auth/helpers"
import type { Id, Doc } from "../_generated/dataModel"
import { PERMS } from "./permissions"

// ============================================================================
// Types
// ============================================================================

export type WorkspaceWithHierarchy = Doc<"workspaces"> & {
  children?: WorkspaceWithHierarchy[]
  linkedChildren?: Array<Doc<"workspaces"> & { link: Doc<"workspaceLinks"> }>
  parent?: Doc<"workspaces"> | null
  isLinked?: boolean
}

// ============================================================================
// Queries
// ============================================================================

/**
 * Get the user's Main Workspace
 * Each user has exactly one Main Workspace that serves as their personal hub.
 */
export const getMainWorkspace = query({
  args: {},
  handler: async (ctx) => {
    // Return null if not authenticated instead of throwing
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return null
    
    const userId = await ensureUser(ctx)
    
    // First try the optimized index
    const mainWorkspace = await ctx.db
      .query("workspaces")
      .withIndex("by_creator_main", (q) => 
        q.eq("createdBy", userId).eq("isMainWorkspace", true)
      )
      .first()
    
    if (mainWorkspace) return mainWorkspace
    
    // Fallback: find any personal workspace marked as main
    return await ctx.db
      .query("workspaces")
      .withIndex("by_creator", (q) => q.eq("createdBy", userId))
      .filter((q) => q.eq(q.field("isMainWorkspace"), true))
      .first()
  },
})

/**
 * Get direct child workspaces of a parent workspace
 * Includes both owned children (parentWorkspaceId) and linked children (workspaceLinks)
 */
export const getChildWorkspaces = query({
  args: {
    workspaceId: v.id("workspaces"),
    includeLinked: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Return empty array if not authenticated
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return []
    
    const userId = await ensureUser(ctx)
    const includeLinked = args.includeLinked ?? true
    
    // Get direct children (where parentWorkspaceId matches)
    const directChildren = await ctx.db
      .query("workspaces")
      .withIndex("by_parent", (q) => q.eq("parentWorkspaceId", args.workspaceId))
      .collect()
    
    // Get linked children
    let linkedChildren: Array<Doc<"workspaces"> & { link: Doc<"workspaceLinks"> }> = []
    if (includeLinked) {
      const links = await ctx.db
        .query("workspaceLinks")
        .withIndex("by_parent", (q) => q.eq("parentWorkspaceId", args.workspaceId))
        .collect()
      
      linkedChildren = await Promise.all(
        links.map(async (link) => {
          const workspace = await ctx.db.get(link.childWorkspaceId)
          if (!workspace) return null
          return { ...workspace, link, isLinked: true }
        })
      ).then(arr => arr.filter(Boolean) as any)
    }
    
    // Deduplicate: if workspace is both direct child AND linked, prefer direct
    const directChildIds = new Set(directChildren.map(c => String(c._id)))
    const dedupedLinkedChildren = linkedChildren.filter(
      lc => !directChildIds.has(String(lc._id))
    )
    
    // Combine and sort by sortOrder or creation time
    const allChildren = [
      ...directChildren.map(ws => ({ ...ws, isLinked: false })),
      ...dedupedLinkedChildren,
    ].sort((a, b) => {
      const aOrder = (a as any).link?.sortOrder ?? 0
      const bOrder = (b as any).link?.sortOrder ?? 0
      if (aOrder !== bOrder) return aOrder - bOrder
      return (a._creationTime || 0) - (b._creationTime || 0)
    })
    
    return allChildren
  },
})

/**
 * Get workspace ancestors (parent chain up to root/main)
 * Protected against cycles with max depth limit
 */
export const getWorkspaceAncestors = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    // Return empty array if not authenticated
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return []
    
    const workspace = await ctx.db.get(args.workspaceId)
    if (!workspace) return []
    
    // If path is materialized AND doesn't contain duplicates, use it
    if (workspace.path && workspace.path.length > 0) {
      // Validate path doesn't contain self or duplicates
      const uniquePath = new Set(workspace.path.map(id => String(id)))
      if (!uniquePath.has(String(args.workspaceId)) && uniquePath.size === workspace.path.length) {
        const ancestors = await Promise.all(
          workspace.path.map(id => ctx.db.get(id))
        )
        return ancestors.filter(Boolean) as Doc<"workspaces">[]
      }
      // Path is corrupted, fall through to traverse
    }
    
    // Traverse up the tree with cycle protection
    const ancestors: Doc<"workspaces">[] = []
    let currentId = workspace.parentWorkspaceId
    const visited = new Set<string>()
    const MAX_DEPTH = 20 // Safety limit
    
    while (currentId && !visited.has(String(currentId)) && ancestors.length < MAX_DEPTH) {
      // Self-reference check
      if (String(currentId) === String(args.workspaceId)) {
        console.warn(`[hierarchy] Detected self-reference in workspace ${args.workspaceId}`)
        break
      }
      
      visited.add(String(currentId))
      const parent = await ctx.db.get(currentId)
      if (!parent) break
      
      ancestors.unshift(parent) // Add to front for root-first order
      currentId = parent.parentWorkspaceId
    }
    
    return ancestors
  },
})

/**
 * Get the full workspace tree for a user
 * Returns hierarchical structure starting from Main Workspace
 */
export const getWorkspaceTree = query({
  args: {
    maxDepth: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Return null tree if not authenticated
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return { mainWorkspace: null, workspaces: [], tree: null }
    
    const userId = await ensureUser(ctx)
    const maxDepth = args.maxDepth ?? 3
    
    // Get main workspace
    const mainWorkspace = await ctx.db
      .query("workspaces")
      .withIndex("by_creator_main", (q) => 
        q.eq("createdBy", userId).eq("isMainWorkspace", true)
      )
      .first()
    
    if (!mainWorkspace) {
      // Return all user's workspaces as flat list if no main workspace
      const allWorkspaces = await ctx.db
        .query("workspaces")
        .withIndex("by_creator", (q) => q.eq("createdBy", userId))
        .collect()
      return { mainWorkspace: null, workspaces: allWorkspaces, tree: null }
    }
    
    // Build tree recursively
    async function buildTree(
      workspaceId: Id<"workspaces">, 
      depth: number
    ): Promise<WorkspaceWithHierarchy | null> {
      if (depth > maxDepth) return null
      
      const workspace = await ctx.db.get(workspaceId)
      if (!workspace) return null
      
      // Get direct children
      const directChildren = await ctx.db
        .query("workspaces")
        .withIndex("by_parent", (q) => q.eq("parentWorkspaceId", workspaceId))
        .collect()
      
      // Get linked children
      const links = await ctx.db
        .query("workspaceLinks")
        .withIndex("by_parent", (q) => q.eq("parentWorkspaceId", workspaceId))
        .collect()
      
      const linkedChildren = await Promise.all(
        links.map(async (link) => {
          const ws = await ctx.db.get(link.childWorkspaceId)
          if (!ws) return null
          return { ...ws, link, isLinked: true }
        })
      ).then(arr => arr.filter(Boolean))
      
      // Recursively build children trees
      const childTrees = await Promise.all(
        directChildren.map(child => buildTree(child._id, depth + 1))
      ).then(arr => arr.filter(Boolean) as WorkspaceWithHierarchy[])
      
      return {
        ...workspace,
        children: childTrees,
        linkedChildren: linkedChildren as any,
      }
    }
    
    const tree = await buildTree(mainWorkspace._id, 0)
    
    // Also get all user's workspaces for flat list reference
    const allWorkspaces = await ctx.db
      .query("workspaces")
      .withIndex("by_creator", (q) => q.eq("createdBy", userId))
      .collect()
    
    return {
      mainWorkspace,
      workspaces: allWorkspaces,
      tree,
    }
  },
})

/**
 * Get siblings of a workspace (same parent)
 * IMPORTANT: Excludes ancestors, descendants, and Main Workspace to prevent hierarchy confusion
 */
export const getSiblingWorkspaces = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    // Return empty array if not authenticated
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) return []
    
    const workspace = await ctx.db.get(args.workspaceId)
    if (!workspace) return []
    
    // Build set of ancestor IDs to exclude
    const ancestorIds = new Set<string>()
    if (workspace.path && workspace.path.length > 0) {
      workspace.path.forEach(id => ancestorIds.add(String(id)))
    }
    // Also traverse up to be safe (in case path is not materialized)
    let currentParentId = workspace.parentWorkspaceId
    const MAX_DEPTH = 20
    let depth = 0
    while (currentParentId && depth < MAX_DEPTH) {
      ancestorIds.add(String(currentParentId))
      const parent = await ctx.db.get(currentParentId)
      if (!parent) break
      currentParentId = parent.parentWorkspaceId
      depth++
    }
    
    // Build set of descendant IDs to exclude (children, grandchildren, etc.)
    const descendantIds = new Set<string>()
    async function collectDescendants(wsId: Id<"workspaces">, d: number) {
      if (d > MAX_DEPTH) return
      const children = await ctx.db
        .query("workspaces")
        .withIndex("by_parent", (q) => q.eq("parentWorkspaceId", wsId))
        .collect()
      for (const child of children) {
        descendantIds.add(String(child._id))
        await collectDescendants(child._id, d + 1)
      }
    }
    await collectDescendants(args.workspaceId, 0)
    
    if (!workspace.parentWorkspaceId) {
      // Root level - return other root workspaces that user has access to
      // EXCLUDE: Main Workspace, ancestors, descendants, current workspace
      
      // Get user's identity for membership lookup
      const userId = await ensureUser(ctx)
      
      // 1. Get workspaces created by user
      const createdWorkspaces = await ctx.db
        .query("workspaces")
        .withIndex("by_creator", (q) => q.eq("createdBy", workspace.createdBy))
        .filter((q) => 
          q.and(
            q.neq(q.field("_id"), args.workspaceId),
            q.neq(q.field("isMainWorkspace"), true), // Exclude Main Workspace
            q.or(
              q.eq(q.field("parentWorkspaceId"), undefined),
              q.eq(q.field("parentWorkspaceId"), null as any)
            )
          )
        )
        .collect()
      
      // 2. Get workspaces user has membership to (shared with them)
      const memberships = await ctx.db
        .query("workspaceMemberships")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .filter((q) => q.eq(q.field("status"), "active"))
        .collect()
      
      const memberWorkspaces: Doc<"workspaces">[] = []
      for (const membership of memberships) {
        const ws = await ctx.db.get(membership.workspaceId)
        if (ws && 
            String(ws._id) !== String(args.workspaceId) &&
            ws.isMainWorkspace !== true &&
            !ws.parentWorkspaceId) {
          // Mark as shared
          memberWorkspaces.push({ ...ws, isShared: true, isOwner: false } as any)
        }
      }
      
      // Combine and deduplicate (prefer created over member if same)
      const createdIds = new Set(createdWorkspaces.map(w => String(w._id)))
      const uniqueMemberWorkspaces = memberWorkspaces.filter(
        w => !createdIds.has(String(w._id))
      )
      
      const allSiblings = [
        ...createdWorkspaces.map(w => ({ ...w, isOwner: true, isShared: false })),
        ...uniqueMemberWorkspaces
      ]
      
      // Filter out ancestors and descendants
      return allSiblings.filter(s => 
        !ancestorIds.has(String(s._id)) && 
        !descendantIds.has(String(s._id))
      )
    }
    
    // Get siblings with same parent
    const siblings = await ctx.db
      .query("workspaces")
      .withIndex("by_parent", (q) => q.eq("parentWorkspaceId", workspace.parentWorkspaceId!))
      .filter((q) => q.neq(q.field("_id"), args.workspaceId))
      .collect()
    
    // Filter out ancestors and descendants (shouldn't happen but just in case of corrupted data)
    return siblings.filter(s => 
      !ancestorIds.has(String(s._id)) && 
      !descendantIds.has(String(s._id))
    )
  },
})

/**
 * Get workspaces available to link as children
 * Returns workspaces user has access to but aren't already linked to the target
 */
export const getAvailableWorkspacesToLink = query({
  args: {
    parentWorkspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx)
    
    // Get user's memberships
    const memberships = await ctx.db
      .query("workspaceMemberships")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("status"), "active"))
      .collect()
    
    const memberWorkspaceIds = memberships.map(m => m.workspaceId)
    
    // Get already linked workspaces
    const existingLinks = await ctx.db
      .query("workspaceLinks")
      .withIndex("by_parent", (q) => q.eq("parentWorkspaceId", args.parentWorkspaceId))
      .collect()
    const linkedIds = new Set(existingLinks.map(l => String(l.childWorkspaceId)))
    
    // Get direct children
    const directChildren = await ctx.db
      .query("workspaces")
      .withIndex("by_parent", (q) => q.eq("parentWorkspaceId", args.parentWorkspaceId))
      .collect()
    const directChildIds = new Set(directChildren.map(c => String(c._id)))
    
    // Filter available workspaces
    const available: Doc<"workspaces">[] = []
    for (const wsId of memberWorkspaceIds) {
      // Skip if already linked, is the parent itself, or is a direct child
      if (
        linkedIds.has(String(wsId)) || 
        String(wsId) === String(args.parentWorkspaceId) ||
        directChildIds.has(String(wsId))
      ) {
        continue
      }
      
      const workspace = await ctx.db.get(wsId)
      if (workspace) {
        available.push(workspace)
      }
    }
    
    return available
  },
})

// ============================================================================
// Mutations
// ============================================================================

/**
 * Link an existing workspace as a child of another workspace
 * This creates a reference, not ownership transfer.
 */
export const linkWorkspaceAsChild = mutation({
  args: {
    parentWorkspaceId: v.id("workspaces"),
    childWorkspaceId: v.id("workspaces"),
    displayName: v.optional(v.string()),
    colorOverride: v.optional(v.string()),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx)
    
    // Verify user has access to parent workspace
    await requirePermission(ctx, args.parentWorkspaceId, PERMS.MANAGE_WORKSPACE)
    
    // Verify user has access to child workspace
    const childMembership = await ctx.db
      .query("workspaceMemberships")
      .withIndex("by_user_workspace", (q) => 
        q.eq("userId", userId).eq("workspaceId", args.childWorkspaceId)
      )
      .first()
    
    if (!childMembership || childMembership.status !== "active") {
      throw new Error("You don't have access to the child workspace")
    }
    
    // Check for circular reference
    const wouldCreateCircle = await checkCircularReference(
      ctx, 
      args.parentWorkspaceId, 
      args.childWorkspaceId
    )
    if (wouldCreateCircle) {
      throw new Error("Cannot link workspace: would create circular reference")
    }
    
    // Check if link already exists
    const existingLink = await ctx.db
      .query("workspaceLinks")
      .withIndex("by_parent_child", (q) => 
        q.eq("parentWorkspaceId", args.parentWorkspaceId)
          .eq("childWorkspaceId", args.childWorkspaceId)
      )
      .first()
    
    if (existingLink) {
      throw new Error("This workspace is already linked as a child")
    }
    
    // Create the link
    const linkId = await ctx.db.insert("workspaceLinks", {
      parentWorkspaceId: args.parentWorkspaceId,
      childWorkspaceId: args.childWorkspaceId,
      linkedBy: userId,
      displayName: args.displayName,
      colorOverride: args.colorOverride,
      sortOrder: args.sortOrder ?? 0,
      linkedAt: Date.now(),
    })
    
    return linkId
  },
})

/**
 * Unlink a child workspace from a parent
 */
export const unlinkChildWorkspace = mutation({
  args: {
    parentWorkspaceId: v.id("workspaces"),
    childWorkspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx)
    
    // Verify user has access to parent workspace
    await requirePermission(ctx, args.parentWorkspaceId, PERMS.MANAGE_WORKSPACE)
    
    // Find and delete the link
    const link = await ctx.db
      .query("workspaceLinks")
      .withIndex("by_parent_child", (q) => 
        q.eq("parentWorkspaceId", args.parentWorkspaceId)
          .eq("childWorkspaceId", args.childWorkspaceId)
      )
      .first()
    
    if (!link) {
      throw new Error("Link not found")
    }
    
    await ctx.db.delete(link._id)
    return true
  },
})

/**
 * Update a workspace link (display name, color, sort order)
 */
export const updateWorkspaceLink = mutation({
  args: {
    linkId: v.id("workspaceLinks"),
    displayName: v.optional(v.string()),
    colorOverride: v.optional(v.string()),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx)
    
    const link = await ctx.db.get(args.linkId)
    if (!link) {
      throw new Error("Link not found")
    }
    
    // Verify user has access to parent workspace
    await requirePermission(ctx, link.parentWorkspaceId, PERMS.MANAGE_WORKSPACE)
    
    const updates: Partial<Doc<"workspaceLinks">> = {}
    if (args.displayName !== undefined) updates.displayName = args.displayName
    if (args.colorOverride !== undefined) updates.colorOverride = args.colorOverride
    if (args.sortOrder !== undefined) updates.sortOrder = args.sortOrder
    
    await ctx.db.patch(args.linkId, updates)
    return true
  },
})

/**
 * Set a workspace's parent (move in hierarchy)
 */
export const setWorkspaceParent = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    parentWorkspaceId: v.optional(v.id("workspaces")),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx)
    
    // Verify user owns the workspace
    await requirePermission(ctx, args.workspaceId, PERMS.MANAGE_WORKSPACE)
    
    if (args.parentWorkspaceId) {
      // Verify user has access to new parent
      await requirePermission(ctx, args.parentWorkspaceId, PERMS.MANAGE_WORKSPACE)
      
      // Check for circular reference
      const wouldCreateCircle = await checkCircularReference(
        ctx, 
        args.parentWorkspaceId, 
        args.workspaceId
      )
      if (wouldCreateCircle) {
        throw new Error("Cannot set parent: would create circular reference")
      }
    }
    
    // Update workspace
    const workspace = await ctx.db.get(args.workspaceId)
    if (!workspace) throw new Error("Workspace not found")
    
    // Calculate new depth and path
    let depth = 0
    let path: Id<"workspaces">[] = []
    
    if (args.parentWorkspaceId) {
      const parent = await ctx.db.get(args.parentWorkspaceId)
      if (parent) {
        depth = (parent.depth ?? 0) + 1
        path = [...(parent.path ?? []), parent._id]
      }
    }
    
    await ctx.db.patch(args.workspaceId, {
      parentWorkspaceId: args.parentWorkspaceId,
      depth,
      path,
    })
    
    // Update children's paths recursively
    await updateChildrenPaths(ctx, args.workspaceId, [...path, args.workspaceId], depth + 1)
    
    return true
  },
})

/**
 * Update workspace color
 */
export const setWorkspaceColor = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    color: v.string(),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.MANAGE_WORKSPACE)
    
    await ctx.db.patch(args.workspaceId, {
      color: args.color,
    })
    
    return true
  },
})

/**
 * Toggle data sharing to parent workspace
 */
export const setShareDataToParent = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    shareDataToParent: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requirePermission(ctx, args.workspaceId, PERMS.MANAGE_WORKSPACE)
    
    await ctx.db.patch(args.workspaceId, {
      shareDataToParent: args.shareDataToParent,
    })
    
    return true
  },
})

/**
 * Fix corrupted workspace hierarchy data
 * Removes self-references and recalculates paths
 */
export const fixCorruptedHierarchy = mutation({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const userId = await ensureUser(ctx)
    await requirePermission(ctx, args.workspaceId, PERMS.MANAGE_WORKSPACE)
    
    const workspace = await ctx.db.get(args.workspaceId)
    if (!workspace) throw new Error("Workspace not found")
    
    let needsUpdate = false
    const updates: Partial<Doc<"workspaces">> = {}
    
    // Check for self-reference
    if (workspace.parentWorkspaceId && String(workspace.parentWorkspaceId) === String(args.workspaceId)) {
      console.log(`[fixHierarchy] Removing self-reference from workspace ${workspace.name}`)
      updates.parentWorkspaceId = undefined
      updates.depth = 0
      updates.path = []
      needsUpdate = true
    }
    
    // Check for corrupted path (contains self)
    if (workspace.path && workspace.path.some(id => String(id) === String(args.workspaceId))) {
      console.log(`[fixHierarchy] Fixing corrupted path in workspace ${workspace.name}`)
      updates.path = []
      needsUpdate = true
    }
    
    // Check for duplicates in path
    if (workspace.path) {
      const uniquePath = [...new Set(workspace.path.map(id => String(id)))]
      if (uniquePath.length !== workspace.path.length) {
        console.log(`[fixHierarchy] Removing duplicate entries from path in workspace ${workspace.name}`)
        updates.path = []
        needsUpdate = true
      }
    }
    
    if (needsUpdate) {
      await ctx.db.patch(args.workspaceId, updates as any)
      
      // Recalculate path properly if we have a valid parent
      if (!updates.parentWorkspaceId && workspace.parentWorkspaceId && 
          String(workspace.parentWorkspaceId) !== String(args.workspaceId)) {
        const parent = await ctx.db.get(workspace.parentWorkspaceId)
        if (parent) {
          const newPath = [...(parent.path ?? []), parent._id]
          const newDepth = (parent.depth ?? 0) + 1
          await ctx.db.patch(args.workspaceId, {
            path: newPath,
            depth: newDepth,
          })
        }
      }
      
      return { fixed: true, message: "Workspace hierarchy fixed" }
    }
    
    return { fixed: false, message: "No issues found" }
  },
})

/**
 * Fix ALL corrupted workspace hierarchies for the current user
 * Scans all workspaces and repairs path/parent issues
 */
export const fixAllWorkspaceHierarchies = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await ensureUser(ctx)
    
    const workspaces = await ctx.db
      .query("workspaces")
      .withIndex("by_creator", (q) => q.eq("createdBy", userId))
      .collect()
    
    let fixedCount = 0
    const fixedWorkspaces: string[] = []
    
    for (const workspace of workspaces) {
      let needsUpdate = false
      const updates: any = {}
      
      // 1. Check for self-reference
      if (workspace.parentWorkspaceId && String(workspace.parentWorkspaceId) === String(workspace._id)) {
        console.log(`[fixAllHierarchy] Removing self-reference from workspace ${workspace.name}`)
        updates.parentWorkspaceId = undefined
        updates.depth = 0
        updates.path = []
        needsUpdate = true
      }
      
      // 2. Check for corrupted path (contains self)
      if (workspace.path && workspace.path.some(id => String(id) === String(workspace._id))) {
        console.log(`[fixAllHierarchy] Fixing corrupted path (contains self) in workspace ${workspace.name}`)
        updates.path = []
        needsUpdate = true
      }
      
      // 3. Check for duplicates in path
      if (workspace.path) {
        const uniquePath = [...new Set(workspace.path.map(id => String(id)))]
        if (uniquePath.length !== workspace.path.length) {
          console.log(`[fixAllHierarchy] Removing duplicate entries from path in workspace ${workspace.name}`)
          updates.path = []
          needsUpdate = true
        }
      }
      
      if (needsUpdate) {
        await ctx.db.patch(workspace._id, updates)
        fixedCount++
        fixedWorkspaces.push(workspace.name)
      }
    }
    
    // Second pass: recalculate paths for all workspaces based on their parentWorkspaceId
    for (const workspace of workspaces) {
      // Skip main workspaces
      if ((workspace as any).isMainWorkspace) {
        await ctx.db.patch(workspace._id, { depth: 0, path: [] })
        continue
      }
      
      // Calculate path from parent chain
      if (workspace.parentWorkspaceId) {
        const parent = await ctx.db.get(workspace.parentWorkspaceId)
        if (parent) {
          const newPath = [...(parent.path ?? []), parent._id]
          const newDepth = (parent.depth ?? 0) + 1
          
          // Only update if different
          const currentPath = workspace.path ?? []
          if (
            newDepth !== workspace.depth ||
            newPath.length !== currentPath.length ||
            !newPath.every((id, i) => String(id) === String(currentPath[i]))
          ) {
            await ctx.db.patch(workspace._id, {
              path: newPath,
              depth: newDepth,
            })
          }
        }
      } else {
        // No parent - this is a root workspace
        if ((workspace.depth ?? 0) !== 0 || (workspace.path?.length ?? 0) !== 0) {
          await ctx.db.patch(workspace._id, {
            depth: 0,
            path: [],
          })
        }
      }
    }
    
    return {
      fixed: fixedCount > 0,
      count: fixedCount,
      workspaces: fixedWorkspaces,
      message: fixedCount > 0 
        ? `Fixed ${fixedCount} workspace(s): ${fixedWorkspaces.join(", ")}`
        : "No issues found in any workspace",
    }
  },
})

/**
 * Validate and report hierarchy issues for all user workspaces
 */
export const validateMyWorkspaceHierarchy = query({
  args: {},
  handler: async (ctx) => {
    const userId = await ensureUser(ctx)
    
    const workspaces = await ctx.db
      .query("workspaces")
      .withIndex("by_creator", (q) => q.eq("createdBy", userId))
      .collect()
    
    const issues: Array<{ workspaceId: Id<"workspaces">; name: string; issue: string }> = []
    
    for (const ws of workspaces) {
      // Check self-reference
      if (ws.parentWorkspaceId && String(ws.parentWorkspaceId) === String(ws._id)) {
        issues.push({
          workspaceId: ws._id,
          name: ws.name,
          issue: "Self-reference: workspace is its own parent",
        })
      }
      
      // Check path contains self
      if (ws.path && ws.path.some(id => String(id) === String(ws._id))) {
        issues.push({
          workspaceId: ws._id,
          name: ws.name,
          issue: "Corrupted path: contains self",
        })
      }
      
      // Check for duplicate path entries
      if (ws.path) {
        const uniqueIds = new Set(ws.path.map(id => String(id)))
        if (uniqueIds.size !== ws.path.length) {
          issues.push({
            workspaceId: ws._id,
            name: ws.name,
            issue: "Corrupted path: contains duplicates",
          })
        }
      }
      
      // Check cycle by traversing up
      if (ws.parentWorkspaceId && String(ws.parentWorkspaceId) !== String(ws._id)) {
        const visited = new Set<string>([String(ws._id)])
        let currentId: Id<"workspaces"> | undefined = ws.parentWorkspaceId
        let depth = 0
        const MAX_DEPTH = 20
        
        while (currentId && depth < MAX_DEPTH) {
          if (visited.has(String(currentId))) {
            issues.push({
              workspaceId: ws._id,
              name: ws.name,
              issue: "Cycle detected in ancestor chain",
            })
            break
          }
          visited.add(String(currentId))
          const parent: Awaited<ReturnType<typeof ctx.db.get>> = await ctx.db.get(currentId)
          if (!parent) break
          currentId = parent.parentWorkspaceId
          depth++
        }
        
        if (depth >= MAX_DEPTH) {
          issues.push({
            workspaceId: ws._id,
            name: ws.name,
            issue: `Hierarchy too deep (> ${MAX_DEPTH} levels)`,
          })
        }
      }
    }
    
    return {
      totalWorkspaces: workspaces.length,
      issueCount: issues.length,
      issues,
    }
  },
})

// ============================================================================
// Internal Mutations
// ============================================================================

/**
 * Create Main Workspace for a user (called during user creation)
 */
export const createMainWorkspace = internalMutation({
  args: {
    userId: v.id("users"),
    userName: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if main workspace already exists
    const existing = await ctx.db
      .query("workspaces")
      .withIndex("by_creator_main", (q) => 
        q.eq("createdBy", args.userId).eq("isMainWorkspace", true)
      )
      .first()
    
    if (existing) {
      return existing._id
    }
    
    // Create main workspace
    const workspaceId = await ctx.db.insert("workspaces", {
      name: `${args.userName}'s Space`,
      slug: `main-${args.userName.toLowerCase().replace(/[^a-z0-9]/g, "")}-${Date.now()}`,
      description: "Your personal command center for all workspaces",
      type: "personal",
      isPublic: false,
      isMainWorkspace: true,
      depth: 0,
      path: [],
      shareDataToParent: false, // Main workspace has no parent
      color: "#6366f1", // Default indigo color
      settings: {
        allowInvites: false,
        allowGuestOnly: true,
        requireApproval: true,
      },
      createdBy: args.userId,
    })
    
    // Create owner role
    const ownerRoleId = await ctx.db.insert("roles", {
      workspaceId,
      name: "Owner",
      slug: "owner",
      description: "Full access to workspace",
      level: 0,
      permissions: ["*"],
      isDefault: true,
      isSystemRole: true,
      createdBy: args.userId,
      updatedBy: args.userId,
    })
    
    // Create owner membership
    await ctx.db.insert("workspaceMemberships", {
      workspaceId,
      userId: args.userId,
      roleId: ownerRoleId,
      roleLevel: 0,
      status: "active",
      additionalPermissions: [],
      joinedAt: Date.now(),
    })
    
    // Update workspace with default role
    await ctx.db.patch(workspaceId, {
      settings: {
        allowInvites: false,
        allowGuestOnly: true,
        requireApproval: true,
        defaultRoleId: ownerRoleId,
      },
    })
    
    return workspaceId
  },
})

/**
 * Migrate existing workspace to be under Main Workspace
 */
export const migrateWorkspaceToHierarchy = internalMutation({
  args: {
    workspaceId: v.id("workspaces"),
    mainWorkspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const workspace = await ctx.db.get(args.workspaceId)
    if (!workspace) return false
    
    // Skip if already has parent or is main workspace
    if (workspace.parentWorkspaceId || workspace.isMainWorkspace) {
      return false
    }
    
    const mainWorkspace = await ctx.db.get(args.mainWorkspaceId)
    if (!mainWorkspace) return false
    
    // Set main workspace as parent
    await ctx.db.patch(args.workspaceId, {
      parentWorkspaceId: args.mainWorkspaceId,
      depth: 1,
      path: [args.mainWorkspaceId],
      shareDataToParent: true, // Default to sharing for owned workspaces
    })
    
    return true
  },
})

// ============================================================================
// Helpers
// ============================================================================

const MAX_HIERARCHY_DEPTH = 20 // Prevent infinite loops and keep hierarchy manageable

/**
 * Check if linking child to parent would create a circular reference
 * 
 * A cycle would occur if:
 * 1. parentId === childId (self-reference)
 * 2. childId is an ancestor of parentId (making parent a child of its own descendant)
 */
async function checkCircularReference(
  ctx: any,
  parentId: Id<"workspaces">,
  childId: Id<"workspaces">
): Promise<boolean> {
  // Self-reference check
  if (String(parentId) === String(childId)) return true
  
  // Check if childId is an ancestor of parentId
  // We traverse UP from parentId, if we find childId, it's circular
  const visited = new Set<string>()
  let currentId: Id<"workspaces"> | undefined = parentId
  let depth = 0
  
  while (currentId && depth < MAX_HIERARCHY_DEPTH) {
    if (visited.has(String(currentId))) {
      // Already visited = cycle detected
      return true
    }
    visited.add(String(currentId))
    
    const workspace: Awaited<ReturnType<typeof ctx.db.get>> = await ctx.db.get(currentId)
    if (!workspace) break
    
    // If parent's ancestor is the child, linking would create cycle
    if (workspace.parentWorkspaceId) {
      if (String(workspace.parentWorkspaceId) === String(childId)) {
        return true
      }
      currentId = workspace.parentWorkspaceId
    } else {
      break
    }
    
    depth++
  }
  
  return false
}

/**
 * Recursively update children's paths after a parent move
 */
async function updateChildrenPaths(
  ctx: any,
  workspaceId: Id<"workspaces">,
  newPath: Id<"workspaces">[],
  newDepth: number
): Promise<void> {
  const children = await ctx.db
    .query("workspaces")
    .withIndex("by_parent", (q: any) => q.eq("parentWorkspaceId", workspaceId))
    .collect()
  
  for (const child of children) {
    await ctx.db.patch(child._id, {
      path: newPath,
      depth: newDepth,
    })
    
    // Recursively update grandchildren
    await updateChildrenPaths(ctx, child._id, [...newPath, child._id], newDepth + 1)
  }
}
