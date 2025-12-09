/**
 * Bundle Categories Configuration Tab
 * 
 * A tab panel for managing bundle categories in the Platform Admin.
 * Allows creating, editing, and deleting bundle categories with
 * full metadata configuration (name, icon, colors, etc.)
 */

"use client"

import React, { useState, useMemo } from "react"
import {
  Plus,
  Edit2,
  Trash2,
  Save,
  X,
  Loader2,
  Search,
  Filter,
  Download,
  MoreHorizontal,
  Package,
  Palette,
  Tags,
  Eye,
  EyeOff,
  GripVertical,
  ChevronDown,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Skeleton } from "@/components/ui/skeleton"
import { Checkbox } from "@/components/ui/checkbox"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { toast } from "sonner"
import { useBundleCategories, useBundleCategoryMutations } from "../hooks/usePlatformAdmin"
import { useTableSortAndFilter, ColumnDef } from "../hooks/useTableSortAndFilter"
import { EnhancedTableHeader } from "./EnhancedTableHeader"
import type { Id } from "@/convex/_generated/dataModel"
import { ColorPickerSimple } from "@/components/ui/shadcn-io/color-picker/ColorPickerSimple"
import { IconPicker, getIconComponent } from "@/frontend/shared/ui/components/icons"

// Bundle category types
const BUNDLE_CATEGORIES = [
  { value: "productivity", label: "Productivity", color: "bg-blue-500" },
  { value: "business", label: "Business", color: "bg-green-500" },
  { value: "personal", label: "Personal", color: "bg-purple-500" },
  { value: "creative", label: "Creative", color: "bg-pink-500" },
  { value: "education", label: "Education", color: "bg-yellow-500" },
  { value: "community", label: "Community", color: "bg-teal-500" },
] as const

// Workspace types
const WORKSPACE_TYPES = [
  { value: "personal", label: "Personal" },
  { value: "family", label: "Family" },
  { value: "group", label: "Group" },
  { value: "organization", label: "Organization" },
  { value: "institution", label: "Institution" },
] as const

// Icons are now loaded from IconPicker component

type BundleCategory = "productivity" | "business" | "personal" | "creative" | "education" | "community"
type WorkspaceType = "personal" | "family" | "group" | "organization" | "institution"

interface BundleCategoryData {
  _id: Id<"bundleCategories">
  bundleId: string
  name: string
  description: string
  icon: string
  category: BundleCategory
  primaryColor?: string
  accentColor?: string
  recommendedFor: WorkspaceType[]
  tags: string[]
  isEnabled: boolean
  isPublic: boolean
  order: number
  isSystem?: boolean
  createdAt: number
  updatedAt?: number
}

interface BundleFormState {
  bundleId: string
  name: string
  description: string
  icon: string
  category: BundleCategory
  primaryColor: string
  accentColor: string
  recommendedFor: WorkspaceType[]
  tags: string[]
  isEnabled: boolean
  isPublic: boolean
}

const defaultFormState: BundleFormState = {
  bundleId: "",
  name: "",
  description: "",
  icon: "Package",
  category: "productivity",
  primaryColor: "#6366f1",
  accentColor: "",
  recommendedFor: ["personal"],
  tags: [],
  isEnabled: true,
  isPublic: true,
}

export function BundleCategoriesTable() {
  const { bundles, isLoading } = useBundleCategories()
  const {
    createBundle,
    updateBundle,
    removeBundle,
    seedBundles
  } = useBundleCategoryMutations()

  // Define columns for sorting and filtering
  const columns: ColumnDef<BundleCategoryData>[] = [
    {
      key: "name",
      label: "Bundle",
      sortable: true,
      filterable: true,
    },
    {
      key: "bundleId",
      label: "Bundle ID",
      sortable: true,
      filterable: true,
    },
    {
      key: "category",
      label: "Category",
      sortable: true,
      filterable: true,
    },
    {
      key: "createdAt",
      label: "Created",
      sortable: true,
      sortFn: (a, b) => a.createdAt - b.createdAt,
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
    processedData: filteredBundles,
  } = useTableSortAndFilter({
    data: bundles,
    columns,
    initialFilters: { category: "all" },
  })

  // State
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [editingBundle, setEditingBundle] = useState<BundleCategoryData | null>(null)
  const [isEditSheetOpen, setIsEditSheetOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isSeeding, setIsSeeding] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Form state
  const [editForm, setEditForm] = useState<BundleFormState>(defaultFormState)
  const [newBundle, setNewBundle] = useState<BundleFormState>(defaultFormState)

  // Handlers
  const handleOpenEdit = (bundle: BundleCategoryData) => {
    setEditingBundle(bundle)
    setEditForm({
      bundleId: bundle.bundleId,
      name: bundle.name,
      description: bundle.description,
      icon: bundle.icon,
      category: bundle.category,
      primaryColor: bundle.primaryColor || "#6366f1",
      accentColor: bundle.accentColor || "",
      recommendedFor: bundle.recommendedFor,
      tags: bundle.tags,
      isEnabled: bundle.isEnabled,
      isPublic: bundle.isPublic,
    })
    setIsEditSheetOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editingBundle) return
    setIsSaving(true)
    try {
      await updateBundle(editingBundle._id, {
        name: editForm.name,
        description: editForm.description,
        icon: editForm.icon,
        category: editForm.category,
        primaryColor: editForm.primaryColor || undefined,
        accentColor: editForm.accentColor || undefined,
        recommendedFor: editForm.recommendedFor,
        tags: editForm.tags,
        isEnabled: editForm.isEnabled,
        isPublic: editForm.isPublic,
      })
      toast.success("Bundle category updated successfully")
      setIsEditSheetOpen(false)
      setEditingBundle(null)
    } catch (error) {
      toast.error("Failed to update bundle category")
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCreateBundle = async () => {
    if (!newBundle.bundleId || !newBundle.name) {
      toast.error("Bundle ID and Name are required")
      return
    }
    setIsSaving(true)
    try {
      await createBundle({
        bundleId: newBundle.bundleId,
        name: newBundle.name,
        description: newBundle.description,
        icon: newBundle.icon,
        category: newBundle.category,
        primaryColor: newBundle.primaryColor || undefined,
        accentColor: newBundle.accentColor || undefined,
        recommendedFor: newBundle.recommendedFor,
        tags: newBundle.tags,
        isEnabled: newBundle.isEnabled,
        isPublic: newBundle.isPublic,
      })
      toast.success("Bundle category created successfully")
      setIsCreateDialogOpen(false)
      setNewBundle(defaultFormState)
    } catch (error: any) {
      toast.error(error.message || "Failed to create bundle category")
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (bundle: BundleCategoryData) => {
    if (bundle.isSystem) {
      toast.error("Cannot delete system bundle categories")
      return
    }
    if (!confirm(`Are you sure you want to delete "${bundle.name}"?`)) return
    try {
      await removeBundle(bundle._id)
      toast.success("Bundle category deleted")
    } catch (error) {
      toast.error("Failed to delete bundle category")
    }
  }

  const handleSeedBundles = async () => {
    setIsSeeding(true)
    try {
      const result = await seedBundles()
      toast.success(`Seeded ${result.created} bundles, ${result.skipped} skipped`)
    } catch (error) {
      toast.error("Failed to seed bundle categories")
    } finally {
      setIsSeeding(false)
    }
  }

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredBundles.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(filteredBundles.map((b: BundleCategoryData) => b._id)))
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

  if (bundles.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No bundle categories configured yet.</p>
        <p className="text-sm mb-4">
          Seed the default bundle categories to get started.
        </p>
        <Button onClick={handleSeedBundles} disabled={isSeeding}>
          {isSeeding ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Seeding...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Seed Default Bundles
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
            placeholder="Search bundles..."
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
            {BUNDLE_CATEGORIES.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                {cat.label}
              </SelectItem>
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
          <Button
            variant="outline"
            size="sm"
            onClick={handleSeedBundles}
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
            New Bundle
          </Button>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredBundles.length} of {bundles.length} bundle categories
      </div>

      {/* Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={
                    selectedIds.size === filteredBundles.length &&
                    filteredBundles.length > 0
                  }
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <EnhancedTableHeader
                sortable={true}
                sortDirection={sortConfig.key === "name" ? sortConfig.direction : null}
                isActive={sortConfig.key === "name"}
                onSort={() => handleSort("name")}
              >
                Bundle
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
              <TableHead className="w-[80px]">Color</TableHead>
              <TableHead className="w-[100px]">Workspace Types</TableHead>
              <TableHead className="w-[70px] text-center">Public</TableHead>
              <TableHead className="w-[70px] text-center">Enabled</TableHead>
              <TableHead className="w-[80px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBundles.map((bundle: BundleCategoryData) => (
              <TableRow
                key={bundle._id}
                className={cn(
                  !bundle.isEnabled && "opacity-50",
                  selectedIds.has(bundle._id) && "bg-muted/50"
                )}
              >
                <TableCell>
                  <Checkbox
                    checked={selectedIds.has(bundle._id)}
                    onCheckedChange={() => toggleSelect(bundle._id)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{bundle.name}</span>
                      {bundle.isSystem && (
                        <Badge
                          variant="outline"
                          className="text-xs bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                        >
                          System
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground font-mono">
                      {bundle.bundleId}
                    </span>
                    {bundle.description && (
                      <span className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                        {bundle.description}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="capitalize">
                    {bundle.category}
                  </Badge>
                </TableCell>
                <TableCell>
                  {bundle.primaryColor && (
                    <div
                      className="w-6 h-6 rounded-full border"
                      style={{ backgroundColor: bundle.primaryColor }}
                      title={bundle.primaryColor}
                    />
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {bundle.recommendedFor.slice(0, 2).map((type) => (
                      <Badge key={type} variant="outline" className="text-xs">
                        {type}
                      </Badge>
                    ))}
                    {bundle.recommendedFor.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{bundle.recommendedFor.length - 2}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Switch checked={bundle.isPublic} disabled />
                </TableCell>
                <TableCell className="text-center">
                  <Switch checked={bundle.isEnabled} disabled />
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleOpenEdit(bundle)}>
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit Bundle
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => handleDelete(bundle)}
                        className="text-red-500"
                        disabled={bundle.isSystem}
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

      {/* Edit Bundle Sheet */}
      <Sheet open={isEditSheetOpen} onOpenChange={setIsEditSheetOpen}>
        <SheetContent className="w-full sm:max-w-[520px] p-0 gap-0 [&>button]:top-5 [&>button]:right-5">
          <SheetHeader className="px-6 pt-6 pb-4 border-b flex-shrink-0">
            <SheetTitle className="text-xl">Edit Bundle Category</SheetTitle>
            <SheetDescription>
              Configure bundle category metadata and styling
            </SheetDescription>
          </SheetHeader>

          <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6 space-y-6">
            {/* Bundle ID - Read Only */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Bundle ID</Label>
              <Input
                value={editForm.bundleId}
                disabled
                className="font-mono bg-muted/50 h-10"
              />
            </div>

            {/* Basic Info Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Basic Information
              </h4>

              <div className="space-y-2">
                <Label htmlFor="edit-name" className="text-sm font-medium">
                  Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="edit-name"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  placeholder="Bundle name"
                  className="h-10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description" className="text-sm font-medium">
                  Description
                </Label>
                <Textarea
                  id="edit-description"
                  value={editForm.description}
                  onChange={(e) =>
                    setEditForm({ ...editForm, description: e.target.value })
                  }
                  placeholder="Brief description of the bundle"
                  rows={3}
                  className="resize-none"
                />
              </div>
            </div>

            {/* Appearance Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Appearance
              </h4>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Icon
                  </Label>
                  <IconPicker
                    icon={editForm.icon}
                    color={editForm.primaryColor}
                    onIconChange={(icon) => setEditForm({ ...editForm, icon })}
                    onColorChange={(color) => setEditForm({ ...editForm, primaryColor: color })}
                    showColor={false}
                    className="w-full"
                    trigger={
                      <Button variant="outline" className="w-full h-10 justify-start gap-2">
                        {(() => {
                          const IconComp = getIconComponent(editForm.icon)
                          return <IconComp className="h-4 w-4" style={{ color: editForm.primaryColor }} />
                        })()}
                        <span>{editForm.icon}</span>
                      </Button>
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-category" className="text-sm font-medium">
                    Category
                  </Label>
                  <Select
                    value={editForm.category}
                    onValueChange={(v) =>
                      setEditForm({ ...editForm, category: v as BundleCategory })
                    }
                  >
                    <SelectTrigger id="edit-category" className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {BUNDLE_CATEGORIES.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Primary Color
                  </Label>
                  <ColorPickerSimple
                    value={editForm.primaryColor}
                    onChange={(color) => setEditForm({ ...editForm, primaryColor: color })}
                    placeholder="#6366f1"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Accent Color
                  </Label>
                  <ColorPickerSimple
                    value={editForm.accentColor || ""}
                    onChange={(color) => setEditForm({ ...editForm, accentColor: color })}
                    placeholder="Optional"
                  />
                </div>
              </div>
            </div>

            {/* Recommended For Section */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Recommended For
              </h4>

              <div className="flex flex-wrap gap-2">
                {WORKSPACE_TYPES.map((type) => (
                  <Badge
                    key={type.value}
                    variant={
                      editForm.recommendedFor.includes(type.value)
                        ? "default"
                        : "outline"
                    }
                    className="cursor-pointer"
                    onClick={() => {
                      const isSelected = editForm.recommendedFor.includes(type.value)
                      setEditForm({
                        ...editForm,
                        recommendedFor: isSelected
                          ? editForm.recommendedFor.filter((t) => t !== type.value)
                          : [...editForm.recommendedFor, type.value],
                      })
                    }}
                  >
                    {type.label}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Tags Section */}
            <div className="space-y-2">
              <Label htmlFor="edit-tags" className="text-sm font-medium">
                Tags
              </Label>
              <Input
                id="edit-tags"
                value={editForm.tags.join(", ")}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    tags: e.target.value
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean),
                  })
                }
                placeholder="tag1, tag2, tag3"
                className="h-10"
              />
              <p className="text-xs text-muted-foreground">
                Separate tags with commas
              </p>
            </div>

            {/* Visibility Settings */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Visibility
              </h4>

              <div className="space-y-1 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Public</Label>
                    <p className="text-xs text-muted-foreground">
                      Show in workspace template selection
                    </p>
                  </div>
                  <Switch
                    checked={editForm.isPublic}
                    onCheckedChange={(v) =>
                      setEditForm({ ...editForm, isPublic: v })
                    }
                  />
                </div>
              </div>

              <div className="space-y-1 rounded-lg border p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">Enabled</Label>
                    <p className="text-xs text-muted-foreground">
                      Bundle can be used for workspaces
                    </p>
                  </div>
                  <Switch
                    checked={editForm.isEnabled}
                    onCheckedChange={(v) =>
                      setEditForm({ ...editForm, isEnabled: v })
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          <SheetFooter className="px-6 py-4 border-t flex-shrink-0">
            <div className="flex w-full gap-3">
              <Button
                variant="outline"
                onClick={() => setIsEditSheetOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="flex-1"
              >
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

      {/* Create Bundle Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 gap-0">
          <DialogHeader className="px-6 pt-6 pb-4">
            <DialogTitle className="text-xl">Create Bundle Category</DialogTitle>
            <DialogDescription>
              Add a new bundle category for workspace templates
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 py-4 space-y-5 max-h-[60vh] overflow-y-auto">
            {/* Bundle ID */}
            <div className="space-y-2">
              <Label htmlFor="new-bundleId" className="text-sm font-medium">
                Bundle ID <span className="text-red-500">*</span>
              </Label>
              <Input
                id="new-bundleId"
                value={newBundle.bundleId}
                onChange={(e) =>
                  setNewBundle({
                    ...newBundle,
                    bundleId: e.target.value.toLowerCase().replace(/\s+/g, "-"),
                  })
                }
                placeholder="my-bundle"
                className="font-mono h-10"
              />
              <p className="text-xs text-muted-foreground">
                Unique identifier, lowercase with hyphens
              </p>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="new-name" className="text-sm font-medium">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="new-name"
                value={newBundle.name}
                onChange={(e) =>
                  setNewBundle({ ...newBundle, name: e.target.value })
                }
                placeholder="My Bundle"
                className="h-10"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="new-description" className="text-sm font-medium">
                Description
              </Label>
              <Textarea
                id="new-description"
                value={newBundle.description}
                onChange={(e) =>
                  setNewBundle({ ...newBundle, description: e.target.value })
                }
                placeholder="Brief description"
                rows={2}
                className="resize-none"
              />
            </div>

            {/* Icon & Category */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Icon</Label>
                <IconPicker
                  icon={newBundle.icon}
                  color={newBundle.primaryColor}
                  onIconChange={(icon) => setNewBundle({ ...newBundle, icon })}
                  onColorChange={(color) => setNewBundle({ ...newBundle, primaryColor: color })}
                  showColor={false}
                  className="w-full"
                  trigger={
                    <Button variant="outline" className="w-full h-10 justify-start gap-2">
                      {(() => {
                        const IconComp = getIconComponent(newBundle.icon)
                        return <IconComp className="h-4 w-4" style={{ color: newBundle.primaryColor }} />
                      })()}
                      <span>{newBundle.icon}</span>
                    </Button>
                  }
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Category</Label>
                <Select
                  value={newBundle.category}
                  onValueChange={(v) =>
                    setNewBundle({ ...newBundle, category: v as BundleCategory })
                  }
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BUNDLE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Primary Color */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Primary Color</Label>
              <ColorPickerSimple
                value={newBundle.primaryColor}
                onChange={(color) => setNewBundle({ ...newBundle, primaryColor: color })}
                placeholder="#6366f1"
              />
            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t">
            <div className="flex w-full gap-3">
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateBundle}
                disabled={isSaving}
                className="flex-1"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Bundle
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

export default BundleCategoriesTable
