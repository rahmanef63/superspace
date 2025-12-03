/**
 * Panel Header Component
 */

"use client"

import { cn } from "@/lib/utils"
import { CollapseButton } from "./CollapseButton"
import type { PanelHeaderProps } from "./types"

export function PanelHeader({ 
  side, 
  collapsed, 
  onToggle, 
  label, 
  showButton,
  children 
}: PanelHeaderProps) {
  return (
    <div className={cn(
      "flex items-center h-10 px-2 border-b",
      "bg-muted/30",
      side === "left" ? "justify-between" : "flex-row-reverse justify-between"
    )}>
      {showButton && (
        <CollapseButton
          side={side}
          collapsed={collapsed}
          onClick={onToggle}
          label={label}
        />
      )}
      {!collapsed && children && (
        <div className="flex-1 truncate px-2 text-sm font-medium">
          {children}
        </div>
      )}
    </div>
  )
}
