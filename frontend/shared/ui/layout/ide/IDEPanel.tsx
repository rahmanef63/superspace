"use client"

import * as React from "react"
import { ChevronDown, ChevronRight, X, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { IDEPanelHeaderProps, IDEPanelProps } from "./types"

/**
 * IDE Panel Header
 * 
 * Header component for IDE panels with title, actions, and collapse control.
 */
export function IDEPanelHeader({
  title,
  icon: Icon,
  actions,
  onCollapse,
  onClose,
  className,
}: IDEPanelHeaderProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between h-9 px-3",
        "bg-muted/50 border-b",
        className
      )}
    >
      <div className="flex items-center gap-2">
        {onCollapse && (
          <button
            onClick={onCollapse}
            className="p-0.5 rounded-sm hover:bg-accent"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
        )}
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
        <span className="text-xs font-medium uppercase tracking-wide">
          {title}
        </span>
      </div>
      
      <div className="flex items-center gap-1">
        {actions}
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 rounded-sm hover:bg-accent"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}

/**
 * IDE Panel
 * 
 * Generic panel component for sidebars and bottom panel.
 */
export function IDEPanel({
  children,
  className,
  header,
  footer,
}: IDEPanelProps) {
  return (
    <div className={cn("flex flex-col h-full bg-background", className)}>
      {header}
      <div className="flex-1 overflow-auto">{children}</div>
      {footer}
    </div>
  )
}

/**
 * IDE Panel Section
 * 
 * Collapsible section within a panel (like VS Code's explorer sections).
 */
interface IDEPanelSectionProps {
  title: string
  defaultOpen?: boolean
  actions?: React.ReactNode
  children?: React.ReactNode
  className?: string
}

export function IDEPanelSection({
  title,
  defaultOpen = true,
  actions,
  children,
  className,
}: IDEPanelSectionProps) {
  const [isOpen, setIsOpen] = React.useState(defaultOpen)
  
  return (
    <div className={cn("border-b last:border-b-0", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-between w-full px-2 py-1.5",
          "text-xs font-semibold uppercase tracking-wide",
          "hover:bg-accent/50 transition-colors"
        )}
      >
        <div className="flex items-center gap-1">
          {isOpen ? (
            <ChevronDown className="h-3.5 w-3.5" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5" />
          )}
          <span>{title}</span>
        </div>
        {actions && (
          <div onClick={(e) => e.stopPropagation()}>{actions}</div>
        )}
      </button>
      {isOpen && <div className="pb-2">{children}</div>}
    </div>
  )
}

/**
 * IDE Panel Tabs
 * 
 * Tabs for switching between different views within a panel.
 */
interface IDEPanelTabsProps {
  tabs: { id: string; label: string }[]
  activeId?: string
  onChange?: (id: string) => void
  className?: string
}

export function IDEPanelTabs({
  tabs,
  activeId,
  onChange,
  className,
}: IDEPanelTabsProps) {
  return (
    <div className={cn("flex items-center gap-1 px-2 py-1 bg-muted/30", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange?.(tab.id)}
          className={cn(
            "px-2 py-0.5 text-xs rounded-sm",
            "text-muted-foreground hover:text-foreground",
            "transition-colors",
            activeId === tab.id && "bg-accent text-foreground"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
