/**
 * Workspace Inspector Component
 * 
 * Inline-editable inspector panel for workspace details
 * Shows: name, description, type, icon, color, owner, created/updated time
 */

"use client"

import * as React from "react"
import { useQuery } from "convex/react"
import { api } from "@/convex/_generated/api"
import type { Id } from "@/convex/_generated/dataModel"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { 
  User, 
  Calendar, 
  Clock, 
  Pencil, 
  Check, 
  X,
  Building2,
  Home,
  Users,
  Heart,
  Briefcase,
  Info,
  Layers,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { DynamicIcon, IconPicker } from "@/frontend/shared/ui/icons"
import { InlineColorPicker } from "@/frontend/shared/ui/color-picker"
import { WORKSPACE_TYPE_OPTIONS } from "../constants"
import type { WorkspaceStoreItem, WorkspaceType } from "../types"

// ============================================================================
// Types
// ============================================================================

interface WorkspaceInspectorProps {
  workspace: WorkspaceStoreItem | null
  onUpdate?: (workspaceId: string, data: Partial<WorkspaceStoreItem>) => Promise<void>
  onShowFeatures?: () => void
  className?: string
}

interface EditableFieldProps {
  label: string
  value: string
  onSave: (value: string) => Promise<void>
  type?: "text" | "textarea"
  placeholder?: string
}

// ============================================================================
// Type Icon Map
// ============================================================================

const TYPE_ICONS: Record<WorkspaceType, React.ElementType> = {
  personal: Home,
  organization: Building2,
  institution: Building2,
  group: Users,
  family: Heart,
}

// ============================================================================
// Editable Field Component
// ============================================================================

function EditableField({ label, value, onSave, type = "text", placeholder }: EditableFieldProps) {
  const [isEditing, setIsEditing] = React.useState(false)
  const [editValue, setEditValue] = React.useState(value)
  const [isSaving, setIsSaving] = React.useState(false)

  const handleSave = async () => {
    if (editValue === value) {
      setIsEditing(false)
      return
    }
    setIsSaving(true)
    try {
      await onSave(editValue)
      setIsEditing(false)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setEditValue(value)
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && type === "text") {
      e.preventDefault()
      handleSave()
    }
    if (e.key === "Escape") {
      handleCancel()
    }
  }

  // Sync value when props change
  React.useEffect(() => {
    if (!isEditing) {
      setEditValue(value)
    }
  }, [value, isEditing])

  if (isEditing) {
    return (
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">{label}</Label>
        <div className="flex items-start gap-2">
          {type === "textarea" ? (
            <Textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="min-h-[80px] text-sm"
              autoFocus
            />
          ) : (
            <Input
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="text-sm"
              autoFocus
            />
          )}
          <div className="flex flex-col gap-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={handleSave}
              disabled={isSaving}
            >
              <Check className="h-3.5 w-3.5 text-green-500" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7"
              onClick={handleCancel}
              disabled={isSaving}
            >
              <X className="h-3.5 w-3.5 text-red-500" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-1 group">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div 
        className="flex items-start justify-between gap-2 p-2 rounded-md hover:bg-muted/50 cursor-pointer transition-colors"
        onClick={() => setIsEditing(true)}
      >
        <p className={cn("text-sm flex-1", !value && "text-muted-foreground italic")}>
          {value || placeholder || "Click to edit..."}
        </p>
        <Pencil className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
      </div>
    </div>
  )
}

// ============================================================================
// Main Component
// ============================================================================

export function WorkspaceInspector({ 
  workspace, 
  onUpdate,
  onShowFeatures,
  className 
}: WorkspaceInspectorProps) {
  // Query owner user info
  const ownerUser = useQuery(
    api.user.users.getById,
    workspace?.createdBy ? { userId: workspace.createdBy as Id<"users"> } : "skip"
  )

  if (!workspace) {
    return (
      <div className={cn("flex flex-col h-full items-center justify-center p-6 text-center", className)}>
        <Info className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="font-medium text-muted-foreground">No Workspace Selected</h3>
        <p className="text-sm text-muted-foreground/70 mt-1">
          Select a workspace from the left panel to view its details
        </p>
      </div>
    )
  }

  const handleUpdate = async (field: string, value: unknown) => {
    if (onUpdate) {
      await onUpdate(workspace.id, { [field]: value })
    }
  }

  const TypeIcon = TYPE_ICONS[workspace.type] || Briefcase
  const iconName = workspace.icon || "Briefcase"
  const color = workspace.color || "#6366f1"
  
  // Resolve owner display name
  const ownerDisplayName = ownerUser?.name || ownerUser?.email || "Unknown"

  return (
    <ScrollArea className={cn("h-full", className)}>
      <div className="p-4 space-y-6">
        {/* Header - Centered Icon with Name below */}
        <div className="flex flex-col items-center text-center pt-2">
          {/* Editable Icon - Centered & Larger */}
          <Popover>
            <PopoverTrigger asChild>
              <button 
                className="flex h-20 w-20 items-center justify-center rounded-xl text-white shrink-0 hover:opacity-80 transition-opacity shadow-lg"
                style={{ backgroundColor: color }}
              >
                <DynamicIcon name={iconName} className="h-10 w-10" />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-3" align="center">
              <div className="flex flex-col gap-3">
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-2">Icon</div>
                  <IconPicker
                    icon={iconName}
                    onIconChange={(newIcon) => handleUpdate("icon", newIcon)}
                    showColor={false}
                    showBackground={false}
                  />
                </div>
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-2">Color</div>
                  <InlineColorPicker
                    value={color}
                    onChange={(newColor) => handleUpdate("color", newColor)}
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          {/* Name & Type Badge - Below Icon */}
          <h2 className="text-xl font-semibold mt-4">{workspace.name}</h2>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="text-xs" style={{ borderColor: color, color }}>
              <TypeIcon className="h-3 w-3 mr-1" />
              {WORKSPACE_TYPE_OPTIONS.find(o => o.value === workspace.type)?.label || workspace.type}
            </Badge>
            {workspace.isMainWorkspace && (
              <Badge variant="secondary" className="text-xs">Main</Badge>
            )}
          </div>
          
          {/* Show Features Button - Below badges */}
          {onShowFeatures && (
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={onShowFeatures}
            >
              <Layers className="h-4 w-4 mr-2" />
              Show Available Features
            </Button>
          )}
        </div>

        <Separator />

        {/* Editable Fields */}
        <div className="space-y-4">
          <EditableField
            label="Name"
            value={workspace.name}
            onSave={(value) => handleUpdate("name", value)}
            placeholder="Workspace name"
          />
          
          <EditableField
            label="Description"
            value={workspace.description || ""}
            onSave={(value) => handleUpdate("description", value)}
            type="textarea"
            placeholder="Add a description..."
          />

          {/* Type Selector */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">Type</Label>
            <Select
              value={workspace.type}
              onValueChange={(value) => handleUpdate("type", value)}
            >
              <SelectTrigger className="text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WORKSPACE_TYPE_OPTIONS.map((opt) => {
                  const Icon = TYPE_ICONS[opt.value as WorkspaceType] || Briefcase
                  return (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {opt.label}
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        {/* Metadata (Read-only) */}
        <div className="space-y-3">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Details</h4>
          
          {/* Owner */}
          <div className="flex items-center gap-3 text-sm">
            <User className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-muted-foreground">Owner:</span>
            <span className="font-medium truncate">
              {ownerDisplayName}
            </span>
          </div>
          
          {/* Created */}
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-muted-foreground">Created:</span>
            <span className="font-medium">
              {workspace._creationTime 
                ? format(new Date(workspace._creationTime), "MMM d, yyyy 'at' h:mm a")
                : "Unknown"
              }
            </span>
          </div>
          
          {/* Updated */}
          <div className="flex items-center gap-3 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-muted-foreground">Updated:</span>
            <span className="font-medium">
              {workspace.updatedAt 
                ? format(new Date(workspace.updatedAt), "MMM d, yyyy 'at' h:mm a")
                : "Never"
              }
            </span>
          </div>
          
          {/* Workspace ID */}
          <div className="flex items-center gap-3 text-sm">
            <Info className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-muted-foreground">ID:</span>
            <code className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded truncate">
              {workspace.id}
            </code>
          </div>
        </div>
      </div>
    </ScrollArea>
  )
}

export default WorkspaceInspector
