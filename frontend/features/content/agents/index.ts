import { subAgentRegistry } from "@/frontend/features/ai/agents"
import type { SubAgent } from "@/frontend/features/ai/agents"

export function registerContentAgent() {
  const agent: SubAgent = {
    id: "content-agent",
    name: "Content Agent",
    description: "Helps manage content library and generation workflows.",
    featureId: "content",
    tools: [
      {
        name: "summarize",
        description: "Summarize content feature status.",
        parameters: {},
        handler: async (_params, ctx) => {
          return {
            success: true,
            data: {
              featureSlug: "content",
              workspaceId: ctx.workspaceId,
              note: "Scaffolded tool. Implement real tools under convex/features/content/agents.",
            },
            message: "OK",
          }
        },
      },
    ],
    canHandle: (query) => {
      const q = query.toLowerCase()
      if (q.includes("content") || q.includes("asset") || q.includes("media") || q.includes("library")) return 0.6
      return 0
    },
  }

  subAgentRegistry.register(agent, { priority: 10, enabled: true })
}
