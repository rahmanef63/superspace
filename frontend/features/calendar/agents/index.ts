import { subAgentRegistry } from "@/frontend/features/ai/agents"
import type { SubAgent } from "@/frontend/features/ai/agents"

export function registerCalendarAgent() {
  const agent: SubAgent = {
    id: "calendar-agent",
    name: "Calendar Agent",
    description: "Helps with scheduling and calendar operations.",
    featureId: "calendar",
    tools: [
      {
        name: "summarize",
        description: "Summarize calendar feature status.",
        parameters: {},
        handler: async (_params, ctx) => {
          return {
            success: true,
            data: {
              featureSlug: "calendar",
              workspaceId: ctx.workspaceId,
              note: "Scaffolded tool. Calendar backend uses convex/features/calendar/agent.ts today.",
            },
            message: "OK",
          }
        },
      },
    ],
    canHandle: (query) => {
      const q = query.toLowerCase()
      if (q.includes("calendar") || q.includes("schedule") || q.includes("meeting")) return 0.6
      return 0
    },
  }

  subAgentRegistry.register(agent, { priority: 10, enabled: true })
}
