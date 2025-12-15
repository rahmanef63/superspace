"use client"

import * as React from "react"
import { TwoTabSettingsLayout, SettingsId, SettingsTabType } from "./layout"
import { ActivityUsageSettings } from "./sections/ActivityUsageSettings"
import { AIExperienceSettings } from "./sections/AIExperienceSettings"
import { PrivacySettings } from "./sections/PrivacySettings"
import { FamilySettings } from "./sections/FamilySettings"
import { PersonalizationSettings } from "../personal/PersonalizationSettings"
import { WorkspaceSettingsContent } from "../workspace/WorkspaceSettingsContent"
import { useWorkspaceContext } from "@/frontend/shared/foundation/provider/WorkspaceProvider"
import { Id } from "@/convex/_generated/dataModel"
import { Separator } from "@/components/ui/separator"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { getFeatureSettingsBuilder } from "@/frontend/shared/foundation/utils/registry/feature-settings-registry"
import { SettingsMenuSection } from "./layout"

// Placeholder for sections not yet implemented
const PlaceholderSettings = ({ title }: { title: string }) => (
    <div className="space-y-6">
        <div>
            <h3 className="text-lg font-medium">{title}</h3>
            <p className="text-sm text-muted-foreground">Configure {title.toLowerCase()} settings below.</p>
        </div>
        <Separator />
        <div className="h-40 rounded-lg border border-dashed flex items-center justify-center text-muted-foreground bg-muted/10">
            <div className="text-center">
                <p className="font-medium">{title}</p>
                <p className="text-xs">Settings will appear here</p>
            </div>
        </div>
    </div>
)

interface ComprehensiveSettingsPageProps {
    defaultTab?: SettingsTabType
    defaultId?: SettingsId
    defaultFeatureSlug?: string
}

export function ComprehensiveSettingsPage({
    defaultTab = "workspace",
    defaultId,
    defaultFeatureSlug
}: ComprehensiveSettingsPageProps) {
    const [activeTab, setActiveTab] = React.useState<SettingsTabType>(defaultTab)
    const [activeId, setActiveId] = React.useState<SettingsId>(
        defaultId || (defaultTab === "workspace" ? "ws_appearance" : defaultTab === "features" ? "ft_settings" : "gl_activity")
    )
    const [activeFeatureSlug, setActiveFeatureSlug] = React.useState<string | undefined>(defaultFeatureSlug)

    // Update state if props change (re-opening dialog)
    React.useEffect(() => {
        setActiveTab(defaultTab)
        
        if (defaultTab === "features" && defaultFeatureSlug) {
             const builder = getFeatureSettingsBuilder(defaultFeatureSlug)
             const items = builder ? builder() : []
             if (items.length > 0) {
                 // If defaultId is provided and exists in items, use it. Otherwise use first item.
                 const exists = defaultId && items.some(i => i.id === defaultId)
                 setActiveId(exists ? defaultId! : items[0].id)
             } else {
                 setActiveId("ft_settings")
             }
             setActiveFeatureSlug(defaultFeatureSlug)
        } else {
             setActiveId(defaultId || (defaultTab === "workspace" ? "ws_appearance" : defaultTab === "features" ? "ft_settings" : "gl_activity"))
             if (defaultTab !== "features") {
                 setActiveFeatureSlug(undefined)
             }
        }
    }, [defaultTab, defaultId, defaultFeatureSlug])

    const { workspaceId } = useWorkspaceContext()

    // Fetch workspace name for display
    const workspaceData = useQuery(
        (api as any)["workspace/workspaces"]?.getWorkspace,
        workspaceId ? { workspaceId: workspaceId as Id<"workspaces"> } : "skip"
    ) as { name?: string } | null | undefined

    // Generate dynamic menu for features
    const featuresMenu = React.useMemo(() => {
        if (!activeFeatureSlug) return undefined
        
        const builder = getFeatureSettingsBuilder(activeFeatureSlug)
        if (!builder) return undefined
        
        const items = builder()
        
        return [{
            label: activeFeatureSlug.charAt(0).toUpperCase() + activeFeatureSlug.slice(1),
            items: items.map(item => ({
                id: item.id,
                label: item.label,
                icon: item.icon,
                description: item.description
            }))
        }] as SettingsMenuSection[]
    }, [activeFeatureSlug])

    // Reset activeId when tab changes
    const handleTabChange = (tab: SettingsTabType) => {
        setActiveTab(tab)
        // Set default item for each tab
        if (tab === "workspace") setActiveId("ws_appearance")
        else if (tab === "features") {
            // If we have an active feature, try to select its first item
            if (activeFeatureSlug) {
                const builder = getFeatureSettingsBuilder(activeFeatureSlug)
                const items = builder ? builder() : []
                if (items.length > 0) {
                    setActiveId(items[0].id)
                    return
                }
            }
            setActiveId("ft_settings")
        }
        else setActiveId("gl_activity")
    }

    const renderContent = () => {
        // ==========================================
        // Workspace Settings (This Workspace tab)
        // ==========================================
        if (activeTab === "workspace") {
            switch (activeId) {
                case "ws_appearance":
                    return <WorkspaceSettingsContent workspaceId={workspaceId as Id<"workspaces">} activeCategory="appearance" />
                case "ws_general":
                    return <WorkspaceSettingsContent workspaceId={workspaceId as Id<"workspaces">} activeCategory="general" />
                case "ws_members":
                    return <WorkspaceSettingsContent workspaceId={workspaceId as Id<"workspaces">} activeCategory="members" />
                case "ws_roles":
                    return <WorkspaceSettingsContent workspaceId={workspaceId as Id<"workspaces">} activeCategory="roles" />
                case "ws_features":
                    return <WorkspaceSettingsContent workspaceId={workspaceId as Id<"workspaces">} activeCategory="features" />
                case "ws_menus":
                    return <PlaceholderSettings title="Menu Store" />
                case "ws_security":
                    return <WorkspaceSettingsContent workspaceId={workspaceId as Id<"workspaces">} activeCategory="security" />
                case "ws_billing":
                    return <PlaceholderSettings title="Billing & Plans" />
                case "ws_danger":
                    return <PlaceholderSettings title="Danger Zone" />
                default:
                    return <PlaceholderSettings title="Workspace Settings" />
            }
        }


        // ==========================================
        // Features Settings (Features tab)
        // ==========================================
        if (activeTab === "features") {
            // Try to find the component in the active feature settings
            if (activeFeatureSlug) {
                const builder = getFeatureSettingsBuilder(activeFeatureSlug)
                const items = builder ? builder() : []
                const activeItem = items.find(item => item.id === activeId)
                
                if (activeItem && activeItem.component) {
                    const Component = activeItem.component
                    return <Component />
                }
            }

            switch (activeId) {
                case "ft_settings":
                    return <PlaceholderSettings title="Feature Settings" />
                default:
                    return <PlaceholderSettings title="Feature Settings" />
            }
        }

        // ==========================================
        // Global Settings (Global tab)
        // ==========================================
        switch (activeId) {
            // Your Experience
            case "gl_activity": return <ActivityUsageSettings />
            case "gl_ai": return <AIExperienceSettings />
            case "gl_productivity": return <PlaceholderSettings title="Productivity Preferences" />

            // Privacy & Visibility
            case "gl_privacy":
            case "gl_discovery":
                return <PrivacySettings />

            // App & Media
            case "gl_theme": return <PersonalizationSettings />
            case "gl_notifications": return <PlaceholderSettings title="Notification Preferences" />
            case "gl_devices": return <PlaceholderSettings title="Manage Devices" />

            // Account
            case "gl_account": return <PlaceholderSettings title="Account Settings" />
            case "gl_help": return <PlaceholderSettings title="Help & Support" />

            default:
                return <PlaceholderSettings title="Global Settings" />
        }
    }

    return (
        <TwoTabSettingsLayout
            activeTab={activeTab}
            activeId={activeId}
            onTabChange={handleTabChange}
            onNavigate={setActiveId}
            workspaceName={workspaceData?.name || "Current Workspace"}
            featuresMenu={featuresMenu}
        >
            {renderContent()}
        </TwoTabSettingsLayout>
    )
}
