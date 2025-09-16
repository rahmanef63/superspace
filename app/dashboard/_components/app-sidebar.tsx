"use client"

import * as React from "react"
import { useEffect, useMemo, useRef } from "react"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { Building, Folder, BookOpen, Calendar } from "lucide-react"

import { WorkspaceSwitcher } from "@/app/dashboard/_components/WorkspaceSwitcher"
import { NavMain } from "@/app/dashboard/_components/NavMain"
import { usePathname, useRouter } from "next/navigation"
import { NavUser } from "@/app/dashboard/_components/NavUser"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar"
import { NavProjects } from "@/app/dashboard/_components/NavProjects"
import { NavSecondary } from "./NavSecondary"
import { getDefaultPages, PAGE_MANIFEST_MAP, COMPONENT_REGISTRY_MAP } from "@/frontend/shared/pages/manifest"

const REQUIRED_MENU_SLUGS = [
  "dashboard",
  "wa",
  "wa-chats",
  "wa-calls",
  "wa-status",
  "wa-ai",
  "wa-starred",
  "wa-archived",
  "wa-settings",
  "wa-profile",
  "members",
  "friends",
  "documents",
  "canvas",
  "menus",
  "invitations",
  "user-settings",
  "settings",
]
import { iconFromName } from "@/frontend/shared/pages/icons"
import { useWorkspaceContext } from "@/app/dashboard/WorkspaceProvider"

interface AppSidebarProps {
  workspaceId?: Id<"workspaces"> | null
  onWorkspaceChange?: (workspaceId: Id<"workspaces">) => void
  activeView?: string
  onViewChange?: (view: string) => void
  side?: "left" | "right"
  variant?: "sidebar" | "floating" | "inset"
  collapsible?: "offcanvas" | "icon" | "none"
}

export function AppSidebar({
  workspaceId,
  onWorkspaceChange,
  activeView,
  onViewChange = () => {},
  side = "left",
  variant = "sidebar",
  collapsible = "icon",
}: AppSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { workspaceId: ctxWorkspaceId, setWorkspaceId } = useWorkspaceContext()
  const derivedActiveView = React.useMemo(() => {
    if (!pathname) return "dashboard"
    const parts = pathname.split("?")[0].split("#")[0].split("/").filter(Boolean)
    // Expecting paths like /dashboard or /dashboard/<view>
    const idx = parts.indexOf("dashboard")
    const view = idx >= 0 && parts[idx + 1] ? parts[idx + 1] : "dashboard"
    return view
  }, [pathname])
  const effectiveActiveView = activeView ?? derivedActiveView
  const handleViewChange = onViewChange ?? ((view: string) => router.push(`/dashboard/${view}`))
  const effectiveWorkspaceId = (workspaceId ?? ctxWorkspaceId) as Id<"workspaces"> | null
  const workspace = useQuery(
    api.workspace.workspaces.getWorkspace,
    effectiveWorkspaceId ? { workspaceId: effectiveWorkspaceId as Id<"workspaces"> } : "skip",
  )
  const userWorkspaces = useQuery(api.workspace.workspaces.getUserWorkspaces)
  const menuItems = useQuery(
    api.menu.menuItems.getWorkspaceMenuItems,
    effectiveWorkspaceId ? { workspaceId: effectiveWorkspaceId as Id<"workspaces"> } : "skip",
  ) as any[] | undefined

  // Opportunistic backfill: if workspace has too few menus, ensure defaults
  const createDefaults = useMutation(api.menu.menuItems.createDefaultMenuItems)
  const seededRef = useRef<string | null>(null)
  useEffect(() => {
    if (!effectiveWorkspaceId) return
    if (!Array.isArray(menuItems)) return
    const key = String(effectiveWorkspaceId)
    const missingSlugs = REQUIRED_MENU_SLUGS.filter((slug) => !menuItems.some((mi) => String(mi.slug) === slug))
    if (missingSlugs.length === 0) {
      seededRef.current = key
      return
    }
    const trackedKey = `${key}:${missingSlugs.join(",")}`
    if (seededRef.current === trackedKey) return

    seededRef.current = trackedKey
    createDefaults({ workspaceId: effectiveWorkspaceId as Id<"workspaces">, selectedSlugs: missingSlugs })
      .then(() => {
        seededRef.current = key
      })
      .catch(() => {
        seededRef.current = null
      })
  }, [effectiveWorkspaceId, menuItems, createDefaults])

  // Build dynamic nav items from menu items or fallback to manifest
  const navItems = useMemo(() => {
    console.log("[v0] AppSidebar menuItems:", menuItems)

    if (Array.isArray(menuItems) && menuItems.length > 0) {
      const itemsMap = new Map()
      const rootItems: any[] = []

      // First pass: organize items by parent
      menuItems
        .filter((mi) => mi && typeof mi.slug === "string" && mi.isVisible !== false)
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .forEach((mi) => {
          const fallbackByComponent = mi.component ? COMPONENT_REGISTRY_MAP[mi.component as string] : undefined
          const fallbackBySlug = PAGE_MANIFEST_MAP[mi.slug as string]
          const fallback = fallbackByComponent ?? fallbackBySlug

          const navItem = {
            id: mi.slug as string,
            title: (mi.name as string) || fallback?.title || mi.slug,
            description: (mi.metadata?.description as string) || fallback?.description,
            icon: iconFromName(mi.icon as string) || fallback?.icon,
            type: mi.type,
            parentId: mi.parentId,
            children: [] as any[],
          }

          itemsMap.set(mi._id, navItem)

          if (!mi.parentId) {
            rootItems.push(navItem)
          }
        })

      // Second pass: build parent-child relationships
      menuItems.forEach((mi) => {
        if (mi.parentId && itemsMap.has(mi.parentId)) {
          const parent = itemsMap.get(mi.parentId)
          const child = itemsMap.get(mi._id)
          if (parent && child) {
            parent.children.push({
              id: child.id,
              title: child.title,
              url: `/dashboard/${child.id}`,
            })
          }
        }
      })

      console.log("[v0] Built navItems:", rootItems)
      return rootItems
    }

    // Fallback to default manifest order
    return getDefaultPages().map((p) => ({
      id: p.id,
      title: p.title,
      description: p.description,
      icon: p.icon,
    }))
  }, [menuItems])

  // Render a lightweight loading state until workspaces load
  if (userWorkspaces === undefined) {
    return (
      <Sidebar collapsible={collapsible} side={side} variant={variant}>
        <SidebarContent>
          <div className="p-4 text-center text-gray-500">Loading...</div>
        </SidebarContent>
      </Sidebar>
    )
  }

  // Transform workspaces data for WorkspaceSwitcher
  type SwitcherItem = {
    id: Id<"workspaces">
    name: string
    logo: React.ElementType
    plan: string
  }

  const workspaces: SwitcherItem[] = (userWorkspaces as any[])
    .filter((ws: any) => ws && ws._id && ws.name)
    .map((ws: any) => ({
      id: ws._id as Id<"workspaces">,
      name: ws.name as string,
      logo: Building,
      plan: ws.type ? String(ws.type).charAt(0).toUpperCase() + String(ws.type).slice(1) : "Workspace",
    }))

  const currentWorkspace = workspaces.find((w: SwitcherItem) => String(w.id) === String(effectiveWorkspaceId || ""))

  // Sample projects data
  const projects = [
    { name: "Design System", url: "#", icon: Folder },
    { name: "Website Redesign", url: "#", icon: Folder },
    { name: "Mobile App", url: "#", icon: Folder },
  ]

  // Sample secondary navigation items
  const secondaryItems = [
    { title: "Support", url: "#", icon: BookOpen },
    { title: "Feedback", url: "#", icon: Calendar },
  ]

  // navItems already computed above

  return (
    <Sidebar collapsible={collapsible} side={side} variant={variant}>
      <SidebarHeader>
        <WorkspaceSwitcher
          workspaces={workspaces}
          currentWorkspace={currentWorkspace}
          onWorkspaceSelect={(ws) => {
            if (onWorkspaceChange) {
              onWorkspaceChange(ws.id)
            } else {
              setWorkspaceId(ws.id)
            }
          }}
          isLoading={userWorkspaces === undefined}
        />
      </SidebarHeader>
      <SidebarContent className="flex justify-between">
        <div>
          <NavMain
            workspaceId={effectiveWorkspaceId as Id<"workspaces">}
            activeView={effectiveActiveView}
            onViewChange={handleViewChange}
            items={navItems}
          />
          <NavProjects projects={projects} />
        </div>
        <NavSecondary />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
