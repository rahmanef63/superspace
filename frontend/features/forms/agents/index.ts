import { subAgentRegistry } from "@/frontend/features/ai/agents"
import type { SubAgent } from "@/frontend/features/ai/agents"

export function registerFormsAgent() {
  const agent: SubAgent = {
    id: "forms-agent",
    name: "Forms Agent",
    description: "Helps with forms, submissions, and templates.",
    featureId: "forms",
    tools: [
      {
        name: "summarize",
        description: "Summarize forms feature status.",
        parameters: {},
        handler: async (_params, ctx) => {
          return {
            success: true,
            data: {
              featureSlug: "forms",
              workspaceId: ctx.workspaceId,
              note: "Scaffolded tool. Implement real tools under convex/features/forms/agents.",
            },
            message: "OK",
          }
        },
      },
    ],
    canHandle: (query) => {
      const q = query.toLowerCase()
      if (q.includes("form") || q.includes("submission") || q.includes("survey")) return 0.6
      return 0
    },
  }

  subAgentRegistry.register(agent, { priority: 10, enabled: true })
}
