"use client"

/**
 * Feature Settings Button
 *
 * A button component that opens feature-specific settings.
 * Designed to be placed in feature headers, on the right side opposite to the feature name.
 */

import React, { useState, useCallback, useEffect } from "react"
import { Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { hasFeatureSettings, getFeatureSettingsBuilder } from "@/frontend/shared/foundation/utils/registry/feature-settings-registry"
import { FeatureSettingsDialog } from "./FeatureSettingsDialog"
import { SettingsRegistryProvider } from "../SettingsProvider"
import type { SettingsCategory } from "../types"

export interface FeatureSettingsButtonProps {
  /** Feature slug to show settings for */
  featureSlug: string
  /** Feature display name (shown in sheet header) */
  featureName?: string
  /** Default category to open */
  defaultCategory?: string
  /** Button variant */
  variant?: "default" | "ghost" | "outline" | "secondary"
  /** Button size */
  size?: "default" | "sm" | "lg" | "icon"
  /** Additional CSS classes */
  className?: string
  /** Whether to hide button if feature has no settings (checked lazily) */
  hideIfNoSettings?: boolean
  /** Custom icon component */
  icon?: React.ElementType
  /** Show label alongside icon */
  showLabel?: boolean
  /** Custom label text */
  label?: string
}

/**
 * Button that opens feature settings in a sheet
 *
 * @example
 * ```tsx
 * // In feature header
 * <FeatureSettingsButton
 *   featureSlug="chat"
 *   featureName="Chat"
 * />
 *
 * // With custom styling
 * <FeatureSettingsButton
 *   featureSlug="calls"
 *   featureName="Calls"
 *   variant="outline"
 *   size="sm"
 *   showLabel
 * />
 * ```
 */
export function FeatureSettingsButton({
  featureSlug,
  featureName,
  defaultCategory,
  variant = "ghost",
  size = "icon",
  className,
  hideIfNoSettings = false, // Changed default to false - always show by default
  icon: Icon = Settings,
  showLabel = false,
  label = "Settings",
}: FeatureSettingsButtonProps) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [hasSettings, setHasSettings] = useState(true) // Optimistic default

  // Check for settings after mount (to ensure init files have run)
  useEffect(() => {
    setMounted(true)
    // Delay check to ensure init files have executed
    const timer = setTimeout(() => {
      setHasSettings(hasFeatureSettings(featureSlug))
    }, 100)
    return () => clearTimeout(timer)
  }, [featureSlug])

  // Get settings for this feature from the global registry
  const getFeatureCategories = useCallback((): SettingsCategory[] => {
    const builder = getFeatureSettingsBuilder(featureSlug)
    if (!builder) return []

    // Build categories with a dummy menuItem (for compatibility)
    const categories = builder({
      menuItem: {
        _id: "" as any,
        name: featureName || featureSlug,
        slug: featureSlug,
        type: "route",
      },
    })

    // Add featureSlug to each category
    return categories.map((cat) => ({
      ...cat,
      featureSlug,
    }))
  }, [featureSlug, featureName])

  // Hide button if feature has no settings and hideIfNoSettings is true
  // Only hide after mount to avoid hydration mismatch
  if (mounted && hideIfNoSettings && !hasSettings) {
    return null
  }

  const categories = getFeatureCategories()

  if (process.env.NODE_ENV === "development") {
    console.log("[FeatureSettingsButton] featureSlug:", featureSlug)
    console.log("[FeatureSettingsButton] categories:", categories.length, categories.map(c => c.id))
  }

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={variant}
              size={size}
              className={className}
              onClick={() => setOpen(true)}
            >
              <Icon className="h-4 w-4" />
              {showLabel && <span className="ml-2">{label}</span>}
              <span className="sr-only">{featureName || featureSlug} Settings</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{featureName || featureSlug} Settings</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Wrap sheet in its own provider with pre-loaded settings */}
      <SettingsRegistryProvider coreSettings={categories}>
        <FeatureSettingsDialog
          open={open}
          onOpenChange={setOpen}
          featureSlug={featureSlug}
          featureName={featureName}
          defaultCategory={defaultCategory}
        />
      </SettingsRegistryProvider>
    </>
  )
}
