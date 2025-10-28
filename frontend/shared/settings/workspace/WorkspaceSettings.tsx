"use client"

import { useEffect, useMemo, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { useQuery } from "convex/react"
import {
  Settings2,
  AlertTriangle,
  MessageSquare,
  Bell,
  Bot,
  Phone,
  Mic,
  Camera,
  FileText,
  ClipboardList,
  BarChart3,
  BookOpen,
  Calendar,
} from "lucide-react"
import type { Id } from "@convex/_generated/dataModel"
import { api } from "@/convex/_generated/api"
import {
  DynamicSettingsView
} from "@/frontend/shared/settings/components/DynamicSettingsView"
import {
  SettingsRegistryProvider
} from "@/frontend/shared/settings/SettingsRegistry"
import {
  useSettingsRegistry
} from "@/frontend/shared/settings/SettingsRegistry"
import { GeneralSettings } from "./GeneralSettings"
import { DangerZoneSettings } from "./DangerZoneSettings"
import type { SettingsCategory } from "@/frontend/shared/settings/types"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  getFeatureSettingsBuilder,
  hasFeatureSettings,
} from "@/frontend/shared/settings/featureSettingsRegistry"

type MenuItemRecord = {
  _id: Id<"menuItems">
  name: string
  slug: string
  type: "folder" | "route" | "divider" | "action" | "chat" | "document" | string
  icon?: string | null
  path?: string | null
  metadata?: Record<string, any>
}

type FeatureSettingsBuilder = (ctx: {
  menuItem: MenuItemRecord
}) => Omit<SettingsCategory, "featureSlug">[]

export const FEATURE_SETTINGS_DEFAULT_CATEGORY: Record<string, string> = {
  chats: "chats-settings",
  chat: "chat-general",
  calls: "calls-quality",
  ai: "ai-settings",
  status: "status-settings",
  documents: "documents-settings",
  calendar: "calendar-settings",
  reports: "reports-settings",
  tasks: "tasks-settings",
  wiki: "wiki-settings",
}

const buildPlaceholderCategory = (
  id: string,
  icon: SettingsCategory["icon"],
  order: number,
  featureName: string,
  description?: string
): Omit<SettingsCategory, "featureSlug"> => ({
  id,
  label: featureName,
  icon,
  order,
  component: () => (
    <FeatureSettingsPlaceholder
      featureName={featureName}
      description={description}
    />
  ),
})

const FEATURE_SETTINGS_BUILDERS: Record<string, FeatureSettingsBuilder> = {
  chats: ({ menuItem }) => [
    buildPlaceholderCategory(
      FEATURE_SETTINGS_DEFAULT_CATEGORY.chats,
      MessageSquare,
      90,
      menuItem.name || "Chats",
      "Manage chat behaviors, message retention, and inbox defaults."
    ),
  ],
  // NOTE: chat and calls settings now registered dynamically via featureSettingsRegistry
  // Features register their settings at app initialization
  // See: frontend/shared/settings/featureSettingsRegistry.ts
  ai: ({ menuItem }) => [
    buildPlaceholderCategory(
      FEATURE_SETTINGS_DEFAULT_CATEGORY.ai,
      Bot,
      150,
      menuItem.name || "AI",
      "Configure AI assistants, smart replies, and automation settings."
    ),
  ],
  status: ({ menuItem }) => [
    buildPlaceholderCategory(
      FEATURE_SETTINGS_DEFAULT_CATEGORY.status,
      Camera,
      220,
      menuItem.name || "Status",
      "Control who can view and interact with status updates."
    ),
  ],
  documents: ({ menuItem }) => [
    buildPlaceholderCategory(
      FEATURE_SETTINGS_DEFAULT_CATEGORY.documents,
      FileText,
      300,
      menuItem.name || "Documents",
      "Set up templates, permissions, and editing defaults."
    ),
  ],
  reports: ({ menuItem }) => [
    buildPlaceholderCategory(
      FEATURE_SETTINGS_DEFAULT_CATEGORY.reports,
      BarChart3,
      400,
      menuItem.name || "Reports",
      "Configure data sources, refresh schedules, and visibility."
    ),
  ],
  calendar: ({ menuItem }) => [
    buildPlaceholderCategory(
      FEATURE_SETTINGS_DEFAULT_CATEGORY.calendar,
      Calendar,
      420,
      menuItem.name || "Calendar",
      "Manage calendars, default views, and event syncing."
    ),
  ],
  tasks: ({ menuItem }) => [
    buildPlaceholderCategory(
      FEATURE_SETTINGS_DEFAULT_CATEGORY.tasks,
      ClipboardList,
      500,
      menuItem.name || "Tasks",
      "Customize task states, notifications, and automations."
    ),
  ],
  wiki: ({ menuItem }) => [
    buildPlaceholderCategory(
      FEATURE_SETTINGS_DEFAULT_CATEGORY.wiki,
      BookOpen,
      600,
      menuItem.name || "Wiki",
      "Manage knowledge base structure and contributor permissions."
    ),
  ],
}

function WorkspaceFeatureSettingsSync({ workspaceId }: { workspaceId: Id<"workspaces"> }) {
  const { registerSettings, unregisterSettings } = useSettingsRegistry()
  const previouslyRegistered = useRef<Set<string>>(new Set())

  const menuItems = useQuery(
    (api as any)["menu/store/menuItems"].getWorkspaceMenuItems,
    workspaceId ? { workspaceId } : "skip"
  ) as MenuItemRecord[] | undefined

  const featureMenuItems = useMemo(() => {
    if (!Array.isArray(menuItems)) {
      return []
    }

    return menuItems.filter(
      (item) =>
        item &&
        typeof item.slug === "string" &&
        !["folder", "divider", "action"].includes(item.type)
    )
  }, [menuItems])

  useEffect(() => {
    if (!workspaceId || featureMenuItems.length === 0) {
      previouslyRegistered.current.forEach((slug) => unregisterSettings(slug))
      previouslyRegistered.current = new Set()
      return
    }

    const registeredThisRun = new Set<string>()

    featureMenuItems.forEach((menuItem) => {
      // Try registry first (new dynamic registration)
      const registryBuilder = getFeatureSettingsBuilder(menuItem.slug)
      // Fallback to static builders (placeholders)
      const builder = registryBuilder || FEATURE_SETTINGS_BUILDERS[menuItem.slug]
      const categories = builder ? builder({ menuItem }) : []

      if (categories.length > 0) {
        registerSettings({
          featureSlug: menuItem.slug,
          categories,
        })
        registeredThisRun.add(menuItem.slug)
      } else {
        unregisterSettings(menuItem.slug)
      }
    })

    previouslyRegistered.current.forEach((slug) => {
      if (!registeredThisRun.has(slug)) {
        unregisterSettings(slug)
      }
    })

    previouslyRegistered.current = registeredThisRun
  }, [featureMenuItems, registerSettings, unregisterSettings, workspaceId])

  return null
}

function FeatureSettingsPlaceholder({
  featureName,
  description,
}: {
  featureName: string
  description?: string
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{featureName} Settings</CardTitle>
          <CardDescription>
            {description || "Configuration options will appear here soon."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            We're working on exposing detailed configuration for {featureName}.
            Installed features without dedicated controls show this preview so
            teams know where settings will live.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export function getWorkspaceFeatureDefaultCategory(slug: string): string | undefined {
  return FEATURE_SETTINGS_DEFAULT_CATEGORY[slug]
}

export interface WorkspaceSettingsProps {
  workspaceId: Id<"workspaces">
}

export function WorkspaceSettings({ workspaceId }: WorkspaceSettingsProps) {
  const searchParams = useSearchParams()
  const requestedCategory = searchParams.get("category") ?? undefined
  const resolvedDefaultCategory = useMemo(() => {
    if (!requestedCategory) return "general"
    return FEATURE_SETTINGS_DEFAULT_CATEGORY[requestedCategory] ?? requestedCategory
  }, [requestedCategory])

  const coreCategories: SettingsCategory[] = useMemo(
    () => [
      {
        id: "general",
        label: "General",
        icon: Settings2,
        order: 0,
        component: () => <GeneralSettings workspaceId={workspaceId} />,
      },
      {
        id: "danger-zone",
        label: "Danger Zone",
        icon: AlertTriangle,
        order: 1000,
        component: () => <DangerZoneSettings workspaceId={workspaceId} />,
      },
    ],
    [workspaceId]
  )

  return (
    <SettingsRegistryProvider
      coreSettings={coreCategories}
      defaultCategory={resolvedDefaultCategory}
    >
      <WorkspaceFeatureSettingsSync workspaceId={workspaceId} />
      <DynamicSettingsView
        title="Workspace Settings"
        description="Manage your workspace configuration and installed feature settings"
        groupByFeature
      />
    </SettingsRegistryProvider>
  )
}
