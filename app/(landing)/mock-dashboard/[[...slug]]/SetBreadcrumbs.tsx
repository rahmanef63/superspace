"use client"

import { useBreadcrumbs, type SidebarBreadcrumbItem } from "@/frontend/shared/ui/layout/sidebar/components/breadcrumbs-context"
import { useEffect } from "react"

interface SetBreadcrumbsProps {
  items: SidebarBreadcrumbItem[]
}

/**
 * Sets breadcrumb items for the current page.
 * This component renders nothing but updates the breadcrumb context.
 */
export function SetBreadcrumbs({ items }: SetBreadcrumbsProps) {
  const { setBreadcrumbs } = useBreadcrumbs()
  
  useEffect(() => {
    setBreadcrumbs(items)
    return () => {
      setBreadcrumbs([])
    }
  }, [items, setBreadcrumbs])
  
  return null
}
