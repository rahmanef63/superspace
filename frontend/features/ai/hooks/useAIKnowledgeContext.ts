"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useWorkspaceContext } from "@/frontend/shared/foundation/provider/WorkspaceProvider"
import { useAIStore } from "../stores"
import type { KnowledgeSourceType } from "../components/WikiSelector"

/**
 * Hook to fetch and format knowledge context for AI
 * Returns formatted context string from selected knowledge sources
 */
export function useAIKnowledgeContext() {
  const { workspaceId } = useWorkspaceContext()
  const selectedKnowledgeSources = useAIStore((s) => s.selectedKnowledgeSources)
  const globalMode = useAIStore((s) => s.globalMode)

  // Fetch document counts for UI
  const documentCounts = useQuery(
    api.features.ai.queries.getKnowledgeDocumentCounts,
    workspaceId && !globalMode ? { workspaceId } : "skip"
  )

  // Fetch knowledge documents based on selected sources
  const knowledgeDocs = useQuery(
    api.features.ai.queries.getKnowledgeBySourceTypes,
    workspaceId && !globalMode && selectedKnowledgeSources.length > 0
      ? {
          workspaceId,
          sourceTypes: selectedKnowledgeSources,
          limit: 20, // Limit to avoid context overflow
        }
      : "skip"
  )

  // Format knowledge documents into context string
  const formatKnowledgeContext = (): string | undefined => {
    if (!knowledgeDocs || knowledgeDocs.length === 0) return undefined

    const sections: string[] = []

    // Group documents by source type
    const groupedDocs = knowledgeDocs.reduce((acc, doc) => {
      if (!acc[doc.sourceType]) {
        acc[doc.sourceType] = []
      }
      acc[doc.sourceType].push(doc)
      return acc
    }, {} as Record<string, typeof knowledgeDocs>)

    // Format each section
    for (const [sourceType, docs] of Object.entries(groupedDocs)) {
      const sectionTitle = formatSourceTypeTitle(sourceType as KnowledgeSourceType)
      const docContent = docs
        .map((doc) => `### ${doc.title}\n${doc.content}`)
        .join("\n\n")
      
      sections.push(`## ${sectionTitle}\n\n${docContent}`)
    }

    return sections.join("\n\n---\n\n")
  }

  return {
    knowledgeContext: formatKnowledgeContext(),
    documentCounts: documentCounts as Record<KnowledgeSourceType, number> | undefined,
    isLoading: knowledgeDocs === undefined && selectedKnowledgeSources.length > 0,
    hasKnowledge: Boolean(knowledgeDocs && knowledgeDocs.length > 0),
  }
}

function formatSourceTypeTitle(sourceType: KnowledgeSourceType): string {
  const titles: Record<KnowledgeSourceType, string> = {
    wiki: "Wiki / Knowledge Base",
    posts: "Blog Posts",
    portfolio: "Portfolio",
    services: "Services",
    products: "Products",
    team: "Team Information",
    workspace: "Workspace Settings",
    custom: "Custom Documents",
  }
  return titles[sourceType] || sourceType
}
