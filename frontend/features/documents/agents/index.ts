import { subAgentRegistry } from "@/frontend/features/ai/agents"
import type { SubAgent } from "@/frontend/features/ai/agents"

export function registerDocumentsAgent() {
  const agent: SubAgent = {
    id: "documents-agent",
    name: "Documents Agent",
    description: "Helps with documents (deprecated: routed to Knowledge > Docs).",
    featureId: "documents",
    tools: [
      {
        name: "summarize",
        description: "Summarize documents feature status.",
        parameters: {},
        handler: async (_params, ctx) => {
          return {
            success: true,
            data: {
              featureSlug: "documents",
              workspaceId: ctx.workspaceId,
              note: "Documents is deprecated; real agent capabilities live under convex/features/docs/agent.ts.",
            },
            message: "OK",
          }
        },
      },
    ],
    canHandle: (query) => {
      const q = query.toLowerCase()
      if (q.includes("document") || q.includes("docs")) return 0.5
      return 0
    },
  }

  subAgentRegistry.register(agent, { priority: 5, enabled: true })
}
