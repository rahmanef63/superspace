/**
 * Marketing Feature Initialization
 */

import { registerFeatureSettings } from "@/frontend/shared/settings"
import { Megaphone, Target, Mail, BarChart3 } from "lucide-react"
import {
    MarketingGeneralSettings,
    MarketingCampaignSettings,
    MarketingEmailSettings,
    MarketingAnalyticsSettings,
} from "./settings"
import { registerMarketingAgent } from "./agents"

registerFeatureSettings("marketing", () => [
    {
        id: "marketing-general",
        label: "General",
        icon: Megaphone,
        order: 100,
        component: MarketingGeneralSettings,
    },
    {
        id: "marketing-campaigns",
        label: "Campaigns",
        icon: Target,
        order: 110,
        component: MarketingCampaignSettings,
    },
    {
        id: "marketing-email",
        label: "Email",
        icon: Mail,
        order: 120,
        component: MarketingEmailSettings,
    },
    {
        id: "marketing-analytics",
        label: "Analytics",
        icon: BarChart3,
        order: 130,
        component: MarketingAnalyticsSettings,
    },
])

registerMarketingAgent()

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
    console.log("✅ Marketing feature settings registered")
}
