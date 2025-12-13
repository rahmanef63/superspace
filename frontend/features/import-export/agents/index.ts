import { subAgentRegistry } from "@/frontend/features/ai/agents"
import type { SubAgent } from "@/frontend/features/ai/agents"

export function registerImportExportAgent() {
  const agent: SubAgent = {
    id: "import-export-agent",
    name: "Import/Export Agent",
    description: "Helps with data import/export operations and validation.",
    featureId: "import-export",
    tools: [
      {
        name: "summarize",
        description: "Summarize import-export feature status.",
        parameters: {},
        handler: async (_params, ctx) => {
          return {
            success: true,
            data: {
              featureSlug: "import-export",
              workspaceId: ctx.workspaceId,
              note: "Scaffolded tool. Implement real tools under convex/features/importExport/agents.",
            },
            message: "OK",
          }
        },
      },
    ],
    canHandle: (query) => {
      const q = query.toLowerCase()
      if (q.includes("import") || q.includes("export") || q.includes("csv")) return 0.6
      return 0
    },
  }

  subAgentRegistry.register(agent, { priority: 10, enabled: true })
}
