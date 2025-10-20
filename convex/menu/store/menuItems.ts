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
// Get workspace menu items
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

    // Role-based visibility (if configured)
    if (item.visibleForRoleIds.length > 0 && !item.visibleForRoleIds.includes(membership.roleId)) {
      return null as any
    }

    return item
  },
})

import { DEFAULT_MENU_ITEMS } from "./menu_manifest_data"
import { OPTIONAL_FEATURES_CATALOG } from "./optional_features_catalog"

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

    console.log("[v0] Creating default menu items for workspace:", args.workspaceId)

    // Ensure a default workspace-owned menu set exists and is assigned
    const defaultAssignment = await ctx.db
      .query("workspaceMenuAssignments")
      .withIndex("by_workspace_default", (q) => q.eq("workspaceId", args.workspaceId).eq("isDefault", true))
      .first()
    let menuSetId: any = defaultAssignment?.menuSetId
    if (!menuSetId) {
      menuSetId = await ctx.db.insert("menuSets", {
        ownerType: "workspace" as any,
        ownerWorkspaceId: args.workspaceId,
        ownerUserId: undefined,
        name: "Default",
        slug: "default",
        description: "Default workspace menu",
        isPublic: true,
        createdBy: userId,
      } as any)
      // Assign as default to workspace
      await ctx.db.insert("workspaceMenuAssignments", {
        workspaceId: args.workspaceId,
        menuSetId,
        isDefault: true,
        order: 0,
        createdAt: Date.now(),
      } as any)
    }

    // Get default menus from the single source of truth
    const defaultMenuItems = DEFAULT_MENU_ITEMS

    // Back-compat: migrate any existing workspace-scoped items into the default menu set
    const legacyWorkspaceItems = await ctx.db
      .query("menuItems")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect()
    const existingSetItems = await ctx.db
      .query("menuItems")
      .withIndex("by_menuSet", (q) => q.eq("menuSetId", menuSetId))
      .collect()
    const setSlugs = new Set(existingSetItems.map((i: any) => i.slug))
    const slugToId = new Map<string, any>()
    const slugToExisting = new Map<string, any>()
    existingSetItems.forEach((item: any) => {
      slugToId.set(item.slug, item._id)
      slugToExisting.set(item.slug, item)
    })
    for (const it of legacyWorkspaceItems) {
      if (setSlugs.has(it.slug)) continue
      const clonedId = await ctx.db.insert("menuItems", {
        workspaceId: args.workspaceId,
        menuSetId,
        parentId: it.parentId ?? undefined,
        name: it.name,
        slug: it.slug,
        type: it.type,
        icon: it.icon,
        path: it.path,
        component: it.component,
        order: it.order,
        isVisible: it.isVisible ?? true,
        visibleForRoleIds: it.visibleForRoleIds ?? [],
        metadata: it.metadata,
        createdBy: userId,
      } as any)
      setSlugs.add(it.slug)
      slugToId.set(it.slug, clonedId)
      slugToExisting.set(it.slug, { ...it, _id: clonedId })
    }

    const allRoles = await ctx.db
      .query("roles")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect()

    const permissionCache = new Map<string, any[]>()

    const resolveVisibleRoleIds = (permKey?: string) => {
      const permissionValue = normalizePermissionKey(permKey)
      if (!permissionValue) return []
      const cached = permissionCache.get(permissionValue)
      if (cached) return cached
      const visibleRoles = allRoles
        .filter((role: any) => {
          const permissions = role.permissions || []
          return permissions.includes("*") || permissions.includes(permissionValue)
        })
        .map((role: any) => role._id)
      permissionCache.set(permissionValue, visibleRoles)
      return visibleRoles
    }

    const hasSelection = Array.isArray(args.selectedSlugs) && args.selectedSlugs.length > 0
    const selectedSlugs = new Set((args.selectedSlugs ?? []).map((slug) => String(slug)))

    const hasSelectedDescendant = (item: any): boolean => {
      if (!hasSelection) return false
      if (!Array.isArray((item as any).children)) return false
      return (item as any).children.some((child: any) =>
        selectedSlugs.has(String(child.slug)) || hasSelectedDescendant(child),
      )
    }

    const menuItemIds: Id<"menuItems">[] = []

    const insertItemRecursive = async (item: any, parentId?: any, ancestorSelected = false) => {
      const slug = String(item.slug)
      const isExplicitlySelected = selectedSlugs.has(slug)
      const shouldInclude =
        !hasSelection || isExplicitlySelected || ancestorSelected || hasSelectedDescendant(item)

      if (!shouldInclude) return

      const visibleForRoleIds = resolveVisibleRoleIds((item as any).requiresPermission)
      let menuItemId = slugToId.get(slug)

      if (!menuItemId) {
        menuItemId = await ctx.db.insert("menuItems", {
          workspaceId: args.workspaceId,
          menuSetId,
          parentId: parentId ?? undefined,
          name: item.name,
          slug,
          type: item.type,
          icon: item.icon,
          path: item.path,
          component: item.component,
          order: item.order,
          isVisible: true,
          visibleForRoleIds,
          metadata: item.metadata,
          createdBy: userId,
        } as any)

        menuItemIds.push(menuItemId)
        setSlugs.add(slug)
        slugToId.set(slug, menuItemId)
        slugToExisting.set(slug, { ...item, _id: menuItemId })
      } else {
        const existingItem = slugToExisting.get(slug)
        if (existingItem) {
          const expectedParentId = parentId ?? undefined
          const updates: any = {}

          if (String(existingItem.parentId || "") !== String(expectedParentId || "")) {
            updates.parentId = expectedParentId
          }
          if ((existingItem.component || undefined) !== (item.component || undefined) && item.component) {
            updates.component = item.component
          }
          if (item.path && (!existingItem.path || existingItem.path.startsWith("/"))) {
            updates.path = item.path
          }
          if (item.metadata) {
            const existingMetadata = existingItem.metadata ?? {}
            const mergedMetadata: any = { ...existingMetadata }
            let metadataChanged = false

            const maybeSetMetadata = (key: string, value: any, overwrite = false) => {
              if (value === undefined) return
              if (overwrite || mergedMetadata[key] === undefined) {
                mergedMetadata[key] = value
                metadataChanged = true
              }
            }

            maybeSetMetadata("featureType", item.metadata.featureType)
            maybeSetMetadata("originalFeatureType", item.metadata.originalFeatureType)
            maybeSetMetadata("requiresPermission", item.metadata.requiresPermission)
            maybeSetMetadata("originalRequiresPermission", item.metadata.originalRequiresPermission)

            if (metadataChanged) {
              updates.metadata = mergedMetadata
            }
          }
          if (existingItem.isVisible === false) {
            updates.isVisible = true
          }
          const expectedRoles = visibleForRoleIds
          const existingRoles = Array.isArray(existingItem.visibleForRoleIds) ? existingItem.visibleForRoleIds : []
          const shouldSyncRoles = expectedRoles.length > 0 && (existingRoles.length !== expectedRoles.length || expectedRoles.some((r: any, idx: number) => String(r) !== String(existingRoles[idx])))
          if (shouldSyncRoles) {
            updates.visibleForRoleIds = expectedRoles
          }

          if (Object.keys(updates).length > 0) {
            await ctx.db.patch(menuItemId, updates)
            slugToExisting.set(slug, { ...existingItem, ...updates })
          }
        }
      }

      if (Array.isArray((item as any).children) && (item as any).children.length > 0) {
        for (const child of (item as any).children) {
          await insertItemRecursive(child, menuItemId, ancestorSelected || isExplicitlySelected)
        }
      }
    }

    for (const item of defaultMenuItems) {
      await insertItemRecursive(item)
    }

    console.log("[v0] Created menu items:", menuItemIds.length)
    return menuItemIds
  },
})

// Update or set a menu item's component mapping by slug (create if missing optional)
export const setMenuItemComponent = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    slug: v.string(),
    component: v.string(), // must match frontend manifest componentId
    createIfMissing: v.optional(v.boolean()),
    name: v.optional(v.string()),
    icon: v.optional(v.string()),
    order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { membership } = await requirePermission(ctx, args.workspaceId, PERMS.MANAGE_MENUS)
    const userId = membership?.userId

    const existing = await ctx.db
      .query("menuItems")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => q.eq(q.field("slug"), args.slug))
      .first()

    if (existing) {
      await ctx.db.patch(existing._id, { component: args.component })
      return existing._id
    }

    if (!args.createIfMissing) throw new Error("Menu item not found and createIfMissing is false")

    const def = DEFAULT_MENU_ITEMS.find((i) => i.slug === args.slug)
    return await ctx.db.insert("menuItems", {
      workspaceId: args.workspaceId,
      name: args.name ?? def?.name ?? args.slug,
      slug: args.slug,
      type: def?.type ?? ("route" as any),
      icon: args.icon ?? def?.icon,
      path: def?.path,
      component: args.component,
      order: args.order ?? def?.order ?? 0,
      isVisible: true,
      visibleForRoleIds: [], // Default to visible for all roles
      metadata: def?.metadata,
      createdBy: userId,
    })
  },
})

// List workspace routes resolved to componentId, merging DB with manifest defaults
export const listWorkspaceRoutesResolved = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    // Load DB menu items
    const dbItems = await ctx.db
      .query("menuItems")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect()

    const bySlug = new Map<string, any>(dbItems.map((i: any) => [i.slug, i]))
    const defaults = DEFAULT_MENU_ITEMS.map((d) => ({
      slug: d.slug,
      name: d.name,
      component: d.component,
      icon: d.icon,
      order: d.order,
      metadata: d.metadata,
      source: "default",
    }))
    const fromDb = dbItems.map((i: any) => ({
      slug: i.slug,
      name: i.name,
      component: i.component,
      icon: i.icon,
      order: i.order,
      metadata: i.metadata,
      source: "db",
    }))

    // Merge, preferring DB entries
    const merged: Array<any> = []
    const allSlugs = new Set<string>([...defaults.map((d) => d.slug), ...fromDb.map((d) => d.slug)])
    for (const slug of allSlugs) {
      const db = bySlug.get(slug)
      if (db) {
        merged.push(fromDb.find((d) => d.slug === slug))
      } else {
        merged.push(defaults.find((d) => d.slug === slug))
      }
    }

    return merged.sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  },
})

// List menu items that use a given componentId (many-to-many usage)
export const getComponentUsage = query({
  args: { workspaceId: v.id("workspaces"), component: v.string() },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("menuItems")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => q.eq(q.field("component"), args.component))
      .collect()
    return items
  },
})

// Action: Sync menu components ensuring they match known manifest components or defaults
export const syncMenuMappings = action({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const { runMutation, runQuery } = ctx
    // Build a set of known componentIds from defaults
    const known = new Set(DEFAULT_MENU_ITEMS.map((d) => d.component))

    const items = await runQuery((api as any)["menu/store/menuItems"].getWorkspaceMenuItems, { workspaceId: args.workspaceId })
    for (const item of items as any[]) {
      if (item?.component && !known.has(item.component)) {
        // Try to fallback by slug in defaults
        const def = DEFAULT_MENU_ITEMS.find((d) => d.slug === item.slug)
        if (def?.component) {
          await runMutation((api as any)["menu/store/menuItems"].setMenuItemComponent, {
            workspaceId: args.workspaceId,
            slug: item.slug,
            component: def.component,
          })
        }
      }
    }
    return true as const
  },
})

// Install or update feature menu items (like plugins) with version control
export const installFeatureMenus = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    featureSlugs: v.array(v.string()),
    forceUpdate: v.optional(v.boolean()), // Force update existing features
  },
  returns: v.array(v.id("menuItems")),
  handler: async (ctx, args) => {
    const { membership } = await requirePermission(ctx, args.workspaceId, PERMS.MANAGE_MENUS)
    const userId = membership?.userId

    // Build available features from OPTIONAL_FEATURES_CATALOG
    // We need to match the catalog features with their full menu definitions
    const catalogFeatureMap = new Map(
      OPTIONAL_FEATURES_CATALOG.map((f) => [f.slug, f])
    )

    // Map catalog features to full menu item definitions
    // For features not in DEFAULT_MENU_ITEMS, derive from catalog
    const availableFeatures = OPTIONAL_FEATURES_CATALOG.map((catalogFeature) => {
      // Try to find in DEFAULT_MENU_ITEMS for full definition
      const defaultFeature = DEFAULT_MENU_ITEMS.find((d) => d.slug === catalogFeature.slug)

      if (defaultFeature) {
        // Use default feature but mark as optional
        return {
          name: defaultFeature.name,
          slug: defaultFeature.slug,
          type: defaultFeature.type,
          icon: defaultFeature.icon,
          path: defaultFeature.path,
          component: defaultFeature.component,
          order: defaultFeature.order,
          version: catalogFeature.version,
          metadata: {
            description: catalogFeature.description,
            version: catalogFeature.version,
            category: catalogFeature.category,
            tags: catalogFeature.tags,
            status: catalogFeature.status as "development" | "stable" | "beta" | "experimental" | "deprecated" | undefined,
            isReady: catalogFeature.isReady,
            expectedRelease: catalogFeature.expectedRelease,
            lastUpdated: Date.now(),
            featureType: "optional" as const,
            originalFeatureType: "optional" as const,
            requiresPermission: catalogFeature.requiresPermission,
            originalRequiresPermission:
              catalogFeature.originalRequiresPermission ?? catalogFeature.requiresPermission,
          },
          requiresPermission: catalogFeature.requiresPermission,
        }
      } else {
        // Derive from catalog (for truly optional features)
        return {
          name: catalogFeature.name,
          slug: catalogFeature.slug,
          type: "route" as const,
          icon: catalogFeature.icon,
          path: `/dashboard/${catalogFeature.slug}`,
          component: `${catalogFeature.name.replace(/\s+/g, '')}Page`,
          order: 100, // Put at end by default
          version: catalogFeature.version,
          metadata: {
            description: catalogFeature.description,
            version: catalogFeature.version,
            category: catalogFeature.category,
            tags: catalogFeature.tags,
            status: catalogFeature.status as "development" | "stable" | "beta" | "experimental" | "deprecated" | undefined,
            isReady: catalogFeature.isReady,
            expectedRelease: catalogFeature.expectedRelease,
            lastUpdated: Date.now(),
            featureType: "optional" as const,
            originalFeatureType: "optional" as const,
            requiresPermission: catalogFeature.requiresPermission,
            originalRequiresPermission:
              catalogFeature.originalRequiresPermission ?? catalogFeature.requiresPermission,
          },
          requiresPermission: catalogFeature.requiresPermission,
        }
      }
    })

    // Get role permissions
    const allRoles = await ctx.db
      .query("roles")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect()

    const rolesCanManageMembers = allRoles
      .filter((r: any) => (r.permissions || []).includes("*") || (r.permissions || []).includes(PERMS.MANAGE_MEMBERS))
      .map((r: any) => r._id)

    const rolesCanManageMenus = allRoles
      .filter((r: any) => (r.permissions || []).includes("*") || (r.permissions || []).includes(PERMS.MANAGE_MENUS))
      .map((r: any) => r._id)

    const rolesCanManageInvitations = allRoles
      .filter(
        (r: any) => (r.permissions || []).includes("*") || (r.permissions || []).includes(PERMS.MANAGE_INVITATIONS),
      )
      .map((r: any) => r._id)

    // Resolve workspace default menu set (if any)
    const wsAssignedDefault = await ctx.db
      .query("workspaceMenuAssignments")
      .withIndex("by_workspace_default", (q) => q.eq("workspaceId", args.workspaceId).eq("isDefault", true))
      .first()
    const defaultMenuSetId: any = wsAssignedDefault?.menuSetId ?? null

    const menuItemIds: Id<"menuItems">[] = []
    const featuresToInstall = availableFeatures.filter((feature) => args.featureSlugs.includes(feature.slug))

    for (const feature of featuresToInstall) {
      // Check if already exists
      const existing = await ctx.db
        .query("menuItems")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
        .filter((q) => q.eq(q.field("slug"), feature.slug))
        .first()

      // Skip if already installed and not forcing update
      if (existing && !args.forceUpdate) continue

      // Check if update is needed (version comparison)
      if (existing && args.forceUpdate) {
        const existingVersion = existing.metadata?.version || "0.0.0"
        const newVersion = (feature as any).version || "1.0.0"

        // Simple version comparison (you can use semver library for more complex logic)
        if (existingVersion === newVersion) continue // Same version, skip

        // Update existing menu item
        await ctx.db.patch(existing._id, {
          name: feature.name,
          icon: feature.icon,
          path: feature.path,
          component: feature.component,
          order: feature.order,
          metadata: {
            ...existing.metadata,
            description: feature.metadata.description,
            version: newVersion,
            lastUpdated: Date.now(),
            previousVersion: existingVersion,
          },
        })

        // Audit log for version update
        await ctx.db.insert("activityEvents", {
          actorUserId: userId,
          workspaceId: args.workspaceId,
          entityType: "menuItem",
          entityId: String(existing._id),
          action: "version_updated",
          diff: {
            slug: feature.slug,
            previousVersion: existingVersion,
            newVersion: newVersion,
            updatedFields: ["name", "icon", "path", "component", "metadata"],
          },
          createdAt: Date.now(),
        })

        menuItemIds.push(existing._id)
        continue
      }

      // Determine role restrictions
      let visibleForRoleIds: any[] = []
      if ((feature as any).requiresPermission === PERMS.MANAGE_MEMBERS) {
        visibleForRoleIds = rolesCanManageMembers
      } else if ((feature as any).requiresPermission === PERMS.MANAGE_MENUS) {
        visibleForRoleIds = rolesCanManageMenus
      } else if ((feature as any).requiresPermission === PERMS.MANAGE_INVITATIONS) {
        visibleForRoleIds = rolesCanManageInvitations
      }

      const menuItemId = await ctx.db.insert("menuItems", {
        workspaceId: args.workspaceId,
        menuSetId: defaultMenuSetId ?? undefined,
        name: feature.name,
        slug: feature.slug,
        type: feature.type,
        icon: feature.icon,
        path: feature.path,
        component: feature.component,
        order: feature.order,
        isVisible: true,
        visibleForRoleIds,
        metadata: feature.metadata,
        createdBy: userId,
      })
      menuItemIds.push(menuItemId)

      // Audit log for new feature installation
      await ctx.db.insert("activityEvents", {
        actorUserId: userId,
        workspaceId: args.workspaceId,
        entityType: "menuItem",
        entityId: String(menuItemId),
        action: "feature_installed",
        diff: {
          slug: feature.slug,
          version: (feature as any).version || "1.0.0",
          featureType: feature.metadata.featureType,
        },
        createdAt: Date.now(),
      })
    }

    return menuItemIds
  },
})

// Developer function: Seed or update specific menu features by slug with version control
export const seedMenuFeature = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    featureSlug: v.string(),
    version: v.optional(v.string()),
    forceUpdate: v.optional(v.boolean()),
  },
  returns: v.object({
    menuItemId: v.id("menuItems"),
    action: v.string(),
    version: v.string(),
    previousVersion: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    const { membership } = await requirePermission(ctx, args.workspaceId, PERMS.MANAGE_MENUS)
    const userId = membership?.userId

    // Get the feature definition by slug
    const availableFeatures = [
      {
        name: "Chat",
        slug: "chat",
        type: "route" as const,
        icon: "MessageSquare",
        path: "/chat",
        component: "ChatPage",
        order: 2,
        version: "1.0.0",
        metadata: {
          description: "Messages and AI assistant",
          version: "1.0.0",
          lastUpdated: Date.now(),
        },
      },
      {
        name: "Documents",
        slug: "documents",
        type: "route" as const,
        icon: "FileText",
        path: "/documents",
        component: "DocumentsPage",
        order: 3,
        version: "1.2.0",
        metadata: {
          description: "Collaborative documents",
          version: "1.2.0",
          lastUpdated: Date.now(),
        },
      },
      // Add other features as needed...
    ]

    const feature = availableFeatures.find((f) => f.slug === args.featureSlug)
    if (!feature) {
      throw new Error(`Feature '${args.featureSlug}' not found in available features`)
    }

    // Override version if provided
    const targetVersion = args.version || (feature as any).version
    const featureWithVersion = {
      ...feature,
      version: targetVersion,
      metadata: {
        ...feature.metadata,
        version: targetVersion,
        lastUpdated: Date.now(),
      },
    }

    // Check if already exists
    const existing = await ctx.db
      .query("menuItems")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => q.eq(q.field("slug"), args.featureSlug))
      .first()

    if (existing) {
      if (!args.forceUpdate) {
        throw new Error(`Feature '${args.featureSlug}' already exists. Use forceUpdate: true to update it.`)
      }

      // Update existing
      await ctx.db.patch(existing._id, {
        name: featureWithVersion.name,
        icon: featureWithVersion.icon,
        path: featureWithVersion.path,
        component: featureWithVersion.component,
        order: featureWithVersion.order,
        metadata: {
          ...existing.metadata,
          ...featureWithVersion.metadata,
          previousVersion: existing.metadata?.version || "0.0.0",
        },
      })

      return {
        menuItemId: existing._id,
        action: "updated",
        version: targetVersion,
        previousVersion: existing.metadata?.version || "0.0.0",
      }
    }

    // Create new menu item
    const menuItemId = await ctx.db.insert("menuItems", {
      workspaceId: args.workspaceId,
      name: featureWithVersion.name,
      slug: featureWithVersion.slug,
      type: featureWithVersion.type,
      icon: featureWithVersion.icon,
      path: featureWithVersion.path,
      component: featureWithVersion.component,
      order: featureWithVersion.order,
      isVisible: true,
      visibleForRoleIds: [], // Default to visible for all roles
      metadata: featureWithVersion.metadata,
      createdBy: userId,
    })

    return {
      menuItemId,
      action: "created",
      version: targetVersion,
    }
  },
})

// Get available feature menus that can be installed
export const getAvailableFeatureMenus = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  returns: v.array(
    v.object({
      slug: v.string(),
      name: v.string(),
      description: v.string(),
      icon: v.string(),
      version: v.string(),
      category: v.string(),
      tags: v.optional(v.array(v.string())),
      status: v.optional(v.union(
        v.literal("stable"),
        v.literal("beta"),
        v.literal("development"),
        v.literal("experimental"),
        v.literal("deprecated")
      )),
      isReady: v.optional(v.boolean()),
      expectedRelease: v.optional(v.string()),
      featureType: v.optional(v.string()),
    }),
  ),
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    // Get currently installed menus
    const installedMenus = await ctx.db
      .query("menuItems")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect()

    const installedSlugs = new Set(installedMenus.map((m) => m.slug))

    // Use OPTIONAL_FEATURES_CATALOG as the source of truth
    // This is auto-generated from features.config.ts via sync:features script
    const availableFeatures = OPTIONAL_FEATURES_CATALOG.map((feature) => ({
      slug: feature.slug,
      name: feature.name,
      description: feature.description,
      icon: feature.icon,
      version: feature.version,
      category: feature.category,
      tags: feature.tags,
      status: normalizeFeatureStatus(feature.status),
      isReady: feature.isReady,
      expectedRelease: feature.expectedRelease,
      featureType: feature.featureType,
    }))

    // Return only features that aren't already installed
    return availableFeatures.filter((feature) => !installedSlugs.has(feature.slug))
  },
})

// Check for menu updates available
export const getMenuUpdates = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  returns: v.array(
    v.object({
      menuItemId: v.id("menuItems"),
      slug: v.string(),
      name: v.string(),
      currentVersion: v.string(),
      latestVersion: v.string(),
      hasUpdate: v.boolean(),
    }),
  ),
  handler: async (ctx, args) => {
    await requireActiveMembership(ctx, args.workspaceId)

    // Get currently installed menus
    const installedMenus = await ctx.db
      .query("menuItems")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect()

    // Build a map of latest versions from catalog
    const catalogVersionMap = new Map(
      [...DEFAULT_MENU_ITEMS, ...OPTIONAL_FEATURES_CATALOG].map((item) => [
        item.slug,
        (item as any).version || (item as any).metadata?.version || "1.0.0",
      ])
    )

    const updates = installedMenus
      .map((menu) => {
        const currentVersion = menu.metadata?.version || "0.0.0"
        const latestVersion = catalogVersionMap.get(menu.slug) || currentVersion
        const hasUpdate = compareVersions(latestVersion, currentVersion) > 0

        return {
          menuItemId: menu._id,
          slug: menu.slug,
          name: menu.name,
          currentVersion,
          latestVersion,
          hasUpdate,
        }
      })
      .filter((item) => item.hasUpdate)

    return updates
  },
})

// Helper function to compare semantic versions
function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split(".").map(Number)
  const parts2 = v2.split(".").map(Number)

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
    const { membership } = await requirePermission(ctx, args.workspaceId, PERMS.MANAGE_MENUS)
    await ctx.runMutation(internal.menu.store.menuItems.createDefaultMenuItems, {
      workspaceId: args.workspaceId,
      actorUserId: membership?.userId,
      selectedSlugs: args.featureSlugs ?? undefined,
    })
    return true as const
  },
})

// Delete menu item
export const deleteMenuItem = mutation({
  args: { menuItemId: v.id("menuItems") },
  handler: async (ctx, args) => {
    const menuItem = await ctx.db.get(args.menuItemId)
    if (!menuItem) throw new Error("Menu item not found")
    await requirePermission(ctx, menuItem.workspaceId, PERMS.MANAGE_MENUS)

    await ctx.db.delete(args.menuItemId)
    return args.menuItemId
  },
})

// Get menu breadcrumbs
export const getMenuBreadcrumbs = query({
  args: {
    workspaceId: v.id("workspaces"),
    menuItemId: v.optional(v.id("menuItems")),
  },
  handler: async (ctx, args) => {
    // Return breadcrumb path for compatibility
    const workspace = await ctx.db.get(args.workspaceId)
    if (!workspace) return []

    return [
      {
        id: args.workspaceId,
        name: workspace.name,
        type: "workspace",
        icon: "Building",
      },
    ]
  },
})

// Update menu order for drag and drop
export const updateMenuOrder = mutation({
  args: {
    menuItemId: v.id("menuItems"),
    newOrder: v.number(),
    parentId: v.optional(v.union(v.id("menuItems"), v.null())),
  },
  handler: async (ctx, args) => {
    // Any reorder requires manage menus permission in the item's workspace
    const menuItem = await ctx.db.get(args.menuItemId)
    if (!menuItem) throw new Error("Menu item not found")
    await requirePermission(ctx, menuItem.workspaceId, PERMS.MANAGE_MENUS)

    await ctx.db.patch(args.menuItemId, {
      order: args.newOrder,
      parentId: args.parentId ?? undefined,
    })

    return args.menuItemId
  },
})

// Rename menu item
export const renameMenuItem = mutation({
  args: {
    menuItemId: v.id("menuItems"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const menuItem = await ctx.db.get(args.menuItemId)
    if (!menuItem) throw new Error("Menu item not found")
    await requirePermission(ctx, menuItem.workspaceId, PERMS.MANAGE_MENUS)

    await ctx.db.patch(args.menuItemId, {
      name: args.name,
    })

    return args.menuItemId
  },
})

// Duplicate menu item
export const duplicateMenuItem = mutation({
  args: {
    menuItemId: v.id("menuItems"),
    newName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const menuItem = await ctx.db.get(args.menuItemId)
    if (!menuItem) throw new Error("Menu item not found")
    const { membership } = await requirePermission(ctx, menuItem.workspaceId, PERMS.MANAGE_MENUS)

    // Get next order number
    const existingItems = await ctx.db
      .query("menuItems")
      .withIndex("by_workspace_parent", (q) =>
        q.eq("workspaceId", menuItem.workspaceId).eq("parentId", menuItem.parentId ?? undefined)
      )
      .collect()
    const maxOrder = Math.max(...existingItems.map(item => item.order), -1)

    // Create duplicate with new name and slug
    const baseName = args.newName || `${menuItem.name} (Copy)`
    const baseSlug = `${menuItem.slug}-copy`

    // Ensure unique slug
    let uniqueSlug = baseSlug
    let counter = 1
    while (true) {
      const existing = await ctx.db
        .query("menuItems")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", menuItem.workspaceId))
        .filter((q) => q.eq(q.field("slug"), uniqueSlug))
        .first()
      if (!existing) break
      uniqueSlug = `${baseSlug}-${counter}`
      counter++
    }

    const duplicateId = await ctx.db.insert("menuItems", {
      workspaceId: menuItem.workspaceId,
      menuSetId: menuItem.menuSetId,
      parentId: menuItem.parentId,
      name: baseName,
      slug: uniqueSlug,
      type: menuItem.type,
      icon: menuItem.icon,
      path: menuItem.path,
      component: menuItem.component,
      order: maxOrder + 1,
      isVisible: menuItem.isVisible,
      visibleForRoleIds: menuItem.visibleForRoleIds,
      metadata: menuItem.metadata,
      createdBy: membership?.userId as any,
    })

    return duplicateId
  },
})

// Share menu item (generate shareable menu ID)
export const shareMenuItem = mutation({
  args: {
    menuItemId: v.id("menuItems"),
  },
  handler: async (ctx, args) => {
    const menuItem = await ctx.db.get(args.menuItemId)
    if (!menuItem) throw new Error("Menu item not found")
    await requirePermission(ctx, menuItem.workspaceId, PERMS.MANAGE_MENUS)

    // Generate a shareable ID that includes workspace and menu item info
    const shareableId = `${menuItem.workspaceId}:${menuItem._id}:${menuItem.slug}`

    return {
      shareableId,
      menuItemId: menuItem._id,
      name: menuItem.name,
      slug: menuItem.slug,
    }
  },
})

// Import menu item from shareable ID
export const importMenuFromShareableId = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    shareableId: v.string(),
    newName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { membership } = await requirePermission(ctx, args.workspaceId, PERMS.MANAGE_MENUS)

    try {
      // Parse shareable ID - format: workspaceId:menuItemId:slug
      const parts = args.shareableId.trim().split(':')

      if (parts.length !== 3) {
        throw new Error("Invalid shareable ID format. Expected format: workspaceId:menuItemId:slug")
      }

      const [sourceWorkspaceId, sourceMenuItemId, sourceSlug] = parts

      if (!sourceWorkspaceId || !sourceMenuItemId || !sourceSlug) {
        throw new Error("Invalid shareable ID format. All parts (workspaceId, menuItemId, slug) are required")
      }

      // Get source menu item
      const sourceMenuItem = await ctx.db.get(sourceMenuItemId as Id<"menuItems">)
      if (!sourceMenuItem) {
        throw new Error("Source menu item not found")
      }

      // Check if user has access to source workspace (optional, could be public sharing)
      // For now, allow importing from any workspace

      // Generate unique slug for target workspace
      const baseSlug = sourceSlug
      let uniqueSlug = baseSlug
      let counter = 1
      while (true) {
        const existing = await ctx.db
          .query("menuItems")
          .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
          .filter((q) => q.eq(q.field("slug"), uniqueSlug))
          .first()
        if (!existing) break
        uniqueSlug = `${baseSlug}-${counter}`
        counter++
      }

      // Get next order number
      const existingItems = await ctx.db
        .query("menuItems")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
        .collect()
      const maxOrder = Math.max(...existingItems.map(item => item.order), -1)

      // Create imported menu item
      const importedId = await ctx.db.insert("menuItems", {
        workspaceId: args.workspaceId,
        menuSetId: undefined, // Will be assigned to default menu set if exists
        parentId: undefined, // Import at root level
        name: args.newName || `${sourceMenuItem.name} (Imported)`,
        slug: uniqueSlug,
        type: sourceMenuItem.type,
        icon: sourceMenuItem.icon,
        path: sourceMenuItem.path,
        component: sourceMenuItem.component,
        order: maxOrder + 1,
        isVisible: true,
        visibleForRoleIds: [], // Reset permissions for new workspace
        metadata: {
          ...sourceMenuItem.metadata,
        },
        createdBy: membership?.userId as any,
      })

      return {
        menuItemId: importedId,
        imported: true,
        sourceName: sourceMenuItem.name,
      }
    } catch (error) {
      throw new Error(`Failed to import menu: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  },
})
