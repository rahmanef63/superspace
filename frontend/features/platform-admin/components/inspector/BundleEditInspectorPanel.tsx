"use client"

import React, { useEffect, useMemo, useState } from "react"
import { Loader2, Save, X } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { ColorPickerSimple } from "@/components/ui/shadcn-io/color-picker/ColorPickerSimple"
import { IconPicker, getIconComponent } from "@/frontend/shared/ui/components/icons"

import type { Id } from "@/convex/_generated/dataModel"
import { useBundleCategoryMutations } from "../../hooks/usePlatformAdmin"
import type { BundleCategoryDataForEdit } from "../BundleEditSheet"

const BUNDLE_CATEGORIES = [
  { value: "productivity", label: "Productivity" },
  { value: "business", label: "Business" },
  { value: "personal", label: "Personal" },
  { value: "creative", label: "Creative" },
  { value: "education", label: "Education" },
  { value: "community", label: "Community" },
] as const

const WORKSPACE_TYPES = [
  { value: "personal", label: "Personal" },
  { value: "family", label: "Family" },
  { value: "group", label: "Group" },
  { value: "organization", label: "Organization" },
  { value: "institution", label: "Institution" },
] as const

type BundleCategory = (typeof BUNDLE_CATEGORIES)[number]["value"]
type WorkspaceType = (typeof WORKSPACE_TYPES)[number]["value"]

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

export interface BundleEditInspectorPanelProps {
  bundle: BundleCategoryDataForEdit
  onClose: () => void
  onSaved?: () => void
}

export function BundleEditInspectorPanel({ bundle, onClose, onSaved }: BundleEditInspectorPanelProps) {
  const { updateBundle } = useBundleCategoryMutations()
  const [isSaving, setIsSaving] = useState(false)
  const [form, setForm] = useState<BundleFormState>(defaultFormState)

  const categoryValue = useMemo(() => {
    const raw = (bundle.category as string | undefined) ?? "productivity"
    const allowed = new Set<BundleCategory>(BUNDLE_CATEGORIES.map((c) => c.value))
    const candidate = raw as BundleCategory
    return allowed.has(candidate) ? candidate : "productivity"
  }, [bundle.category])

  useEffect(() => {
    setForm({
      bundleId: bundle.bundleId ?? "",
      name: bundle.name ?? "",
      description: bundle.description ?? "",
      icon: bundle.icon ?? "Package",
      category: categoryValue,
      primaryColor: bundle.primaryColor ?? "#6366f1",
      accentColor: bundle.accentColor ?? "",
      recommendedFor: (bundle.recommendedFor as WorkspaceType[] | undefined) ?? ["personal"],
      tags: bundle.tags ?? [],
      isEnabled: bundle.isEnabled ?? true,
      isPublic: bundle.isPublic ?? true,
    })
  }, [bundle, categoryValue])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updateBundle(bundle._id as Id<"bundleCategories">, {
        name: form.name,
        description: form.description,
        icon: form.icon,
        category: form.category,
        primaryColor: form.primaryColor || undefined,
        accentColor: form.accentColor || undefined,
        recommendedFor: form.recommendedFor,
        tags: form.tags,
        isEnabled: form.isEnabled,
        isPublic: form.isPublic,
      })
      toast.success("Bundle category updated successfully")
      onSaved?.()
      onClose()
    } catch (err: any) {
      toast.error(err?.message || "Failed to update bundle category")
      // eslint-disable-next-line no-console
      console.error(err)
    } finally {
      setIsSaving(false)
    }
  }

  const IconComp = getIconComponent(form.icon)

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 px-4 py-3 border-b bg-muted/30">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold truncate">Edit Bundle Category</h3>
            <p className="text-xs text-muted-foreground font-mono truncate">{form.bundleId}</p>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 min-h-0">
        <div className="p-4 space-y-6">
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Bundle ID</Label>
            <Input value={form.bundleId} disabled className="font-mono bg-muted/50" />
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Name</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              className="resize-none"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Appearance</Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-sm">Icon</Label>
                <IconPicker
                  icon={form.icon}
                  color={form.primaryColor}
                  onIconChange={(icon) => setForm({ ...form, icon })}
                  onColorChange={(color) => setForm({ ...form, primaryColor: color })}
                  showColor={false}
                  className="w-full"
                  trigger={
                    <Button variant="outline" className="w-full justify-start gap-2">
                      {IconComp ? <IconComp className="h-4 w-4" style={{ color: form.primaryColor }} /> : null}
                      <span className="truncate">{form.icon}</span>
                    </Button>
                  }
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as BundleCategory })}>
                  <SelectTrigger>
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

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-sm">Primary Color</Label>
                <ColorPickerSimple value={form.primaryColor} onChange={(c) => setForm({ ...form, primaryColor: c })} />
              </div>
              <div className="space-y-2">
                <Label className="text-sm">Accent Color</Label>
                <ColorPickerSimple value={form.accentColor} onChange={(c) => setForm({ ...form, accentColor: c })} />
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Recommended For</Label>
            <div className="flex flex-wrap gap-2">
              {WORKSPACE_TYPES.map((t) => {
                const isSelected = form.recommendedFor.includes(t.value)
                return (
                  <Badge
                    key={t.value}
                    variant={isSelected ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() =>
                      setForm({
                        ...form,
                        recommendedFor: isSelected
                          ? form.recommendedFor.filter((x) => x !== t.value)
                          : [...form.recommendedFor, t.value],
                      })
                    }
                  >
                    {t.label}
                  </Badge>
                )
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Tags</Label>
            <Input
              value={form.tags.join(", ")}
              onChange={(e) =>
                setForm({
                  ...form,
                  tags: e.target.value
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean),
                })
              }
              placeholder="tag1, tag2"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Visibility</Label>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Public</Label>
                <p className="text-xs text-muted-foreground">Show in workspace template selection</p>
              </div>
              <Switch checked={form.isPublic} onCheckedChange={(v) => setForm({ ...form, isPublic: v })} />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Enabled</Label>
                <p className="text-xs text-muted-foreground">Bundle can be used for workspaces</p>
              </div>
              <Switch checked={form.isEnabled} onCheckedChange={(v) => setForm({ ...form, isEnabled: v })} />
            </div>
          </div>
        </div>
      </ScrollArea>

      <div className="flex-shrink-0 p-4 border-t bg-background">
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={handleSave} disabled={isSaving || !form.name.trim()}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
