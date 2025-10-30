"use client"

import { FeatureNotReady } from "@/frontend/shared/ui"

export default function PagesPage() {
  return (
    <FeatureNotReady
      featureName="Pages"
      featureSlug="pages"
      status="development"
      message="Notion-like pages feature is under development. Coming soon!"
    />
  )
}
