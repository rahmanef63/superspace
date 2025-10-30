"use client"

import React from "react"
import { type SidebarBreadcrumbItem, useBreadcrumbs } from "@/frontend/shared/ui/layout/sidebar/components/breadcrumbs-context"

export function SetBreadcrumbs({ items }: { items: SidebarBreadcrumbItem[] }) {
  const { setBreadcrumbs } = useBreadcrumbs()

  React.useEffect(() => {
    setBreadcrumbs(items)
  }, [items, setBreadcrumbs])

  return null
}
