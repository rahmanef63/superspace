"use client"

/**
 * Settings Page (Personal Settings)
 * 
 * Personal user settings only. For workspace settings, use WorkspaceSettingsPage.
 * - Personal: Account, appearance, notifications, shortcuts
 * - Workspace Settings: Separate page at /workspace-settings
 * - Menu Store: Feature management at /menus
 * - Workspace Store: Workspace management at /workspace-store
 */

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Settings, User, Video, Bell, Palette, HardDrive, Keyboard, HelpCircle, Download, Boxes, Menu, type LucideIcon } from "lucide-react"
import { ThreeColumnLayoutAdvanced } from "@/frontend/shared/ui/layout/container"
import { FeatureHeader, ContainerHeader } from "@/frontend/shared/ui/layout/header"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

// Personal settings components
import {
  GeneralSettings,
  AccountSettings,
  VideoVoiceSettings,
  NotificationSettings,
  PersonalizationSettings,
  StorageSettings,
  ShortcutsSettings,
  HelpSettings,
} from "@/frontend/shared/settings/personal"

import { ImportMigrationSettings } from "@/frontend/shared/settings/workspace/ImportMigrationSettings"
import { useWorkspaceContext } from "@/frontend/shared/foundation/provider/WorkspaceProvider"

interface SettingsCategory {
  id: string
  label: string
  icon: LucideIcon
  component: React.ComponentType<any>
}

const PERSONAL_SETTINGS: SettingsCategory[] = [
  { id: "general", label: "General", icon: Settings, component: GeneralSettings },
  { id: "account", label: "Account", icon: User, component: AccountSettings },
  { id: "video-voice", label: "Video & Voice", icon: Video, component: VideoVoiceSettings },
  { id: "notifications", label: "Notifications", icon: Bell, component: NotificationSettings },
  { id: "personalization", label: "Personalization", icon: Palette, component: PersonalizationSettings },
  { id: "storage", label: "Storage and data", icon: HardDrive, component: StorageSettings },
  { id: "shortcuts", label: "Keyboard shortcuts", icon: Keyboard, component: ShortcutsSettings },
  { id: "import", label: "Import", icon: Download, component: ImportMigrationSettings },
  { id: "help", label: "Help", icon: HelpCircle, component: HelpSettings },
]

// Quick navigation links
const QUICK_LINKS = [
  { id: "workspace-settings", label: "Workspace Settings", icon: Settings, path: "/dashboard/workspace-settings", description: "Configure current workspace" },
  { id: "menu-store", label: "Menu Store", icon: Menu, path: "/dashboard/menus", description: "Manage features and menus" },
  { id: "workspace-store", label: "Workspace Store", icon: Boxes, path: "/dashboard/workspace-store", description: "Manage workspaces" },
]

export interface SettingsPageProps {
  workspaceId?: unknown
}

export default function SettingsPage(_props: SettingsPageProps) {
  const router = useRouter()
  const [activeCategory, setActiveCategory] = useState("general")
  const { workspaceId } = useWorkspaceContext()

  const activeSetting = useMemo(
    () => PERSONAL_SETTINGS.find((s) => s.id === activeCategory) || PERSONAL_SETTINGS[0],
    [activeCategory]
  )

  const ActiveComponent = activeSetting?.component

  // Left Panel - Category List
  const leftPanelContent = (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex-shrink-0 border-b bg-muted/30 px-3 py-2">
        <span className="text-sm font-medium">Personal Settings</span>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="p-2 space-y-4">
          {/* Personal Settings */}
          <div className="space-y-1">
            {PERSONAL_SETTINGS.map((setting) => {
              const Icon = setting.icon
              const isActive = activeCategory === setting.id
              return (
                <Button
                  key={setting.id}
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 h-10",
                    isActive && "bg-accent"
                  )}
                  onClick={() => setActiveCategory(setting.id)}
                >
                  <Icon className="h-4 w-4" />
                  <span className="truncate">{setting.label}</span>
                </Button>
              )
            })}
          </div>

          {/* Quick Links */}
          <div className="pt-4 border-t">
            <div className="px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
              Quick Links
            </div>
            {QUICK_LINKS.map((link) => {
              const Icon = link.icon
              return (
                <Button
                  key={link.id}
                  variant="ghost"
                  className="w-full justify-start gap-3 h-10 text-muted-foreground hover:text-foreground"
                  onClick={() => router.push(link.path)}
                >
                  <Icon className="h-4 w-4" />
                  <span className="truncate">{link.label}</span>
                </Button>
              )
            })}
          </div>
        </div>
      </ScrollArea>
    </div>
  )

  // Center Panel - Settings Content
  const centerPanelContent = (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex-shrink-0 border-b bg-muted/30">
        <ContainerHeader
          title={activeSetting?.label ?? "Settings"}
          subtitle="Personal settings"
          icon={activeSetting?.icon ?? Settings}
        />
      </div>

      <ScrollArea className="flex-1 min-h-0">
        {ActiveComponent && (
          <ActiveComponent workspaceId={workspaceId} />
        )}
      </ScrollArea>
    </div>
  )

  // Right Panel - Quick Links Cards
  const rightPanelContent = (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex-shrink-0 border-b bg-muted/30">
        <ContainerHeader
          title="Related"
          subtitle="Other settings areas"
          icon={Boxes}
        />
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="p-4 space-y-4">
          {QUICK_LINKS.map((link) => {
            const Icon = link.icon
            return (
              <Card
                key={link.id}
                className="cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => router.push(link.path)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-primary" />
                    <CardTitle className="text-sm">{link.label}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-xs">{link.description}</CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )

  return (
    <div className="flex flex-col w-full h-full overflow-hidden">
      <div className="flex-shrink-0 border-b">
        <FeatureHeader
          icon={Settings}
          title="Settings"
          subtitle="Personal preferences and account settings"
        />
      </div>

      <div className="flex-1 min-h-0">
        <ThreeColumnLayoutAdvanced
          left={leftPanelContent}
          center={centerPanelContent}
          right={rightPanelContent}
          leftLabel="Categories"
          centerLabel="Settings"
          rightLabel="Related"
          leftWidth={260}
          rightWidth={280}
          centerMinWidth={400}
          showCollapseButtons={true}
          defaultRightCollapsed={true}
        />
      </div>
    </div>
  )
}
