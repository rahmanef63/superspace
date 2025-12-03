"use client"

import { useEffect, useMemo, useState } from "react"
import type { Id } from "@convex/_generated/dataModel"
import { AlertTriangle, Settings, User, Puzzle } from "lucide-react"
import { SettingsView, SettingsRegistryProvider } from "@/frontend/shared/settings"
import { DynamicSettingsView } from "@/frontend/shared/settings/components/DynamicSettingsView"
import { FeatureSettingsSync } from "@/frontend/shared/settings/components/FeatureSettingsSync"
import { WorkspaceSettings } from "@/frontend/shared/settings/workspace"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { FeatureHeader } from "@/frontend/shared/ui/layout/header"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/frontend/shared/ui/layout/tabs"

export interface WorkspaceSettingsPageProps {
  workspaceId?: Id<"workspaces"> | null
}

export default function WorkspaceSettingsPage({ workspaceId }: WorkspaceSettingsPageProps) {
  const hasWorkspace = Boolean(workspaceId)
  const [activeTab, setActiveTab] = useState<string>(hasWorkspace ? "workspace" : "personal")

  useEffect(() => {
    if (hasWorkspace) {
      setActiveTab((current) => (current === "workspace" ? current : "workspace"))
    }
  }, [hasWorkspace])

  const tabs = useMemo(
    () => [
      {
        id: "personal",
        label: "Personal",
        icon: User,
        description: "Configure your profile, preferences, and notifications.",
      },
      {
        id: "features",
        label: "Features",
        icon: Puzzle,
        description: "Configure settings for installed features.",
        disabled: !hasWorkspace,
      },
      {
        id: "workspace",
        label: "Workspace",
        icon: Settings,
        description: "Manage workspace defaults, roles, and installed features.",
        disabled: !hasWorkspace,
      },
    ],
    [hasWorkspace]
  )

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <FeatureHeader
        icon={Settings}
        title="Settings"
        subtitle="Customize your personal experience and workspace configuration from a single place."
        badge={!hasWorkspace ? { 
          text: "Workspace unavailable", 
          variant: "outline",
          icon: AlertTriangle,
        } : undefined}
      />

      <Tabs 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        variant="underline"
        className="flex h-full flex-col"
      >
        <div className="border-b border-border px-6">
          <TabsList>
            {tabs.map(({ id, label, icon: Icon, disabled }) => (
              <TabsTrigger key={id} value={id} disabled={disabled} icon={Icon}>
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="personal" className="flex flex-1 overflow-hidden">
          <div className="flex h-full w-full min-h-0 min-w-0 overflow-hidden">
            <SettingsView defaultCategory="general" />
          </div>
        </TabsContent>

        <TabsContent value="features" className="flex flex-1 overflow-hidden">
          {hasWorkspace && workspaceId ? (
            <div className="flex h-full w-full min-h-0 min-w-0 overflow-hidden">
              <SettingsRegistryProvider>
                <FeatureSettingsSync workspaceId={workspaceId} />
                <DynamicSettingsView />
              </SettingsRegistryProvider>
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center p-6">
              <Card className="max-w-md">
                <CardHeader>
                  <CardTitle>No workspace selected</CardTitle>
                  <CardDescription>
                    Feature settings require an active workspace. Select or create a workspace to manage feature
                    configuration.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Switch to a workspace from the sidebar to view settings for installed features.
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="workspace" className="flex flex-1 overflow-hidden">
          {hasWorkspace && workspaceId ? (
            <div className="flex h-full w-full min-h-0 min-w-0 overflow-hidden">
              <WorkspaceSettings workspaceId={workspaceId} />
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center p-6">
              <Card className="max-w-md">
                <CardHeader>
                  <CardTitle>No workspace selected</CardTitle>
                  <CardDescription>
                    Workspace settings require an active workspace. Select or create a workspace to manage shared
                    configuration.
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Switch to a workspace from the sidebar to unlock shared settings for members, features, and defaults.
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
