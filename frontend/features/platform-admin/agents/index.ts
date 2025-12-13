import { subAgentRegistry } from "@/frontend/features/ai/agents"
import type { SubAgent } from "@/frontend/features/ai/agents"

export function registerPlatformAdminAgent() {
  const agent: SubAgent = {
    id: "platform-admin-agent",
    name: "Platform Admin Agent",
    description: "Helps manage platform-level administration.",
    featureId: "platform-admin",
    tools: [
      {
        name: "summarize",
        description: "Summarize platform admin feature status.",
        parameters: {},
        handler: async (_params, ctx) => {
          return {
            success: true,
            data: {
              featureSlug: "platform-admin",
              workspaceId: ctx.workspaceId,
              note: "Scaffolded tool. Implement real tools under convex/features/platformAdmin/agents.",
            },
            message: "OK",
          }
        },
      },
    ],
    canHandle: (query) => {
      const q = query.toLowerCase()
      if (q.includes("platform admin") || q.includes("super admin") || q.includes("feature flag") || q.includes("workspace")) return 0.6
      return 0
    },
  }

  subAgentRegistry.register(agent, { priority: 10, enabled: true })
}
