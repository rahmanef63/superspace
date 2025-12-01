"use client"

import { useEffect, useMemo, useState } from "react"
import type { Id } from "@convex/_generated/dataModel"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Settings, User, Puzzle } from "lucide-react"
import { SettingsView, SettingsRegistryProvider } from "@/frontend/shared/settings"
import { DynamicSettingsView } from "@/frontend/shared/settings/components/DynamicSettingsView"
import { FeatureSettingsSync } from "@/frontend/shared/settings/components/FeatureSettingsSync"
import { WorkspaceSettings } from "@/frontend/shared/settings/workspace"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

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
        value: "personal",
        label: "Personal",
        icon: User,
        description: "Configure your profile, preferences, and notifications.",
      },
      {
        value: "features",
        label: "Features",
        icon: Puzzle,
        description: "Configure settings for installed features.",
        disabled: !hasWorkspace,
      },
      {
        value: "workspace",
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
      <div className="border-b border-border px-6 py-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold leading-tight">Settings</h1>
            <p className="text-sm text-muted-foreground">
              Customize your personal experience and workspace configuration from a single place.
            </p>
          </div>
          {!hasWorkspace && (
            <Badge variant="outline" className="gap-1">
              <AlertTriangle className="h-3.5 w-3.5" />
              Workspace unavailable
            </Badge>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex h-full flex-col gap-0">
        <div className="border-b border-border px-6 py-4">
          <TabsList>
            {tabs.map(({ value, label, icon: Icon, disabled }) => (
              <TabsTrigger key={value} value={value} disabled={disabled}>
                <Icon className="h-4 w-4" />
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
