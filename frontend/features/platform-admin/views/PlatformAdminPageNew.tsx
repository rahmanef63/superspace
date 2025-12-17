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

function PlatformAdminErrorFallback({ error, reset }: { error: Error; reset: () => void }) {
  const message = error?.message ?? "An unexpected error occurred."
  const isAccessError = message.toLowerCase().includes("platform administrator access required")

  if (isAccessError) {
    return (
      <div className="flex flex-col h-full p-6 space-y-4">
        <AccessDenied />
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" onClick={reset}>
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
      <Button variant="outline" size="sm" onClick={reset}>
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
        }}
      />
    )
  )

  return (
    <div className="h-full bg-background">
      <ThreeColumnLayoutAdvanced
        left={leftPanel}
        center={centerPanel}
        right={rightPanel}
        rightCollapsed={rightPanelCollapsed}
        onRightCollapsedChange={setRightPanelCollapsed}
      />

      {/* Edit Sheet */}
      <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
        <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Edit Feature</SheetTitle>
            <SheetDescription>
              Update feature configuration and settings
            </SheetDescription>
          </SheetHeader>

          <div className="py-6 space-y-6">
            <div className="space-y-4">
              {/* Basic Info */}
              <div className="space-y-2">
                <Label>Details</Label>
                <Input
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Feature Name"
                />
                <Textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description"
                />
              </div>

              {/* Toggles */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-0.5">
                  <Label>Publicly Available</Label>
                  <div className="text-xs text-muted-foreground">Is this visible to users?</div>
                </div>
                <Switch
                  checked={editForm.isPublic}
                  onCheckedChange={(c) => setEditForm(prev => ({ ...prev, isPublic: c }))}
                />
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-0.5">
                  <Label>Feature Enabled</Label>
                  <div className="text-xs text-muted-foreground">Is this feature enabled globally?</div>
                </div>
                <Switch
                  checked={editForm.isEnabled}
                  onCheckedChange={(c) => setEditForm(prev => ({ ...prev, isEnabled: c }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Bundles</Label>
                <BundleMultiSelect
                  value={selectedBundles}
                  onChange={setSelectedBundles}
                  options={bundleOptions}
                />
              </div>

              {/* Status */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={editForm.status}
                    onValueChange={(v) => setEditForm(prev => ({ ...prev, status: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FEATURE_STATUSES.map(s => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={editForm.featureType}
                    onValueChange={(v) => setEditForm(prev => ({ ...prev, featureType: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {FEATURE_TYPES.map(t => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <SheetFooter>
            <Button variant="outline" onClick={() => setIsEditSheetOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveEdit} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}

/**
 * Main Page Component with Error Boundary
 */
export default function PlatformAdminPageNew() {
  return (
    <div className="h-full bg-background animate-in fade-in duration-500">
      <ConvexErrorBoundary fallback={(error, reset) => <PlatformAdminErrorFallback error={error} reset={reset} />}>
        <PlatformAdminContent />
      </ConvexErrorBoundary>
    </div>
  )
}
