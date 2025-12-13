/**
 * Communications Feature Initialization
 * 
 * Registers settings sections and any feature-specific setup.
 * Called during app initialization.
 * 
 * @module features/communications/init
 */

import { registerFeatureSettings } from "@/frontend/shared/settings"
import { Hash, Bell, Video, Shield, Bot } from "lucide-react"
import { CommunicationsSettingsPlaceholder } from "./settings"
import { registerCommunicationsAgent } from "./agents"
// Settings components will be created in ./settings/ folder
// import { ChannelSettings } from "./settings/ChannelSettings"
// import { NotificationSettings } from "./settings/NotificationSettings"
// import { CallSettings } from "./settings/CallSettings"
// import { PrivacySettings } from "./settings/PrivacySettings"
// import { AIBotSettings } from "./settings/AIBotSettings"

/**
 * Initialize the Communications feature
 * - Registers settings sections
 * - Sets up any required listeners or providers
 */
export function initCommunicationsFeature() {
  // Register Communications settings with the registry
  registerFeatureSettings("communications", (ctx) => [
    {
      id: "communications-channels",
      label: "Channels",
      icon: Hash,
      order: 1,
      description: "Channel creation and management settings",
      // component: ChannelSettings,
      component: CommunicationsSettingsPlaceholder,
    },
    {
      id: "communications-notifications",
      label: "Notifications",
      icon: Bell,
      order: 2,
      description: "Message and call notification preferences",
      // component: NotificationSettings,
      component: CommunicationsSettingsPlaceholder,
    },
    {
      id: "communications-calls",
      label: "Voice & Video",
      icon: Video,
      order: 3,
      description: "Call settings including audio/video defaults",
      // component: CallSettings,
      component: CommunicationsSettingsPlaceholder,
    },
    {
      id: "communications-privacy",
      label: "Privacy",
      icon: Shield,
      order: 4,
      description: "Who can message you and see your status",
      // component: PrivacySettings,
      component: CommunicationsSettingsPlaceholder,
    },
    {
      id: "communications-ai-bots",
      label: "AI Bots",
      icon: Bot,
      order: 5,
      description: "Configure AI assistants for channels",
      // component: AIBotSettings,
      component: CommunicationsSettingsPlaceholder,
    },
  ])

  registerCommunicationsAgent()
}

// Auto-init when module is imported (if settings registry exists)
try {
  initCommunicationsFeature()
} catch (error) {
  // Settings registry may not be available during build
  console.debug("[Communications] Deferred settings registration")
}

export default initCommunicationsFeature
