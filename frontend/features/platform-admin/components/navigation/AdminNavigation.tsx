"use client"

import React from "react"
import {
  Shield,
  Store,
  Package,
  Building2,
  Users,
  Mail,
  BarChart3,
  Settings,
  Blocks,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"

export type AdminSection =
  | "system-features"
  | "bundle-categories"
  | "workspace-hierarchy"
  | "custom-features"
  | "workspaces"
  | "users"
  | "invitations"
  | "analytics"
  | "settings"

export interface AdminNavItem {
  id: AdminSection
  label: string
  icon: React.ElementType
  badge?: string | number
  badgeVariant?: "default" | "secondary" | "destructive" | "outline"
  description?: string
}

const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  {
    id: "system-features",
    label: "Menu Store",
    icon: Store,
    description: "Manage system features in Menu Store",
  },
  {
    id: "bundle-categories",
    label: "Bundles",
    icon: Package,
    description: "Configure workspace bundle templates",
  },
  {
    id: "workspace-hierarchy",
    label: "Hierarchy",
    icon: Building2,
    description: "Workspace tree structure",
  },
  {
    id: "custom-features",
    label: "Custom Features",
    icon: Blocks,
    description: "Features created via Builder",
  },
  {
    id: "workspaces",
    label: "Workspaces",
    icon: Building2,
    description: "All platform workspaces",
  },
  {
    id: "users",
    label: "Users",
    icon: Users,
    description: "Platform user management",
  },
  {
    id: "invitations",
    label: "Invitations",
    icon: Mail,
    description: "Pending workspace invitations",
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: BarChart3,
    description: "Usage statistics and metrics",
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
    description: "Platform configuration",
  },
]

interface AdminNavigationProps {
  activeSection: AdminSection
  onSectionChange: (section: AdminSection) => void
  stats?: {
    features?: number
    bundles?: number
    workspaces?: number
    users?: number
    invitations?: number
  }
  className?: string
}

export function AdminNavigation({
  activeSection,
  onSectionChange,
  stats,
  className,
}: AdminNavigationProps) {
  // Add badges based on stats
  const navItemsWithBadges = ADMIN_NAV_ITEMS.map((item) => {
    let badge: string | number | undefined
    switch (item.id) {
      case "system-features":
        badge = stats?.features
        break
      case "bundle-categories":
        badge = stats?.bundles
        break
      case "workspaces":
        badge = stats?.workspaces
        break
      case "users":
        badge = stats?.users
        break
      case "invitations":
        badge = stats?.invitations
        break
    }
    return { ...item, badge }
  })

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-gradient-to-br from-red-500 to-orange-500 p-1.5">
            <Shield className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold">Platform Admin</h2>
            <p className="text-xs text-muted-foreground">Super Admin Console</p>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-2 space-y-1">
          {navItemsWithBadges.map((item) => {
            const Icon = item.icon
            const isActive = activeSection === item.id

            return (
              <Button
                key={item.id}
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start gap-3 h-auto py-2.5 px-3",
                  isActive && "bg-primary/10 text-primary border border-primary/20"
                )}
                onClick={() => onSectionChange(item.id)}
              >
                <Icon className={cn("h-4 w-4 flex-shrink-0", isActive && "text-primary")} />
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">{item.label}</span>
                    {item.badge !== undefined && (
                      <Badge
                        variant={item.badgeVariant || "secondary"}
                        className="h-5 px-1.5 text-xs"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                </div>
                <ChevronRight
                  className={cn(
                    "h-4 w-4 flex-shrink-0 opacity-0 transition-opacity",
                    isActive && "opacity-100"
                  )}
                />
              </Button>
            )
          })}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="flex-shrink-0 px-4 py-3 border-t bg-muted/20">
        <p className="text-xs text-muted-foreground text-center">
          Admin v1.0.0
        </p>
      </div>
    </div>
  )
}

export { ADMIN_NAV_ITEMS }
