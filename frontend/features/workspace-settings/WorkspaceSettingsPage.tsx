"use client"

/**
 * Workspace Settings Page
 * 
 * Role-based workspace settings:
 * - Level 1-3 (High): Full access (General, Members, Features, Danger Zone)
 * - Level 4-6 (Medium): Admin access (General, Members, Features)
 * - Level 7+ (Low): Member access (Preferences, Notifications only)
 * 
 * Uses role.level from user management for permission checks.
 */

import React, { useState, useMemo } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import {
    Settings, Users, Layers, Bell, Palette, AlertTriangle, Shield,
    Lock, type LucideIcon, ExternalLink
} from "lucide-react"
import { ThreeColumnLayoutAdvanced } from "@/frontend/shared/ui/layout/container"
import { FeatureHeader, ContainerHeader } from "@/frontend/shared/ui/layout/header"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import { useWorkspaceContext } from "@/frontend/shared/foundation/provider/WorkspaceProvider"
import { useRouter } from "next/navigation"

// Settings categories with permission levels
interface SettingsCategory {
    id: string
    label: string
    icon: LucideIcon
    description: string
    minLevel?: number // Lower = more permission (1 = owner, 10 = guest)
    permissions?: string[]
}

// All possible workspace settings categories
const ALL_WORKSPACE_SETTINGS: SettingsCategory[] = [
    // Available to all members
    { id: "preferences", label: "Preferences", icon: Palette, description: "Theme and display settings for this workspace" },
    { id: "notifications", label: "Notifications", icon: Bell, description: "Notification preferences for this workspace" },

    // Requires higher level (admin+)
    { id: "general", label: "General", icon: Settings, description: "Workspace name, icon, and description", minLevel: 5 },
    { id: "members", label: "Members", icon: Users, description: "Manage workspace members and permissions", minLevel: 5, permissions: ["MANAGE_MEMBERS"] },
    { id: "features", label: "Features", icon: Layers, description: "Configure installed features", minLevel: 5 },

    // Requires owner level
    { id: "security", label: "Security", icon: Shield, description: "Security and access settings", minLevel: 3 },
    { id: "danger-zone", label: "Danger Zone", icon: AlertTriangle, description: "Delete or transfer workspace", minLevel: 1 },
]

export interface WorkspaceSettingsPageProps {
    workspaceId?: Id<"workspaces"> | null
}

export default function WorkspaceSettingsPage(_props: WorkspaceSettingsPageProps) {
    const router = useRouter()
    const { workspaceId } = useWorkspaceContext()
    const [activeCategory, setActiveCategory] = useState<string>("preferences")

    // Get current user's membership and role for this workspace
    const membership = useQuery(
        (api as any)["features/workspaces/workspaceMemberships"]?.getCurrentUserMembership,
        workspaceId ? { workspaceId: workspaceId as Id<"workspaces"> } : "skip"
    ) as { roleId?: Id<"roles">; role?: { level?: number; permissions?: string[]; name?: string } } | null | undefined

    // Get workspace info
    const workspace = useQuery(
        (api as any)["features/workspaces/workspaces"]?.getById,
        workspaceId ? { id: workspaceId as Id<"workspaces"> } : "skip"
    ) as { name?: string; ownerId?: Id<"users"> } | null | undefined

    // Determine user's permission level (lower = more access)
    const userLevel = membership?.role?.level ?? 10 // Default to lowest access
    const userPermissions = membership?.role?.permissions ?? []
    const roleName = membership?.role?.name ?? "Guest"

    // Filter categories based on user's level and permissions
    const availableCategories = useMemo(() => {
        return ALL_WORKSPACE_SETTINGS.filter(category => {
            // Check level requirement
            if (category.minLevel !== undefined && userLevel > category.minLevel) {
                return false
            }
            // Check permission requirement
            if (category.permissions?.length) {
                const hasPermission = category.permissions.some(p => userPermissions.includes(p))
                if (!hasPermission) return false
            }
            return true
        })
    }, [userLevel, userPermissions])

    // Restricted categories (for display)
    const restrictedCategories = useMemo(() => {
        return ALL_WORKSPACE_SETTINGS.filter(category => {
            if (category.minLevel !== undefined && userLevel > category.minLevel) {
                return true
            }
            if (category.permissions?.length) {
                const hasPermission = category.permissions.some(p => userPermissions.includes(p))
                if (!hasPermission) return true
            }
            return false
        })
    }, [userLevel, userPermissions])

    const activeSettingInfo = availableCategories.find(c => c.id === activeCategory) || availableCategories[0]

    // Left Panel - Category List
    const leftPanelContent = (
        <div className="flex flex-col h-full min-h-0">
            <div className="flex-shrink-0 border-b bg-muted/30 px-3 py-2">
                <div className="flex items-center gap-2 text-sm">
                    <Badge variant="outline" className="text-xs">
                        {roleName}
                    </Badge>
                    {userLevel <= 3 && <Badge variant="secondary" className="text-xs">Owner</Badge>}
                </div>
            </div>

            <ScrollArea className="flex-1 min-h-0">
                <div className="p-2 space-y-4">
                    {/* Available Categories */}
                    <div className="space-y-1">
                        <div className="px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
                            Available
                        </div>
                        {availableCategories.map((category) => {
                            const Icon = category.icon
                            const isActive = activeCategory === category.id
                            const isDanger = category.id === "danger-zone"
                            return (
                                <Button
                                    key={category.id}
                                    variant={isActive ? "secondary" : "ghost"}
                                    className={cn(
                                        "w-full justify-start gap-3 h-10",
                                        isActive && "bg-accent",
                                        isDanger && "text-destructive hover:text-destructive"
                                    )}
                                    onClick={() => setActiveCategory(category.id)}
                                >
                                    <Icon className="h-4 w-4" />
                                    <span className="truncate">{category.label}</span>
                                </Button>
                            )
                        })}
                    </div>

                    {/* Restricted Categories */}
                    {restrictedCategories.length > 0 && (
                        <div className="space-y-1 pt-2 border-t">
                            <div className="px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                                <Lock className="h-3 w-3" />
                                Restricted
                            </div>
                            {restrictedCategories.map((category) => {
                                const Icon = category.icon
                                return (
                                    <div
                                        key={category.id}
                                        className="flex items-center gap-3 h-10 px-4 text-muted-foreground/60 cursor-not-allowed"
                                    >
                                        <Icon className="h-4 w-4" />
                                        <span className="truncate">{category.label}</span>
                                        <Lock className="h-3 w-3 ml-auto" />
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    )

    // Center Panel - Settings Content
    const centerPanelContent = (
        <div className="flex flex-col h-full min-h-0">
            <div className="flex-shrink-0 border-b bg-muted/30">
                <ContainerHeader
                    title={activeSettingInfo?.label ?? "Settings"}
                    subtitle={activeSettingInfo?.description}
                    icon={activeSettingInfo?.icon ?? Settings}
                />
            </div>

            <ScrollArea className="flex-1 min-h-0">
                <div className="p-6 space-y-6">
                    {/* Preferences Tab */}
                    {activeCategory === "preferences" && (
                        <div className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Theme</CardTitle>
                                    <CardDescription>Customize the appearance for this workspace</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">Theme settings will appear here.</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Display Density</CardTitle>
                                    <CardDescription>Adjust spacing and layout density</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">Density settings will appear here.</p>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Notifications Tab */}
                    {activeCategory === "notifications" && (
                        <div className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Workspace Notifications</CardTitle>
                                    <CardDescription>Configure how you receive notifications from this workspace</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">Notification settings will appear here.</p>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* General Tab (Admin+) */}
                    {activeCategory === "general" && (
                        <div className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Workspace Details</CardTitle>
                                    <CardDescription>Update workspace name, description, and icon</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">Workspace details form will appear here.</p>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Members Tab (Admin+) */}
                    {activeCategory === "members" && (
                        <div className="space-y-4">
                            <Alert>
                                <Users className="h-4 w-4" />
                                <AlertDescription>
                                    For full member management, go to{" "}
                                    <Button
                                        variant="link"
                                        className="h-auto p-0"
                                        onClick={() => router.push("/dashboard/user-management")}
                                    >
                                        User Management
                                        <ExternalLink className="h-3 w-3 ml-1" />
                                    </Button>
                                </AlertDescription>
                            </Alert>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Quick Member Overview</CardTitle>
                                    <CardDescription>View members of this workspace</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">Member list will appear here.</p>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Features Tab (Admin+) */}
                    {activeCategory === "features" && (
                        <div className="space-y-4">
                            <Alert>
                                <Layers className="h-4 w-4" />
                                <AlertDescription>
                                    For feature installation and management, go to{" "}
                                    <Button
                                        variant="link"
                                        className="h-auto p-0"
                                        onClick={() => router.push("/dashboard/menus")}
                                    >
                                        Menu Store
                                        <ExternalLink className="h-3 w-3 ml-1" />
                                    </Button>
                                </AlertDescription>
                            </Alert>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Installed Features</CardTitle>
                                    <CardDescription>Features enabled in this workspace</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">Feature list with settings will appear here.</p>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Security Tab (Owner) */}
                    {activeCategory === "security" && (
                        <div className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Access Control</CardTitle>
                                    <CardDescription>Manage who can access this workspace</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">Security settings will appear here.</p>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    {/* Danger Zone (Owner only) */}
                    {activeCategory === "danger-zone" && (
                        <div className="space-y-4">
                            <Alert variant="destructive">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription>
                                    These actions are destructive and cannot be undone.
                                </AlertDescription>
                            </Alert>
                            <Card className="border-destructive">
                                <CardHeader>
                                    <CardTitle className="text-destructive">Transfer Ownership</CardTitle>
                                    <CardDescription>Transfer this workspace to another user</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button variant="outline" className="text-destructive border-destructive">
                                        Transfer Ownership
                                    </Button>
                                </CardContent>
                            </Card>
                            <Card className="border-destructive">
                                <CardHeader>
                                    <CardTitle className="text-destructive">Delete Workspace</CardTitle>
                                    <CardDescription>Permanently delete this workspace and all its data</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button variant="destructive">
                                        Delete Workspace
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>
    )

    if (!workspaceId) {
        return (
            <div className="flex h-full items-center justify-center">
                <p className="text-muted-foreground">No workspace selected</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col w-full h-full overflow-hidden">
            <div className="flex-shrink-0 border-b">
                <FeatureHeader
                    icon={Settings}
                    title="Workspace Settings"
                    subtitle={workspace?.name ? `Settings for ${workspace.name}` : "Configure workspace"}
                />
            </div>

            <div className="flex-1 min-h-0">
                <ThreeColumnLayoutAdvanced
                    left={leftPanelContent}
                    center={centerPanelContent}
                    right={null}
                    leftLabel="Categories"
                    centerLabel="Settings"
                    rightLabel="Preview"
                    leftWidth={260}
                    rightWidth={0}
                    rightCollapsed
                    centerMinWidth={400}
                    showCollapseButtons={false}
                />
            </div>
        </div>
    )
}
