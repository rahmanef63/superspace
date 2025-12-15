/**
 * Team Composition Section
 * 
 * Displays team members grouped by role.
 */

"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users } from "lucide-react"
import { cn } from "@/lib/utils"

// ============================================================================
// Types
// ============================================================================

export interface TeamCompositionSectionProps {
  /** Roles with member counts */
  roles: Record<string, number>
  /** Title */
  title?: string
  /** Subtitle */
  subtitle?: string
  /** Additional className */
  className?: string
}

// ============================================================================
// Role Colors
// ============================================================================

const ROLE_COLORS: Record<string, string> = {
  owner: "bg-purple-500",
  admin: "bg-blue-500",
  editor: "bg-green-500",
  viewer: "bg-gray-500",
  member: "bg-primary",
  guest: "bg-orange-500",
}

// ============================================================================
// Team Composition Section
// ============================================================================

export function TeamCompositionSection({
  roles,
  title = "Team Composition",
  subtitle = "Members by role",
  className,
}: TeamCompositionSectionProps) {
  const hasRoles = roles && Object.keys(roles).length > 0

  return (
    <Card className={cn("col-span-1", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{subtitle}</CardDescription>
      </CardHeader>
      <CardContent>
        {hasRoles ? (
          <div className="space-y-4">
            {Object.entries(roles).map(([role, count]) => (
              <div key={role} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div 
                    className={cn(
                      "w-2 h-2 rounded-full",
                      ROLE_COLORS[role.toLowerCase()] || "bg-primary"
                    )} 
                  />
                  <span className="capitalize">{role}</span>
                </div>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Users className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <h4 className="font-medium text-foreground mb-1">No team members</h4>
            <p className="text-sm text-muted-foreground">
              Invite team members to get started.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
