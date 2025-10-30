"use client"

import React from "react"
import { usePathname } from "next/navigation"

export type SidebarBreadcrumbItem = {
  label: string
  href: string
}

type BreadcrumbsContextValue = {
  breadcrumbs: SidebarBreadcrumbItem[]
  setBreadcrumbs: (items: SidebarBreadcrumbItem[]) => void
}

const BreadcrumbsContext = React.createContext<BreadcrumbsContextValue | null>(
  null
)

export function useBreadcrumbs() {
  const ctx = React.useContext(BreadcrumbsContext)
  if (!ctx) {
    throw new Error(
      "useBreadcrumbs must be used within a BreadcrumbsProvider"
    )
  }
  return ctx
}

export function BreadcrumbsProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [breadcrumbs, setBreadcrumbs] = React.useState<SidebarBreadcrumbItem[]>([])
  const pathname = usePathname()

  // Clear breadcrumbs on route change to avoid stale values
  React.useEffect(() => {
    setBreadcrumbs([])
  }, [pathname])

  const value = React.useMemo(
    () => ({ breadcrumbs, setBreadcrumbs }),
    [breadcrumbs]
  )

  return (
    <BreadcrumbsContext.Provider value={value}>
      {children}
    </BreadcrumbsContext.Provider>
  )
}
