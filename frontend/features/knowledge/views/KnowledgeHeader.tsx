"use client"

import React from "react"
import { BookOpen, Plus, Settings, Search } from "lucide-react"
import { FeatureHeader } from "@/frontend/shared/ui/layout/header"

interface KnowledgeHeaderProps {
  onCreateArticle?: () => void
  onSearch?: () => void
  onSettings?: () => void
}

/**
 * KnowledgeHeader Component
 * 
 * Consistent header for the Knowledge feature.
 */
export function KnowledgeHeader({
  onCreateArticle,
  onSearch,
  onSettings,
}: KnowledgeHeaderProps) {
  return (
    <FeatureHeader
      icon={BookOpen}
      title="Knowledge"
      subtitle="Centralized knowledge base with documents, articles, and AI-consumable data"
      primaryAction={{
        label: "New Article",
        icon: Plus,
        onClick: onCreateArticle ?? (() => {}),
      }}
      secondaryActions={[
        {
          id: "search",
          label: "Search",
          icon: Search,
          onClick: onSearch ?? (() => {}),
        },
        {
          id: "settings",
          label: "Settings",
          icon: Settings,
          onClick: onSettings ?? (() => {}),
        },
      ]}
    />
  )
}

export default KnowledgeHeader
