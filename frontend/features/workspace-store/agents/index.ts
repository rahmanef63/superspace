import { subAgentRegistry } from "@/frontend/features/ai/agents"
import type { SubAgent } from "@/frontend/features/ai/agents"

export function registerWorkspaceStoreAgent() {
  const agent: SubAgent = {
    id: "workspace-store-agent",
    name: "Workspace Store Agent",
    description: "Helps manage workspace templates and installed capabilities.",
    featureId: "workspace-store",
    tools: [
      {
        name: "summarize",
        description: "Summarize workspace-store feature status.",
        parameters: {},
        handler: async (_params, ctx) => {
          return {
            success: true,
            data: {
              featureSlug: "workspace-store",
              workspaceId: ctx.workspaceId,
              note: "Scaffolded tool. Implement real tools under convex/features/workspaceStore/agents.",
            },
            message: "OK",
          }
        },
      },
    ],
    canHandle: (query) => {
      const q = query.toLowerCase()
      if (q.includes("workspace") || q.includes("template") || q.includes("store")) return 0.6
      return 0
    },
  }

  subAgentRegistry.register(agent, { priority: 10, enabled: true })
}
