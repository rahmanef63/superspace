"use client"

import React from "react"
import { BookOpen, Plus, Search } from "lucide-react"
import { FeatureHeader, FeatureHeaderActions } from "@/frontend/shared/ui/layout/header"

interface KnowledgeHeaderProps {
  onCreateArticle?: () => void
  onSearch?: () => void
}

/**
 * KnowledgeHeader Component
 * 
 * Consistent header for the Knowledge feature.
 * Uses FeatureHeaderActions for Settings and AI Assistant buttons.
 */
export function KnowledgeHeader({
  onCreateArticle,
  onSearch,
}: KnowledgeHeaderProps) {
  return (
    <FeatureHeader
      icon={BookOpen}
      title="Knowledge"
      subtitle="Centralized knowledge base with documents, articles, and AI-consumable data"
      primaryAction={{
        label: "New Article",
        icon: Plus,
        onClick: onCreateArticle ?? (() => { }),
      }}
      secondaryActions={[
        {
          id: "search",
          label: "Search",
          icon: Search,
          onClick: onSearch ?? (() => { }),
        },
      ]}
    >
      <FeatureHeaderActions
        featureSlug="knowledge"
        showSettings={true}
        showAgent={true}
      />
    </FeatureHeader>
  )
}

export default KnowledgeHeader

