/**
 * AI Feature Initialization
 * Registers AI settings with the shared settings registry
 */

import { registerFeatureSettings } from "@/frontend/shared/settings"
import { Bot, Sliders, Shield, Sparkles } from "lucide-react"
import {
  AIGeneralSettings,
  AIBehaviorSettings,
  AIPrivacySettings,
  AIPersonalizationSettings,
} from "./settings"

registerFeatureSettings("ai", () => [
  {
    id: "ai-general",
    label: "AI Assistant",
    icon: Bot,
    order: 100,
    component: AIGeneralSettings,
  },
  {
    id: "ai-behavior",
    label: "Behavior",
    icon: Sliders,
    order: 110,
    component: AIBehaviorSettings,
  },
  {
    id: "ai-privacy",
    label: "Privacy",
    icon: Shield,
    order: 120,
    component: AIPrivacySettings,
  },
  {
    id: "ai-personalization",
    label: "Personalization",
    icon: Sparkles,
    order: 130,
    component: AIPersonalizationSettings,
  },
])

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  console.log("✅ AI feature settings registered")
}
