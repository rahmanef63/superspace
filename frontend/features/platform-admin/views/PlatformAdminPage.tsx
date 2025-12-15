"use client"

import React, { useState, useMemo } from "react"
import {
  Shield,
  Users,
  Settings,
  Activity,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Loader2,
  Building2,
  Blocks,
  BarChart3,
  RefreshCw,
  Store,
  Edit2,
  Save,
  X,
  Plus,
  Eye,
  EyeOff,
  Trash2,
  Download,
  Search,
  Filter,
  GripVertical,
  ChevronDown,
  MoreHorizontal,
  Copy,
  ExternalLink,
  Zap,
  Package,
  Mail,
  Box,
} from "lucide-react"
import { usePlatformAdmin, useSystemFeatures, useSystemFeatureMutations, useBundleCategories, useBundleCategoryMutations } from "../hooks/usePlatformAdmin"
import { useTableSortAndFilter, ColumnDef } from "../hooks/useTableSortAndFilter"
import { EnhancedTableHeader } from "../components/EnhancedTableHeader"
import { FEATURE_TAGS, type FeatureStatus } from "../types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import BundleMultiSelect, { BundleBadges, type SelectedBundle, type BundleOption } from "../components/BundleMultiSelect"
import BundleCategoriesTable from "../components/BundleCategoriesTable"
import { PlatformUsersTable } from "../components/PlatformUsersTable"
import { PlatformInvitationsTable } from "../components/PlatformInvitationsTable"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Checkbox } from "@/components/ui/checkbox"
import { IconPicker, getIconComponent } from "@/frontend/shared/ui/icons"
import { WorkspaceStorePage } from "@/frontend/features/workspace-store"
import { ConvexErrorBoundary } from "@/frontend/shared/ui/components/error/ConvexErrorBoundary"

// Feature categories available
const FEATURE_CATEGORIES = [
  "productivity",
  "communication",
  "analytics",
  "integration",
  "management",
  "development",
  "ai",
  "media",
  "commerce",
  "system",
] as const

// Feature statuses
const FEATURE_STATUSES = [
  { value: "stable", label: "Stable", color: "bg-green-500/10 text-green-500 border-green-500/20" },
  { value: "beta", label: "Beta", color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
  { value: "development", label: "Development", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  { value: "experimental", label: "Experimental", color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  { value: "deprecated", label: "Deprecated", color: "bg-gray-500/10 text-gray-500 border-gray-500/20" },
] as const

// Feature types
const FEATURE_TYPES = [
  { value: "default", label: "Default" },
  { value: "optional", label: "Optional" },
  { value: "system", label: "System" },
  { value: "premium", label: "Premium" },
] as const

// Icons are loaded from IconPicker component

function StatusBadge({ status }: { status: FeatureStatus }) {
  const statusConfig: Record<FeatureStatus, { icon: React.ElementType; class: string }> = {
    stable: { icon: CheckCircle2, class: "bg-green-500/10 text-green-500 border-green-500/20" },
    beta: { icon: AlertTriangle, class: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
    development: { icon: Settings, class: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
    experimental: { icon: Zap, class: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
    deprecated: { icon: XCircle, class: "bg-gray-500/10 text-gray-500 border-gray-500/20" },
    disabled: { icon: XCircle, class: "bg-red-500/10 text-red-500 border-red-500/20" },
  }

  const config = statusConfig[status] || statusConfig.stable
  const Icon = config.icon

  return (
    <Badge variant="outline" className={cn("gap-1", config.class)}>
      <Icon className="h-3 w-3" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  )
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
}: {
  title: string
  value: string | number
  description: string
  icon: React.ElementType
  trend?: { value: number; positive: boolean }
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
        {trend && (
          <p className={cn(
            "text-xs mt-1",
            trend.positive ? "text-green-500" : "text-red-500"
          )}>
            {trend.positive ? "+" : ""}{trend.value}% from last month
          </p>
        )}
      </CardContent>
    </Card>
  )
}

function LoadingState() {
  return (
    <div className="flex flex-col h-full p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-8" />
        <Skeleton className="h-8 w-48" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-32 mt-2" />
            </CardContent>
          </Card>
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
        <p className="text-center text-sm text-muted-foreground">
          If you believe you should have access, ask a platform admin to grant permissions.
        </p>
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
      <div className="flex gap-2">
        <Button variant="outline" size="sm" onClick={onRetry}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    </div>
  )
}

function FeaturesTable({
  features,
  onStatusChange
}: {
  features: any[]
  onStatusChange: (id: any, status: FeatureStatus) => void
}) {
  if (features.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Blocks className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No custom features created yet.</p>
        <p className="text-sm">Features created via Builder will appear here.</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Feature</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Created</TableHead>
          <TableHead>Public</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {features.map((feature) => (
          <TableRow key={feature._id}>
            <TableCell>
              <div className="flex flex-col">
                <span className="font-medium">{feature.name}</span>
                <span className="text-xs text-muted-foreground">{feature.featureId}</span>
              </div>
            </TableCell>
            <TableCell>
              <StatusBadge status={feature.status} />
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {new Date(feature.createdAt).toLocaleDateString()}
            </TableCell>
            <TableCell>
              <Badge variant={feature.isPublic ? "default" : "secondary"}>
                {feature.isPublic ? "Public" : "Private"}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <Select
                defaultValue={feature.status}
                onValueChange={(value) => onStatusChange(feature._id, value as FeatureStatus)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="development">Development</SelectItem>
                  <SelectItem value="beta">Beta</SelectItem>
                  <SelectItem value="stable">Stable</SelectItem>
                  <SelectItem value="deprecated">Deprecated</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

function WorkspacesTable({ workspaces }: { workspaces: any[] }) {
  if (workspaces.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No workspaces found.</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Workspace</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {workspaces.map((workspace) => (
          <TableRow key={workspace._id}>
            <TableCell>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{workspace.name}</span>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="outline">
                {workspace.type || "workspace"}
              </Badge>
            </TableCell>
            <TableCell className="text-sm text-muted-foreground">
              {new Date(workspace.createdAt).toLocaleDateString()}
            </TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="sm">
                Manage Access
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

/**
 * System Features Table Component
 * For managing Menu Store features dynamically with full CRUD
 */
function SystemFeaturesTable() {
  const { features, isLoading } = useSystemFeatures()
  const { updateFeature, setVisibility, deleteFeature, seedFeatures, createFeature } = useSystemFeatureMutations()
  const { bundles: bundleCategories, isLoading: isBundlesLoading } = useBundleCategories()
  const { setFeatureBundles, createBundle } = useBundleCategoryMutations()

  // Define columns for sorting and filtering
  const columns: ColumnDef<any>[] = [
    {
      key: "name",
      label: "Feature",
      sortable: true,
      filterable: true,
    },
    {
      key: "featureId",
      label: "Feature ID",
      sortable: true,
      filterable: true,
    },
    {
      key: "version",
      label: "Version",
      sortable: true,
      filterable: false,
    },
    {
      key: "category",
      label: "Category",
      sortable: true,
      filterable: true,
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      filterable: true,
    },
    {
      key: "featureType",
      label: "Type",
      sortable: true,
      filterable: true,
    },
  ]

  // Use the sorting and filtering hook
  const {
    searchQuery,
    filters,
    sortConfig,
    setSearchQuery,
    handleSort,
    handleFilter,
    clearFilters,
    hasActiveFilters,
    processedData: filteredFeatures,
  } = useTableSortAndFilter({
    data: features,
    columns,
    initialFilters: { category: null, status: null },
  })

  // State for editing
  const [editingFeature, setEditingFeature] = useState<any | null>(null)
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isSeeding, setIsSeeding] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set()) // Track individual loading states

  // Bundle selection state for editing
  const [selectedBundles, setSelectedBundles] = useState<SelectedBundle[]>([])

  // Convert bundle categories to options format
  const bundleOptions: BundleOption[] = useMemo(() => {
    return bundleCategories.map((b: any) => ({
      bundleId: b.bundleId,
      name: b.name,
      description: b.description,
      icon: b.icon,
      primaryColor: b.primaryColor,
      category: b.category,
    }))
  }, [bundleCategories])

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

  // New feature form
  const [newFeature, setNewFeature] = useState({
    featureId: "",
    name: "",
    description: "",
    version: "1.0.0",
    category: "productivity",
    status: "development",
    featureType: "optional",
    icon: "Box",
    tags: [] as string[],
    isReady: false,
    expectedRelease: "",
    isPublic: true,
  })

  // Get unique categories from features
  const categories = useMemo(() => {
    const cats = new Set(features.map((f: any) => f.category))
    return Array.from(cats).filter(Boolean)
  }, [features])

  const handleOpenEdit = (feature: any) => {
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
    // Reset bundle selection (will be loaded from the edit sheet)
    setSelectedBundles([])
    setIsEditSheetOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editingFeature) return
    setIsSaving(true)
    try {
      // Update feature details
      await updateFeature(editingFeature._id, {
        ...editForm,
        status: editForm.status as FeatureStatus,
      })

      // Update bundle memberships
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
  }

  const handleCreateFeature = async () => {
    if (!newFeature.featureId || !newFeature.name) {
      toast.error("Feature ID and Name are required")
      return
    }
    setIsSaving(true)
    try {
      await createFeature({
        ...newFeature,
        tags: newFeature.tags,
        status: newFeature.status as FeatureStatus,
      })
      toast.success("Feature created successfully")
      setIsCreateDialogOpen(false)
      setNewFeature({
        featureId: "",
        name: "",
        description: "",
        version: "1.0.0",
        category: "productivity",
        status: "development",
        featureType: "optional",
        icon: "Box",
        tags: [],
        isReady: false,
        expectedRelease: "",
        isPublic: true,
      })
    } catch (error: any) {
      toast.error(error.message || "Failed to create feature")
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleVisibilityToggle = async (feature: any) => {
    const featureId = feature._id
    setTogglingIds(prev => new Set(prev).add(featureId))
    try {
      await setVisibility(feature._id, !feature.isPublic, feature.isEnabled)
      toast.success(
        !feature.isPublic
          ? `"${feature.name}" now visible in Menu Store`
          : `"${feature.name}" hidden from Menu Store`
      )
    } catch (error: any) {
      toast.error(error?.message || "Failed to update Menu Store visibility")
      console.error("Visibility toggle error:", error)
    } finally {
      setTogglingIds(prev => {
        const next = new Set(prev)
        next.delete(featureId)
        return next
      })
    }
  }

  const handleEnabledToggle = async (feature: any) => {
    const featureId = feature._id
    setTogglingIds(prev => new Set(prev).add(featureId))
    try {
      await setVisibility(feature._id, feature.isPublic, !feature.isEnabled)
      toast.success(
        !feature.isEnabled
          ? `"${feature.name}" is now enabled`
          : `"${feature.name}" is now disabled`
      )
    } catch (error: any) {
      toast.error(error?.message || "Failed to update feature status")
      console.error("Enabled toggle error:", error)
    } finally {
      setTogglingIds(prev => {
        const next = new Set(prev)
        next.delete(featureId)
        return next
      })
    }
  }

  const handleDelete = async (featureId: any) => {
    if (!confirm("Are you sure you want to delete this feature?")) return
    try {
      await deleteFeature(featureId)
      toast.success("Feature deleted")
    } catch (error) {
      toast.error("Failed to delete feature")
    }
  }

  const handleBulkEnable = async () => {
    for (const id of selectedIds) {
      const feature = features.find((f: any) => f._id === id)
      if (feature && !feature.isEnabled) {
        await setVisibility(id as any, feature.isPublic, true)
      }
    }
    toast.success(`Enabled ${selectedIds.size} features`)
    setSelectedIds(new Set())
  }

  const handleBulkDisable = async () => {
    for (const id of selectedIds) {
      const feature = features.find((f: any) => f._id === id)
      if (feature && feature.isEnabled) {
        await setVisibility(id as any, feature.isPublic, false)
      }
    }
    toast.success(`Disabled ${selectedIds.size} features`)
    setSelectedIds(new Set())
  }

  const handleSeedFeatures = async () => {
    setIsSeeding(true)
    try {
      const result = await seedFeatures()
      toast.success(`Seeded ${result.created} features, ${result.skipped} skipped`)
    } catch (error) {
      toast.error("Failed to seed features")
    } finally {
      setIsSeeding(false)
    }
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredFeatures.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredFeatures.map((f: any) => f._id)))
    }
  }

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    )
  }

  if (features.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Store className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No system features configured yet.</p>
        <p className="text-sm mb-4">Seed features from the catalog to populate Menu Store.</p>
        <Button onClick={handleSeedFeatures} disabled={isSeeding}>
          {isSeeding ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Seeding...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Seed from Catalog
            </>
          )}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search features..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>

        {/* Category Filter */}
        <Select
          value={filters.category || "all"}
          onValueChange={(v) => handleFilter("category", v === "all" ? null : v)}
        >
          <SelectTrigger className="w-[150px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select
          value={filters.status || "all"}
          onValueChange={(v) => handleFilter("status", v === "all" ? null : v)}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {FEATURE_STATUSES.map((s) => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="ghost" size="icon" onClick={clearFilters}>
            <X className="h-4 w-4" />
          </Button>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 ml-auto">
          {selectedIds.size > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Bulk Actions ({selectedIds.size})
                  <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={handleBulkEnable}>
                  <Eye className="h-4 w-4 mr-2" />
                  Enable Selected
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleBulkDisable}>
                  <EyeOff className="h-4 w-4 mr-2" />
                  Disable Selected
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleSeedFeatures}
            disabled={isSeeding}
          >
            {isSeeding ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Sync
          </Button>

          <Button size="sm" onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Feature
          </Button>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredFeatures.length} of {features.length} features
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={selectedIds.size === filteredFeatures.length && filteredFeatures.length > 0}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <EnhancedTableHeader
                sortable={true}
                sortDirection={sortConfig.key === "name" ? sortConfig.direction : null}
                isActive={sortConfig.key === "name"}
                onSort={() => handleSort("name")}
              >
                Feature
              </EnhancedTableHeader>
              <EnhancedTableHeader
                sortable={true}
                sortDirection={sortConfig.key === "version" ? sortConfig.direction : null}
                isActive={sortConfig.key === "version"}
                onSort={() => handleSort("version")}
                className="w-[100px]"
              >
                Version
              </EnhancedTableHeader>
              <EnhancedTableHeader
                sortable={true}
                sortDirection={sortConfig.key === "category" ? sortConfig.direction : null}
                isActive={sortConfig.key === "category"}
                onSort={() => handleSort("category")}
                className="w-[120px]"
              >
                Category
              </EnhancedTableHeader>
              <EnhancedTableHeader
                sortable={true}
                sortDirection={sortConfig.key === "status" ? sortConfig.direction : null}
                isActive={sortConfig.key === "status"}
                onSort={() => handleSort("status")}
                className="w-[120px]"
              >
                Status
              </EnhancedTableHeader>
              <EnhancedTableHeader
                sortable={true}
                sortDirection={sortConfig.key === "featureType" ? sortConfig.direction : null}
                isActive={sortConfig.key === "featureType"}
                onSort={() => handleSort("featureType")}
                className="w-[100px]"
              >
                Type
              </EnhancedTableHeader>
              <TableHead className="w-[100px] text-center">
                <div className="flex items-center justify-center gap-1">
                  <Store className="h-3.5 w-3.5" />
                  <span>Menu Store</span>
                </div>
              </TableHead>
              <TableHead className="w-[70px] text-center">Enabled</TableHead>
              <TableHead className="w-[80px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredFeatures.map((feature: any) => (
              <TableRow
                key={feature._id}
                className={cn(
                  !feature.isEnabled && "opacity-50",
                  selectedIds.has(feature._id) && "bg-muted/50"
                )}
              >
                <TableCell>
                  <Checkbox
                    checked={selectedIds.has(feature._id)}
                    onCheckedChange={() => toggleSelect(feature._id)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{feature.name}</span>
                      {!feature.isReady && (
                        <Badge variant="outline" className="text-xs bg-orange-500/10 text-orange-500 border-orange-500/20">
                          Coming Soon
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground font-mono">{feature.featureId}</span>
                    {feature.description && (
                      <span className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{feature.description}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="font-mono">{feature.version}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="capitalize">{feature.category}</Badge>
                </TableCell>
                <TableCell>
                  <StatusBadge status={feature.status as FeatureStatus} />
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">{feature.featureType}</Badge>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center">
                    {togglingIds.has(feature._id) ? (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    ) : (
                      <Switch
                        checked={feature.isPublic}
                        onCheckedChange={() => handleVisibilityToggle(feature)}
                        disabled={togglingIds.has(feature._id)}
                      />
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center">
                    {togglingIds.has(feature._id) ? (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    ) : (
                      <Switch
                        checked={feature.isEnabled}
                        onCheckedChange={() => handleEnabledToggle(feature)}
                        disabled={togglingIds.has(feature._id)}
                      />
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleOpenEdit(feature)}>
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit Feature
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => {
                        navigator.clipboard.writeText(feature.featureId)
                        toast.success("Feature ID copied")
                      }}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy ID
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDelete(feature._id)}
                        className="text-red-500"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
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
                isLoading={isBundlesLoading}
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

      {/* Create Feature Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 gap-0">
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle className="text-xl">Create New Feature</DialogTitle>
            <DialogDescription>
              Add a new feature to the Menu Store
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 py-4 space-y-5 max-h-[60vh] overflow-y-auto">
            {/* Feature ID */}
            <div className="space-y-2">
              <Label htmlFor="new-featureId" className="text-sm font-medium">
                Feature ID <span className="text-red-500">*</span>
              </Label>
              <Input
                id="new-featureId"
                value={newFeature.featureId}
                onChange={(e) => setNewFeature({ ...newFeature, featureId: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                placeholder="my-feature"
                className="font-mono h-10"
              />
              <p className="text-xs text-muted-foreground">Unique identifier, lowercase with hyphens</p>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="new-name" className="text-sm font-medium">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="new-name"
                value={newFeature.name}
                onChange={(e) => setNewFeature({ ...newFeature, name: e.target.value })}
                placeholder="My Feature"
                className="h-10"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="new-description" className="text-sm font-medium">Description</Label>
              <Textarea
                id="new-description"
                value={newFeature.description}
                onChange={(e) => setNewFeature({ ...newFeature, description: e.target.value })}
                placeholder="Brief description of the feature"
                rows={2}
                className="resize-none"
              />
            </div>

            {/* Version & Icon */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Version</Label>
                <Input
                  value={newFeature.version}
                  onChange={(e) => setNewFeature({ ...newFeature, version: e.target.value })}
                  placeholder="1.0.0"
                  className="h-10 font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Icon</Label>
                <IconPicker
                  icon={newFeature.icon}
                  onIconChange={(icon) => setNewFeature({ ...newFeature, icon })}
                  showColor={false}
                  className="w-full"
                  trigger={
                    <Button variant="outline" className="w-full h-10 justify-start gap-2">
                      {(() => {
                        const IconComp = getIconComponent(newFeature.icon)
                        return IconComp ? <IconComp className="h-4 w-4" /> : <Box className="h-4 w-4" />
                      })()}
                      <span>{newFeature.icon}</span>
                    </Button>
                  }
                />
              </div>
            </div>

            {/* Category & Status */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Category</Label>
                <Select value={newFeature.category} onValueChange={(v) => setNewFeature({ ...newFeature, category: v })}>
                  <SelectTrigger className="h-10">
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
                <Label className="text-sm font-medium">Status</Label>
                <Select value={newFeature.status} onValueChange={(v) => setNewFeature({ ...newFeature, status: v })}>
                  <SelectTrigger className="h-10">
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
          </div>

          <DialogFooter className="px-6 py-4 border-t">
            <div className="flex w-full gap-3">
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleCreateFeature} disabled={isSaving} className="flex-1">
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Feature
                  </>
                )}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/**
 * Platform Admin Page Component
 * 
 * Super Admin dashboard for managing:
 * - Custom features created via Builder
 * - Feature access and permissions
 * - All workspaces
 * - System configuration
 */
function PlatformAdminContent() {
  const {
    isLoading,
    isPlatformAdmin,
    email,
    name,
    features,
    workspaces,
    isLoadingFeatures,
    isLoadingWorkspaces,
    updateFeatureStatus,
  } = usePlatformAdmin()

  if (isLoading) {
    return <LoadingState />
  }

  if (!isPlatformAdmin) {
    return <AccessDenied />
  }

  const handleStatusChange = async (featureId: any, status: FeatureStatus) => {
    try {
      await updateFeatureStatus(featureId, status)
    } catch (error) {
      console.error("Failed to update feature status:", error)
    }
  }

  return (
    <div className="flex flex-col h-full p-6 space-y-6 overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-gradient-to-br from-red-500 to-orange-500 p-2">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Platform Admin</h1>
            <p className="text-sm text-muted-foreground">
              Logged in as <span className="font-medium">{email}</span>
            </p>
          </div>
        </div>
        <Badge variant="outline" className={cn("gap-1", FEATURE_TAGS.admin.color)}>
          <Shield className="h-3 w-3" />
          Super Admin
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Workspaces"
          value={workspaces.length}
          description="Active workspaces in platform"
          icon={Building2}
        />
        <StatCard
          title="Custom Features"
          value={features.length}
          description="Created via Builder"
          icon={Blocks}
        />
        <StatCard
          title="Active Users"
          value="--"
          description="Across all workspaces"
          icon={Users}
        />
        <StatCard
          title="System Health"
          value="100%"
          description="All services operational"
          icon={Activity}
        />
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="system-features" className="flex-1">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="system-features" className="gap-2 whitespace-nowrap">
            <Store className="h-4 w-4" />
            Menu Store
          </TabsTrigger>
          <TabsTrigger value="bundle-categories" className="gap-2 whitespace-nowrap">
            <Package className="h-4 w-4" />
            Bundles
          </TabsTrigger>
          <TabsTrigger value="workspace-hierarchy" className="gap-2 whitespace-nowrap">
            <Building2 className="h-4 w-4" />
            Hierarchy
          </TabsTrigger>
          <TabsTrigger value="features" className="gap-2 whitespace-nowrap">
            <Blocks className="h-4 w-4" />
            Custom
          </TabsTrigger>
          <TabsTrigger value="workspaces" className="gap-2 whitespace-nowrap">
            <Building2 className="h-4 w-4" />
            Workspaces
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2 whitespace-nowrap">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="invitations" className="gap-2 whitespace-nowrap">
            <Mail className="h-4 w-4" />
            Invitations
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2 whitespace-nowrap">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2 whitespace-nowrap">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="system-features" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Menu Store Features</CardTitle>
                  <CardDescription>
                    Manage system features that appear in Menu Store.
                    Edit names, versions, and control visibility dynamically.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <SystemFeaturesTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bundle-categories" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Bundle Categories</CardTitle>
                  <CardDescription>
                    Configure workspace bundle templates with custom names, icons, and colors.
                    Features can be assigned to multiple bundles with different roles.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <BundleCategoriesTable />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workspace-hierarchy" className="mt-4 -mx-6 -mb-6">
          <WorkspaceStorePage />
        </TabsContent>

        <TabsContent value="features" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Custom Features</CardTitle>
                  <CardDescription>
                    Manage features created by users via Builder
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingFeatures ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <FeaturesTable
                  features={features}
                  onStatusChange={handleStatusChange}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workspaces" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>All Workspaces</CardTitle>
                  <CardDescription>
                    View and manage all platform workspaces
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingWorkspaces ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <WorkspacesTable workspaces={workspaces} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="mt-4">
          <PlatformUsersTable />
        </TabsContent>

        <TabsContent value="invitations" className="mt-4">
          <PlatformInvitationsTable />
        </TabsContent>

        <TabsContent value="analytics" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Platform Analytics</CardTitle>
              <CardDescription>
                Usage statistics and performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent className="h-64 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Analytics dashboard coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>
                Configure platform-wide settings
              </CardDescription>
            </CardHeader>
            <CardContent className="h-64 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Settings panel coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
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
