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
import { useWorkspaceStoreData, useWorkspaceStoreFiltered } from "./hooks/useWorkspaceStoreData"
import { useWorkspaceStoreMutations } from "./hooks/useWorkspaceStoreMutations"
import { useWorkspaceStoreState, useWorkspaceStoreFilters } from "./hooks/useWorkspaceStoreState"
import {
  WorkspaceToolbar,
  CreateWorkspaceDialog,
  EditWorkspaceDialog,
  DeleteWorkspaceDialog,
  MoveWorkspaceDialog,
} from "./components"
import { useWorkspaceStore } from "./store"
import { FeatureListPanel, PreviewPanel, getAllFeaturePreviews } from "@/frontend/shared/features/preview"
import { WorkspaceDnDTree, type WorkspaceDnDItem } from "@/frontend/shared/ui/layout/dnd"
import { ThreeColumnLayoutAdvanced } from "@/frontend/shared/ui/layout/container"
import { FeatureHeader } from "@/frontend/shared/ui/layout/header"
import { Boxes, Plus, RefreshCw } from "lucide-react"
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
  
  // Feature preview state
  const [selectedFeatureId, setSelectedFeatureId] = React.useState<string | null>(null)
  const [previewVisible, setPreviewVisible] = React.useState(false)
  
  // Get all available feature previews
  const featurePreviews = React.useMemo(() => getAllFeaturePreviews(), [])
  
  // Handle feature preview toggle
  const handleTogglePreview = React.useCallback((featureId: string) => {
    if (selectedFeatureId === featureId && previewVisible) {
      setPreviewVisible(false)
    } else {
      setSelectedFeatureId(featureId)
      setPreviewVisible(true)
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

  // Left Panel Content - Workspace Tree
  const leftPanelContent = React.useMemo(() => (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-shrink-0 p-3">
        <WorkspaceToolbar
          filters={filters}
          onFiltersChange={setFilters}
          onSearchChange={setSearch}
          onCreateClick={handleCreateClick}
          onRefresh={refetch}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          isLoading={isLoading}
          totalCount={workspacesArray.length}
          filteredCount={filteredWorkspaces.length}
        />
      </div>
      
      <div className="flex-1 overflow-hidden">
        <WorkspaceDnDTree
          workspaces={filteredWorkspaces as WorkspaceDnDItem[]}
          selectedId={storeState.selectedId}
          isLoading={isLoading}
          onSelect={(ws) => storeState.setSelectedId(ws.id)}
          onMove={handleDnDMove}
          onEdit={(ws) => handleEdit(ws as WorkspaceStoreItem)}
          onDelete={(ws) => handleDelete(ws as WorkspaceStoreItem)}
          onAddChild={(ws) => handleCreateChild(ws as WorkspaceStoreItem)}
          onIconChange={(ws, icon) => handleSetIcon(ws as WorkspaceStoreItem, icon)}
          onColorChange={(ws, color) => handleSetColor(ws as WorkspaceStoreItem, color)}
          onUnlink={(ws) => handleUnlink(ws as WorkspaceStoreItem)}
        />
      </div>
    </div>
  ), [
    filters, setFilters, setSearch, handleCreateClick, refetch,
    viewMode, setViewMode, isLoading, workspacesArray.length,
    filteredWorkspaces, storeState.selectedId, storeState.setSelectedId,
    handleDnDMove, handleEdit, handleDelete, handleCreateChild, handleSetIcon, handleSetColor, handleUnlink
  ])

  // Center Panel Content - Feature List
  const centerPanelContent = React.useMemo(() => (
    <div className="h-full overflow-hidden">
      <FeatureListPanel
        features={featurePreviews}
        selectedFeatureId={selectedFeatureId}
        onTogglePreview={handleTogglePreview}
        previewVisibleFor={previewVisible ? selectedFeatureId : null}
      />
    </div>
  ), [featurePreviews, selectedFeatureId, handleTogglePreview, previewVisible])

  // Right Panel Content - Feature Preview
  const rightPanelContent = React.useMemo(() => (
    <div className="h-full overflow-hidden">
      <PreviewPanel
        featureId={selectedFeatureId}
        visible={previewVisible}
        onClose={() => setPreviewVisible(false)}
      />
    </div>
  ), [selectedFeatureId, previewVisible])

  return (
    <div className="flex flex-col w-full h-full overflow-hidden">
      {/* ✨ NEW LAYOUT SYSTEM - Yellow BG indicates new header/container integration */}
      <div className="bg-yellow-100 dark:bg-yellow-900/30 border-b border-yellow-300 dark:border-yellow-700">
        <FeatureHeader
          icon={Boxes}
          title="Workspace Store"
          subtitle="Manage your workspaces with drag-and-drop hierarchy"
          badge={{ text: "NEW LAYOUT", variant: "default" }}
          primaryAction={{
            label: "Create Workspace",
            icon: Plus,
            onClick: handleCreateClick,
          }}
          secondaryActions={[
            {
              id: "refresh",
              label: "Refresh",
              icon: RefreshCw,
              onClick: refetch,
            },
          ]}
        />
      </div>
      
      {/* Three Column Layout - ThreeColumnLayoutAdvanced with yellow border */}
      <div className="flex-1 min-h-0 border-4 border-yellow-400 dark:border-yellow-600">
        <ThreeColumnLayoutAdvanced
          left={leftPanelContent}
          center={centerPanelContent}
          right={rightPanelContent}
          // Labels
          leftLabel="Workspaces"
          centerLabel="Features"
          rightLabel="Preview"
          // Widths - right panel is larger for desktop preview
          leftWidth={280}
          rightWidth={500}
          centerMinWidth={240}
          minSideWidth={200}
          maxSideWidth={700}
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
          // Default states
          defaultLeftCollapsed={false}
          defaultRightCollapsed={false}
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
