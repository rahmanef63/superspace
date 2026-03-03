import { subAgentRegistry } from "@/frontend/features/ai/agents"
import type { SubAgent } from "@/frontend/features/ai/agents"

export function registerMenusAgent() {
  const agent: SubAgent = {
    id: "menus-agent",
    name: "Menus Agent",
    description: "Helps manage workspace menus and navigation.",
    featureId: "menus",
    tools: [
      {
        name: "summarize",
        description: "Summarize menus feature status.",
        parameters: {},
        handler: async (_params, ctx) => {
          return {
            success: true,
            data: {
              featureSlug: "menus",
              workspaceId: ctx.workspaceId,
              note: "Scaffolded tool. Implement real tools under convex/features/menus/agents.",
            },
            message: "OK",
          }
        },
      },
    ],
    canHandle: (query) => {
      const q = query.toLowerCase()
      if (q.includes("menu") || q.includes("navigation")) return 0.6
      return 0
    },
  }

  subAgentRegistry.register(agent, { priority: 10, enabled: true })
}
