/**
 * Workspace Store Page
 * 
 * Main page component for managing workspaces with tree structure
 */

"use client"

import * as React from "react"
import { useWorkspaceStoreData, useWorkspaceStoreFiltered } from "./hooks/useWorkspaceStoreData"
import { useWorkspaceStoreMutations } from "./hooks/useWorkspaceStoreMutations"
import { useWorkspaceStoreState, useWorkspaceStoreFilters } from "./hooks/useWorkspaceStoreState"
import {
  WorkspaceTree,
  WorkspaceToolbar,
  CreateWorkspaceDialog,
  EditWorkspaceDialog,
  DeleteWorkspaceDialog,
  MoveWorkspaceDialog,
} from "./components"
import { useWorkspaceStore } from "./store"
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

  return (
    <div className="flex flex-col h-full p-4">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">Workspace Store</h1>
        <p className="text-muted-foreground">
          Manage your workspaces with drag-and-drop hierarchy
        </p>
      </div>
      
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
      
      <div className="flex-1 overflow-auto mt-4">
        <WorkspaceTree
          workspaces={filteredWorkspaces}
          selectedId={storeState.selectedId}
          expandedIds={storeState.expandedIds}
          onSelect={storeState.setSelectedId}
          onToggleExpand={storeState.toggleExpanded}
          onMove={handleDnDMove}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAddChild={handleCreateChild}
          onSetColor={handleSetColor}
          onUnlink={handleUnlink}
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
