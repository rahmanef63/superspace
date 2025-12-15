/**
 * Panel Header Component
 */

"use client"

import { cn } from "@/lib/utils"
import { Header } from "../../header"
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
    <Header 
      size="sm"
      className={cn(
        "h-10 px-2 bg-muted/30",
        // Override default padding from size="sm" (px-3 py-2) to match original px-2
        "px-2 py-0" 
      )}
    >
      {/* Left Side (or Right Side content) */}
      <div className="flex items-center gap-2 flex-1 overflow-hidden">
        {side === "left" && showButton && (
          <CollapseButton
            side={side}
            collapsed={collapsed}
            onClick={onToggle}
            label={label}
          />
        )}
        
        {!collapsed && children && (
          <div className="truncate text-sm font-medium">
            {children}
          </div>
        )}
      </div>

      {/* Right Side (Collapse button for right panel) */}
      {side === "right" && showButton && (
        <Header.Actions>
          <CollapseButton
            side={side}
            collapsed={collapsed}
            onClick={onToggle}
            label={label}
          />
        </Header.Actions>
      )}
    </Header>
  )
}
