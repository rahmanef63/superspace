"use client"

import * as React from "react"
import { useMemo } from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { Building, BookOpen, Calendar } from "lucide-react"

import { WorkspaceSwitcherStack } from "./WorkspaceSwitcherStack"
import { WorkspaceSwitcher } from "./WorkspaceSwitcher"
import { NavMain } from "./NavMain"
import { usePathname, useRouter } from "next/navigation"
import { NavUser } from "./NavUser"
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarRail } from "@/components/ui/sidebar"
import { NavSystem } from "./NavSystem"
import { NavSecondary } from "./NavSecondary"
import { useWorkspaceContext } from "@/frontend/shared/foundation/provider/WorkspaceProvider"
import { useIsGuestMode, useGuestWorkspaceContext, GUEST_USER } from "@/frontend/shared/foundation/provider/GuestWorkspaceProvider"
import {
  CreateWorkspaceDialog,
  EditWorkspaceDialog,
  DeleteWorkspaceDialog
} from "@/frontend/features/workspace-store/components/WorkspaceDialogs"
import type { WorkspaceStoreItem, WorkspaceType } from "@/frontend/features/workspace-store/types"

// Import extracted hooks
import {
  useWorkspaceCRUD,
  useNavItems,
  useMenuSeeding,
  useSystemNavItems
} from "./hooks"
import { CommandMenu } from "@/frontend/shared/foundation/utils/system/command-menu"
import { GlobalOverlays } from "../../chrome/GlobalOverlays"

/**
 * Hook that works with both WorkspaceProvider (authenticated) and GuestWorkspaceProvider (guest mode)
 */
function useUnifiedWorkspaceContext() {
  const isGuestMode = useIsGuestMode()
  
  // Guest context (will be available if in GuestWorkspaceProvider)
  let guestContext: ReturnType<typeof useGuestWorkspaceContext> | null = null
  try {
    if (isGuestMode) {
      guestContext = useGuestWorkspaceContext()
    }
  } catch {
    // Not in guest mode
  }
  
  // Real context (will be available if in WorkspaceProvider)
  let realContext: ReturnType<typeof useWorkspaceContext> | null = null
  try {
    if (!isGuestMode) {
      realContext = useWorkspaceContext()
    }
  } catch {
    // Not in real mode
  }
  
  if (guestContext) {
    return {
      workspaceId: guestContext.workspaceId as Id<"workspaces"> | null,
      setWorkspaceId: (id: Id<"workspaces"> | null) => guestContext!.setWorkspaceId(id as string | null),
      currentWorkspace: guestContext.currentWorkspace as any,
      workspaces: guestContext.workspaces as any[],
      isGuestMode: true,
      guestUser: guestContext.guestUser,
    }
  }
  
  if (realContext) {
    return {
      workspaceId: realContext.workspaceId,
      setWorkspaceId: realContext.setWorkspaceId,
      currentWorkspace: realContext.currentWorkspace,
      workspaces: realContext.workspaces,
      isGuestMode: false,
      guestUser: null,
    }
  }
  
  // Fallback
  return {
    workspaceId: null as Id<"workspaces"> | null,
    setWorkspaceId: () => {},
    currentWorkspace: null as any,
    workspaces: undefined as any[] | undefined,
    isGuestMode: false,
    guestUser: null,
  }
}

export interface AppSidebarProps {
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
  onViewChange = () => { },
  side = "left",
  variant = "sidebar",
  collapsible = "icon",
}: AppSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { 
    workspaceId: ctxWorkspaceId, 
    setWorkspaceId, 
    currentWorkspace: contextWorkspace,
    workspaces: contextWorkspaces,
    isGuestMode,
    guestUser 
  } = useUnifiedWorkspaceContext()

  // Derive active view from pathname
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

  // Query user workspaces - skip in guest mode
  const userWorkspacesQuery = useQuery(
    api.workspace.workspaces.getUserWorkspaces,
    isGuestMode ? "skip" : undefined
  )
  
  // Use context workspaces in guest mode, query result otherwise
  const userWorkspaces = isGuestMode ? contextWorkspaces : userWorkspacesQuery

  // Use extracted hooks for navigation and CRUD
  const { navItems, systemItems, menuItems } = useNavItems(effectiveWorkspaceId)
  const finalSystemItems = useSystemNavItems(systemItems)

  // Auto-seed menu items - skip in guest mode
  useMenuSeeding(isGuestMode ? null : effectiveWorkspaceId, menuItems)

  // Workspace CRUD hook
  const {
    createDialogOpen,
    setCreateDialogOpen,
    createParentId,
    openCreateDialog,
    handleCreateSubmit,
    editDialogOpen,
    setEditDialogOpen,
    editWorkspace,
    openEditDialog,
    handleEditSubmit,
    deleteDialogOpen,
    setDeleteDialogOpen,
    deleteWorkspace,
    openDeleteDialog,
    handleDeleteConfirm,
  } = useWorkspaceCRUD()

  // Prepare dialog props to avoid complex expressions in JSX (must be before conditional returns)
  const createParentWorkspace = useMemo(() => {
    if (!createParentId || !userWorkspaces) return null
    const parent = userWorkspaces.find((ws: any) => ws._id === createParentId)
    return {
      id: createParentId as unknown as string,
      name: parent?.name || "Parent",
    } as WorkspaceStoreItem
  }, [createParentId, userWorkspaces])

  const editWorkspaceItem = useMemo(() => {
    if (!editWorkspace) return null
    return {
      id: editWorkspace._id as unknown as string,
      name: editWorkspace.name,
      description: editWorkspace.description,
      type: (editWorkspace.type || "group") as WorkspaceType,
      icon: (editWorkspace as any).icon,
      color: (editWorkspace as any).color,
    } as WorkspaceStoreItem
  }, [editWorkspace])

  const deleteWorkspaceItem = useMemo(() => {
    if (!deleteWorkspace) return null
    return {
      id: deleteWorkspace._id as unknown as string,
      name: deleteWorkspace.name,
    } as WorkspaceStoreItem
  }, [deleteWorkspace])

  if (userWorkspaces === undefined) {
    return (
      <Sidebar collapsible={collapsible} side={side} variant={variant}>
        <SidebarContent>
          <div className="p-4 flex items-center justify-center text-gray-500 mx-auto ">Loading...</div>
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
            onWorkspaceSelect={() => { }}
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
        <WorkspaceSwitcherStack
          onWorkspaceSelect={(wsId) => {
            if (onWorkspaceChange) {
              onWorkspaceChange(wsId)
            } else {
              setWorkspaceId(wsId)
            }
          }}
          onCreateWorkspace={isGuestMode ? undefined : openCreateDialog}
          onEditWorkspace={isGuestMode ? undefined : openEditDialog}
          onDeleteWorkspace={isGuestMode ? undefined : openDeleteDialog}
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
              workspaceColor={contextWorkspace?.color}
            />
          ) : (
            <div className="space-y-2 p-4">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="h-6 rounded bg-muted animate-pulse" />
              ))}
            </div>
          )}
          <NavSystem system={finalSystemItems} />
        </div>
        <NavSecondary />
      </SidebarContent>
      <SidebarFooter>
        {isGuestMode && guestUser ? (
          <GuestNavUser user={guestUser} />
        ) : (
          <NavUser />
        )}
      </SidebarFooter>
      <SidebarRail />

      {/* Workspace CRUD Dialogs - only show in authenticated mode */}
      {!isGuestMode && (
        <>
          <CreateWorkspaceDialog
            open={createDialogOpen}
            onOpenChange={setCreateDialogOpen}
            onSubmit={handleCreateSubmit}
            parentWorkspace={createParentWorkspace}
          />

          <EditWorkspaceDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            workspace={editWorkspaceItem}
            onSubmit={handleEditSubmit}
          />

          <DeleteWorkspaceDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            workspace={deleteWorkspaceItem}
            onConfirm={handleDeleteConfirm}
          />
        </>
      )}
      <CommandMenu />
      <GlobalOverlays />
    </Sidebar>
  )
}

// Guest-specific NavUser component
function GuestNavUser({ user }: { user: typeof GUEST_USER }) {
  return (
    <div className="flex items-center gap-2 px-2 py-1.5">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-medium">
        {user.initials}
      </div>
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-semibold">{user.name}</span>
        <span className="truncate text-xs text-muted-foreground">{user.email}</span>
      </div>
    </div>
  )
}
