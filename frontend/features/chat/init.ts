/**
 * Chat Feature Initialization
 * Registers chat settings with the shared settings registry
 *
 * Import this file at app initialization to enable chat settings
 */

import { registerFeatureSettings } from "@/frontend/shared/settings"
import { MessageSquare, Bell, Bot, Shield, Image as ImageIcon } from "lucide-react"
import {
  ChatGeneralSettings,
  ChatNotificationsSettings,
  ChatPrivacySettings,
  ChatAISettings,
  ChatMediaSettings,
} from "./settings/ChatSettings"

// ============================================================================
// Register Chat Settings
// ============================================================================

registerFeatureSettings("chat", () => [
  {
    id: "chat-general",
    label: "Chat",
    icon: MessageSquare,
    order: 100,
    component: ChatGeneralSettings,
  },
  {
    id: "chat-notifications",
    label: "Notifications",
    icon: Bell,
    order: 110,
    component: ChatNotificationsSettings,
  },
  {
    id: "chat-privacy",
    label: "Privacy",
    icon: Shield,
    order: 120,
    component: ChatPrivacySettings,
  },
  {
    id: "chat-ai",
    label: "AI Features",
    icon: Bot,
    order: 130,
    component: ChatAISettings,
  },
  {
    id: "chat-media",
    label: "Media",
    icon: ImageIcon,
    order: 140,
    component: ChatMediaSettings,
  },
])

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  console.log("✅ Chat feature settings registered")
}
