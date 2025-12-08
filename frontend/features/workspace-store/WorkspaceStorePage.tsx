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
import { Boxes, Plus, RefreshCw, TreeDeciduous, List, Eye, Filter, X, Info, Layers, Package, Sliders, Download, Loader2, Check } from "lucide-react"
import { WORKSPACE_TYPE_OPTIONS } from "./constants"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Toggle } from "@/components/ui/toggle"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { SettingsRegistryProvider } from "@/frontend/shared/settings"
import { FeatureSettingsSync } from "@/frontend/shared/settings/components/FeatureSettingsSync"
import { FeatureSettingsListPanel } from "@/frontend/shared/settings/components/FeatureSettingsListPanel"
import { FeatureSettingsPanel } from "@/frontend/shared/settings/components/FeatureSettingsPanel"
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

  // Center panel mode: inspector (default), features, available, settings, import
  const [centerPanelMode, setCenterPanelMode] = React.useState<"inspector" | "features" | "available" | "settings" | "import">("inspector")

  // Right panel mode: preview or settings
  const [rightPanelMode, setRightPanelMode] = React.useState<"preview" | "settings">("preview")

  // Feature settings state
  const [selectedSettingsFeatureSlug, setSelectedSettingsFeatureSlug] = React.useState<string | null>(null)
  const [settingsVisible, setSettingsVisible] = React.useState(false)

  // Import state
  const [importWorkspaceId, setImportWorkspaceId] = React.useState("")
  const [importing, setImporting] = React.useState(false)

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

  // Handle feature settings toggle
  const handleToggleSettings = React.useCallback((featureSlug: string, featureName?: string) => {
    if (selectedSettingsFeatureSlug === featureSlug && settingsVisible) {
      setSettingsVisible(false)
      setRightPanelCollapsed(true)
    } else {
      setSelectedSettingsFeatureSlug(featureSlug)
      setSettingsVisible(true)
      setPreviewVisible(false)
      setRightPanelMode("settings")
      setRightPanelCollapsed(false)
    }
  }, [selectedSettingsFeatureSlug, settingsVisible])

  // Handle import workspace (placeholder)
  const handleImportWorkspace = React.useCallback(async () => {
    if (!importWorkspaceId.trim()) return
    setImporting(true)
    try {
      // TODO: Implement actual import logic
      console.log("Importing workspace:", importWorkspaceId)
      await new Promise(resolve => setTimeout(resolve, 1000))
      setImportWorkspaceId("")
    } finally {
      setImporting(false)
    }
  }, [importWorkspaceId])

  // Available workspace templates (example data)
  const availableWorkspaceTemplates = React.useMemo(() => [
    { id: "consultant", name: "Consultant", description: "For consulting firms and freelancers", features: ["projects", "tasks", "crm", "reports", "documents"] },
    { id: "developer", name: "Developer", description: "For software development teams", features: ["projects", "tasks", "database", "documents", "ai"] },
    { id: "marketing", name: "Marketing", description: "For marketing agencies and teams", features: ["crm", "reports", "analytics", "documents", "chat"] },
    { id: "startup", name: "Startup", description: "All-in-one for startups", features: ["projects", "tasks", "crm", "reports", "analytics", "documents", "chat"] },
    { id: "enterprise", name: "Enterprise", description: "Full-featured for large organizations", features: ["all"] },
  ], [])

  // Handle inline update from inspector
  const handleInspectorUpdate = React.useCallback(async (workspaceId: string, data: Partial<WorkspaceStoreItem>) => {
    await mutations.updateWorkspace(workspaceId, data)
  }, [mutations])

  // Get menu item for selected settings feature
  const selectedSettingsMenuItem = React.useMemo(() => {
    if (!selectedSettingsFeatureSlug || !workspaceMenuItems) return null
    return workspaceMenuItems.find(item => item.slug === selectedSettingsFeatureSlug) ?? null
  }, [selectedSettingsFeatureSlug, workspaceMenuItems])

  // Center Panel Content - 5 Tabs matching Menu Store
  const centerPanelContent = React.useMemo(() => {
    const getCenterTitle = () => {
      switch (centerPanelMode) {
        case "inspector": return "Inspector"
        case "features": return "Features"
        case "available": return "Available Templates"
        case "settings": return "Feature Settings"
        case "import": return "Import Workspace"
        default: return "Inspector"
      }
    }

    const getCenterSubtitle = () => {
      switch (centerPanelMode) {
        case "inspector": return selectedWorkspace ? "Workspace Details" : "Select a workspace"
        case "features": return selectedWorkspace ? `${featurePreviews.length} features installed` : "Select a workspace"
        case "available": return `${availableWorkspaceTemplates.length} templates available`
        case "settings": return "Configure installed features"
        case "import": return "Import from another source"
        default: return ""
      }
    }

    const getCenterIcon = () => {
      switch (centerPanelMode) {
        case "inspector": return Info
        case "features": return Layers
        case "available": return Package
        case "settings": return Sliders
        case "import": return Download
        default: return Info
      }
    }

    return (
      <div className="flex flex-col h-full min-h-0">
        {/* Panel Header with Tabs */}
        <div className="flex-shrink-0 border-b bg-muted/30">
          <ContainerHeader
            title={getCenterTitle()}
            subtitle={getCenterSubtitle()}
            icon={getCenterIcon()}
          />

          {/* Unified Action Toolbar */}
          <div className="px-3 pb-2">
            <div className="flex items-center gap-1 p-1 bg-muted/40 rounded-lg border border-border/50">
              {/* Contextual Group - Active when workspace selected */}
              <div className="flex flex-1 gap-1">
                <Button
                  variant={centerPanelMode === "inspector" ? "secondary" : "ghost"}
                  size="sm"
                  className={cn(
                    "flex-1 text-xs h-7 px-2 font-medium transition-all",
                    centerPanelMode === "inspector" && "bg-background shadow-sm text-foreground",
                    !selectedWorkspace && "opacity-50"
                  )}
                  onClick={() => setCenterPanelMode("inspector")}
                  disabled={!selectedWorkspace}
                  title={!selectedWorkspace ? "Select a workspace first" : "View Details"}
                >
                  <Info className="h-3.5 w-3.5 mr-1.5" />
                  Inspector
                </Button>
                <Button
                  variant={centerPanelMode === "features" ? "secondary" : "ghost"}
                  size="sm"
                  className={cn(
                    "flex-1 text-xs h-7 px-2 font-medium transition-all",
                    centerPanelMode === "features" && "bg-background shadow-sm text-foreground",
                    !selectedWorkspace && "opacity-50"
                  )}
                  onClick={() => setCenterPanelMode("features")}
                  disabled={!selectedWorkspace}
                  title={!selectedWorkspace ? "Select a workspace first" : "Manage Features"}
                >
                  <Layers className="h-3.5 w-3.5 mr-1.5" />
                  Features
                </Button>
                <Button
                  variant={centerPanelMode === "settings" ? "secondary" : "ghost"}
                  size="sm"
                  className={cn(
                    "flex-1 text-xs h-7 px-2 font-medium transition-all",
                    centerPanelMode === "settings" && "bg-background shadow-sm text-foreground",
                    !selectedWorkspace && "opacity-50"
                  )}
                  onClick={() => setCenterPanelMode("settings")}
                  disabled={!selectedWorkspace}
                  title={!selectedWorkspace ? "Select a workspace first" : "Feature Settings"}
                >
                  <Sliders className="h-3.5 w-3.5 mr-1.5" />
                  Settings
                </Button>
              </div>

              {/* Visual Divider */}
              <div className="w-px h-4 bg-border mx-1" />

              {/* Global Group */}
              <div className="flex flex-1 gap-1">
                <Button
                  variant={centerPanelMode === "available" ? "secondary" : "ghost"}
                  size="sm"
                  className={cn(
                    "flex-1 text-xs h-7 px-2 font-medium transition-all",
                    centerPanelMode === "available" && "bg-background shadow-sm text-foreground"
                  )}
                  onClick={() => setCenterPanelMode("available")}
                >
                  <Package className="h-3.5 w-3.5 mr-1.5" />
                  Templates
                </Button>
                <Button
                  variant={centerPanelMode === "import" ? "secondary" : "ghost"}
                  size="sm"
                  className={cn(
                    "flex-1 text-xs h-7 px-2 font-medium transition-all",
                    centerPanelMode === "import" && "bg-background shadow-sm text-foreground"
                  )}
                  onClick={() => setCenterPanelMode("import")}
                >
                  <Download className="h-3.5 w-3.5 mr-1.5" />
                  Import
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Panel Content */}
        <div className="flex-1 min-h-0 overflow-auto">
          {/* Inspector Tab */}
          {centerPanelMode === "inspector" && (
            <WorkspaceInspector
              workspace={selectedWorkspace}
              onUpdate={handleInspectorUpdate}
              onShowFeatures={() => setCenterPanelMode("features")}
            />
          )}

          {/* Features Tab */}
          {centerPanelMode === "features" && (
            <FeatureListPanel
              features={featurePreviews}
              selectedFeatureId={selectedFeatureId}
              onTogglePreview={handleTogglePreview}
              previewVisibleFor={previewVisible ? selectedFeatureId : null}
              hideHeader
            />
          )}

          {/* Available Templates Tab */}
          {centerPanelMode === "available" && (
            <div className="p-4">
              {availableWorkspaceTemplates.length > 0 ? (
                <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
                  {availableWorkspaceTemplates.map((template) => (
                    <Card key={template.id} className={cn(
                      "hover:bg-muted/50 transition-all duration-300 cursor-pointer group hover:shadow-md hover:-translate-y-1 hover:border-primary/20",
                      "relative overflow-hidden"
                    )}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{template.name}</CardTitle>
                          <Badge variant="secondary" className="text-xs">
                            {template.features.length} features
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {template.features.slice(0, 4).map((f) => (
                            <Badge key={f} variant="outline" className="text-[10px]">{f}</Badge>
                          ))}
                          {template.features.length > 4 && (
                            <Badge variant="outline" className="text-[10px]">+{template.features.length - 4}</Badge>
                          )}
                        </div>
                        <Button
                          size="sm"
                          className="w-full mt-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0"
                          onClick={() => {
                            // Create workspace from template
                            setParentForCreate(null)
                            setCreateDialogOpen(true)
                          }}
                        >
                          Use Template
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <Check className="mx-auto mb-4 h-12 w-12 text-green-500" />
                  <h3 className="mb-2 text-lg font-semibold">All Templates Used</h3>
                  <p className="text-muted-foreground">
                    You have used all available workspace templates.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {centerPanelMode === "settings" && (
            <div className="h-full">
              {storeState.selectedId ? (
                <FeatureSettingsListPanel
                  menuItems={workspaceMenuItems as any[] ?? []}
                  onToggleSettings={(featureSlug, featureName) => {
                    handleToggleSettings(featureSlug, featureName)
                  }}
                  activeSettingsSlug={settingsVisible ? selectedSettingsFeatureSlug : null}
                  searchable
                  showCounts
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-in fade-in-50 duration-500">
                  <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-6 ring-1 ring-border/50">
                    <Sliders className="h-8 w-8 text-muted-foreground/50" />
                  </div>
                  <h3 className="font-semibold text-xl tracking-tight mb-2">Select a Workspace</h3>
                  <p className="text-muted-foreground max-w-xs text-sm leading-relaxed">
                    Choose a workspace from the tree to view and configure its feature settings.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Import Tab */}
          {centerPanelMode === "import" && (
            <div className="p-4">
              <div className="space-y-6">
                <div className="max-w-md space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="workspaceId">Workspace ID</Label>
                    <Input
                      id="workspaceId"
                      placeholder="Enter shareable workspace ID..."
                      value={importWorkspaceId}
                      onChange={(e) => setImportWorkspaceId(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && importWorkspaceId.trim() && !importing) {
                          handleImportWorkspace()
                        }
                      }}
                    />
                  </div>
                  <Button
                    onClick={handleImportWorkspace}
                    disabled={!importWorkspaceId.trim() || importing}
                    className="w-full"
                  >
                    {importing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Importing...
                      </>
                    ) : (
                      <>
                        <Download className="mr-2 h-4 w-4" />
                        Import Workspace
                      </>
                    )}
                  </Button>
                </div>

                <Card className="max-w-md">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">How to get a Workspace ID:</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ol className="list-inside list-decimal space-y-1 text-sm text-muted-foreground">
                      <li>Go to the workspace you want to import</li>
                      <li>Click on workspace settings and select "Share"</li>
                      <li>Copy the shareable ID and paste it here</li>
                    </ol>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }, [
    centerPanelMode, selectedWorkspace, featurePreviews, selectedFeatureId,
    handleTogglePreview, previewVisible, handleInspectorUpdate, setCenterPanelMode,
    availableWorkspaceTemplates, storeState.selectedId, workspaceMenuItems,
    handleToggleSettings, settingsVisible, selectedSettingsFeatureSlug,
    importWorkspaceId, importing, handleImportWorkspace, setCreateDialogOpen, setParentForCreate
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
