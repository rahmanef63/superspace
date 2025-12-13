import { subAgentRegistry } from "@/frontend/features/ai/agents"
import type { SubAgent } from "@/frontend/features/ai/agents"

export function registerBuilderAgent() {
  const agent: SubAgent = {
    id: "builder-agent",
    name: "Builder Agent",
    description: "Helps with the builder feature and configuration.",
    featureId: "builder",
    tools: [
      {
        name: "summarize",
        description: "Summarize builder feature status.",
        parameters: {},
        handler: async (_params, ctx) => {
          return {
            success: true,
            data: {
              featureSlug: "builder",
              workspaceId: ctx.workspaceId,
              note: "Scaffolded tool. Implement real tools under convex/features/builder/agents.",
            },
            message: "OK",
          }
        },
      },
    ],
    canHandle: (query) => {
      const q = query.toLowerCase()
      if (q.includes("builder") || q.includes("template") || q.includes("compose")) return 0.6
      return 0
    },
  }

  subAgentRegistry.register(agent, { priority: 10, enabled: true })
}
