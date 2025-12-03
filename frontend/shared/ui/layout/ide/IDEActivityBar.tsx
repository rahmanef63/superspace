"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import type { IDEActivityBarProps, ActivityBarItem } from "./types"

/**
 * Activity Bar Component
 * 
 * VS Code-style vertical icon bar for switching between views.
 * Typically positioned on the far left.
 */
export function IDEActivityBar({
  items,
  activeId,
  onItemClick,
  position = "left",
  className,
}: IDEActivityBarProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center bg-muted/50 border-r",
        "w-12 py-2 gap-1",
        position === "right" && "border-l border-r-0",
        className
      )}
    >
      {items.map((item) => (
        <ActivityBarButton
          key={item.id}
          item={item}
          isActive={activeId === item.id}
          onClick={() => {
            item.onClick?.()
            onItemClick?.(item.id)
          }}
        />
      ))}
    </div>
  )
}

interface ActivityBarButtonProps {
  item: ActivityBarItem
  isActive: boolean
  onClick: () => void
}

function ActivityBarButton({ item, isActive, onClick }: ActivityBarButtonProps) {
  const Icon = item.icon
  
  return (
    <Tooltip delayDuration={300}>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          className={cn(
            "relative flex items-center justify-center",
            "w-10 h-10 rounded-lg",
            "text-muted-foreground hover:text-foreground",
            "hover:bg-accent/50 transition-colors",
            isActive && [
              "text-foreground bg-accent",
              "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2",
              "before:w-0.5 before:h-6 before:bg-primary before:rounded-r",
            ]
          )}
        >
          <Icon className="h-5 w-5" />
          {item.badge !== undefined && (
            <Badge
              variant="secondary"
              className={cn(
                "absolute -top-0.5 -right-0.5",
                "h-4 min-w-4 px-1 text-[10px]",
                typeof item.badge === "number" && item.badge > 99 && "min-w-5"
              )}
            >
              {typeof item.badge === "number" && item.badge > 99
                ? "99+"
                : item.badge}
            </Badge>
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent side="right">
        <p>{item.tooltip || item.label}</p>
      </TooltipContent>
    </Tooltip>
  )
}
