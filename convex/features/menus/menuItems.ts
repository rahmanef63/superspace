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

export interface FeatureManifestItem {
  slug: string;
  name: string;
  description?: string;
  icon?: string;
  version?: string;
  category?: string;
  featureType?: string;
  tags?: string[];
  status?: string;
  isReady?: boolean;
  expectedRelease?: string;
  type?: string;
  path?: string;
  component?: string;
}

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
    } catch (_err) { }

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

// Get available feature menus (features that can be added to a workspace menu)
// Only returns features NOT already installed in the workspace
export const getAvailableFeatureMenus = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    // Get the workspace's default menu set
    const wsAssignment = await ctx.db
      .query("workspaceMenuAssignments")
      .withIndex("by_workspace_default", (q: any) => q.eq("workspaceId", args.workspaceId).eq("isDefault", true))
      .first()
    const menuSetId = wsAssignment?.menuSetId

    // Get currently installed menu items - check BOTH menuSetId and workspaceId for compatibility
    let installedMenuItems: any[] = []

    if (menuSetId) {
      installedMenuItems = await ctx.db
        .query("menuItems")
        .withIndex("by_menuSet", (q: any) => q.eq("menuSetId", menuSetId))
        .collect()
    }

    // Also check by workspaceId (back-compat for old items without menuSetId)
    const wsItems = await ctx.db
      .query("menuItems")
      .withIndex("by_workspace", (q: any) => q.eq("workspaceId", args.workspaceId))
      .collect()

    // Merge and dedupe by slug
    const allInstalled = [...installedMenuItems, ...wsItems]
    const installedSlugs = new Set(allInstalled.map(item => item.slug))

    // Combine default features from manifest with optional features catalog
    const allFeatures = [
      ...DEFAULT_MENU_ITEMS.map((item) => {
        const metadata = ((item as any).metadata ?? {}) as Record<string, any>
        return {
          slug: item.slug,
          name: item.name,
          description: (item as any).description ?? metadata.description ?? "",
          icon: item.icon ?? "Box",
          version: (item as any).version ?? metadata.version,
          category: (item as any).category ?? metadata.category,
          featureType: (item as any).featureType ?? metadata.featureType,
          tags: (item as any).tags ?? metadata.tags ?? [],
          status: normalizeFeatureStatus((item as any).status ?? metadata.status) ?? "stable" as const,
          isReady: (item as any).isReady ?? metadata.isReady ?? true,
          expectedRelease: (item as any).expectedRelease ?? metadata.expectedRelease,
        }
      }),
      ...OPTIONAL_FEATURES_CATALOG.map((item) => ({
        slug: item.slug,
        name: item.name,
        description: item.description ?? "",
        icon: item.icon ?? "Box",
        version: item.version,
        category: item.category,
        featureType: "optional" as const,
        tags: item.tags ?? [],
        status: normalizeFeatureStatus(item.status) ?? "stable" as const,
        isReady: item.isReady ?? true,
        expectedRelease: (item as FeatureManifestItem).expectedRelease,
      })),
    ]

    // Dedupe by slug (prefer first occurrence) AND filter out already installed features
    const seen = new Set<string>()
    return allFeatures.filter((f) => {
      // Skip if already seen (dedupe)
      if (seen.has(f.slug)) return false
      seen.add(f.slug)
      // Skip if already installed in this workspace
      if (installedSlugs.has(f.slug)) return false
      return true
    })
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
    } catch (_err) { }

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

    // Placeholder implementation to fix syntax error

    return true;
  },
})

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
      return false as const
    }
  },
})

// Cron job handler: Syncs default menus for all workspaces to ensure manifest updates propagate
export const syncAllWorkspaceMenus = internalMutation({
  args: {},
  handler: async (ctx) => {
    // 1. Get all workspaces
    const workspaces = await ctx.db.query("workspaces").collect()

    // 2. For each workspace, sync default menu items
    // We use Promise.all to run them in parallel (up to limits)
    // For very large datasets, this might need to be an action iterating batches
    await Promise.all(
      workspaces.map(async (workspace) => {
        // Use ctx.runMutation to call the internal mutation (Convex best practice)
        // Note: We skip the actorUserId as this is a system-triggered sync
        await ctx.runMutation(internal.features.menus.menuItems.createDefaultMenuItems, {
          workspaceId: workspace._id,
          actorUserId: undefined,
          selectedSlugs: undefined,
        })
      })
    )

    console.log(`Synced menus for ${workspaces.length} workspaces`)
  },
})

// Get menu items that have updates available (version mismatch with manifest)
export const getMenuUpdates = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    // Get all menu items for this workspace
    const menuItems = await ctx.db
      .query("menuItems")
      .withIndex("by_workspace", (q: any) => q.eq("workspaceId", args.workspaceId))
      .collect()

    const updates: Array<{
      menuItemId: Id<"menuItems">
      currentVersion: string
      latestVersion: string
    }> = []

    // Check each menu item against the manifest
    for (const item of menuItems) {
      if (!item.slug) continue

      // Look up in DEFAULT_MENU_ITEMS
      const defaultItem = DEFAULT_MENU_ITEMS.find((d) => d.slug === item.slug) as FeatureManifestItem | undefined
      if (defaultItem && defaultItem.version) {
        const currentVersion = (item as any).version || "1.0.0"
        if (currentVersion !== defaultItem.version) {
          updates.push({
            menuItemId: item._id,
            currentVersion,
            latestVersion: defaultItem.version,
          })
        }
        continue
      }

      // Look up in OPTIONAL_FEATURES_CATALOG
      const optionalItem = OPTIONAL_FEATURES_CATALOG.find((o) => o.slug === item.slug) as FeatureManifestItem | undefined
      if (optionalItem && optionalItem.version) {
        const currentVersion = (item as any).version || "1.0.0"
        if (currentVersion !== optionalItem.version) {
          updates.push({
            menuItemId: item._id,
            currentVersion,
            latestVersion: optionalItem.version,
          })
        }
      }
    }

    return updates
  },
})

// Install feature menus for a workspace (public API for frontend)
export const installFeatureMenus = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    featureSlugs: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      const { membership } = await requirePermission(ctx, args.workspaceId, PERMS.MANAGE_MENUS)

      // Get the workspace's default menu set
      const wsAssignment = await ctx.db
        .query("workspaceMenuAssignments")
        .withIndex("by_workspace_default", (q: any) => q.eq("workspaceId", args.workspaceId).eq("isDefault", true))
        .first()
      const menuSetId = wsAssignment?.menuSetId

      // Get existing menu items for this workspace (check both menuSet and workspace indexes)
      let existingItems: any[] = []
      if (menuSetId) {
        existingItems = await ctx.db
          .query("menuItems")
          .withIndex("by_menuSet", (q: any) => q.eq("menuSetId", menuSetId))
          .collect()
      }
      // Also check workspace-scoped items (back-compat)
      const wsItems = await ctx.db
        .query("menuItems")
        .withIndex("by_workspace", (q: any) => q.eq("workspaceId", args.workspaceId))
        .collect()

      // Merge and dedupe
      const allItems = [...existingItems, ...wsItems]
      const existingSlugs = new Set(allItems.map((item: any) => item.slug).filter(Boolean))

      // Get max order for new items
      let maxOrder = allItems.reduce((max: number, item: any) => Math.max(max, item.order || 0), 0)

      // Install each feature
      for (const slug of args.featureSlugs) {
        if (existingSlugs.has(slug)) continue // Already installed

        // Look up in DEFAULT_MENU_ITEMS first
        let featureData = DEFAULT_MENU_ITEMS.find((d) => d.slug === slug) as FeatureManifestItem | undefined

        // If not found, look in OPTIONAL_FEATURES_CATALOG
        if (!featureData) {
          featureData = OPTIONAL_FEATURES_CATALOG.find((o) => o.slug === slug) as FeatureManifestItem | undefined
        }

        if (!featureData) continue // Feature not found in manifest

        maxOrder += 1
        const normalizedType:
          | "folder"
          | "group"
          | "route"
          | "divider"
          | "action"
          | "chat"
          | "document" =
          featureData.type === "folder" ||
            featureData.type === "group" ||
            featureData.type === "route" ||
            featureData.type === "divider" ||
            featureData.type === "action" ||
            featureData.type === "chat" ||
            featureData.type === "document"
            ? featureData.type
            : "route"

        await ctx.db.insert("menuItems", {
          workspaceId: args.workspaceId,
          menuSetId: menuSetId, // Include menuSetId so items are found by the query
          parentId: undefined,
          name: featureData.name || slug,
          slug: featureData.slug,
          type: normalizedType,
          icon: featureData.icon,
          path: featureData.path || `/${slug}`,
          component: featureData.component,
          order: maxOrder,
          isVisible: true,
          visibleForRoleIds: [],
          metadata: {
            version: featureData.version || "1.0.0",
            category: featureData.category,
            description: featureData.description,
            featureType: "optional", // Mark as optional for visibility rules
          },
          createdBy: membership?.userId as any,
        })

        existingSlugs.add(slug)
      }

      return { success: true, installed: args.featureSlugs.length }
    } catch (error) {
      console.error("Failed to install feature menus:", error)
      return { success: false, error: String(error) }
    }
  },
})

/**
 * Repair orphaned menu items that are missing menuSetId or have wrong menuSetId.
 * Uses the same index as getWorkspaceMenuItems to ensure consistency.
 */
export const repairOrphanedMenuItems = mutation({
  args: {},
  handler: async (ctx) => {
    const allItems = await ctx.db.query("menuItems").collect()

    let repaired = 0
    let skipped = 0

    for (const item of allItems) {
      if (!item.workspaceId) {
        skipped++
        continue
      }

      // Use the SAME index query as getWorkspaceMenuItems
      const wsAssignment = await ctx.db
        .query("workspaceMenuAssignments")
        .withIndex("by_workspace_default", (q: any) => q.eq("workspaceId", item.workspaceId).eq("isDefault", true))
        .first()

      if (!wsAssignment) {
        skipped++
        continue
      }

      const correctMenuSetId = wsAssignment.menuSetId

      // Fix if missing or mismatched
      if (!item.menuSetId || item.menuSetId !== correctMenuSetId) {
        await ctx.db.patch(item._id, { menuSetId: correctMenuSetId })
        repaired++
      }
    }

    return {
      totalItems: allItems.length,
      repaired,
      skipped,
      message: `Repaired ${repaired} menu items, skipped ${skipped} without workspace assignment`
    }
  },
})
