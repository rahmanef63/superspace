import { subAgentRegistry } from "@/frontend/features/ai/agents"
import type { SubAgent } from "@/frontend/features/ai/agents"

export function registerAutomationAgent() {
  const agent: SubAgent = {
    id: "automation-agent",
    name: "Automation Agent",
    description: "Helps create and monitor automations.",
    featureId: "automation",
    tools: [
      {
        name: "summarize",
        description: "Summarize automation feature status.",
        parameters: {},
        handler: async (_params, ctx) => {
          return {
            success: true,
            data: {
              featureSlug: "automation",
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
      if (q.includes("automation") || q.includes("workflow") || q.includes("trigger")) return 0.6
      return 0
    },
  }

  subAgentRegistry.register(agent, { priority: 10, enabled: true })
}
