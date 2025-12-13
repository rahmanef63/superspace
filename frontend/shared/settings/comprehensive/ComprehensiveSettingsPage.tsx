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

// Placeholder for sections not yet implemented
const PlaceholderSettings = ({ title }: { title: string }) => (
    <div className="space-y-6">
        <div>
            <h3 className="text-lg font-medium">{title}</h3>
            <p className="text-sm text-muted-foreground">This section is coming soon.</p>
        </div>
        <Separator />
        <div className="h-40 rounded-lg border border-dashed flex items-center justify-center text-muted-foreground bg-muted/10">
            Settings content for {title}
        </div>
    </div>
)

export function ComprehensiveSettingsPage() {
    const [activeTab, setActiveTab] = React.useState<SettingsTabType>("workspace")
    const [activeId, setActiveId] = React.useState<SettingsId>("ws_general")
    const { workspaceId } = useWorkspaceContext()

    // Fetch workspace name for display
    const workspaceData = useQuery(
        (api as any)["workspace/workspaces"]?.getWorkspace,
        workspaceId ? { workspaceId: workspaceId as Id<"workspaces"> } : "skip"
    ) as { name?: string } | null | undefined

    // Reset activeId when tab changes
    const handleTabChange = (tab: SettingsTabType) => {
        setActiveTab(tab)
        // Set default item for each tab
        setActiveId(tab === "workspace" ? "ws_general" : "gl_activity")
    }

    const renderContent = () => {
        // ==========================================
        // Workspace Settings (This Workspace tab)
        // ==========================================
        if (activeTab === "workspace") {
            switch (activeId) {
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
        >
            {renderContent()}
        </TwoTabSettingsLayout>
    )
}
