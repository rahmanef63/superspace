"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  ChevronsUpDown,
  Plus,
  Loader2,
  Home,
  Building2,
  Users,
  Briefcase,
  Heart,
  ChevronRight,
  Link2,
  Unlink,
  Palette,
  MoreHorizontal,
  Check,
  Share2,
} from "lucide-react";
import { Id, Doc } from "@convex/_generated/dataModel";
import { useWorkspaceContext, useChildWorkspaces } from "@/frontend/shared/foundation/provider/WorkspaceProvider";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";

// Import from SSOT
import { WORKSPACE_COLORS } from "@/frontend/shared/constants/colors";

// Workspace type icons
const WORKSPACE_TYPE_ICONS: Record<string, React.ElementType> = {
  personal: Home,
  organization: Building2,
  institution: Building2,
  group: Users,
  family: Heart,
};

interface HierarchicalWorkspace extends Doc<"workspaces"> {
  isLinked?: boolean;
  link?: Doc<"workspaceLinks">;
  children?: HierarchicalWorkspace[];
}

interface EnhancedWorkspaceSwitcherProps {
  onWorkspaceSelect?: (workspaceId: Id<"workspaces">) => void;
  isLoading?: boolean;
}

/**
 * Enhanced Workspace Switcher with hierarchy support
 * 
 * Features:
 * - Shows Main Workspace at top with special styling
 * - Displays child workspaces in hierarchical tree
 * - Shows linked workspaces with link indicator
 * - Supports color-coded workspaces
 * - Actions: Link workspace, unlink, change color
 */
export function EnhancedWorkspaceSwitcher({
  onWorkspaceSelect,
  isLoading = false,
}: EnhancedWorkspaceSwitcherProps) {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = React.useState(false);
  
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
  } = useWorkspaceContext();
  
  // Get available workspaces to link
  const availableToLink = useQuery(
    api.workspace.hierarchy.getAvailableWorkspacesToLink,
    workspaceId ? { parentWorkspaceId: workspaceId } : "skip"
  );
  
  // Mutations
  const linkWorkspace = useMutation(api.workspace.hierarchy.linkWorkspaceAsChild);
  const unlinkWorkspace = useMutation(api.workspace.hierarchy.unlinkChildWorkspace);
  const setWorkspaceColor = useMutation(api.workspace.hierarchy.setWorkspaceColor);

  React.useEffect(() => setMounted(true), []);

  const handleWorkspaceSelect = React.useCallback(
    (wsId: Id<"workspaces">) => {
      setWorkspaceId(wsId);
      onWorkspaceSelect?.(wsId);
    },
    [setWorkspaceId, onWorkspaceSelect],
  );

  const handleLinkWorkspace = React.useCallback(
    async (childId: Id<"workspaces">) => {
      if (!workspaceId) return;
      try {
        await linkWorkspace({
          parentWorkspaceId: workspaceId,
          childWorkspaceId: childId,
        });
        setLinkDialogOpen(false);
      } catch (error) {
        console.error("Failed to link workspace:", error);
      }
    },
    [workspaceId, linkWorkspace],
  );

  const handleUnlinkWorkspace = React.useCallback(
    async (childId: Id<"workspaces">) => {
      if (!workspaceId) return;
      try {
        await unlinkWorkspace({
          parentWorkspaceId: workspaceId,
          childWorkspaceId: childId,
        });
      } catch (error) {
        console.error("Failed to unlink workspace:", error);
      }
    },
    [workspaceId, unlinkWorkspace],
  );

  const handleColorChange = React.useCallback(
    async (wsId: Id<"workspaces">, color: string) => {
      try {
        await setWorkspaceColor({ workspaceId: wsId, color });
      } catch (error) {
        console.error("Failed to set color:", error);
      }
    },
    [setWorkspaceColor],
  );

  // Stable shell before hydration
  if (!mounted) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg border" />
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">Workspace</span>
              <span className="truncate text-xs">Loading...</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  if (isLoading || !workspaces) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" disabled className="opacity-75">
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <Loader2 className="size-4 animate-spin" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">Loading workspaces...</span>
              <span className="truncate text-xs">Please wait</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  if (workspaces.length === 0) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size="lg"
            onClick={() => router.push("/dashboard/workspace")}
            className="justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg border">
                <Plus className="size-4" />
              </div>
              <div className="grid text-left text-sm leading-tight">
                <span className="truncate font-semibold">Create workspace</span>
                <span className="truncate text-xs text-muted-foreground">No workspaces yet</span>
              </div>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  const WorkspaceIcon = currentWorkspace?.type
    ? WORKSPACE_TYPE_ICONS[currentWorkspace.type] ?? Briefcase
    : Briefcase;

  const workspaceColor = (currentWorkspace as any)?.color ?? "#6366f1";

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <div
                  className="flex aspect-square size-8 items-center justify-center rounded-lg text-white"
                  style={{ backgroundColor: workspaceColor }}
                >
                  <WorkspaceIcon className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate font-semibold">
                      {currentWorkspace?.name || "Select Workspace"}
                    </span>
                    {isMainWorkspace && (
                      <Badge variant="secondary" className="h-4 px-1 text-[10px]">
                        Main
                      </Badge>
                    )}
                    {(currentWorkspace as any)?.isShared && (
                      <Badge variant="outline" className="h-4 px-1 text-[10px] gap-0.5">
                        <Share2 className="size-2.5" />
                      </Badge>
                    )}
                  </div>
                  <span className="truncate text-xs text-muted-foreground">
                    {currentWorkspace?.type || ""}
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-64 rounded-lg"
              align="start"
              side={isMobile ? "bottom" : "right"}
              sideOffset={4}
            >
              {/* Breadcrumb path */}
              {workspacePath.length > 1 && (
                <>
                  <div className="flex items-center gap-1 px-2 py-1.5 text-xs text-muted-foreground">
                    {workspacePath.map((ws, idx) => (
                      <React.Fragment key={ws._id}>
                        {idx > 0 && <ChevronRight className="size-3" />}
                        <button
                          className="hover:text-foreground transition-colors"
                          onClick={() => handleWorkspaceSelect(ws._id)}
                        >
                          {ws.name}
                        </button>
                      </React.Fragment>
                    ))}
                  </div>
                  <DropdownMenuSeparator />
                </>
              )}

              {/* Main Workspace */}
              {mainWorkspace && (
                <>
                  <DropdownMenuLabel className="text-xs text-muted-foreground">
                    Main Workspace
                  </DropdownMenuLabel>
                  <WorkspaceMenuItem
                    workspace={mainWorkspace}
                    isSelected={String(workspaceId) === String(mainWorkspace._id)}
                    onSelect={() => handleWorkspaceSelect(mainWorkspace._id)}
                    isMain
                    isShared={(mainWorkspace as any).isShared}
                  />
                  <DropdownMenuSeparator />
                </>
              )}

              {/* Siblings & Children */}
              {(siblingWorkspaces.length > 0 || childWorkspaces.length > 0) && (
                <>
                  {siblingWorkspaces.length > 0 && (
                    <>
                      <DropdownMenuLabel className="text-xs text-muted-foreground">
                        Workspaces
                      </DropdownMenuLabel>
                      {siblingWorkspaces.map((ws) => (
                        <WorkspaceMenuItem
                          key={ws._id}
                          workspace={ws}
                          isSelected={String(workspaceId) === String(ws._id)}
                          onSelect={() => handleWorkspaceSelect(ws._id)}
                          isLinked={(ws as any).isLinked}
                          isShared={(ws as any).isShared}
                        />
                      ))}
                    </>
                  )}

                  {childWorkspaces.length > 0 && (
                    <>
                      <DropdownMenuLabel className="text-xs text-muted-foreground">
                        Child Workspaces
                      </DropdownMenuLabel>
                      {childWorkspaces.map((ws) => (
                        <WorkspaceMenuItem
                          key={ws._id}
                          workspace={ws}
                          isSelected={String(workspaceId) === String(ws._id)}
                          onSelect={() => handleWorkspaceSelect(ws._id)}
                          isLinked={(ws as any).isLinked}
                          isShared={(ws as any).isShared}
                          onUnlink={
                            (ws as any).isLinked
                              ? () => handleUnlinkWorkspace(ws._id)
                              : undefined
                          }
                          onColorChange={(color) => handleColorChange(ws._id, color)}
                        />
                      ))}
                    </>
                  )}
                  <DropdownMenuSeparator />
                </>
              )}

              {/* All Workspaces (fallback) */}
              {siblingWorkspaces.length === 0 && childWorkspaces.length === 0 && (
                <>
                  <DropdownMenuLabel className="text-xs text-muted-foreground">
                    All Workspaces
                  </DropdownMenuLabel>
                  {workspaces
                    .filter((ws) => String(ws._id) !== String(mainWorkspace?._id))
                    .map((ws) => (
                      <WorkspaceMenuItem
                        key={ws._id}
                        workspace={ws}
                        isSelected={String(workspaceId) === String(ws._id)}
                        onSelect={() => handleWorkspaceSelect(ws._id)}
                        isShared={(ws as any).isShared}
                      />
                    ))}
                  <DropdownMenuSeparator />
                </>
              )}

              {/* Actions */}
              <DropdownMenuItem
                className="gap-2 p-2"
                onSelect={() => setLinkDialogOpen(true)}
              >
                <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                  <Link2 className="size-4" />
                </div>
                <div className="font-medium text-muted-foreground">Link existing workspace</div>
              </DropdownMenuItem>

              <DropdownMenuItem
                className="gap-2 p-2"
                onSelect={() => router.push("/dashboard/workspace")}
              >
                <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                  <Plus className="size-4" />
                </div>
                <div className="font-medium text-muted-foreground">Create new workspace</div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      {/* Link Workspace Dialog */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link Workspace</DialogTitle>
            <DialogDescription>
              Select a workspace to link as a child of the current workspace.
              Linked workspaces will appear in your workspace hierarchy.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-64">
            <div className="space-y-1">
              {availableToLink && availableToLink.length > 0 ? (
                availableToLink.map((ws) => {
                  const Icon = WORKSPACE_TYPE_ICONS[ws.type ?? "personal"] ?? Briefcase;
                  return (
                    <Button
                      key={ws._id}
                      variant="ghost"
                      className="w-full justify-start gap-3"
                      onClick={() => handleLinkWorkspace(ws._id)}
                    >
                      <div
                        className="flex size-8 items-center justify-center rounded-lg text-white"
                        style={{ backgroundColor: (ws as any).color ?? "#6366f1" }}
                      >
                        <Icon className="size-4" />
                      </div>
                      <div className="text-left">
                        <div className="font-medium">{ws.name}</div>
                        <div className="text-xs text-muted-foreground">{ws.type}</div>
                      </div>
                    </Button>
                  );
                })
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  No available workspaces to link
                </div>
              )}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLinkDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Individual workspace menu item with actions
function WorkspaceMenuItem({
  workspace,
  isSelected,
  onSelect,
  isMain = false,
  isLinked = false,
  isShared = false,
  onUnlink,
  onColorChange,
}: {
  workspace: Doc<"workspaces">;
  isSelected: boolean;
  onSelect: () => void;
  isMain?: boolean;
  isLinked?: boolean;
  isShared?: boolean;
  onUnlink?: () => void;
  onColorChange?: (color: string) => void;
}) {
  const Icon = WORKSPACE_TYPE_ICONS[workspace.type ?? "personal"] ?? Briefcase;
  const color = (workspace as any).color ?? "#6366f1";

  return (
    <DropdownMenuItem
      className={cn(
        "gap-2 p-2",
        isSelected && "bg-accent"
      )}
      onSelect={(e) => {
        e.preventDefault();
        onSelect();
      }}
    >
      <div
        className="flex size-6 items-center justify-center rounded-sm text-white"
        style={{ backgroundColor: color }}
      >
        <Icon className="size-4 shrink-0" />
      </div>
      <div className="grid flex-1 text-left text-sm leading-tight">
        <div className="flex items-center gap-1.5">
          <span className="truncate font-medium">{workspace.name}</span>
          {isMain && (
            <Badge variant="secondary" className="h-4 px-1 text-[10px]">
              Main
            </Badge>
          )}
          {isShared && (
            <Badge variant="outline" className="h-4 px-1 text-[10px] gap-0.5">
              <Share2 className="size-2.5" />
              Shared
            </Badge>
          )}
          {isLinked && (
            <Link2 className="size-3 text-muted-foreground" />
          )}
        </div>
        <span className="truncate text-xs text-muted-foreground">
          {workspace.type}
        </span>
      </div>
      
      {isSelected && <Check className="size-4" />}
      
      {(onUnlink || onColorChange) && (
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="p-0 h-auto">
            <MoreHorizontal className="size-4 text-muted-foreground" />
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {onColorChange && (
              <div className="p-2">
                <div className="text-xs font-medium mb-2">Color</div>
                <div className="flex flex-wrap gap-1">
                  {WORKSPACE_COLORS.map((colorItem) => (
                    <button
                      key={colorItem.value}
                      className={cn(
                        "size-5 rounded-full border-2 transition-all",
                        colorItem.value === color ? "border-foreground scale-110" : "border-transparent"
                      )}
                      style={{ backgroundColor: colorItem.value }}
                      onClick={() => onColorChange(colorItem.value)}
                      title={colorItem.name}
                    />
                  ))}
                </div>
              </div>
            )}
            {onUnlink && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onUnlink} className="text-destructive">
                  <Unlink className="size-4 mr-2" />
                  Unlink workspace
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      )}
    </DropdownMenuItem>
  );
}

export { WorkspaceSwitcher } from "./WorkspaceSwitcher";
