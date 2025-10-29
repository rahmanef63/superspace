"use client"

import React from "react"
import { BreadcrumbItem, useBreadcrumbs } from "@/frontend/shared/ui/layout/sidebar/components/breadcrumbs-context"

export function SetBreadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const { setBreadcrumbs } = useBreadcrumbs()

  React.useEffect(() => {
    setBreadcrumbs(items)
  }, [items, setBreadcrumbs])

  return null
}
