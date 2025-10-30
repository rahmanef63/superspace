"use client"

/**
 * Feature Settings Sync
 *
 * Generic component that syncs workspace menu items with settings registry.
 * Automatically registers/unregisters feature settings as features are added/removed.
 */

import { useEffect, useMemo, useRef } from "react"
import { useQuery } from "convex/react"
import type { Id } from "@convex/_generated/dataModel"
import { api } from "@/convex/_generated/api"
import { useSettingsRegistry } from "../SettingsRegistry"
import { getFeatureSettingsBuilder } from "../featureSettingsRegistry"
import type { SettingsCategory } from "../types"

type MenuItemRecord = {
  _id: Id<"menuItems">
  name: string
  slug: string
  type: "folder" | "route" | "divider" | "action" | "chat" | "document" | string
  icon?: string | null
  path?: string | null
  metadata?: Record<string, any>
}

type FeatureSettingsBuilder = (ctx: {
  menuItem: MenuItemRecord
}) => Omit<SettingsCategory, "featureSlug">[]

export interface FeatureSettingsSyncProps {
  /** Workspace ID to sync settings for */
  workspaceId: Id<"workspaces">
  /** Optional static feature settings builders (fallback for features without dynamic registration) */
  staticBuilders?: Record<string, FeatureSettingsBuilder>
}

/**
 * Syncs workspace features with settings registry
 *
 * @example
 * ```tsx
 * <FeatureSettingsSync
 *   workspaceId={workspaceId}
 *   staticBuilders={LEGACY_FEATURE_BUILDERS}
 * />
 * ```
 */
export function FeatureSettingsSync({
  workspaceId,
  staticBuilders = {},
}: FeatureSettingsSyncProps) {
  const { registerSettings, unregisterSettings } = useSettingsRegistry()
  const previouslyRegistered = useRef<Set<string>>(new Set())

  const menuItems = useQuery(
    (api as any)["menu/store/menuItems"].getWorkspaceMenuItems,
    workspaceId ? { workspaceId } : "skip"
  ) as MenuItemRecord[] | undefined

  const featureMenuItems = useMemo(() => {
    if (!Array.isArray(menuItems)) {
      return []
    }

    return menuItems.filter(
      (item) =>
        item &&
        typeof item.slug === "string" &&
        !["folder", "divider", "action"].includes(item.type)
    )
  }, [menuItems])

  useEffect(() => {
    if (!workspaceId || featureMenuItems.length === 0) {
      previouslyRegistered.current.forEach((slug) => unregisterSettings(slug))
      previouslyRegistered.current = new Set()
      return
    }

    const registeredThisRun = new Set<string>()

    featureMenuItems.forEach((menuItem) => {
      // Try dynamic registry first (new system)
      const registryBuilder = getFeatureSettingsBuilder(menuItem.slug)
      // Fallback to static builders (legacy/placeholders)
      const builder = registryBuilder || staticBuilders[menuItem.slug]
      const categories = builder ? builder({ menuItem }) : []

      if (categories.length > 0) {
        registerSettings({
          featureSlug: menuItem.slug,
          categories,
        })
        registeredThisRun.add(menuItem.slug)
      } else {
        unregisterSettings(menuItem.slug)
      }
    })

    previouslyRegistered.current.forEach((slug) => {
      if (!registeredThisRun.has(slug)) {
        unregisterSettings(slug)
      }
    })

    previouslyRegistered.current = registeredThisRun
  }, [featureMenuItems, registerSettings, unregisterSettings, workspaceId, staticBuilders])

  return null
}
