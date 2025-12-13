import { subAgentRegistry } from "@/frontend/features/ai/agents"
import type { SubAgent } from "@/frontend/features/ai/agents"

export function registerTasksAgent() {
  const agent: SubAgent = {
    id: "tasks-agent",
    name: "Tasks Agent",
    description: "Helps manage tasks safely (create/update/summarize).",
    featureId: "tasks",
    tools: [
      {
        name: "summarize",
        description: "Summarize tasks feature status.",
        parameters: {},
        handler: async (_params, ctx) => {
          return {
            success: true,
            data: {
              featureSlug: "tasks",
              workspaceId: ctx.workspaceId,
              note: "Scaffolded tool. Add real tools under convex/features/tasks/agents.",
            },
            message: "OK",
          }
        },
      },
    ],
    canHandle: (query) => {
      const q = query.toLowerCase()
      if (q.includes("task") || q.includes("todo")) return 0.6
      return 0
    },
  }

  subAgentRegistry.register(agent, { priority: 10, enabled: true })
}
