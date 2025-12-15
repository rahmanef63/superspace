/**
 * Quick Actions Section
 * 
 * Displays quick action buttons for common tasks.
 */

"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Plus, 
  FileText, 
  MessageSquare, 
  Calendar,
  Users,
  FolderKanban,
  Settings,
  type LucideIcon 
} from "lucide-react"
import { cn } from "@/lib/utils"

// ============================================================================
// Types
// ============================================================================

export interface QuickAction {
  id: string
  label: string
  description?: string
  icon: LucideIcon
  onClick?: () => void
  href?: string
  variant?: "default" | "secondary" | "outline" | "ghost"
  disabled?: boolean
}

export interface QuickActionsSectionProps {
  /** Actions to display */
  actions: QuickAction[]
  /** Section title */
  title?: string
  /** Section description */
  description?: string
  /** Layout style */
  layout?: "grid" | "list"
  /** Additional className */
  className?: string
}

// ============================================================================
// Quick Actions Section
// ============================================================================

export function QuickActionsSection({
  actions,
  title = "Quick Actions",
  description = "Common tasks at your fingertips",
  layout = "grid",
  className,
}: QuickActionsSectionProps) {
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <Plus className="h-5 w-5 text-muted-foreground" />
        </div>
      </CardHeader>
      
      <CardContent>
        <div className={cn(
          layout === "grid" 
            ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3"
            : "flex flex-col gap-2"
        )}>
          {actions.map((action) => {
            const Icon = action.icon
            
            return (
              <Button
                key={action.id}
                variant={action.variant ?? "outline"}
                disabled={action.disabled}
                onClick={action.onClick}
                className={cn(
                  layout === "grid" 
                    ? "h-auto flex-col gap-2 p-4"
                    : "justify-start gap-3"
                )}
                asChild={!!action.href}
              >
                {action.href ? (
                  <a href={action.href}>
                    <Icon className={cn(
                      layout === "grid" ? "h-6 w-6" : "h-4 w-4"
                    )} />
                    <span className={cn(
                      layout === "grid" && "text-xs"
                    )}>
                      {action.label}
                    </span>
                  </a>
                ) : (
                  <>
                    <Icon className={cn(
                      layout === "grid" ? "h-6 w-6" : "h-4 w-4"
                    )} />
                    <span className={cn(
                      layout === "grid" && "text-xs"
                    )}>
                      {action.label}
                    </span>
                  </>
                )}
              </Button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

// ============================================================================
// Default Quick Actions (for reuse)
// ============================================================================

export const DEFAULT_QUICK_ACTIONS: QuickAction[] = [
  {
    id: "new-document",
    label: "New Document",
    icon: FileText,
  },
  {
    id: "new-task",
    label: "New Task",
    icon: FolderKanban,
  },
  {
    id: "new-message",
    label: "Send Message",
    icon: MessageSquare,
  },
  {
    id: "schedule",
    label: "Schedule",
    icon: Calendar,
  },
  {
    id: "invite-member",
    label: "Invite Member",
    icon: Users,
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
  },
]
