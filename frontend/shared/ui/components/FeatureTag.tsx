"use client"

import React from "react"
import { cn } from "@/lib/utils"
import { Shield, FlaskConical, Sparkles, AlertTriangle, Archive } from "lucide-react"

export type FeatureTagType = "admin" | "beta" | "new" | "deprecated" | "experimental"

interface FeatureTagConfig {
  label: string
  shortLabel: string
  icon: React.ElementType
  className: string
}

const TAG_CONFIG: Record<FeatureTagType, FeatureTagConfig> = {
  admin: {
    label: "Admin Only",
    shortLabel: "Admin",
    icon: Shield,
    className: "bg-red-500/10 text-red-500 border-red-500/20",
  },
  beta: {
    label: "Beta",
    shortLabel: "Beta",
    icon: FlaskConical,
    className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  },
  new: {
    label: "New",
    shortLabel: "New",
    icon: Sparkles,
    className: "bg-green-500/10 text-green-500 border-green-500/20",
  },
  deprecated: {
    label: "Deprecated",
    shortLabel: "Old",
    icon: Archive,
    className: "bg-gray-500/10 text-gray-500 border-gray-500/20",
  },
  experimental: {
    label: "Experimental",
    shortLabel: "Exp",
    icon: AlertTriangle,
    className: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  },
}

interface FeatureTagProps {
  type: FeatureTagType
  compact?: boolean
  showIcon?: boolean
  className?: string
}

/**
 * Feature Tag Component
 * 
 * Displays visual tags for features (admin, beta, new, etc.)
 * Used in sidebar navigation to indicate feature status
 */
export function FeatureTag({ 
  type, 
  compact = false, 
  showIcon = true,
  className,
}: FeatureTagProps) {
  const config = TAG_CONFIG[type]
  const Icon = config.icon
  
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-medium leading-none",
        config.className,
        className
      )}
    >
      {showIcon && <Icon className="h-2.5 w-2.5" />}
      {!compact && <span>{config.shortLabel}</span>}
    </span>
  )
}

/**
 * Get feature tag from metadata
 */
export function getFeatureTagFromMetadata(metadata?: Record<string, any>): FeatureTagType | null {
  if (!metadata) return null
  
  // Check feature type
  if (metadata.featureType === "system") return "admin"
  if (metadata.featureType === "experimental") return "experimental"
  
  // Check status
  if (metadata.state === "beta") return "beta"
  if (metadata.state === "deprecated") return "deprecated"
  if (metadata.isNew) return "new"
  
  // Check explicit tags
  if (metadata.tags?.includes("admin")) return "admin"
  if (metadata.tags?.includes("beta")) return "beta"
  if (metadata.tags?.includes("new")) return "new"
  if (metadata.tags?.includes("experimental")) return "experimental"
  
  return null
}

/**
 * Multiple Feature Tags Display
 */
export function FeatureTags({ 
  tags, 
  compact = true,
}: { 
  tags: FeatureTagType[]
  compact?: boolean
}) {
  if (tags.length === 0) return null
  
  return (
    <div className="flex items-center gap-1">
      {tags.map((tag) => (
        <FeatureTag key={tag} type={tag} compact={compact} />
      ))}
    </div>
  )
}
