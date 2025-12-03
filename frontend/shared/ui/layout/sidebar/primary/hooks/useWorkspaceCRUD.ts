"use client"

import { useCallback, useState } from "react"
import { useMutation, useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import type { WorkspaceType } from "@/frontend/features/workspace-store/types"

/**
 * Hook for workspace CRUD operations
 * Provides dialog state management and mutation handlers
 */
export function useWorkspaceCRUD() {
  // Dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [createParentId, setCreateParentId] = useState<Id<"workspaces"> | undefined>()
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editWorkspaceId, setEditWorkspaceId] = useState<Id<"workspaces"> | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteWorkspaceId, setDeleteWorkspaceId] = useState<Id<"workspaces"> | null>(null)
  
  // Mutations
  const createWorkspace = useMutation(api.workspace.workspaces.createWorkspace)
  const updateWorkspace = useMutation(api.workspace.workspaces.updateWorkspace)
  const deleteWorkspaceMutation = useMutation(api.workspace.workspaces.deleteWorkspace)
  
  // Queries for dialogs
  const editWorkspace = useQuery(
    api.workspace.workspaces.getWorkspace,
    editWorkspaceId ? { workspaceId: editWorkspaceId } : "skip"
  )
  
  const deleteWorkspace = useQuery(
    api.workspace.workspaces.getWorkspace,
    deleteWorkspaceId ? { workspaceId: deleteWorkspaceId } : "skip"
  )
  
  // Open dialog handlers
  const openCreateDialog = useCallback((parentId?: Id<"workspaces">) => {
    setCreateParentId(parentId)
    setCreateDialogOpen(true)
  }, [])
  
  const openEditDialog = useCallback((workspaceId: Id<"workspaces">) => {
    setEditWorkspaceId(workspaceId)
    setEditDialogOpen(true)
  }, [])
  
  const openDeleteDialog = useCallback((workspaceId: Id<"workspaces">) => {
    setDeleteWorkspaceId(workspaceId)
    setDeleteDialogOpen(true)
  }, [])
  
  // Submit handlers - matching actual API signatures
  const handleCreateSubmit = useCallback(async (data: {
    name: string
    description?: string
    type: WorkspaceType
    icon?: string
    color?: string
    parentId?: string
  }) => {
    // Generate slug from name
    const slug = data.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
    
    await createWorkspace({
      name: data.name,
      slug,
      description: data.description,
      type: data.type,
      isPublic: false,
    })
  }, [createWorkspace])
  
  const handleEditSubmit = useCallback(async (data: {
    name: string
    description?: string
    type: WorkspaceType
    icon?: string
    color?: string
  }) => {
    if (!editWorkspaceId) return
    // updateWorkspace only supports name, description, isPublic
    await updateWorkspace({
      workspaceId: editWorkspaceId,
      name: data.name,
      description: data.description,
    })
  }, [editWorkspaceId, updateWorkspace])
  
  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteWorkspaceId) return
    await deleteWorkspaceMutation({ workspaceId: deleteWorkspaceId })
  }, [deleteWorkspaceId, deleteWorkspaceMutation])
  
  return {
    // Create dialog
    createDialogOpen,
    setCreateDialogOpen,
    createParentId,
    openCreateDialog,
    handleCreateSubmit,
    
    // Edit dialog
    editDialogOpen,
    setEditDialogOpen,
    editWorkspaceId,
    editWorkspace,
    openEditDialog,
    handleEditSubmit,
    
    // Delete dialog
    deleteDialogOpen,
    setDeleteDialogOpen,
    deleteWorkspaceId,
    deleteWorkspace,
    openDeleteDialog,
    handleDeleteConfirm,
  }
}
