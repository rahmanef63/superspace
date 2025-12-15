/**
 * Feature Header Actions
 * 
 * Dynamic header actions that adapt to the currently active feature.
 * Displays Settings and AI Assistant buttons based on the open feature page.
 * 
 * @example
 * ```tsx
 * // In a header, automatically detects feature from URL
 * <FeatureHeaderActions />
 * 
 * // Or explicitly provide feature
 * <FeatureHeaderActions featureSlug="documents" />
 * ```
 */

"use client"

import { useMemo } from "react"
import { usePathname } from "next/navigation"
import { FeatureSettingsButton } from "@/frontend/shared/settings/components/FeatureSettingsButton"
import { FeatureAIAssistant } from "@/frontend/shared/ui/ai-assistant/FeatureAIAssistant"
import { getActiveFeatureSlug, slugToDisplayName } from "../utils"

// ============================================================================
// Types
// ============================================================================

export interface FeatureHeaderActionsProps {
  /** 
   * Explicit feature slug. If not provided, auto-detected from URL.
   */
  featureSlug?: string | null
  /** 
   * Feature display name. If not provided, derived from slug.
   */
  featureName?: string
  /** 
   * Show settings button 
   * @default true
   */
  showSettings?: boolean
  /** 
   * Show AI assistant button 
   * @default true
   */
  showAgent?: boolean
  /** 
   * Show labels on buttons (responsive) 
   * @default true
   */
  showLabels?: boolean
  /** 
   * Additional className for container 
   */
  className?: string
}

// ============================================================================
// Component
// ============================================================================

export function FeatureHeaderActions({
  featureSlug: explicitSlug,
  featureName: explicitName,
  showSettings = true,
  showAgent = true,
  showLabels = true,
  className,
}: FeatureHeaderActionsProps) {
  const pathname = usePathname()
  
  // Determine active feature
  const activeFeatureSlug = useMemo(() => {
    if (explicitSlug !== undefined) return explicitSlug
    return getActiveFeatureSlug(pathname)
  }, [explicitSlug, pathname])
  
  const activeFeatureName = useMemo(() => {
    if (explicitName) return explicitName
    return activeFeatureSlug ? slugToDisplayName(activeFeatureSlug) : null
  }, [explicitName, activeFeatureSlug])

  // No feature active, render nothing
  if (!activeFeatureSlug) {
    return null
  }

  const buttonBaseClass = "h-8 text-muted-foreground hover:text-foreground"
  const labelClass = showLabels 
    ? "w-auto px-2 [&>span]:hidden [&>span]:lg:inline" 
    : "w-8"

  return (
    <div className={className}>
      {/* Feature Settings */}
      {showSettings && (
        <FeatureSettingsButton
          featureSlug={activeFeatureSlug}
          featureName={activeFeatureName || activeFeatureSlug}
          className={`${buttonBaseClass} ${labelClass}`}
          showLabel={showLabels}
          label="Settings"
        />
      )}

      {/* Feature AI Assistant */}
      {showAgent && (
        <FeatureAIAssistant 
          featureId={activeFeatureSlug}
          buttonVariant="ghost"
          className={`${buttonBaseClass} ${labelClass}`}
          showLabel={showLabels}
        />
      )}
    </div>
  )
}
