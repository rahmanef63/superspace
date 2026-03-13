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
      if (
        q.includes("studio") || q.includes("builder") || q.includes("automation") ||
        q.includes("workflow") || q.includes("trigger") || q.includes("widget") ||
        q.includes("canvas") || q.includes("inspector") || q.includes("template") ||
        q.includes("group") || q.includes("block") || q.includes("json schema") ||
        q.includes("pin") || q.includes("preview") || q.includes("renderer")
      ) return 0.7
      return 0
    },
  }

  subAgentRegistry.register(agent, { priority: 10, enabled: true })
}
