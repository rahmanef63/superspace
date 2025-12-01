"use client"

import { useState, useMemo } from "react"
import { Check, Sparkles, Loader2 } from "lucide-react"
import * as Icons from "lucide-react"
import { cn } from "@/lib/utils"
import { 
  useBundlesForWorkspaceType,
  getMergedBundleEnabledFeatures,
  type MergedBundle,
} from "../hooks/useBundles"
import type { WorkspaceType } from "../types"

interface BundleSelectorProps {
  workspaceType: WorkspaceType
  selectedBundleId: string | null
  onSelect: (bundleId: string) => void
}

export function BundleSelector({ workspaceType, selectedBundleId, onSelect }: BundleSelectorProps) {
  const [hoveredBundle, setHoveredBundle] = useState<string | null>(null)
  
  // Use the new hook that fetches from database with static fallback
  const { bundles, isLoading } = useBundlesForWorkspaceType(workspaceType)

  const getIcon = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName] || Icons.HelpCircle
    return IconComponent
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Choose Your Template</h2>
        <p className="text-muted-foreground">
          Select a pre-configured bundle to get started quickly, or customize your own
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {bundles.map((bundle) => {
          const IconComponent = getIcon(bundle.icon)
          const isSelected = selectedBundleId === bundle.id
          const isRecommended = bundle.recommendedFor.includes(workspaceType)
          const enabledCount = getMergedBundleEnabledFeatures(bundle).length

          return (
            <button
              key={bundle.id}
              type="button"
              onClick={() => onSelect(bundle.id)}
              onMouseEnter={() => setHoveredBundle(bundle.id)}
              onMouseLeave={() => setHoveredBundle(null)}
              className={cn(
                "relative flex flex-col items-start p-4 rounded-lg border-2 transition-all duration-200 text-left",
                isSelected
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                  : "border-border hover:border-primary/50 hover:bg-muted/50",
                bundle.id === 'custom' && "col-span-full md:col-span-1"
              )}
            >
              {/* Recommended Badge */}
              {isRecommended && bundle.id !== 'custom' && (
                <div className="absolute -top-2 -right-2">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-primary text-primary-foreground">
                    <Sparkles className="h-3 w-3" />
                    Recommended
                  </span>
                </div>
              )}

              {/* Selected Check */}
              {isSelected && (
                <div className="absolute top-3 right-3">
                  <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                </div>
              )}

              {/* Icon and Title */}
              <div className="flex items-center gap-3 mb-2">
                <div 
                  className={cn(
                    "h-10 w-10 rounded-lg flex items-center justify-center",
                    isSelected ? "bg-primary/20" : "bg-muted"
                  )}
                  style={{ 
                    backgroundColor: isSelected && bundle.theme?.primaryColor 
                      ? `${bundle.theme.primaryColor}20` 
                      : undefined 
                  }}
                >
                  <IconComponent 
                    className={cn(
                      "h-5 w-5",
                      isSelected ? "text-primary" : "text-muted-foreground"
                    )}
                    style={{ 
                      color: isSelected && bundle.theme?.primaryColor 
                        ? bundle.theme.primaryColor 
                        : undefined 
                    }}
                  />
                </div>
                <div>
                  <h3 className="font-semibold">{bundle.name}</h3>
                  <span className="text-xs text-muted-foreground capitalize">{bundle.category}</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {bundle.description}
              </p>

              {/* Feature Count */}
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-muted">
                  {enabledCount} features enabled
                </span>
              </div>

              {/* Tags */}
              {(hoveredBundle === bundle.id || isSelected) && (
                <div className="flex flex-wrap gap-1 mt-3">
                  {bundle.tags.slice(0, 4).map((tag: string) => (
                    <span
                      key={tag}
                      className="inline-flex px-2 py-0.5 rounded text-xs bg-muted text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
