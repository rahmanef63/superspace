"use client"

/**
 * Settings Page (Personal Only)
 * 
 * Simplified settings page focused on personal/user-level preferences.
 * Workspace settings have been moved to Workspace Store.
 * Feature settings are accessible via each feature's settings button.
 */

import { Settings } from "lucide-react"
import { SettingsView } from "@/frontend/shared/settings"
import { FeatureHeader } from "@/frontend/shared/ui/layout/header"

export interface SettingsPageProps {
  // workspaceId is no longer needed since this is personal settings only
  workspaceId?: unknown
}

export default function SettingsPage(_props: SettingsPageProps) {
  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <FeatureHeader
        icon={Settings}
        title="Settings"
        subtitle="Customize your personal experience, preferences, and account settings."
      />

      <div className="flex flex-1 overflow-hidden">
        <SettingsView defaultCategory="general" />
      </div>
    </div>
  )
}
