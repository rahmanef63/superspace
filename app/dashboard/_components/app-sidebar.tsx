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
import { NavSystem } from "@/app/dashboard/_components/NavSystem"
import { NavSecondary } from "./NavSecondary"
import { getDefaultPages, PAGE_MANIFEST_MAP, COMPONENT_REGISTRY_MAP } from "@/frontend/shared/pages/manifest"
import { iconFromName } from "@/frontend/shared/pages/icons"
import { useWorkspaceContext } from "@/app/dashboard/WorkspaceProvider"

const REQUIRED_MENU_SLUGS = [
  "overview",
  "chat",
  "chats",
  "calls",
  "status",
  "ai",
  "starred",
  "archived",
  "settings",
  "profile",
  "members",
  "friends",
  "documents",
  "canvas",
  "menus",
  "invitations",
  "user-settings",
  "settings",
]

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
    if (!pathname) return "overview"
    const parts = pathname.split("?")[0].split("#")[0].split("/").filter(Boolean)
    const idx = parts.indexOf("dashboard")
    const view = idx >= 0 && parts[idx + 1] ? parts[idx + 1] : "overview"
    return view
  }, [pathname])
  const effectiveActiveView = activeView ?? derivedActiveView
  const handleViewChange = onViewChange ?? ((view: string) => router.push(`/dashboard/${view}`))
  const effectiveWorkspaceId = (workspaceId ?? ctxWorkspaceId) as Id<"workspaces"> | null
  const userWorkspaces = useQuery(api.workspace.workspaces.getUserWorkspaces)
  const menuItems = useQuery(
    api.menu.store.menuItems.getWorkspaceMenuItems,
    effectiveWorkspaceId ? { workspaceId: effectiveWorkspaceId as Id<"workspaces"> } : "skip",
  ) as any[] | undefined

  const createDefaults = useMutation(api.menu.store.menuItems.syncWorkspaceDefaultMenus)
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
    createDefaults({ workspaceId: effectiveWorkspaceId as Id<"workspaces">, featureSlugs: missingSlugs })
      .then(() => {
        seededRef.current = key
      })
      .catch(() => {
        seededRef.current = null
      })
  }, [effectiveWorkspaceId, menuItems, createDefaults])

  const { navItems, systemItems } = useMemo(() => {
    if (Array.isArray(menuItems) && menuItems.length > 0) {
      const itemsMap = new Map()
      const rootItems: any[] = []
      const systemMenuItems: any[] = []

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
            metadata: mi.metadata,
          }

          itemsMap.set(mi._id, navItem)

          // Separate system items (featureType === "system")
          const isSystemItem = mi.metadata?.featureType === "system"

          if (!mi.parentId) {
            if (isSystemItem) {
              systemMenuItems.push({
                id: navItem.id,
                name: navItem.title,
                url: `/dashboard/${navItem.id}`,
                icon: navItem.icon || Building,
                description: navItem.description,
                metadata: mi.metadata,
              })
            } else {
              rootItems.push(navItem)
            }
          }
        })

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

      return { navItems: rootItems, systemItems: systemMenuItems }
    }

    return {
      navItems: getDefaultPages().map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description,
        icon: p.icon,
      })),
      systemItems: [],
    }
  }, [menuItems])

  if (userWorkspaces === undefined) {
    return (
      <Sidebar collapsible={collapsible} side={side} variant={variant}>
        <SidebarContent>
          <div className="p-4 text-center text-gray-500">Loading...</div>
        </SidebarContent>
      </Sidebar>
    )
  }

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

  if (workspaces.length === 0) {
    return (
      <Sidebar collapsible={collapsible} side={side} variant={variant}>
        <SidebarHeader>
          <WorkspaceSwitcher
            workspaces={[]}
            currentWorkspace={undefined}
            onWorkspaceSelect={() => {}}
            isLoading={false}
          />
        </SidebarHeader>
        <SidebarContent>
          <div className="space-y-2 p-4">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="h-8 rounded-md bg-muted/80 animate-pulse" />
            ))}
          </div>
        </SidebarContent>
        <SidebarFooter>
          <div className="px-4 pb-4 text-xs text-muted-foreground">
            Create a workspace to see navigation and data.
          </div>
        </SidebarFooter>
        <SidebarRail />
      </Sidebar>
    )
  }

  const currentWorkspace = workspaces.find((w: SwitcherItem) => String(w.id) === String(effectiveWorkspaceId || ""))

  const secondaryItems = [
    { title: "Support", url: "#", icon: BookOpen },
    { title: "Feedback", url: "#", icon: Calendar },
  ]

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
          {effectiveWorkspaceId ? (
            <NavMain
              workspaceId={effectiveWorkspaceId as Id<"workspaces">}
              activeView={effectiveActiveView}
              onViewChange={handleViewChange}
              items={navItems}
            />
          ) : (
            <div className="space-y-2 p-4">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="h-6 rounded bg-muted animate-pulse" />
              ))}
            </div>
          )}
          <NavSystem system={systemItems} />
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



