/**
 * Feature Settings Registry
 * Allows features to register their settings components dynamically
 * No hardcoded imports - truly shared!
 */

import type { SettingsCategory } from "./types"
import type { Id } from "@/convex/_generated/dataModel"

type MenuItemRecord = {
  _id: Id<"menuItems">
  name: string
  slug: string
  type: string
  icon?: string | null
  path?: string | null
  metadata?: Record<string, any>
}

type FeatureSettingsBuilder = (ctx: {
  menuItem: MenuItemRecord
}) => Omit<SettingsCategory, "featureSlug">[]

// ============================================================================
// Registry
// ============================================================================

const featureSettingsBuilders = new Map<string, FeatureSettingsBuilder>()

// ============================================================================
// Registration API
// ============================================================================

/**
 * Register feature settings builder
 * Features call this at initialization to register their settings
 *
 * @example
 * ```ts
 * // In frontend/features/chat/init.ts
 * import { registerFeatureSettings } from "@/frontend/shared/settings"
 *
 * registerFeatureSettings("chat", () => [
 *   { id: "chat-general", label: "Chat", component: ChatGeneralSettings },
 *   { id: "chat-notifications", label: "Notifications", component: ChatNotificationsSettings },
 * ])
 * ```
 */
export function registerFeatureSettings(
  featureSlug: string,
  builder: FeatureSettingsBuilder
): void {
  if (featureSettingsBuilders.has(featureSlug)) {
    console.warn(`⚠️ Feature settings for "${featureSlug}" already registered, overwriting...`)
  }

  featureSettingsBuilders.set(featureSlug, builder)

  if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
    console.log(`✅ Registered settings for feature: ${featureSlug}`)
  }
}

/**
 * Unregister feature settings (useful for hot module replacement)
 */
export function unregisterFeatureSettings(featureSlug: string): void {
  featureSettingsBuilders.delete(featureSlug)
}

/**
 * Get settings builder for a feature
 */
export function getFeatureSettingsBuilder(
  featureSlug: string
): FeatureSettingsBuilder | undefined {
  return featureSettingsBuilders.get(featureSlug)
}

/**
 * Get all registered feature slugs
 */
export function getAllRegisteredFeatures(): string[] {
  return Array.from(featureSettingsBuilders.keys())
}

/**
 * Check if feature has settings registered
 */
export function hasFeatureSettings(featureSlug: string): boolean {
  return featureSettingsBuilders.has(featureSlug)
}

/**
 * Clear all registrations (useful for testing)
 */
export function clearFeatureSettingsRegistry(): void {
  featureSettingsBuilders.clear()
}

// ============================================================================
// Debug
// ============================================================================

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  (window as any).__FEATURE_SETTINGS_REGISTRY__ = {
    builders: featureSettingsBuilders,
    register: registerFeatureSettings,
    get: getFeatureSettingsBuilder,
    getAll: getAllRegisteredFeatures,
    has: hasFeatureSettings,
    clear: clearFeatureSettingsRegistry,
  }
}
