"use client"

import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useWorkspaceContext } from "@/frontend/shared/foundation/provider/WorkspaceProvider"
import { useAIStore } from "../stores"
import type { KnowledgeSourceType } from "../components/WikiSelector"

/**
 * Hook to fetch and format knowledge context for AI
 * Returns formatted context string from selected knowledge sources
 * 
 * Now includes documents from the Knowledge feature (documents table)
 * for complete AI context.
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

  // Fetch knowledge documents based on selected sources (from knowledgeBaseDocuments)
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

  // NEW: Fetch documents from Knowledge feature (documents table)
  // This is the primary source for user-created knowledge
  const knowledgeFeatureDocs = useQuery(
    (api as any)["features/knowledge/api/knowledgeForAI"]?.getFullKnowledgeContext,
    workspaceId && !globalMode
      ? {
          workspaceId,
          includeDocuments: true,
          includeWorkspaceContext: true,
          documentLimit: 10,
        }
      : "skip"
  )

  // Format knowledge documents into context string
  const formatKnowledgeContext = (): string | undefined => {
    const sections: string[] = []

    // 1. Add Knowledge feature context (workspace context + documents)
    if (knowledgeFeatureDocs?.formattedContext) {
      sections.push(knowledgeFeatureDocs.formattedContext)
    }

    // 2. Add legacy knowledgeBaseDocuments if any
    if (knowledgeDocs && knowledgeDocs.length > 0) {
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
    }

    return sections.length > 0 ? sections.join("\n\n---\n\n") : undefined
  }

  // Calculate combined document count
  const totalDocs = documentCounts 
    ? Object.values(documentCounts).reduce((a: number, b: number) => a + b, 0)
    : 0
  const knowledgeFeatureDocCount = knowledgeFeatureDocs?.documents?.length ?? 0
  const combinedCount = totalDocs + knowledgeFeatureDocCount

  return {
    knowledgeContext: formatKnowledgeContext(),
    documentCounts: documentCounts as Record<KnowledgeSourceType, number> | undefined,
    isLoading: (knowledgeDocs === undefined && selectedKnowledgeSources.length > 0) || 
               knowledgeFeatureDocs === undefined,
    hasKnowledge: Boolean(knowledgeDocs && knowledgeDocs.length > 0) || 
                  Boolean(knowledgeFeatureDocs?.formattedContext),
    // NEW: Expose workspace context status
    hasWorkspaceContext: Boolean(knowledgeFeatureDocs?.workspaceContext),
    knowledgeFeatureDocCount,
    combinedDocumentCount: combinedCount,
  }
}

function formatSourceTypeTitle(sourceType: KnowledgeSourceType): string {
  const titles: Record<KnowledgeSourceType, string> = {
    wiki: "Wiki / Knowledge Base",
    posts: "Blog Posts",
    portfolio: "Portfolio",
    services: "Services",
    products: "Products",
    pages: "CMS Pages",
    custom: "Custom Documents",
  }
  return titles[sourceType] || sourceType
}
