import { subAgentRegistry } from "@/frontend/features/ai/agents"
import type { SubAgent } from "@/frontend/features/ai/agents"

export function registerOverviewAgent() {
  const agent: SubAgent = {
    id: "overview-agent",
    name: "Overview Agent",
    description: "Helps summarize and navigate dashboard overview.",
    featureId: "overview",
    tools: [
      {
        name: "summarize",
        description: "Summarize the current dashboard overview context.",
        parameters: {},
        handler: async (_params, ctx) => {
          return {
            success: true,
            data: {
              featureSlug: "overview",
              workspaceId: ctx.workspaceId,
              note: "Scaffolded tool. Add real read tools under convex/features/overview/agents when available.",
            },
            message: "OK",
          }
        },
      },
    ],
    canHandle: (query) => {
      const q = query.toLowerCase()
      if (q.includes("overview") || q.includes("dashboard")) return 0.7
      return 0
    },
  }

  subAgentRegistry.register(agent, { priority: 10, enabled: true })
}
