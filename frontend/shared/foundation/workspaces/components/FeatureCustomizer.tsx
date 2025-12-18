"use client"

import { useMemo } from "react"
import { Check, Lock, Info, Loader2 } from "lucide-react"
import * as Icons from "lucide-react"
import { cn } from "@/lib/utils"
import { CORE_FEATURES, type AvailableFeatureId } from "../constants"
import { useBundleWithFeatures, getMergedBundleAllFeatures } from "../hooks/useBundles"
import { getAllFeatures } from "@/frontend/shared/lib/features/registry"
import type { FeatureConfig } from "@/frontend/shared/lib/features/defineFeature"

interface FeatureCustomizerProps {
  selectedBundleId: string | null
  enabledFeatures: AvailableFeatureId[]
  onToggleFeature: (featureId: AvailableFeatureId) => void
}

interface FeatureItemProps {
  featureId: AvailableFeatureId
  featureConfig: FeatureConfig | undefined
  isEnabled: boolean
  isCore: boolean
  isRecommended: boolean
  onToggle: () => void
}

function FeatureItem({
  featureId,
  featureConfig,
  isEnabled,
  isCore,
  isRecommended,
  onToggle
}: FeatureItemProps) {
  const IconComponent = featureConfig
    ? (Icons as any)[featureConfig.ui.icon] || Icons.HelpCircle
    : Icons.HelpCircle

  const name = featureConfig?.name || featureId
  const description = featureConfig?.description || ''

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={isCore}
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg border transition-all duration-150 text-left w-full",
        isCore
          ? "border-primary/30 bg-primary/5 cursor-not-allowed"
          : isEnabled
            ? "border-primary bg-primary/5 hover:bg-primary/10"
            : "border-border hover:border-muted-foreground/50 hover:bg-muted/50"
      )}
    >
      {/* Toggle Indicator */}
      <div className={cn(
        "h-5 w-5 rounded flex items-center justify-center shrink-0 mt-0.5",
        isCore
          ? "bg-primary/20"
          : isEnabled
            ? "bg-primary"
            : "bg-muted border border-border"
      )}>
        {isCore ? (
          <Lock className="h-3 w-3 text-primary" />
        ) : isEnabled ? (
          <Check className="h-3 w-3 text-primary-foreground" />
        ) : null}
      </div>

      {/* Icon */}
      <div className={cn(
        "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
        isEnabled ? "bg-primary/10" : "bg-muted"
      )}>
        <IconComponent className={cn(
          "h-4 w-4",
          isEnabled ? "text-primary" : "text-muted-foreground"
        )} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={cn(
            "font-medium text-sm",
            isEnabled ? "text-foreground" : "text-muted-foreground"
          )}>
            {name}
          </span>
          {isCore && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary">
              Required
            </span>
          )}
          {isRecommended && !isCore && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
              Recommended
            </span>
          )}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
            {description}
          </p>
        )}
      </div>
    </button>
  )
}

export function FeatureCustomizer({
  selectedBundleId,
  enabledFeatures,
  onToggleFeature
}: FeatureCustomizerProps) {
  // Use the new hook that fetches from database with static fallback
  const { bundle, isLoading } = useBundleWithFeatures(selectedBundleId)
  const allFeatures = useMemo(() => getAllFeatures(), [])

  // Organize features by category
  const featuresByCategory = useMemo(() => {
    if (!bundle) return {}

    const allBundleFeatures = getMergedBundleAllFeatures(bundle)

    const categories: Record<string, Array<{
      featureId: AvailableFeatureId
      config: FeatureConfig | undefined
      isCore: boolean
      isRecommended: boolean
    }>> = {}

    allBundleFeatures.forEach(featureId => {
      const config = allFeatures.find(f => f.id === featureId)
      const category = config?.ui.category || 'other'
      const isCore = bundle.features.core.includes(featureId)
      const isRecommended = bundle.features.recommended.includes(featureId)

      if (!categories[category]) {
        categories[category] = []
      }

      categories[category].push({
        featureId,
        config,
        isCore,
        isRecommended,
      })
    })

    // Sort categories by importance
    const sortOrder = ['productivity', 'communication', 'collaboration', 'analytics', 'content', 'creativity', 'administration', 'social']
    return Object.fromEntries(
      Object.entries(categories).sort((a, b) => {
        const aIdx = sortOrder.indexOf(a[0])
        const bIdx = sortOrder.indexOf(b[0])
        return (aIdx === -1 ? 999 : aIdx) - (bIdx === -1 ? 999 : bIdx)
      })
    )
  }, [bundle, allFeatures])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!bundle) {
    return (
      <div className="text-center py-8">
        <Info className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Select a Template First</h3>
        <p className="text-muted-foreground">
          Go back and choose a workspace template to customize features
        </p>
      </div>
    )
  }

  const enabledCount = enabledFeatures.length
  const totalCount = bundle.features.core.length + bundle.features.recommended.length + bundle.features.optional.length

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Customize Features</h2>
        <p className="text-muted-foreground">
          Fine-tune which features are enabled for your workspace
        </p>
        <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted text-sm">
          <Check className="h-4 w-4 text-primary" />
          <span>{enabledCount} of {totalCount} features enabled</span>
        </div>
      </div>

      <div className="space-y-6">
        {Object.entries(featuresByCategory).map(([category, features]) => (
          <div key={category}>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              {category}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {features.map(({ featureId, config, isCore, isRecommended }) => (
                <FeatureItem
                  key={featureId}
                  featureId={featureId}
                  featureConfig={config}
                  isEnabled={enabledFeatures.includes(featureId)}
                  isCore={isCore}
                  isRecommended={isRecommended}
                  onToggle={() => onToggleFeature(featureId)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
