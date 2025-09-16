import { v } from "convex/values"
import { query, mutation, action } from "../_generated/server"
import { api } from "../_generated/api"
import { requirePermission, requireActiveMembership, resolveCandidateUserIds } from "../auth/helpers"
import { PERMS } from "../workspace/permissions"

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

// Create default menu items for a workspace based on manifest
export const createDefaultMenuItems = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    selectedSlugs: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    // Require manage menus permission; reuses centralized membership/role check
    const { membership } = await requirePermission(ctx, args.workspaceId, PERMS.MANAGE_MENUS)
    const userId = membership?.userId

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

    const resolvePermissionValue = (permKey?: string) => {
      if (!permKey) return undefined
      const permsRecord = PERMS as Record<string, string>
      return permsRecord[permKey as keyof typeof PERMS] ?? permKey
    }

    const resolveVisibleRoleIds = (permKey?: string) => {
      const permissionValue = resolvePermissionValue(permKey)
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

    const menuItemIds: any[] = []

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
          if (!existingItem.path && item.path) {
            updates.path = item.path
          }
          if (!existingItem.metadata && item.metadata) {
            updates.metadata = item.metadata
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

    const items = await runQuery(api.menu.menuItems.getWorkspaceMenuItems, { workspaceId: args.workspaceId })
    for (const item of items as any[]) {
      if (item?.component && !known.has(item.component)) {
        // Try to fallback by slug in defaults
        const def = DEFAULT_MENU_ITEMS.find((d) => d.slug === item.slug)
        if (def?.component) {
          await runMutation(api.menu.menuItems.setMenuItemComponent, {
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

    // Available feature menus that can be installed with version control
    const availableFeatures = [
      {
        name: "Chat",
        slug: "chat",
        type: "route" as const,
        icon: "MessageSquare",
        path: "/chat",
        component: "ChatPage",
        order: 2,
        version: "1.0.0", // Version for tracking updates
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
      {
        name: "Canvas",
        slug: "canvas",
        type: "route" as const,
        icon: "Palette",
        path: "/canvas",
        component: "CanvasPage",
        order: 4,
        version: "1.0.0",
        metadata: {
          description: "Visual collaboration",
          version: "1.0.0",
          lastUpdated: Date.now(),
        },
      },
      {
        name: "Members",
        slug: "members",
        type: "route" as const,
        icon: "Users",
        path: "/members",
        component: "MembersPage",
        order: 5,
        version: "1.1.0",
        metadata: {
          description: "Manage workspace members",
          version: "1.1.0",
          lastUpdated: Date.now(),
        },
        requiresPermission: PERMS.MANAGE_MEMBERS,
      },
      {
        name: "Friends",
        slug: "friends",
        type: "route" as const,
        icon: "Heart",
        path: "/friends",
        component: "FriendsPage",
        order: 6,
        version: "1.0.0",
        metadata: {
          description: "Manage your friends",
          version: "1.0.0",
          lastUpdated: Date.now(),
        },
      },
      {
        name: "Menu Store",
        slug: "menus",
        type: "route" as const,
        icon: "Menu",
        path: "/menus",
        component: "MenusPage",
        order: 10,
        version: "1.0.0",
        metadata: {
          description: "Install and manage navigation menus",
          version: "1.0.0",
          lastUpdated: Date.now(),
        },
        requiresPermission: PERMS.MANAGE_MENUS,
      },
      {
        name: "Invitations",
        slug: "invitations",
        type: "route" as const,
        icon: "Mail",
        path: "/invitations",
        component: "InvitationsPage",
        order: 11,
        version: "1.0.0",
        metadata: {
          description: "Manage invitations",
          version: "1.0.0",
          lastUpdated: Date.now(),
        },
        requiresPermission: PERMS.MANAGE_INVITATIONS,
      },
    ]

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

    const menuItemIds = []
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

    // Return available features that aren't installed yet
    const availableFeatures = [
      {
        slug: "chat",
        name: "Chat",
        description: "Messages and AI assistant",
        icon: "MessageSquare",
        version: "1.0.0",
        category: "communication",
      },
      {
        slug: "documents",
        name: "Documents",
        description: "Collaborative documents",
        icon: "FileText",
        version: "1.2.0",
        category: "productivity",
      },
      {
        slug: "canvas",
        name: "Canvas",
        description: "Visual collaboration",
        icon: "Palette",
        version: "1.0.0",
        category: "creativity",
      },
      {
        slug: "members",
        name: "Members",
        description: "Manage workspace members",
        icon: "Users",
        version: "1.1.0",
        category: "administration",
      },
      {
        slug: "friends",
        name: "Friends",
        description: "Manage your friends",
        icon: "Heart",
        version: "1.0.0",
        category: "social",
      },
      {
        slug: "menus",
        name: "Menu Store",
        description: "Install and manage navigation menus",
        icon: "Menu",
        version: "1.0.0",
        category: "administration",
      },
      {
        slug: "invitations",
        name: "Invitations",
        description: "Manage invitations",
        icon: "Mail",
        version: "1.0.0",
        category: "administration",
      },
    ]

    return availableFeatures.filter((feature) => !installedSlugs.has(feature.slug))
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
    parentId: v.optional(v.id("menuItems")),
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
    if (args.parentId !== undefined) updates.parentId = args.parentId
    if (args.visibleForRoleIds !== undefined) updates.visibleForRoleIds = args.visibleForRoleIds
    if (args.metadata !== undefined) updates.metadata = args.metadata

    await ctx.db.patch(args.menuItemId, updates)
    return args.menuItemId
  },
})

// Create menu item
export const createMenuItem = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    parentId: v.optional(v.id("menuItems")),
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
        .withIndex("by_workspace_parent", (q) => q.eq("workspaceId", args.workspaceId).eq("parentId", args.parentId))
        .collect()
      order = existingItems.length
    }

    return await ctx.db.insert("menuItems", {
      workspaceId: args.workspaceId,
      parentId: args.parentId,
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
    parentId: v.optional(v.id("menuItems")),
  },
  handler: async (ctx, args) => {
    // Any reorder requires manage menus permission in the item's workspace
    const menuItem = await ctx.db.get(args.menuItemId)
    if (!menuItem) throw new Error("Menu item not found")
    await requirePermission(ctx, menuItem.workspaceId, PERMS.MANAGE_MENUS)

    await ctx.db.patch(args.menuItemId, {
      order: args.newOrder,
      parentId: args.parentId,
    })

    return args.menuItemId
  },
})
