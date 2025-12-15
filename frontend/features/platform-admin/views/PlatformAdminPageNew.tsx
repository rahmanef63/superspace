"use client"

import React, { useEffect, useState, useMemo, useCallback } from "react"
import {
  Shield,
  Users,
  Settings,
  Activity,
  AlertTriangle,
  Loader2,
  Building2,
  Blocks,
  RefreshCw,
  Store,
  Plus,
  Package,
  Save,
  Box,
} from "lucide-react"
import { ThreeColumnLayoutAdvanced } from "@/frontend/shared/ui/layout/container"
import { usePlatformAdmin, useSystemFeatures, useSystemFeatureMutations, useBundleCategories, useBundleCategoryMutations } from "../hooks/usePlatformAdmin"
import {
  AdminNavigation,
  AdminInspector,
  StatCard,
  BundleCategoriesTable,
  PlatformUsersTable,
  PlatformInvitationsTable,
  BundleMultiSelect,
  type AdminSection,
  type SelectedBundle,
  type BundleOption,
  type BundleCategoryDataForEdit,
} from "../components"
import { BundleEditInspectorPanel } from "../components/inspector/BundleEditInspectorPanel"
import { FEATURE_TAGS, type FeatureStatus } from "../types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { ConvexErrorBoundary } from "@/frontend/shared/ui/components/error/ConvexErrorBoundary"
import { IconPicker, getIconComponent } from "@/frontend/shared/ui/icons"

// Import content sections
import {
  SystemFeaturesContent,
  CustomFeaturesContent,
  WorkspacesContent,
  AnalyticsContent,
  SettingsContent,
} from "./content"

// Workspace Store for Hierarchy view
import { WorkspaceStorePage } from "@/frontend/features/workspace-store"

// Feature categories available
const FEATURE_CATEGORIES = [
  "productivity", "communication", "analytics", "integration",
  "management", "development", "ai", "media", "commerce", "system",
] as const

// Feature statuses
const FEATURE_STATUSES = [
  { value: "stable", label: "Stable" },
  { value: "beta", label: "Beta" },
  { value: "development", label: "Development" },
  { value: "experimental", label: "Experimental" },
  { value: "deprecated", label: "Deprecated" },
] as const

// Feature types
const FEATURE_TYPES = [
  { value: "default", label: "Default" },
  { value: "optional", label: "Optional" },
  { value: "system", label: "System" },
  { value: "premium", label: "Premium" },
] as const

function LoadingState() {
  return (
    <div className="flex flex-col h-full p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-8" />
        <Skeleton className="h-8 w-48" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" />
        ))}
      </div>
      <Skeleton className="h-64 w-full" />
    </div>
  )
}

function AccessDenied() {
  return (
    <div className="flex flex-col items-center justify-center h-full p-6">
      <div className="rounded-full bg-red-500/10 p-4 mb-4">
        <Shield className="h-12 w-12 text-red-500" />
      </div>
      <h1 className="text-2xl font-bold text-center">Access Denied</h1>
      <p className="text-muted-foreground text-center mt-2 max-w-md">
        You don&apos;t have platform administrator access.
        This page is restricted to super admins only.
      </p>
      <Badge variant="outline" className={cn("mt-4", FEATURE_TAGS.admin.color)}>
        {FEATURE_TAGS.admin.label}
      </Badge>
    </div>
  )
}

function PlatformAdminErrorFallback({ error, onRetry }: { error: Error; onRetry: () => void }) {
  const message = error?.message ?? "An unexpected error occurred."
  const isAccessError = message.toLowerCase().includes("platform administrator access required")

  if (isAccessError) {
    return (
      <div className="flex flex-col h-full p-6 space-y-4">
        <AccessDenied />
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry access check
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 space-y-3 text-center">
      <AlertTriangle className="h-10 w-10 text-red-500" />
      <div>
        <h2 className="text-lg font-semibold">Unable to load the admin console</h2>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
      <Button variant="outline" size="sm" onClick={onRetry}>
        <RefreshCw className="h-4 w-4 mr-2" />
        Retry
      </Button>
    </div>
  )
}

/**
 * Platform Admin Page with Three Column Layout
 */
function PlatformAdminContent() {
  const {
    isLoading,
    isPlatformAdmin,
    email,
    features,
    workspaces,
  } = usePlatformAdmin()

  const { features: systemFeatures } = useSystemFeatures()
  const { bundles: bundleCategories } = useBundleCategories()
  const { updateFeature } = useSystemFeatureMutations()
  const { setFeatureBundles, createBundle } = useBundleCategoryMutations()

  // Section state
  const [activeSection, setActiveSection] = useState<AdminSection>("system-features")

  // Selected item for inspector
  const [selectedItem, setSelectedItem] = useState<any>(null)

  // Right panel collapsed state
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(true)

  // Edit Sheet state
  const [editingFeature, setEditingFeature] = useState<any | null>(null)
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedBundles, setSelectedBundles] = useState<SelectedBundle[]>([])

  // Bundle edit sheet (driven by inspector, like Menu Store)
  const [editingBundle, setEditingBundle] = useState<BundleCategoryDataForEdit | null>(null)
  const [isBundleEditMode, setIsBundleEditMode] = useState(false)

  useEffect(() => {
    // If selection changes, exit edit mode to avoid editing the wrong item.
    setIsBundleEditMode(false)
  }, [selectedItem?._id])

  // Form state for editing
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    version: "",
    category: "productivity",
    status: "stable",
    featureType: "optional",
    icon: "Box",
    tags: [] as string[],
    isReady: true,
    expectedRelease: "",
    isPublic: true,
    isEnabled: true,
  })

  // Convert bundle categories to options format
  const bundleOptions: BundleOption[] = useMemo(() => {
    return (bundleCategories ?? []).map((b: any) => ({
      bundleId: b.bundleId,
      name: b.name,
      description: b.description,
      icon: b.icon,
      primaryColor: b.primaryColor,
      category: b.category,
    }))
  }, [bundleCategories])

  // Stats for navigation badges
  const stats = useMemo(() => ({
    features: systemFeatures?.length ?? 0,
    bundles: bundleCategories?.length ?? 0,
    workspaces: workspaces?.length ?? 0,
    users: 0, // TODO: fetch user count
    invitations: 0, // TODO: fetch invitation count
  }), [systemFeatures, bundleCategories, workspaces])

  // Handle section change - reset selected item
  const handleSectionChange = useCallback((section: AdminSection) => {
    setActiveSection(section)
    setSelectedItem(null)
    setRightPanelCollapsed(true)
  }, [])

  // Handle item selection - show in inspector
  const handleItemSelect = useCallback((item: any) => {
    setSelectedItem(item)
    setRightPanelCollapsed(false)
  }, [])

  // Handle inspector close
  const handleInspectorClose = useCallback(() => {
    setSelectedItem(null)
    setRightPanelCollapsed(true)
  }, [])

  // Handle opening edit sheet
  const handleOpenEdit = useCallback((feature: any) => {
    setEditingFeature(feature)
    setEditForm({
      name: feature.name || "",
      description: feature.description || "",
      version: feature.version || "1.0.0",
      category: feature.category || "productivity",
      status: feature.status || "stable",
      featureType: feature.featureType || "optional",
      icon: feature.icon || "Box",
      tags: feature.tags || [],
      isReady: feature.isReady ?? true,
      expectedRelease: feature.expectedRelease || "",
      isPublic: feature.isPublic ?? true,
      isEnabled: feature.isEnabled ?? true,
    })
    setSelectedBundles([])
    setIsEditSheetOpen(true)
  }, [])

  const handleOpenBundleEdit = useCallback((bundle: any) => {
    setEditingBundle(bundle)
    setIsBundleEditMode(true)
  }, [])

  // Handle saving edit
  const handleSaveEdit = useCallback(async () => {
    if (!editingFeature) return
    setIsSaving(true)
    try {
      await updateFeature(editingFeature._id, {
        ...editForm,
        status: editForm.status as FeatureStatus,
      })

      if (selectedBundles.length > 0) {
        await setFeatureBundles(editingFeature.featureId, selectedBundles)
      }

      toast.success("Feature updated successfully")
      setIsEditSheetOpen(false)
      setEditingFeature(null)
      setSelectedBundles([])
    } catch (error) {
      toast.error("Failed to update feature")
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }, [editingFeature, editForm, selectedBundles, updateFeature, setFeatureBundles])

  if (isLoading) {
    return <LoadingState />
  }

  if (!isPlatformAdmin) {
    return <AccessDenied />
  }

  // ============================================================================
  // LEFT PANEL - Navigation
  // ============================================================================
  const leftPanel = (
    <AdminNavigation
      activeSection={activeSection}
      onSectionChange={handleSectionChange}
      stats={stats}
    />
  )

  // ============================================================================
  // CENTER PANEL - Content based on active section
  // ============================================================================
  const centerPanel = useMemo(() => {
    // Stats row at the top (only for certain sections)
    const showStats = ["system-features", "bundle-categories", "workspaces", "users"].includes(activeSection)

    const statsRow = showStats && (
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 p-4 border-b bg-muted/20">
        <StatCard
          title="Total Workspaces"
          value={workspaces.length}
          description="Active workspaces"
          icon={Building2}
        />
        <StatCard
          title="System Features"
          value={systemFeatures?.length ?? 0}
          description="In Menu Store"
          icon={Store}
        />
        <StatCard
          title="Bundles"
          value={bundleCategories?.length ?? 0}
          description="Available bundles"
          icon={Package}
        />
        <StatCard
          title="System Health"
          value="100%"
          description="All operational"
          icon={Activity}
        />
      </div>
    )

    // Content based on section
    let content: React.ReactNode

    switch (activeSection) {
      case "system-features":
        content = (
          <SystemFeaturesContent
            onItemSelect={handleItemSelect}
            selectedItemId={selectedItem?._id}
          />
        )
        break

      case "bundle-categories":
        content = (
          <div className="p-4">
            <BundleCategoriesTable
              onItemSelect={handleItemSelect}
              selectedItemId={selectedItem?._id}
            />
          </div>
        )
        break

      case "workspace-hierarchy":
        content = <WorkspaceStorePage />
        break

      case "custom-features":
        content = (
          <CustomFeaturesContent
            features={features}
            onItemSelect={handleItemSelect}
            selectedItemId={selectedItem?._id}
          />
        )
        break

      case "workspaces":
        content = (
          <WorkspacesContent
            workspaces={workspaces}
            onItemSelect={handleItemSelect}
            selectedItemId={selectedItem?._id}
          />
        )
        break

      case "users":
        content = (
          <div className="p-4">
            <PlatformUsersTable />
          </div>
        )
        break

      case "invitations":
        content = (
          <div className="p-4">
            <PlatformInvitationsTable />
          </div>
        )
        break

      case "analytics":
        content = <AnalyticsContent />
        break

      case "settings":
        content = <SettingsContent />
        break

      default:
        content = (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>Select a section from the navigation</p>
          </div>
        )
    }

    return (
      <div className="flex flex-col h-full min-h-0">
        {statsRow}
        <div className="flex-1 min-h-0 overflow-auto">
          {content}
        </div>
      </div>
    )
  }, [activeSection, workspaces, systemFeatures, bundleCategories, features, selectedItem, handleItemSelect])

  // ============================================================================
  // RIGHT PANEL - Inspector
  // ============================================================================
  const rightPanel = (
    activeSection === "bundle-categories" && isBundleEditMode && editingBundle ? (
      <BundleEditInspectorPanel
        bundle={editingBundle}
        onClose={() => {
          setIsBundleEditMode(false)
          setEditingBundle(null)
        }}
        onSaved={(nextBundle) => {
          setEditingBundle(nextBundle)
          setSelectedItem(nextBundle)
        }}
      />
    ) : (
      <AdminInspector
        section={activeSection}
        selectedItem={selectedItem}
        onEdit={() => {
          if (!selectedItem) return
          if (activeSection === "bundle-categories") {
            handleOpenBundleEdit(selectedItem)
            return
          }
          handleOpenEdit(selectedItem)
        }}
        onDelete={() => {
          // TODO: Confirm and delete
          console.log("Delete:", selectedItem)
        }}
        onTogglePublic={() => {
          // TODO: Toggle public visibility
          console.log("Toggle public:", selectedItem)
        }}
        onToggleEnabled={() => {
          // TODO: Toggle enabled state
          console.log("Toggle enabled:", selectedItem)
        }}
        onClose={handleInspectorClose}
      />
    )
  )

  return (
    <div className="flex flex-col w-full h-full overflow-hidden">
      {/* Page Header */}
      <div className="flex-shrink-0 border-b px-6 py-3 bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-gradient-to-br from-red-500 to-orange-500 p-2">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">Platform Admin</h1>
              <p className="text-xs text-muted-foreground">
                Logged in as <span className="font-medium">{email}</span>
              </p>
            </div>
          </div>
          <Badge variant="outline" className={cn("gap-1", FEATURE_TAGS.admin.color)}>
            <Shield className="h-3 w-3" />
            Super Admin
          </Badge>
        </div>
      </div>

      {/* Three Column Layout */}
      <div className="flex-1 min-h-0">
        <ThreeColumnLayoutAdvanced
          preset="admin"
          left={leftPanel}
          center={centerPanel}
          right={rightPanel}
          // Labels
          leftLabel="Navigation"
          centerLabel="Content"
          rightLabel="Inspector"
          persistState={true}
          storageKey="platform-admin-layout"
          rightCollapsed={rightPanelCollapsed}
          onRightCollapsedChange={setRightPanelCollapsed}
        />
      </div>

      {/* Edit Feature Sheet */}
      <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
        <SheetContent className="w-full sm:max-w-[480px] p-0 gap-0 [&>button]:top-5 [&>button]:right-5">
          <SheetHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
            <SheetTitle className="text-xl">Edit Feature</SheetTitle>
            <SheetDescription>
              Update feature details for Menu Store
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6 space-y-6">
            {/* Feature ID - Read Only */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Feature ID</Label>
              <Input value={editingFeature?.featureId || ""} disabled className="font-mono bg-muted/50 h-10" />
            </div>

            {/* Basic Info Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Basic Information</h4>

              <div className="space-y-2">
                <Label htmlFor="edit-name" className="text-sm font-medium">Name <span className="text-red-500">*</span></Label>
                <Input
                  id="edit-name"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="Feature name"
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description" className="text-sm font-medium">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editForm.description}
                  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                  placeholder="Brief description of the feature"
                  rows={3}
                  className="resize-none"
                />
              </div>
            </div>

            {/* Version & Icon */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Version & Appearance</h4>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-version" className="text-sm font-medium">Version <span className="text-red-500">*</span></Label>
                  <Input
                    id="edit-version"
                    value={editForm.version}
                    onChange={(e) => setEditForm({ ...editForm, version: e.target.value })}
                    placeholder="1.0.0"
                    className="h-10 font-mono"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-icon" className="text-sm font-medium">Icon</Label>
                  <IconPicker
                    icon={editForm.icon}
                    onIconChange={(icon) => setEditForm({ ...editForm, icon })}
                    showColor={false}
                    className="w-full"
                    trigger={
                      <Button variant="outline" className="w-full h-10 justify-start gap-2">
                        {(() => {
                          const IconComp = getIconComponent(editForm.icon)
                          return IconComp ? <IconComp className="h-4 w-4" /> : <Box className="h-4 w-4" />
                        })()}
                        <span>{editForm.icon}</span>
                      </Button>
                    }
                  />
                </div>
              </div>
            </div>

            {/* Classification */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Classification</h4>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-category" className="text-sm font-medium">Category <span className="text-red-500">*</span></Label>
                  <Select value={editForm.category} onValueChange={(v) => setEditForm({ ...editForm, category: v })}>
                    <SelectTrigger id="edit-category" className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FEATURE_CATEGORIES.map((cat) => (
                        <SelectItem key={cat} value={cat} className="capitalize">{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-status" className="text-sm font-medium">Status <span className="text-red-500">*</span></Label>
                  <Select value={editForm.status} onValueChange={(v) => setEditForm({ ...editForm, status: v })}>
                    <SelectTrigger id="edit-status" className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FEATURE_STATUSES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-type" className="text-sm font-medium">Feature Type</Label>
                  <Select value={editForm.featureType} onValueChange={(v) => setEditForm({ ...editForm, featureType: v })}>
                    <SelectTrigger id="edit-type" className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FEATURE_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-release" className="text-sm font-medium">Expected Release</Label>
                  <Input
                    id="edit-release"
                    value={editForm.expectedRelease}
                    onChange={(e) => setEditForm({ ...editForm, expectedRelease: e.target.value })}
                    placeholder="Q1 2025"
                    className="h-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-tags" className="text-sm font-medium">Tags</Label>
                <Input
                  id="edit-tags"
                  value={editForm.tags.join(", ")}
                  onChange={(e) => setEditForm({
                    ...editForm,
                    tags: e.target.value.split(",").map(t => t.trim()).filter(Boolean)
                  })}
                  placeholder="productivity, workflow, automation"
                  className="h-10"
                />
                <p className="text-xs text-muted-foreground">Separate tags with commas</p>
              </div>
            </div>

            {/* Bundle Categories Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Bundle Categories</h4>
              <p className="text-xs text-muted-foreground -mt-2">
                Assign this feature to workspace bundles. Each bundle can have this feature as core (always on), recommended (default on), or optional (default off).
              </p>

              <BundleMultiSelect
                options={bundleOptions}
                value={selectedBundles}
                onChange={setSelectedBundles}
                placeholder="Select bundle categories..."
                allowCreate={true}
                onCreateBundle={async (bundleId, name) => {
                  await createBundle({
                    bundleId,
                    name,
                    description: `Created for ${editForm.name}`,
                    icon: "Package",
                    category: "productivity",
                    recommendedFor: ["personal"],
                    tags: [],
                  })
                }}
              />
            </div>

            {/* Visibility Settings */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Visibility & Status</h4>

              <div className="space-y-1 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Ready for Use</Label>
                    <p className="text-xs text-muted-foreground">Feature is production ready</p>
                  </div>
                  <Switch
                    checked={editForm.isReady}
                    onCheckedChange={(v) => setEditForm({ ...editForm, isReady: v })}
                  />
                </div>
              </div>

              <div className="space-y-1 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Public Visibility</Label>
                    <p className="text-xs text-muted-foreground">Show in Menu Store</p>
                  </div>
                  <Switch
                    checked={editForm.isPublic}
                    onCheckedChange={(v) => setEditForm({ ...editForm, isPublic: v })}
                  />
                </div>
              </div>

              <div className="space-y-1 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Enabled</Label>
                    <p className="text-xs text-muted-foreground">Feature can be installed</p>
                  </div>
                  <Switch
                    checked={editForm.isEnabled}
                    onCheckedChange={(v) => setEditForm({ ...editForm, isEnabled: v })}
                  />
                </div>
              </div>
            </div>
          </div>

          <SheetFooter className="px-6 py-4 border-t flex-shrink-0">
            <div className="flex w-full gap-3">
              <Button variant="outline" onClick={() => setIsEditSheetOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSaveEdit} disabled={isSaving} className="flex-1">
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

    </div>
  )
}

export default function PlatformAdminPage() {
  return (
    <ConvexErrorBoundary fallback={(error, reset) => (
      <PlatformAdminErrorFallback error={error} onRetry={reset} />
    )}>
      <PlatformAdminContent />
    </ConvexErrorBoundary>
  )
}
