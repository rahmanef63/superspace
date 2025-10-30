/**
 * Chat Feature Initialization
 * Registers chat settings with the shared settings registry
 *
 * Import this file at app initialization to enable chat settings
 */

import { registerFeatureSettings } from "@/frontend/shared/settings"
import { MessageSquare, Bell, Bot } from "lucide-react"
import {
  ChatGeneralSettings,
  ChatNotificationsSettings,
  ChatAISettings,
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
    id: "chat-ai",
    label: "AI Features",
    icon: Bot,
    order: 120,
    component: ChatAISettings,
  },
])

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  console.log("✅ Chat feature settings registered")
}
