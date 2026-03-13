import { subAgentRegistry } from "@/frontend/features/ai/agents"
import type { SubAgent } from "@/frontend/features/ai/agents"

export function registerStudioAgent() {
  const agent: SubAgent = {
    id: "studio-agent",
    name: "Studio Agent",
    description: "Helps create and monitor automations and UI in Studio.",
    featureId: "studio",
    tools: [
      {
        name: "summarize",
        description: "Summarize automation feature status.",
        parameters: {},
        handler: async (_params, ctx) => {
          return {
            success: true,
            data: {
              featureSlug: "studio",
              workspaceId: ctx.workspaceId,
              note: "Scaffolded tool. Implement real tools under convex/features/automation/agents.",
            },
            message: "OK",
          }
        },
      },
    ],
    canHandle: (query) => {
      const q = query.toLowerCase()
      if (q.includes("studio") || q.includes("builder") || q.includes("automation") || q.includes("workflow") || q.includes("trigger")) return 0.6
      return 0
    },
  }

  subAgentRegistry.register(agent, { priority: 10, enabled: true })
}
