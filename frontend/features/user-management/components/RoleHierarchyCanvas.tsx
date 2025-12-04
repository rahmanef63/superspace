/**
 * RoleHierarchyCanvas
 * 
 * ReactFlow-based visual role management canvas.
 * Allows drag-and-drop role hierarchy editing with filters.
 */

"use client";

import * as React from "react";
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  MarkerType,
  Panel,
  NodeTypes,
  Handle,
  Position,
} from "reactflow";
import "reactflow/dist/style.css";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Plus,
  Filter,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Settings,
  Save,
  Link,
  Unlink,
  Shield,
  Lock,
  Unlock,
} from "lucide-react";
import type { Id } from "@convex/_generated/dataModel";
import type { RoleHierarchy, RoleNode, RoleLink } from "../types";
import { useCreateRoleHierarchyLink, useDeleteRoleHierarchyLink } from "../api";
import { useToast } from "@/hooks/use-toast";

// ============================================================================
// Custom Role Node Component
// ============================================================================

interface RoleNodeData {
  name: string;
  slug: string;
  level: number;
  color?: string;
  permissions: string[];
  isSystemRole?: boolean;
  isDefault?: boolean;
  onEdit?: (id: string) => void;
}

function RoleNodeComponent({ id, data, selected }: { id: string; data: RoleNodeData; selected?: boolean }) {
  const permissionCount = data.permissions?.length ?? 0;
  const hasAllPermissions = data.permissions?.includes("*");

  return (
    <div
      className={cn(
        "px-4 py-3 rounded-lg shadow-md border-2 min-w-40 transition-all",
        selected ? "border-primary ring-2 ring-primary/30" : "border-transparent",
        "bg-background"
      )}
    >
      {/* Input handle (from parent) */}
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-primary border-2 border-background"
      />

      {/* Role content */}
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-3 h-3 rounded-full"
          style={{ backgroundColor: data.color ?? "#6366f1" }}
        />
        <span className="font-medium text-sm">{data.name}</span>
        {data.isSystemRole && (
          <Lock className="w-3 h-3 text-muted-foreground" />
        )}
        {data.isDefault && (
          <Badge variant="secondary" className="text-[9px] px-1 py-0">
            Default
          </Badge>
        )}
      </div>

      <div className="space-y-1 text-xs text-muted-foreground">
        <div className="flex items-center justify-between">
          <span>Level:</span>
          <Badge variant="outline" className="text-[10px]">
            {data.level}
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span>Permissions:</span>
          <Badge 
            variant={hasAllPermissions ? "default" : "secondary"} 
            className="text-[10px]"
          >
            {hasAllPermissions ? "All (*)" : permissionCount}
          </Badge>
        </div>
      </div>

      {/* Output handle (to children) */}
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-primary border-2 border-background"
      />
    </div>
  );
}

const nodeTypes: NodeTypes = {
  roleNode: RoleNodeComponent,
};

// ============================================================================
// Main Component
// ============================================================================

interface RoleHierarchyCanvasProps {
  workspaceId: Id<"workspaces">;
  roleHierarchy: RoleHierarchy | null | undefined;
  className?: string;
}

export function RoleHierarchyCanvas({
  workspaceId,
  roleHierarchy,
  className,
}: RoleHierarchyCanvasProps) {
  // State
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = React.useState<string | null>(null);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = React.useState(false);
  const [linkSource, setLinkSource] = React.useState<string>("");
  const [linkTarget, setLinkTarget] = React.useState<string>("");
  const [linkInheritanceMode, setLinkInheritanceMode] = React.useState<"full" | "restrict" | "extend">("full");
  const [filterLevels, setFilterLevels] = React.useState<Set<number>>(new Set());
  const [showFilters, setShowFilters] = React.useState(false);

  // Hooks
  const createRoleHierarchyLink = useCreateRoleHierarchyLink();
  const deleteRoleHierarchyLink = useDeleteRoleHierarchyLink();
  const { toast } = useToast();

  // Get unique levels for filtering
  const uniqueLevels = React.useMemo(() => {
    if (!roleHierarchy) return [];
    const levels = new Set(roleHierarchy.roles.map((r) => r.level));
    return Array.from(levels).sort((a, b) => a - b);
  }, [roleHierarchy]);

  // Convert role hierarchy to ReactFlow nodes and edges
  React.useEffect(() => {
    if (!roleHierarchy) return;

    // Filter roles by level if filters are active
    const filteredRoles = filterLevels.size > 0
      ? roleHierarchy.roles.filter((r) => filterLevels.has(r.level))
      : roleHierarchy.roles;

    // Create nodes
    const newNodes: Node[] = filteredRoles.map((role) => ({
      id: role.id,
      type: "roleNode",
      position: role.position,
      data: {
        name: role.name,
        slug: role.slug,
        level: role.level,
        color: role.color,
        permissions: role.permissions,
        isSystemRole: role.isSystemRole,
        isDefault: role.isDefault,
      },
    }));

    // Create edges
    const filteredRoleIds = new Set(filteredRoles.map((r) => r.id));
    const newEdges: Edge[] = roleHierarchy.links
      .filter((link) => filteredRoleIds.has(link.source) && filteredRoleIds.has(link.target))
      .map((link) => ({
        id: link.id,
        source: link.source,
        target: link.target,
        type: "smoothstep",
        animated: link.inheritanceMode === "full",
        style: {
          stroke: link.inheritanceMode === "restrict" ? "#ef4444" : 
                  link.inheritanceMode === "extend" ? "#22c55e" : "#6366f1",
          strokeWidth: 2,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: link.inheritanceMode === "restrict" ? "#ef4444" : 
                 link.inheritanceMode === "extend" ? "#22c55e" : "#6366f1",
        },
        label: link.inheritanceMode,
        labelStyle: { fontSize: 10, fill: "#888" },
      }));

    setNodes(newNodes);
    setEdges(newEdges);
  }, [roleHierarchy, filterLevels, setNodes, setEdges]);

  // Handle new connection
  const onConnect = React.useCallback(
    (params: Connection) => {
      if (!params.source || !params.target) return;
      setLinkSource(params.source);
      setLinkTarget(params.target);
      setIsLinkDialogOpen(true);
    },
    []
  );

  // Create hierarchy link
  const handleCreateLink = async () => {
    if (!linkSource || !linkTarget) return;

    try {
      await createRoleHierarchyLink({
        workspaceId,
        parentRoleId: linkSource as Id<"roles">,
        childRoleId: linkTarget as Id<"roles">,
        inheritanceMode: linkInheritanceMode,
      });

      toast({
        title: "Link created",
        description: "Role hierarchy link has been created.",
      });

      setIsLinkDialogOpen(false);
      setLinkSource("");
      setLinkTarget("");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create link",
        variant: "destructive",
      });
    }
  };

  // Delete edge on click
  const onEdgeClick = React.useCallback(
    async (_: React.MouseEvent, edge: Edge) => {
      if (!confirm("Delete this role hierarchy link?")) return;

      try {
        await deleteRoleHierarchyLink({
          linkId: edge.id as Id<"roleHierarchyLinks">,
        });

        toast({
          title: "Link deleted",
          description: "Role hierarchy link has been removed.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to delete link",
          variant: "destructive",
        });
      }
    },
    [deleteRoleHierarchyLink, toast]
  );

  // Toggle level filter
  const toggleLevelFilter = (level: number) => {
    const newFilters = new Set(filterLevels);
    if (newFilters.has(level)) {
      newFilters.delete(level);
    } else {
      newFilters.add(level);
    }
    setFilterLevels(newFilters);
  };

  if (!roleHierarchy) {
    return (
      <div className={cn("flex items-center justify-center h-full text-muted-foreground", className)}>
        <div className="text-center">
          <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin" />
          <p className="text-sm">Loading role hierarchy...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("h-full relative", className)}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onEdgeClick={onEdgeClick}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
        className="bg-muted/20"
      >
        <Background color="#ddd" gap={20} />
        <Controls showInteractive={false} />
        <MiniMap
          nodeStrokeColor={(n) => {
            if (n.data?.isSystemRole) return "#888";
            return n.data?.color ?? "#6366f1";
          }}
          nodeColor={(n) => n.data?.color ?? "#6366f1"}
          nodeBorderRadius={8}
        />

        {/* Custom panel with filters */}
        <Panel position="top-right" className="flex gap-2">
          {/* Filters popover */}
          <Popover open={showFilters} onOpenChange={setShowFilters}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Filter className="w-4 h-4" />
                Filters
                {filterLevels.size > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {filterLevels.size}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-56">
              <div className="space-y-3">
                <div className="font-medium text-sm">Filter by Level</div>
                <div className="space-y-2">
                  {uniqueLevels.map((level) => (
                    <div key={level} className="flex items-center gap-2">
                      <Checkbox
                        id={`level-${level}`}
                        checked={filterLevels.has(level)}
                        onCheckedChange={() => toggleLevelFilter(level)}
                      />
                      <label
                        htmlFor={`level-${level}`}
                        className="text-sm cursor-pointer"
                      >
                        Level {level}
                      </label>
                    </div>
                  ))}
                </div>
                {filterLevels.size > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full"
                    onClick={() => setFilterLevels(new Set())}
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </Panel>

        {/* Legend panel */}
        <Panel position="bottom-right">
          <Card className="text-xs">
            <CardContent className="p-3 space-y-2">
              <div className="font-medium">Link Types</div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-primary" />
                <span>Full inherit (animated)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-red-500" />
                <span>Restrict</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-0.5 bg-green-500" />
                <span>Extend</span>
              </div>
            </CardContent>
          </Card>
        </Panel>
      </ReactFlow>

      {/* Create link dialog */}
      <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Link className="w-5 h-5" />
              Create Role Hierarchy Link
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-3 bg-muted rounded-lg text-sm">
              <p>
                <span className="font-medium">Parent:</span>{" "}
                {roleHierarchy.roles.find((r) => r.id === linkSource)?.name ?? linkSource}
              </p>
              <p>
                <span className="font-medium">Child:</span>{" "}
                {roleHierarchy.roles.find((r) => r.id === linkTarget)?.name ?? linkTarget}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Inheritance Mode</Label>
              <Select
                value={linkInheritanceMode}
                onValueChange={(v) => setLinkInheritanceMode(v as typeof linkInheritanceMode)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-primary" />
                      <div>
                        <div>Full Inherit</div>
                        <div className="text-xs text-muted-foreground">
                          Child inherits all parent permissions
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="restrict">
                    <div className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-red-500" />
                      <div>
                        <div>Restrict</div>
                        <div className="text-xs text-muted-foreground">
                          Child can only have subset of parent
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                  <SelectItem value="extend">
                    <div className="flex items-center gap-2">
                      <Unlock className="w-4 h-4 text-green-500" />
                      <div>
                        <div>Extend</div>
                        <div className="text-xs text-muted-foreground">
                          Child can add to parent permissions
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleCreateLink}>
              <Link className="w-4 h-4 mr-2" />
              Create Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default RoleHierarchyCanvas;
