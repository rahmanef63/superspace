"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import {
  ChevronDown,
  ChevronUp,
  Home,
  Building2,
  Users,
  Heart,
  Briefcase,
  Crown,
  Loader2,
} from "lucide-react"
import type { Id, Doc } from "@convex/_generated/dataModel"
import { useWorkspaceContext } from "@/frontend/shared/foundation/provider/WorkspaceProvider"
import { cn } from "@/lib/utils"

// Workspace type icons
const WORKSPACE_TYPE_ICONS: Record<string, React.ElementType> = {
  personal: Home,
  organization: Building2,
  institution: Building2,
  group: Users,
  family: Heart,
}

interface WorkspaceSwitcherStackProps {
  onWorkspaceSelect?: (workspaceId: Id<"workspaces">) => void
  isLoading?: boolean
}

/**
 * Stacked Workspace Switcher
 * 
 * Shows multiple workspace levels as a stack in the sidebar header.
 * Each level shows the current workspace at that level with ability
 * to switch to siblings.
 * 
 * Features:
 * - Visual hierarchy with colors
 * - Navigate to parent (up) or children (down)
 * - Switch between siblings at same level
 */
export function WorkspaceSwitcherStack({
  onWorkspaceSelect,
  isLoading = false,
}: WorkspaceSwitcherStackProps) {
  const router = useRouter()
  const { isMobile } = useSidebar()
  
  const {
    workspaceId,
    setWorkspaceId,
    workspaces,
    currentWorkspace,
    mainWorkspace,
    isMainWorkspace,
    childWorkspaces,
    siblingWorkspaces,
    workspacePath,
  } = useWorkspaceContext()

  const handleWorkspaceSelect = React.useCallback(
    (wsId: Id<"workspaces">) => {
      setWorkspaceId(wsId)
      onWorkspaceSelect?.(wsId)
    },
    [setWorkspaceId, onWorkspaceSelect],
  )

  if (isLoading || !workspaces) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" disabled className="opacity-75">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <Loader2 className="size-4 animate-spin" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">Loading...</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  // Build the stack levels from workspace path
  // Each level shows: parent path item at that depth
  // The last level is the current workspace
  const stackLevels = workspacePath.map((ws, index) => ({
    workspace: ws,
    isActive: index === workspacePath.length - 1,
    depth: index,
  }))

  return (
    <div className="space-y-1">
      {stackLevels.map((level, index) => (
        <WorkspaceLevelSwitcher
          key={level.workspace._id}
          workspace={level.workspace}
          depth={level.depth}
          isActive={level.isActive}
          siblings={index === stackLevels.length - 1 ? siblingWorkspaces : []}
          children={level.isActive ? childWorkspaces : []}
          onSelect={handleWorkspaceSelect}
          isMobile={isMobile}
        />
      ))}
      
      {/* If no path, show just main/current */}
      {stackLevels.length === 0 && currentWorkspace && (
        <WorkspaceLevelSwitcher
          workspace={currentWorkspace}
          depth={0}
          isActive={true}
          siblings={siblingWorkspaces}
          children={childWorkspaces}
          onSelect={handleWorkspaceSelect}
          isMobile={isMobile}
        />
      )}
    </div>
  )
}

interface WorkspaceLevelSwitcherProps {
  workspace: Doc<"workspaces">
  depth: number
  isActive: boolean
  siblings: Doc<"workspaces">[]
  children: Doc<"workspaces">[]
  onSelect: (id: Id<"workspaces">) => void
  isMobile: boolean
}

function WorkspaceLevelSwitcher({
  workspace,
  depth,
  isActive,
  siblings,
  children,
  onSelect,
  isMobile,
}: WorkspaceLevelSwitcherProps) {
  const Icon = WORKSPACE_TYPE_ICONS[workspace.type ?? "personal"] ?? Briefcase
  const color = (workspace as any).color ?? "#6366f1"
  const isMainWorkspace = (workspace as any).isMainWorkspace
  
  // Calculate size based on depth (parent levels are smaller)
  const size = isActive ? "lg" : "default"
  const opacity = isActive ? 1 : 0.7
  
  // Combined options: siblings + children
  const hasOptions = siblings.length > 0 || children.length > 0

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size={size}
              className={cn(
                "data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground",
                !isActive && "h-8"
              )}
              style={{ 
                opacity,
                borderLeftWidth: isActive ? "3px" : "0",
                borderLeftColor: color,
                borderLeftStyle: "solid",
                paddingLeft: isActive ? undefined : `${(depth * 8) + 8}px`,
              }}
            >
              <div
                className={cn(
                  "flex items-center justify-center rounded text-white",
                  isActive ? "aspect-square size-8 rounded-lg" : "size-5 rounded-sm"
                )}
                style={{ backgroundColor: color }}
              >
                <Icon className={isActive ? "size-4" : "size-3"} />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <div className="flex items-center gap-1.5">
                  <span className={cn(
                    "truncate",
                    isActive ? "font-semibold" : "text-xs"
                  )}>
                    {workspace.name}
                  </span>
                  {isMainWorkspace && (
                    <Badge variant="secondary" className="h-4 px-1 text-[10px]">
                      <Crown className="h-2.5 w-2.5" />
                    </Badge>
                  )}
                </div>
                {isActive && (
                  <span className="truncate text-xs text-muted-foreground">
                    {workspace.type}
                  </span>
                )}
              </div>
              {hasOptions && (
                <ChevronDown className={cn(
                  "ml-auto transition-transform",
                  isActive ? "size-4" : "size-3"
                )} />
              )}
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          
          {hasOptions && (
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              align="start"
              side={isMobile ? "bottom" : "right"}
              sideOffset={4}
            >
              {/* Siblings */}
              {siblings.length > 0 && (
                <>
                  <DropdownMenuLabel className="text-xs text-muted-foreground">
                    Same Level
                  </DropdownMenuLabel>
                  {siblings.map((sibling) => (
                    <WorkspaceMenuItem
                      key={sibling._id}
                      workspace={sibling}
                      onSelect={() => onSelect(sibling._id)}
                    />
                  ))}
                </>
              )}
              
              {/* Children */}
              {children.length > 0 && (
                <>
                  {siblings.length > 0 && <DropdownMenuSeparator />}
                  <DropdownMenuLabel className="text-xs text-muted-foreground">
                    Child Workspaces
                  </DropdownMenuLabel>
                  {children.map((child) => (
                    <WorkspaceMenuItem
                      key={child._id}
                      workspace={child}
                      onSelect={() => onSelect(child._id)}
                    />
                  ))}
                </>
              )}
            </DropdownMenuContent>
          )}
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

function WorkspaceMenuItem({
  workspace,
  onSelect,
}: {
  workspace: Doc<"workspaces">
  onSelect: () => void
}) {
  const Icon = WORKSPACE_TYPE_ICONS[workspace.type ?? "personal"] ?? Briefcase
  const color = (workspace as any).color ?? "#6366f1"
  const isMain = (workspace as any).isMainWorkspace

  return (
    <DropdownMenuItem
      className="gap-2 p-2 cursor-pointer"
      onSelect={(e) => {
        e.preventDefault()
        onSelect()
      }}
    >
      <div
        className="flex size-6 items-center justify-center rounded-sm text-white"
        style={{ backgroundColor: color }}
      >
        <Icon className="size-3.5" />
      </div>
      <div className="flex-1 text-left">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium">{workspace.name}</span>
          {isMain && (
            <Crown className="size-3 text-yellow-500" />
          )}
        </div>
        <span className="text-xs text-muted-foreground">
          {workspace.type}
        </span>
      </div>
    </DropdownMenuItem>
  )
}

export default WorkspaceSwitcherStack
