"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    User,
    Shield,
    Bell,
    Monitor,
    Smartphone,
    HelpCircle,
    Globe,
    Briefcase,
    Users,
    Activity,
    BrainCircuit,
    Lock,
    MessageCircle,
    Layout,
    FileImage,
    Settings,
    Building2
} from "lucide-react"

// ============================================================
// Types
// ============================================================
export type SettingsTabType = "workspace" | "global"
export type SettingsId = string

export interface SettingsMenuItem {
    id: SettingsId
    label: string
    icon?: React.ElementType
    description?: string
}

export interface SettingsMenuSection {
    label: string
    items: SettingsMenuItem[]
}

// ============================================================
// Workspace Settings Menu (This Workspace tab)
// ============================================================
export const WORKSPACE_SETTINGS_MENU: SettingsMenuSection[] = [
    {
        label: "Workspace",
        items: [
            { id: "ws_general", label: "General", icon: Building2, description: "Workspace name, description, and icon" },
            { id: "ws_members", label: "Members", icon: Users, description: "Manage team members and invitations" },
            { id: "ws_roles", label: "Roles & Permissions", icon: Shield, description: "Configure access levels" },
        ]
    },
    {
        label: "Features",
        items: [
            { id: "ws_features", label: "Installed Features", icon: Layout, description: "Enable or disable features" },
            { id: "ws_menus", label: "Menu Store", icon: Settings, description: "Customize sidebar menus" },
        ]
    },
    {
        label: "Advanced",
        items: [
            { id: "ws_security", label: "Security", icon: Lock, description: "2FA, sessions, and audit logs" },
            { id: "ws_billing", label: "Billing", icon: Briefcase, description: "Plans and payment methods" },
            { id: "ws_danger", label: "Danger Zone", icon: Shield, description: "Delete or transfer workspace" },
        ]
    }
]

// ============================================================
// Global Settings Menu (Global tab)
// ============================================================
export const GLOBAL_SETTINGS_MENU: SettingsMenuSection[] = [
    {
        label: "Your Experience",
        items: [
            { id: "gl_activity", label: "Activity & Usage", icon: Activity, description: "Login history and sessions" },
            { id: "gl_ai", label: "AI Experience", icon: BrainCircuit, description: "AI assistance preferences" },
            { id: "gl_productivity", label: "Productivity", icon: Globe, description: "Defaults and shortcuts" },
        ]
    },
    {
        label: "Privacy & Visibility",
        items: [
            { id: "gl_privacy", label: "Profile Visibility", icon: Lock, description: "Who can see your profile" },
            { id: "gl_discovery", label: "Search & Discovery", icon: User, description: "How others find you" },
        ]
    },
    {
        label: "App & Media",
        items: [
            { id: "gl_theme", label: "Display & Theme", icon: Monitor, description: "Dark mode, colors, fonts" },
            { id: "gl_notifications", label: "Notifications", icon: Bell, description: "Email and push settings" },
            { id: "gl_devices", label: "Devices", icon: Smartphone, description: "Manage logged-in devices" },
        ]
    },
    {
        label: "Account",
        items: [
            { id: "gl_account", label: "Account Settings", icon: User, description: "Email, password, 2FA" },
            { id: "gl_help", label: "Help & Support", icon: HelpCircle, description: "FAQs and contact support" },
        ]
    }
]

// ============================================================
// Layout Component Props
// ============================================================
interface TwoTabSettingsLayoutProps {
    children: React.ReactNode
    activeTab: SettingsTabType
    activeId: SettingsId
    onTabChange: (tab: SettingsTabType) => void
    onNavigate: (id: SettingsId) => void
    workspaceName?: string
    className?: string
}

// ============================================================
// Two-Tab Settings Layout Component
// ============================================================
export function TwoTabSettingsLayout({
    children,
    activeTab,
    activeId,
    onTabChange,
    onNavigate,
    workspaceName = "Current Workspace",
    className
}: TwoTabSettingsLayoutProps) {
    const currentMenu = activeTab === "workspace" ? WORKSPACE_SETTINGS_MENU : GLOBAL_SETTINGS_MENU

    return (
        <div className={cn("flex h-full w-full bg-background", className)}>
            {/* Sidebar */}
            <div className="w-[280px] border-r flex flex-col h-full bg-muted/10">
                {/* Header with Tabs */}
                <div className="p-4 pb-2 space-y-3">
                    <h2 className="text-lg font-bold tracking-tight px-2">Settings</h2>
                    <Tabs value={activeTab} onValueChange={(v) => onTabChange(v as SettingsTabType)} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 h-9">
                            <TabsTrigger value="workspace" className="text-xs">
                                <Building2 className="h-3.5 w-3.5 mr-1.5" />
                                This Workspace
                            </TabsTrigger>
                            <TabsTrigger value="global" className="text-xs">
                                <Globe className="h-3.5 w-3.5 mr-1.5" />
                                Global
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                {/* Menu Items */}
                <ScrollArea className="flex-1 px-3">
                    <div className="space-y-4 py-2 pb-8">
                        {currentMenu.map((section, idx) => (
                            <div key={section.label}>
                                <h3 className="mb-1.5 px-3 text-[10px] font-semibold text-muted-foreground/60 uppercase tracking-wider">
                                    {section.label}
                                </h3>
                                <div className="space-y-0.5">
                                    {section.items.map((item) => {
                                        const Icon = item.icon
                                        const isActive = activeId === item.id
                                        return (
                                            <Button
                                                key={item.id}
                                                variant={isActive ? "secondary" : "ghost"}
                                                size="sm"
                                                className={cn(
                                                    "w-full justify-start h-9 px-3 font-normal",
                                                    isActive && "font-medium bg-secondary"
                                                )}
                                                onClick={() => onNavigate(item.id)}
                                            >
                                                {Icon && <Icon className="mr-2.5 h-4 w-4 text-muted-foreground" />}
                                                <span className="truncate">{item.label}</span>
                                            </Button>
                                        )
                                    })}
                                </div>
                                {idx < currentMenu.length - 1 && <Separator className="mt-3 opacity-30" />}
                            </div>
                        ))}
                    </div>
                </ScrollArea>

                {/* Footer */}
                <div className="p-3 border-t bg-muted/20">
                    <div className="flex items-center gap-2.5 px-2">
                        <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center">
                            <Settings className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                            <p className="font-medium text-foreground truncate">{activeTab === "workspace" ? workspaceName : "Global Settings"}</p>
                            <p className="text-[10px]">SuperSpace v1.0</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-background">
                <ScrollArea className="flex-1">
                    <div className="max-w-3xl mx-auto p-6 md:p-8">
                        {children}
                    </div>
                </ScrollArea>
            </div>
        </div>
    )
}

// ============================================================
// Legacy Export (for backward compatibility during transition)
// ============================================================
export const COMPREHENSIVE_SETTINGS_MENU = GLOBAL_SETTINGS_MENU
export type { TwoTabSettingsLayoutProps as ComprehensiveSettingsLayoutProps }
export { TwoTabSettingsLayout as ComprehensiveSettingsLayout }
