// @ts-nocheck - Bypass type checking due to Convex generated API type instantiation depth limits
import { v } from "convex/values"
import { query, mutation, action, internalMutation } from "../../_generated/server"
import { api, internal } from "../../_generated/api"
import type { Id } from "../../_generated/dataModel"
import { requirePermission, requireActiveMembership, resolveCandidateUserIds } from "../../auth/helpers"
import { PERMS } from "../../workspace/permissions"

type FeatureVisibilityType = "default" | "system" | "optional"

type FeatureStatus = "stable" | "beta" | "development" | "experimental" | "deprecated"

function normalizeFeatureStatus(status: string | undefined): FeatureStatus | undefined {
  switch (status) {
    case "stable":
    case "beta":
    case "development":
    case "experimental":
    case "deprecated":
      return status
    default:
      return undefined
  }
}

const SYSTEM_PERMISSION_KEY = "MANAGE_WORKSPACE"
const SYSTEM_PERMISSION_VALUE =
  (PERMS as Record<string, string>)[SYSTEM_PERMISSION_KEY as keyof typeof PERMS] ?? "manage_workspace"

function normalizePermissionKey(permKey?: string): string | undefined {
  if (!permKey) return undefined
  const permsRecord = PERMS as Record<string, string>
  const upper = permKey.toUpperCase()
  return permsRecord[upper as keyof typeof PERMS] ?? permKey
}

function isFeatureDisabledByAccess(access: any | null | undefined): boolean {
  if (!access) return false
  if (access.accessLevel === "disabled") return true
  if (access.configOverrides?.enabled === false) return true
  return false
}

function isFeatureEnabledByAccess(access: any | null | undefined): boolean {
  if (!access) return false
  if (access.accessLevel === "disabled") return false
  if (access.configOverrides?.enabled === false) return false
  if (access.configOverrides?.enabled === true) return true
  return access.accessLevel === "owner" || access.accessLevel === "admin" || access.accessLevel === "user"
}

async function getRoleIdsForPermission(ctx: any, workspaceId: Id<"workspaces">, permKey?: string) {
  const resolved = normalizePermissionKey(permKey)
  if (!resolved) return []

  const roles = await ctx.db
    .query("roles")
    .withIndex("by_workspace", (q: any) => q.eq("workspaceId", workspaceId))
    .collect()

  return roles
    .filter((role: any) => {
      const permissions: string[] = role.permissions || []
      return permissions.includes("*") || permissions.includes(resolved)
    })
    .map((role: any) => role._id)
}

import { DEFAULT_MENU_ITEMS } from "./menu_manifest_data"
import { OPTIONAL_FEATURES_CATALOG } from "./optional_features_catalog"

// Helper to get roles with a given permission for a workspace
async function getRolesWithPermission(ctx: any, workspaceId: Id<"workspaces">, permKey?: string) {
  const permissionValue = normalizePermissionKey(permKey)
  if (!permissionValue) return []
  
  const roles = await ctx.db
    .query("roles")
    .withIndex("by_workspace", (q: any) => q.eq("workspaceId", workspaceId))
    .collect()
  
  return roles
    .filter((role: any) => {
      const permissions = role.permissions || []
      return permissions.includes("*") || permissions.includes(permissionValue)
    })
    .map((role: any) => role._id)
}

// Get workspace menu items - merges database items with manifest for SSOT
export const getWorkspaceMenuItems = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    let membership: any = null
    try {
      const res = await requireActiveMembership(ctx, args.workspaceId)
      membership = res.membership
    } catch {
      return [] as any
    }

    // Resolve effective menu set for this user within the workspace
    let effectiveMenuSetId: any = null
    try {
      const candidateIds = await resolveCandidateUserIds(ctx)
      for (const idStr of candidateIds) {
        const userAssignments = await ctx.db
          .query("userMenuAssignments")
          .withIndex("by_user", (q) => q.eq("userId", idStr as any))
          .collect()
        // Prefer workspace-scoped default
        const wsDefault = userAssignments.find(
          (a: any) =>
            a.scope === "workspace" && String(a.workspaceId || "") === String(args.workspaceId) && a.isDefault,
        )
        if (wsDefault) {
          effectiveMenuSetId = wsDefault.menuSetId
          break
        }
        // Then prefer any workspace-scoped assignment
        const wsAny = userAssignments.find(
          (a: any) => a.scope === "workspace" && String(a.workspaceId || "") === String(args.workspaceId),
        )
        if (wsAny) {
          effectiveMenuSetId = wsAny.menuSetId
          break
        }
        // Then global default
        const globalDefault = userAssignments.find((a: any) => a.scope === "global" && a.isDefault)
        if (globalDefault) {
          effectiveMenuSetId = globalDefault.menuSetId
          break
        }
      }
      if (!effectiveMenuSetId) {
        const wsAssignedDefault = await ctx.db
          .query("workspaceMenuAssignments")
          .withIndex("by_workspace_default", (q) => q.eq("workspaceId", args.workspaceId).eq("isDefault", true))
          .first()
        if (wsAssignedDefault) effectiveMenuSetId = wsAssignedDefault.menuSetId
      }
    } catch (_err) {}

    // Get all menu items for the effective scope
    let menuItems: any[] = []
    if (effectiveMenuSetId) {
      menuItems = await ctx.db
        .query("menuItems")
        .withIndex("by_menuSet", (q) => q.eq("menuSetId", effectiveMenuSetId))
        .filter((q) => q.eq(q.field("isVisible"), true))
        .collect()
    } else {
      // Back-compat: workspace-scoped menu items
      menuItems = await ctx.db
        .query("menuItems")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
        .filter((q) => q.eq(q.field("isVisible"), true))
        .collect()
    }

    // === SSOT: Feature/menu visibility is controlled by:
    // 1) DEFAULT_MENU_ITEMS manifest for default/system features
    // 2) systemFeatures table (platform admin) if present
    // 3) OPTIONAL_FEATURES_CATALOG fallback if systemFeatures is not seeded
    // 4) featureAccess table for per-workspace enable/disable overrides

    const manifestBySlug = new Map(DEFAULT_MENU_ITEMS.map((m: any) => [m.slug, m]))
    const manifestSlugs = new Set(manifestBySlug.keys())

    const systemFeatures = await ctx.db.query("systemFeatures").collect()
    const hasSystemRegistry = systemFeatures.length > 0
    const systemById = new Map(systemFeatures.map((f: any) => [f.featureId, f]))

    const optionalFallbackSlugs = new Set(OPTIONAL_FEATURES_CATALOG.map((f: any) => f.slug))
    const optionalSlugs = hasSystemRegistry
      ? new Set(Array.from(systemById.values()).filter((f: any) => f.featureType === "optional").map((f: any) => f.featureId))
      : optionalFallbackSlugs

    const featureAccess = await ctx.db
      .query("featureAccess")
      .withIndex("by_workspace", (q: any) => q.eq("workspaceId", args.workspaceId))
      .collect()
    const accessByFeatureId = new Map(featureAccess.map((a: any) => [a.featureId, a]))

    const systemAllows = (featureId: string, featureType?: string) => {
      if (!hasSystemRegistry) return true
      const sys = systemById.get(featureId)
      if (!sys) {
        // If the platform registry exists but doesn't include this feature:
        // - allow default/system features if they still exist in the code manifest
        // - treat optional features as removed from the platform catalog
        return featureType === "default" || featureType === "system"
      }
      if (sys.isEnabled === false) return false
      if (sys.status === "disabled") return false
      return true
    }

    const isFeatureMenuCandidate = (item: any) => {
      const slug = String(item?.slug ?? "")
      return Boolean(item?.metadata?.featureType) || manifestSlugs.has(slug) || optionalSlugs.has(slug)
    }

    const isFeatureMenuAllowed = (item: any) => {
      const slug = String(item?.slug ?? "")
      const manifestItem = manifestBySlug.get(slug)
      const inferredType =
        item?.metadata?.featureType ??
        item?.metadata?.originalFeatureType ??
        manifestItem?.metadata?.featureType ??
        (optionalSlugs.has(slug) ? "optional" : undefined)

      const access = accessByFeatureId.get(slug)

      if (inferredType === "default" || inferredType === "system") {
        // Must still exist in code manifest; can be explicitly disabled via admin overrides.
        if (!manifestSlugs.has(slug)) return false
        if (!systemAllows(slug, inferredType)) return false
        if (isFeatureDisabledByAccess(access)) return false
        return true
      }

      if (inferredType === "optional") {
        // Optional features are admin-controlled; if the platform registry exists, it is authoritative.
        if (!optionalSlugs.has(slug)) return false
        if (!systemAllows(slug, inferredType)) return false
        // If there is an explicit per-workspace access record, respect it.
        // If there is no record, keep backward-compat with existing installed menu items.
        if (access) return isFeatureEnabledByAccess(access)
        return true
      }

      // Unknown type: if it's not in manifest or optional catalog, treat as stale feature and hide.
      if (manifestSlugs.has(slug)) return systemAllows(slug, "default") && !isFeatureDisabledByAccess(access)
      if (optionalSlugs.has(slug)) return systemAllows(slug, "optional") && (access ? isFeatureEnabledByAccess(access) : true)
      return false
    }

    // Remove stale/disabled feature menu items from the response.
    // (We do not delete DB rows here; we just stop showing them to users.)
    menuItems = menuItems.filter((item) => {
      if (!isFeatureMenuCandidate(item)) return true
      return isFeatureMenuAllowed(item)
    })

    // === SSOT: Merge missing default/system features from manifest ===
    // This ensures new features appear immediately without requiring a sync
    const dbSlugs = new Set(menuItems.map((item) => item.slug))
    
    // Build catalog lookup for optional features
    const catalogBySlug = new Map(
      OPTIONAL_FEATURES_CATALOG.map((f) => [f.slug, f])
    )
    
    // Get roles for permission checking
    const allRoles = await ctx.db
      .query("roles")
      .withIndex("by_workspace", (q: any) => q.eq("workspaceId", args.workspaceId))
      .collect()
    
    const getVisibleRoleIds = (permKey?: string) => {
      const permissionValue = normalizePermissionKey(permKey)
      if (!permissionValue) return []
      return allRoles
        .filter((role: any) => {
          const permissions = role.permissions || []
          return permissions.includes("*") || permissions.includes(permissionValue)
        })
        .map((role: any) => role._id)
    }
    
    // === SSOT: Update existing optional features with latest catalog values ===
    // This ensures isReady and status are always current from catalog
    menuItems = menuItems.map((item) => {
      const catalogFeature = catalogBySlug.get(item.slug)
      if (catalogFeature && item.metadata?.featureType === "optional") {
        return {
          ...item,
          metadata: {
            ...item.metadata,
            isReady: catalogFeature.isReady,
            status: catalogFeature.status,
          },
        }
      }
      return item
    })
    
    // Add missing default/system features from manifest (respect platform/admin disabling)
    for (const manifestItem of DEFAULT_MENU_ITEMS) {
      if (!dbSlugs.has(manifestItem.slug)) {
        // Only include default and system features (not optional)
        const featureType = manifestItem.metadata?.featureType
        if (featureType === "default" || featureType === "system") {
          if (!systemAllows(manifestItem.slug, featureType)) continue
          const access = accessByFeatureId.get(manifestItem.slug)
          if (isFeatureDisabledByAccess(access)) continue
          const visibleForRoleIds = getVisibleRoleIds(manifestItem.requiresPermission)
          
          // Create a virtual menu item from manifest
          menuItems.push({
            _id: `manifest:${manifestItem.slug}` as any, // Virtual ID
            workspaceId: args.workspaceId,
            name: manifestItem.name,
            slug: manifestItem.slug,
            type: manifestItem.type,
            icon: manifestItem.icon,
            path: manifestItem.path,
            component: manifestItem.component,
            order: manifestItem.order,
            isVisible: true,
            visibleForRoleIds,
            metadata: manifestItem.metadata,
            _fromManifest: true, // Mark as from manifest (not persisted)
          })
        }
      }
    }

    // Filter menu items based on user role permissions
    const visibleMenuItems = menuItems.filter((item) => {
      if (item.visibleForRoleIds.length === 0) return true // Visible to all if no specific roles
      return item.visibleForRoleIds.includes(membership.roleId)
    })

    // Sort by order
    return visibleMenuItems.sort((a, b) => a.order - b.order)
  },
})

// Get single menu item
export const getMenuItem = query({
  args: { menuItemId: v.id("menuItems") },
  handler: async (ctx, args) => {
    const menuItem = await ctx.db.get(args.menuItemId)
    if (!menuItem) return null
    try {
      await requireActiveMembership(ctx, menuItem.workspaceId)
    } catch {
      return null as any
    }

    return menuItem
  },
})

// Get menu item by slug within a workspace (with access validation)
export const getMenuItemBySlug = query({
  args: { workspaceId: v.id("workspaces"), slug: v.string() },
  handler: async (ctx, args) => {
    let membership: any = null
    try {
      const res = await requireActiveMembership(ctx, args.workspaceId)
      membership = res.membership
    } catch {
      return null as any
    }

    // Resolve effective menu set (see getWorkspaceMenuItems)
    let effectiveMenuSetId: any = null
    try {
      const candidateIds = await resolveCandidateUserIds(ctx)
      for (const idStr of candidateIds) {
        const userAssignments = await ctx.db
          .query("userMenuAssignments")
          .withIndex("by_user", (q) => q.eq("userId", idStr as any))
          .collect()
        const wsDefault = userAssignments.find(
          (a: any) =>
            a.scope === "workspace" && String(a.workspaceId || "") === String(args.workspaceId) && a.isDefault,
        )
        if (wsDefault) {
          effectiveMenuSetId = wsDefault.menuSetId
          break
        }
        const wsAny = userAssignments.find(
          (a: any) => a.scope === "workspace" && String(a.workspaceId || "") === String(args.workspaceId),
        )
        if (wsAny) {
          effectiveMenuSetId = wsAny.menuSetId
          break
        }
        const globalDefault = userAssignments.find((a: any) => a.scope === "global" && a.isDefault)
        if (globalDefault) {
          effectiveMenuSetId = globalDefault.menuSetId
          break
        }
      }
      if (!effectiveMenuSetId) {
        const wsAssignedDefault = await ctx.db
          .query("workspaceMenuAssignments")
          .withIndex("by_workspace_default", (q) => q.eq("workspaceId", args.workspaceId).eq("isDefault", true))
          .first()
        if (wsAssignedDefault) effectiveMenuSetId = wsAssignedDefault.menuSetId
      }
    } catch (_err) {}

    let items: any[] = []
    if (effectiveMenuSetId) {
      items = await ctx.db
        .query("menuItems")
        .withIndex("by_menuSet", (q) => q.eq("menuSetId", effectiveMenuSetId))
        .filter((q) => q.and(q.eq(q.field("slug"), args.slug), q.eq(q.field("isVisible"), true)))
        .collect()
    } else {
      // Back-compat: workspace-scoped
      items = await ctx.db
        .query("menuItems")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
        .filter((q) => q.and(q.eq(q.field("slug"), args.slug), q.eq(q.field("isVisible"), true)))
        .collect()
    }

    const item = items[0] || null
    if (!item) return null

    // Enforce SSOT feature visibility (same rules as getWorkspaceMenuItems)
    const manifestBySlug = new Map(DEFAULT_MENU_ITEMS.map((m: any) => [m.slug, m]))
    const manifestSlugs = new Set(manifestBySlug.keys())

    const systemFeatures = await ctx.db.query("systemFeatures").collect()
    const hasSystemRegistry = systemFeatures.length > 0
    const systemById = new Map(systemFeatures.map((f: any) => [f.featureId, f]))

    const optionalFallbackSlugs = new Set(OPTIONAL_FEATURES_CATALOG.map((f: any) => f.slug))
    const optionalSlugs = hasSystemRegistry
      ? new Set(Array.from(systemById.values()).filter((f: any) => f.featureType === "optional").map((f: any) => f.featureId))
      : optionalFallbackSlugs

    const access = await ctx.db
      .query("featureAccess")
      .withIndex("by_feature_workspace", (q: any) => q.eq("featureId", args.slug).eq("workspaceId", args.workspaceId))
      .first()

    const systemAllows = (featureId: string, featureType?: string) => {
      if (!hasSystemRegistry) return true
      const sys = systemById.get(featureId)
      if (!sys) {
        return featureType === "default" || featureType === "system"
      }
      if (sys.isEnabled === false) return false
      if (sys.status === "disabled") return false
      return true
    }

    const manifestItem = manifestBySlug.get(args.slug)
    const inferredType =
      item?.metadata?.featureType ??
      item?.metadata?.originalFeatureType ??
      manifestItem?.metadata?.featureType ??
      (optionalSlugs.has(args.slug) ? "optional" : undefined)

    const isCandidate = Boolean(inferredType) || manifestSlugs.has(args.slug) || optionalSlugs.has(args.slug)
    if (isCandidate) {
      if (inferredType === "default" || inferredType === "system") {
        if (!manifestSlugs.has(args.slug)) return null as any
        if (!systemAllows(args.slug, inferredType)) return null as any
        if (isFeatureDisabledByAccess(access)) return null as any
      } else if (inferredType === "optional") {
        if (!optionalSlugs.has(args.slug)) return null as any
        if (!systemAllows(args.slug, inferredType)) return null as any
        if (access && !isFeatureEnabledByAccess(access)) return null as any
      } else {
        // Unknown feature-type candidate: hide if not known.
        if (!manifestSlugs.has(args.slug) && !optionalSlugs.has(args.slug)) return null as any
      }
    }

    // Role-based visibility (if configured)
    if (item.visibleForRoleIds.length > 0 && !item.visibleForRoleIds.includes(membership.roleId)) {
      return null as any
    }

    return item
  },
})

// Create default menu items for a workspace based on manifest
// INTERNAL MUTATION: Called from server context (createWorkspace, resetWorkspace)
// Does not require auth - actorUserId passed from caller (workspace owner)
export const createDefaultMenuItems = internalMutation({
  args: {
    workspaceId: v.id("workspaces"),
    selectedSlugs: v.optional(v.array(v.string())),
    actorUserId: v.optional(v.id("users")), // Passed from createWorkspace (owner)
  },
  handler: async (ctx, args) => {
    // Internal mutation - no auth check needed (server-safe)
    // actorUserId is the workspace creator/owner
    const userId = args.actorUserId

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const part1 = parts1[i] || 0
    const part2 = parts2[i] || 0

    if (part1 > part2) return 1
    if (part1 < part2) return -1
  }

  return 0
}

// Update menu item
export const updateMenuItem = mutation({
  args: {
    menuItemId: v.id("menuItems"),
    name: v.optional(v.string()),
    slug: v.optional(v.string()),
    type: v.optional(
      v.union(
        v.literal("folder"),
        v.literal("group"),
        v.literal("route"),
        v.literal("divider"),
        v.literal("action"),
        v.literal("chat"),
        v.literal("document"),
      ),
    ),
    icon: v.optional(v.string()),
    path: v.optional(v.string()),
    component: v.optional(v.string()),
    isVisible: v.optional(v.boolean()),
    order: v.optional(v.number()),
    parentId: v.optional(v.union(v.id("menuItems"), v.null())),
    visibleForRoleIds: v.optional(v.array(v.id("roles"))),
    metadata: v.optional(
      v.object({
        description: v.optional(v.string()),
        badge: v.optional(v.string()),
        color: v.optional(v.string()),
        targetId: v.optional(v.string()),
        jsonPlaceholder: v.optional(v.object({})),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const menuItem = await ctx.db.get(args.menuItemId)
    if (!menuItem) throw new Error("Menu item not found")
    await requirePermission(ctx, menuItem.workspaceId, PERMS.MANAGE_MENUS)

    const updates: any = {}
    if (args.name !== undefined) updates.name = args.name
    if (args.slug !== undefined) updates.slug = args.slug
    if (args.type !== undefined) updates.type = args.type
    if (args.icon !== undefined) updates.icon = args.icon
    if (args.path !== undefined) updates.path = args.path
    if (args.component !== undefined) updates.component = args.component
    if (args.isVisible !== undefined) updates.isVisible = args.isVisible
    if (args.order !== undefined) updates.order = args.order
    if (Object.prototype.hasOwnProperty.call(args, "parentId")) updates.parentId = args.parentId ?? undefined
    if (args.visibleForRoleIds !== undefined) updates.visibleForRoleIds = args.visibleForRoleIds
    if (args.metadata !== undefined) updates.metadata = args.metadata

    await ctx.db.patch(args.menuItemId, updates)
    return args.menuItemId
  },
})

export const setMenuItemFeatureType = mutation({
  args: {
    menuItemId: v.id("menuItems"),
    featureType: v.union(v.literal("default"), v.literal("system"), v.literal("optional")),
  },
  handler: async (ctx, args) => {
    const menuItem = await ctx.db.get(args.menuItemId)
    if (!menuItem) throw new Error("Menu item not found")

    await requirePermission(ctx, menuItem.workspaceId, PERMS.MANAGE_MENUS)

    const metadata: any = { ...(menuItem.metadata ?? {}) }
    const originalFeatureType: FeatureVisibilityType =
      (metadata.originalFeatureType as FeatureVisibilityType | undefined) ??
      (metadata.featureType as FeatureVisibilityType | undefined) ??
      "default"

    if (!metadata.originalFeatureType) {
      metadata.originalFeatureType = originalFeatureType
    }

    const targetFeatureType = args.featureType as FeatureVisibilityType
    metadata.featureType = targetFeatureType

    const originalPermission = metadata.originalRequiresPermission ?? metadata.requiresPermission
    const visibilityPermission =
      targetFeatureType === "system" ? SYSTEM_PERMISSION_KEY : originalPermission

    const visibleForRoleIds = await getRoleIdsForPermission(
      ctx,
      menuItem.workspaceId,
      visibilityPermission,
    )

    const updates: any = {
      metadata,
      visibleForRoleIds,
    }

    await ctx.db.patch(args.menuItemId, updates)

    return {
      menuItemId: args.menuItemId,
      featureType: metadata.featureType,
      visibleForRoleIds,
    }
  },
})

// Create menu item
export const createMenuItem = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    parentId: v.optional(v.union(v.id("menuItems"), v.null())),
    name: v.string(),
    slug: v.string(),
    type: v.union(
      v.literal("folder"),
      v.literal("group"),
      v.literal("route"),
      v.literal("divider"),
      v.literal("action"),
      v.literal("chat"),
      v.literal("document"),
    ),
    icon: v.optional(v.string()),
    path: v.optional(v.string()),
    component: v.optional(v.string()),
    order: v.optional(v.number()),
    isVisible: v.optional(v.boolean()),
    visibleForRoleIds: v.optional(v.array(v.id("roles"))),
    metadata: v.optional(
      v.object({
        description: v.optional(v.string()),
        badge: v.optional(v.string()),
        color: v.optional(v.string()),
        targetId: v.optional(v.string()),
        jsonPlaceholder: v.optional(v.object({})),
      }),
    ),
  },
  handler: async (ctx, args) => {
    // Require permission
    const { membership } = await requirePermission(ctx, args.workspaceId, PERMS.MANAGE_MENUS)

    // Get next order number if not provided
    let order = args.order
    if (order === undefined) {
      const existingItems = await ctx.db
        .query("menuItems")
        .withIndex("by_workspace_parent", (q) => q.eq("workspaceId", args.workspaceId).eq("parentId", args.parentId ?? undefined))
        .collect()
      order = existingItems.length
    }

    return await ctx.db.insert("menuItems", {
      workspaceId: args.workspaceId,
      parentId: args.parentId ?? undefined,
      name: args.name,
      slug: args.slug,
      type: args.type,
      icon: args.icon,
      path: args.path,
      component: args.component,
      order,
      isVisible: args.isVisible ?? true,
      visibleForRoleIds: args.visibleForRoleIds ?? [],
      metadata: args.metadata,
      createdBy: membership?.userId as any,
    })
  },
})

export const syncWorkspaceDefaultMenus = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    featureSlugs: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    try {
      const { membership } = await requirePermission(ctx, args.workspaceId, PERMS.MANAGE_MENUS)
      await ctx.runMutation(internal.features.menus.menuItems.createDefaultMenuItems, {
        workspaceId: args.workspaceId,
        actorUserId: membership?.userId,
        selectedSlugs: args.featureSlugs ?? undefined,
      })
      return true as const
    } catch (error) {
      // If user doesn't have permission, just return false instead of throwing
      // This prevents the app from crashing if a regular user triggers this sync
