"use client"

import { cn } from "@/lib/utils"
import { LucideIcon } from "lucide-react"

interface EmptyStateProps {
  /** Lucide icon component to display */
  icon: LucideIcon
  /** Main heading text */
  title: string
  /** Optional description text */
  description?: string
  /** Optional action button/element */
  action?: React.ReactNode
  /** Additional CSS classes for the container */
  className?: string
  /** Icon size (default: h-16 w-16) */
  iconSize?: string
  /** Icon color (default: text-muted-foreground) */
  iconColor?: string
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  iconSize = "h-16 w-16",
  iconColor = "text-muted-foreground",
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex-1 flex items-center justify-center bg-background",
        className
      )}
    >
      <div className="text-center max-w-md px-4">
        <Icon
          className={cn(
            "mx-auto mb-4",
            iconSize,
            iconColor
          )}
        />
        <h2 className="text-xl font-medium text-foreground mb-2">
          {title}
        </h2>
        {description && (
          <p className="text-sm text-muted-foreground mb-4">
            {description}
          </p>
        )}
        {action && <div className="mt-4">{action}</div>}
      </div>
    </div>
  )
}
