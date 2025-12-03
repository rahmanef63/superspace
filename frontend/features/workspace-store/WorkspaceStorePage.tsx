/**
 * Workspace Store Page
 * 
 * Main page component for managing workspaces with tree structure
 * 3-Panel Layout using ThreeColumnLayoutAdvanced:
 * - Left: Workspace Tree with DnD (collapsible)
 * - Middle: Feature List with eye icon to toggle preview
 * - Right: Feature Preview Panel (collapsible)
 */

"use client"

import * as React from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { useWorkspaceStoreData, useWorkspaceStoreFiltered } from "./hooks/useWorkspaceStoreData"
import { useWorkspaceStoreMutations } from "./hooks/useWorkspaceStoreMutations"
import { useWorkspaceStoreState, useWorkspaceStoreFilters } from "./hooks/useWorkspaceStoreState"
import {
  CreateWorkspaceDialog,
  EditWorkspaceDialog,
  DeleteWorkspaceDialog,
  MoveWorkspaceDialog,
  WorkspaceInspector,
} from "./components"
import { useWorkspaceStore } from "./store"
import { FeatureListPanel, PreviewPanel, getAllFeaturePreviews } from "@/frontend/shared/preview"
import { WorkspaceDnDTree, type WorkspaceDnDItem } from "@/frontend/shared/ui/layout/dnd"
import { ThreeColumnLayoutAdvanced } from "@/frontend/shared/ui/layout/container"
import { 
  FeatureHeader, 
  ContainerHeader,
  HeaderControls,
  type FilterChip,
} from "@/frontend/shared/ui/layout/header"
import { Boxes, Plus, RefreshCw, TreeDeciduous, List, Eye, Filter, X, Info, Layers } from "lucide-react"
import { WORKSPACE_TYPE_OPTIONS } from "./constants"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Toggle } from "@/components/ui/toggle"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { WorkspaceStoreItem, WorkspaceType, MoveWorkspaceData } from "./types"

export function WorkspaceStorePage() {
  // Data hooks
  const { workspaces, isLoading, refetch } = useWorkspaceStoreData()
  
  // Get workspaces as array
  const workspacesArray = React.useMemo(() => {
    return Array.isArray(workspaces) ? workspaces : []
  }, [workspaces])
  
  // State hooks
  const storeState = useWorkspaceStoreState()
  const { filters, setFilters, setSearch, clearFilters } = useWorkspaceStoreFilters()
  
  // Filtered workspaces
  const filteredWorkspaces = useWorkspaceStoreFiltered(filters)
  
  // Mutations
  const mutations = useWorkspaceStoreMutations()
  
  // View mode state
  const [viewMode, setViewMode] = React.useState<"tree" | "list">("tree")
  
  // Center panel mode: inspector (default) or features
  const [centerPanelMode, setCenterPanelMode] = React.useState<"inspector" | "features">("inspector")
  
  // Feature preview state
  const [selectedFeatureId, setSelectedFeatureId] = React.useState<string | null>(null)
  const [previewVisible, setPreviewVisible] = React.useState(false)
  const [rightPanelCollapsed, setRightPanelCollapsed] = React.useState(true)
  
  // Get all available feature previews (global registry)
  const allFeaturePreviews = React.useMemo(() => getAllFeaturePreviews(), [])
  
  // Query menu items for selected workspace to get workspace-specific features
  const workspaceMenuItems = useQuery(
    (api as any)["features/menus/menuItems"]?.getWorkspaceMenuItems,
    storeState.selectedId ? { workspaceId: storeState.selectedId as Id<"workspaces"> } : "skip"
  ) as Array<{ slug: string; name: string; isVisible: boolean }> | undefined
  
  // Filter feature previews to only show workspace's enabled features
  const featurePreviews = React.useMemo(() => {
    if (!workspaceMenuItems || workspaceMenuItems.length === 0) {
      return [] // No features for this workspace
    }
    
    // Get visible feature slugs from menu items
    const enabledFeatureSlugs = new Set(
      workspaceMenuItems
        .filter(item => item.isVisible !== false)
        .map(item => item.slug)
    )
    
    // Filter preview configs to only include enabled features
    return allFeaturePreviews.filter(preview => enabledFeatureSlugs.has(preview.featureId))
  }, [allFeaturePreviews, workspaceMenuItems])
  
  // Handle feature preview toggle
  const handleTogglePreview = React.useCallback((featureId: string) => {
    if (selectedFeatureId === featureId && previewVisible) {
      setPreviewVisible(false)
      setRightPanelCollapsed(true) // Collapse panel when closing preview
    } else {
      setSelectedFeatureId(featureId)
      setPreviewVisible(true)
      setRightPanelCollapsed(false) // Expand panel when opening preview
    }
  }, [selectedFeatureId, previewVisible])
  
  // Dialog states
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false)
  const [editDialogOpen, setEditDialogOpen] = React.useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [moveDialogOpen, setMoveDialogOpen] = React.useState(false)
  const [parentForCreate, setParentForCreate] = React.useState<WorkspaceStoreItem | null>(null)
  const [workspaceToEdit, setWorkspaceToEdit] = React.useState<WorkspaceStoreItem | null>(null)
  const [workspaceToDelete, setWorkspaceToDelete] = React.useState<WorkspaceStoreItem | null>(null)
  const [workspaceToMove, setWorkspaceToMove] = React.useState<WorkspaceStoreItem | null>(null)
  
  // Handlers
  const handleCreateClick = React.useCallback(() => {
    setParentForCreate(null)
    setCreateDialogOpen(true)
  }, [])
  
  const handleCreateChild = React.useCallback((parent: WorkspaceStoreItem) => {
    setParentForCreate(parent)
    setCreateDialogOpen(true)
  }, [])
  
  const handleEdit = React.useCallback((workspace: WorkspaceStoreItem) => {
    setWorkspaceToEdit(workspace)
    setEditDialogOpen(true)
  }, [])
  
  const handleDelete = React.useCallback((workspace: WorkspaceStoreItem) => {
    setWorkspaceToDelete(workspace)
    setDeleteDialogOpen(true)
  }, [])
  
  const handleMove = React.useCallback((workspace: WorkspaceStoreItem) => {
    setWorkspaceToMove(workspace)
    setMoveDialogOpen(true)
  }, [])
  
  const handleSetColor = React.useCallback(async (workspace: WorkspaceStoreItem, color: string) => {
    await mutations.setColor(workspace.id, color)
  }, [mutations])
  
  const handleSetIcon = React.useCallback(async (workspace: WorkspaceStoreItem, icon: string) => {
    await mutations.updateWorkspace(workspace.id, { icon })
  }, [mutations])
  
  const handleUnlink = React.useCallback(async (workspace: WorkspaceStoreItem) => {
    await mutations.setParent(workspace.id, null)
  }, [mutations])
  
  // Handle show features from tree item
  const handleShowFeatures = React.useCallback((workspace: WorkspaceStoreItem) => {
    storeState.setSelectedId(workspace.id)
    setCenterPanelMode("features")
  }, [storeState])
  
  // Create submit handler
  const handleCreateSubmit = React.useCallback(async (data: {
    name: string
    description?: string
    type: WorkspaceType
    icon?: string
    color?: string
    parentId?: string
  }) => {
    await mutations.createWorkspace({
      name: data.name,
      description: data.description,
      type: data.type,
      icon: data.icon,
      color: data.color || "#6366f1",
      parentId: data.parentId,
    })
  }, [mutations])
  
  // Edit submit handler
  const handleEditSubmit = React.useCallback(async (data: {
    name: string
    description?: string
    type: WorkspaceType
    icon?: string
    color?: string
  }) => {
    if (!workspaceToEdit) return
    await mutations.updateWorkspace(workspaceToEdit.id, data)
  }, [mutations, workspaceToEdit])
  
  // Delete confirm handler
  const handleDeleteConfirm = React.useCallback(async () => {
    if (!workspaceToDelete) return
    await mutations.deleteWorkspace(workspaceToDelete.id)
  }, [mutations, workspaceToDelete])
  
  // Move submit handler
  const handleMoveSubmit = React.useCallback(async (targetParentId: string | null) => {
    if (!workspaceToMove) return
    await mutations.setParent(workspaceToMove.id, targetParentId)
  }, [mutations, workspaceToMove])
  
  // DnD move handler
  const handleDnDMove = React.useCallback(async (data: MoveWorkspaceData) => {
    await mutations.moveWorkspace(data)
  }, [mutations])
  
  // Get available move targets (exclude self and descendants)
  const getMoveTargets = React.useCallback((workspace: WorkspaceStoreItem | null): WorkspaceStoreItem[] => {
    if (!workspace) return []
    
    // Get all descendant IDs
    const getDescendantIds = (id: string): string[] => {
      const children = workspacesArray.filter((w: WorkspaceStoreItem) => w.parentId === id)
      return [id, ...children.flatMap((c: WorkspaceStoreItem) => getDescendantIds(c.id))]
    }
    
    const excludeIds = new Set(getDescendantIds(workspace.id))
    return workspacesArray.filter((w: WorkspaceStoreItem) => !excludeIds.has(w.id))
  }, [workspacesArray])
  
  // Check if workspace has children
  const hasChildren = React.useCallback((workspace: WorkspaceStoreItem | null): boolean => {
    if (!workspace) return false
    return workspacesArray.some((w: WorkspaceStoreItem) => w.parentId === workspace.id)
  }, [workspacesArray])
  
  // Search state for workspace tree
  const [workspaceSearch, setWorkspaceSearch] = React.useState("")
  
  // Debounced search effect
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(workspaceSearch)
    }, 300)
    return () => clearTimeout(timer)
  }, [workspaceSearch, setSearch])
  
  // Filter chips for workspace panel
  const workspaceFilterChips = React.useMemo<FilterChip[]>(() => {
    const chips: FilterChip[] = []
    if (filters.types?.length) {
      filters.types.forEach((t) => {
        const label = WORKSPACE_TYPE_OPTIONS.find((o) => o.value === t)?.label ?? t
        chips.push({ key: `type-${t}`, label: "Type", value: label })
      })
    }
    if (filters.hasChildren !== undefined) {
      chips.push({ 
        key: "hasChildren", 
        label: "Children", 
        value: filters.hasChildren ? "Has" : "None" 
      })
    }
    return chips
  }, [filters])
  
  // Handle remove filter chip
  const handleRemoveFilterChip = React.useCallback((key: string) => {
    if (key.startsWith("type-")) {
      const typeValue = key.replace("type-", "")
      setFilters({
        types: filters.types?.filter((t) => t !== typeValue) ?? undefined,
      })
    } else if (key === "hasChildren") {
      setFilters({ hasChildren: undefined })
    }
  }, [filters.types, setFilters])
  
  // Selected workspace info for center panel header
  const selectedWorkspace = React.useMemo(() => {
    if (!storeState.selectedId) return null
    return workspacesArray.find((w) => w.id === storeState.selectedId) ?? null
  }, [storeState.selectedId, workspacesArray])

  // Left Panel Content - Workspace Tree with compact header
  const leftPanelContent = React.useMemo(() => (
    <div className="flex flex-col h-full min-h-0">
      {/* Panel Header - Compact with essential controls */}
      <div className="flex-shrink-0 border-b bg-muted/30">
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{filteredWorkspaces.length}</span>
            {filteredWorkspaces.length !== workspacesArray.length && (
              <span>of {workspacesArray.length}</span>
            )}
            <span>workspaces</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="flex border rounded-md">
              <Toggle
                pressed={viewMode === "tree"}
                onPressedChange={() => setViewMode("tree")}
                size="sm"
                className="rounded-r-none h-7 w-7 p-0"
              >
                <TreeDeciduous className="h-3.5 w-3.5" />
              </Toggle>
              <Toggle
                pressed={viewMode === "list"}
                onPressedChange={() => setViewMode("list")}
                size="sm"
                className="rounded-l-none h-7 w-7 p-0"
              >
                <List className="h-3.5 w-3.5" />
              </Toggle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={refetch}
              disabled={isLoading}
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
        
        {/* Search & Filter Controls */}
        <div className="px-3 pb-2">
          <HeaderControls
            searchable
            searchProps={{
              value: workspaceSearch,
              onChange: setWorkspaceSearch,
              placeholder: "Search workspaces...",
            }}
            filterable
            filterProps={{
              chips: workspaceFilterChips,
              onRemoveChip: handleRemoveFilterChip,
              onClearAll: clearFilters,
              popoverContent: (
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium mb-2">Workspace Type</p>
                    <div className="space-y-1">
                      {WORKSPACE_TYPE_OPTIONS.map((opt) => (
                        <Button
                          key={opt.value}
                          variant={filters.types?.includes(opt.value) ? "secondary" : "ghost"}
                          size="sm"
                          className="w-full justify-start text-xs"
                          onClick={() => {
                            const currentTypes = filters.types || []
                            const newTypes = currentTypes.includes(opt.value)
                              ? currentTypes.filter((t) => t !== opt.value)
                              : [...currentTypes, opt.value]
                            setFilters({ types: newTypes.length > 0 ? newTypes : undefined })
                          }}
                        >
                          {opt.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="border-t pt-2">
                    <p className="text-sm font-medium mb-2">Has Children</p>
                    <div className="flex gap-2">
                      <Button
                        variant={filters.hasChildren === true ? "secondary" : "outline"}
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() => setFilters({ hasChildren: filters.hasChildren === true ? undefined : true })}
                      >
                        Yes
                      </Button>
                      <Button
                        variant={filters.hasChildren === false ? "secondary" : "outline"}
                        size="sm"
                        className="flex-1 text-xs"
                        onClick={() => setFilters({ hasChildren: filters.hasChildren === false ? undefined : false })}
                      >
                        No
                      </Button>
                    </div>
                  </div>
                </div>
              ),
            }}
            responsive
          />
        </div>
      </div>
      
      {/* Tree Content with ScrollArea */}
      <ScrollArea className="flex-1 min-h-0">
        <WorkspaceDnDTree
          workspaces={filteredWorkspaces as WorkspaceDnDItem[]}
          selectedId={storeState.selectedId}
          isLoading={isLoading}
          onSelect={(ws) => {
            storeState.setSelectedId(ws.id)
            setCenterPanelMode("inspector") // Switch to inspector when selecting
          }}
          onMove={handleDnDMove}
          onEdit={(ws) => handleEdit(ws as WorkspaceStoreItem)}
          onDelete={(ws) => handleDelete(ws as WorkspaceStoreItem)}
          onAddChild={(ws) => handleCreateChild(ws as WorkspaceStoreItem)}
          onIconChange={(ws, icon) => handleSetIcon(ws as WorkspaceStoreItem, icon)}
          onColorChange={(ws, color) => handleSetColor(ws as WorkspaceStoreItem, color)}
          onUnlink={(ws) => handleUnlink(ws as WorkspaceStoreItem)}
          onShowFeatures={(ws) => handleShowFeatures(ws as WorkspaceStoreItem)}
        />
      </ScrollArea>
    </div>
  ), [
    filters, setFilters, clearFilters, workspaceSearch, setWorkspaceSearch, 
    workspaceFilterChips, handleRemoveFilterChip, refetch,
    viewMode, setViewMode, isLoading, workspacesArray.length,
    filteredWorkspaces, storeState.selectedId, storeState.setSelectedId, setCenterPanelMode,
    handleDnDMove, handleEdit, handleDelete, handleCreateChild, handleSetIcon, handleSetColor, handleUnlink, handleShowFeatures
  ])

  // Handle inline update from inspector
  const handleInspectorUpdate = React.useCallback(async (workspaceId: string, data: Partial<WorkspaceStoreItem>) => {
    await mutations.updateWorkspace(workspaceId, data)
  }, [mutations])

  // Center Panel Content - Inspector or Feature List
  const centerPanelContent = React.useMemo(() => {
    // Inspector Mode (default)
    if (centerPanelMode === "inspector") {
      return (
        <div className="flex flex-col h-full min-h-0">
          {/* Panel Header - Simple, no duplicate info */}
          <div className="flex-shrink-0 border-b bg-muted/30">
            <ContainerHeader
              title="Inspector"
              subtitle={selectedWorkspace ? "Workspace Details" : "Select a workspace"}
              icon={Info}
              actions={selectedWorkspace && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setCenterPanelMode("features")}
                >
                  <Layers className="h-3.5 w-3.5 mr-1" />
                  Features
                </Button>
              )}
            />
          </div>
          
          {/* Inspector Content */}
          <div className="flex-1 min-h-0 overflow-auto">
            <WorkspaceInspector
              workspace={selectedWorkspace}
              onUpdate={handleInspectorUpdate}
              onShowFeatures={() => setCenterPanelMode("features")}
            />
          </div>
        </div>
      )
    }
    
    // Features Mode
    return (
      <div className="flex flex-col h-full min-h-0">
        {/* Panel Header */}
        <div className="flex-shrink-0 border-b bg-muted/30">
          <ContainerHeader
            title={selectedWorkspace ? `Features: ${selectedWorkspace.name}` : "Features"}
            subtitle={selectedWorkspace ? `${featurePreviews.length} available features` : "Select a workspace"}
            icon={Layers}
            badge={selectedWorkspace && (
              <Badge 
                variant="outline" 
                className="text-xs"
                style={{ 
                  borderColor: selectedWorkspace.color,
                  color: selectedWorkspace.color 
                }}
              >
                {featurePreviews.length}
              </Badge>
            )}
            actions={
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setCenterPanelMode("inspector")}
              >
                <Info className="h-3.5 w-3.5 mr-1" />
                Inspector
              </Button>
            }
          />
        </div>
        
        {/* Feature List Content */}
        <div className="flex-1 min-h-0 overflow-auto">
          <FeatureListPanel
            features={featurePreviews}
            selectedFeatureId={selectedFeatureId}
            onTogglePreview={handleTogglePreview}
            previewVisibleFor={previewVisible ? selectedFeatureId : null}
            hideHeader
          />
        </div>
      </div>
    )
  }, [
    centerPanelMode, selectedWorkspace, featurePreviews, selectedFeatureId, 
    handleTogglePreview, previewVisible, handleInspectorUpdate, setCenterPanelMode
  ])

  // Right Panel Content - Feature Preview with ContainerHeader  
  const selectedFeatureConfig = React.useMemo(() => {
    if (!selectedFeatureId) return null
    return featurePreviews.find((f) => f.featureId === selectedFeatureId) ?? null
  }, [selectedFeatureId, featurePreviews])
  
  const rightPanelContent = React.useMemo(() => (
    <div className="flex flex-col h-full min-h-0">
      {/* Panel Header */}
      <div className="flex-shrink-0 border-b bg-muted/30">
        <ContainerHeader
          title={selectedFeatureConfig?.name ?? "Preview"}
          subtitle={selectedFeatureConfig?.description ?? "Select a feature to preview"}
          icon={Eye}
          actions={
            previewVisible && selectedFeatureId && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setPreviewVisible(false)}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            )
          }
        />
      </div>
      
      {/* Preview Content */}
      <div className="flex-1 min-h-0 overflow-auto">
        <PreviewPanel
          featureId={selectedFeatureId}
          visible={previewVisible}
          onClose={() => setPreviewVisible(false)}
          hideHeader
        />
      </div>
    </div>
  ), [selectedFeatureId, previewVisible, selectedFeatureConfig])

  return (
    <div className="flex flex-col w-full h-full overflow-hidden">
      {/* Page Header - Minimalis, actions di panel header */}
      <div className="flex-shrink-0 border-b">
        <FeatureHeader
          icon={Boxes}
          title="Workspace Store"
          subtitle="Manage workspaces with drag-and-drop hierarchy"
          primaryAction={{
            label: "New",
            icon: Plus,
            onClick: handleCreateClick,
          }}
        />
      </div>
      
      {/* Three Column Layout */}
      <div className="flex-1 min-h-0">
        <ThreeColumnLayoutAdvanced
          left={leftPanelContent}
          center={centerPanelContent}
          right={rightPanelContent}
          // Labels
          leftLabel="Workspaces"
          centerLabel="Features"
          rightLabel="Preview"
          // Widths - flexible for desktop preview
          leftWidth={280}
          rightWidth={500}
          centerMinWidth={200}
          minSideWidth={180}
          maxSideWidth={1200}
          collapsedWidth={44}
          // Space distribution - prioritize right panel for preview
          spaceDistribution="right-priority"
          // Features
          resizable={true}
          showCollapseButtons={true}
          persistState={true}
          storageKey="workspace-store-layout"
          // Responsive
          collapseLeftAt={900}
          collapseRightAt={1100}
          stackAt={640}
          // Default states - right panel controlled for preview toggle
          defaultLeftCollapsed={false}
          rightCollapsed={rightPanelCollapsed}
          onRightCollapsedChange={setRightPanelCollapsed}
        />
      </div>
      
      {/* Dialogs */}
      <CreateWorkspaceDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleCreateSubmit}
        parentWorkspace={parentForCreate}
      />
      
      <EditWorkspaceDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        workspace={workspaceToEdit}
        onSubmit={handleEditSubmit}
      />
      
      <DeleteWorkspaceDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        workspace={workspaceToDelete}
        onConfirm={handleDeleteConfirm}
        hasChildren={hasChildren(workspaceToDelete)}
      />
      
      <MoveWorkspaceDialog
        open={moveDialogOpen}
        onOpenChange={setMoveDialogOpen}
        workspace={workspaceToMove}
        availableTargets={getMoveTargets(workspaceToMove)}
        onSubmit={handleMoveSubmit}
      />
    </div>
  )
}

export default WorkspaceStorePage
