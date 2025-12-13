import { subAgentRegistry } from "@/frontend/features/ai/agents"
import type { SubAgent } from "@/frontend/features/ai/agents"

export function registerSupportAgent() {
  const agent: SubAgent = {
    id: "support-agent",
    name: "Support Agent",
    description: "Helps with tickets, SLAs, and support workflows.",
    featureId: "support",
    tools: [
      {
        name: "summarize",
        description: "Summarize support feature status.",
        parameters: {},
        handler: async (_params, ctx) => {
          return {
            success: true,
            data: {
              featureSlug: "support",
              workspaceId: ctx.workspaceId,
              note: "Scaffolded tool. Implement real tools under convex/features/support/agents.",
            },
            message: "OK",
          }
        },
      },
    ],
    canHandle: (query) => {
      const q = query.toLowerCase()
      if (q.includes("support") || q.includes("ticket") || q.includes("sla")) return 0.6
      return 0
    },
  }

  subAgentRegistry.register(agent, { priority: 10, enabled: true })
}
