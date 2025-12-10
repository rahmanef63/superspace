"use client"

import React from "react"
import {
  Shield,
  Store,
  Package,
  Building2,
  Users,
  Mail,
  Edit2,
  Trash2,
  Copy,
  ExternalLink,
  MoreHorizontal,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Zap,
  Settings,
  Box,
  Calendar,
  Tag,
  Info,
  X,
  Blocks,
  BarChart3,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getIconComponent } from "@/frontend/shared/ui/components/icons"
import type { FeatureStatus } from "../../types"
import type { AdminSection } from "../navigation/AdminNavigation"

// Reusable Status Badge
function StatusBadge({ status }: { status: FeatureStatus }) {
  const statusConfig: Record<FeatureStatus, { icon: React.ElementType; class: string; label: string }> = {
    stable: { icon: CheckCircle2, class: "bg-green-500/10 text-green-500 border-green-500/20", label: "Stable" },
    beta: { icon: AlertTriangle, class: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20", label: "Beta" },
    development: { icon: Settings, class: "bg-blue-500/10 text-blue-500 border-blue-500/20", label: "Development" },
    experimental: { icon: Zap, class: "bg-purple-500/10 text-purple-500 border-purple-500/20", label: "Experimental" },
    deprecated: { icon: XCircle, class: "bg-gray-500/10 text-gray-500 border-gray-500/20", label: "Deprecated" },
    disabled: { icon: XCircle, class: "bg-red-500/10 text-red-500 border-red-500/20", label: "Disabled" },
  }

  const config = statusConfig[status] || statusConfig.stable
  const Icon = config.icon

  return (
    <Badge variant="outline" className={cn("gap-1", config.class)}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  )
}

// Feature Inspector
interface FeatureData {
  _id: string
  featureId: string
  name: string
  description?: string
  icon?: string
  version?: string
  category?: string
  status: FeatureStatus
  featureType?: string
  tags?: string[]
  isPublic?: boolean
  isEnabled?: boolean
  isReady?: boolean
  expectedRelease?: string
  createdAt?: number
  updatedAt?: number
}

interface FeatureInspectorProps {
  feature: FeatureData
  onEdit?: () => void
  onDelete?: () => void
  onTogglePublic?: () => void
  onToggleEnabled?: () => void
  onClose?: () => void
}

function FeatureInspector({
  feature,
  onEdit,
  onDelete,
  onTogglePublic,
  onToggleEnabled,
  onClose,
}: FeatureInspectorProps) {
  const IconComponent = feature.icon ? getIconComponent(feature.icon) : Box

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="rounded-lg bg-primary/10 p-2 flex-shrink-0">
              {IconComponent && <IconComponent className="h-5 w-5 text-primary" />}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold truncate">{feature.name}</h3>
              <p className="text-xs text-muted-foreground font-mono truncate">{feature.featureId}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem onClick={onEdit}>
                    <Edit2 className="h-4 w-4 mr-2" />
                    Edit Feature
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => {
                  navigator.clipboard.writeText(feature.featureId)
                }}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy ID
                </DropdownMenuItem>
                {onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={onDelete} className="text-red-500">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            {onClose && (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-4 space-y-6">
          {/* Description */}
          {feature.description && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Description</Label>
              <p className="text-sm">{feature.description}</p>
            </div>
          )}

          {/* Status & Type */}
          <div className="space-y-3">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Status & Type</Label>
            <div className="flex flex-wrap gap-2">
              <StatusBadge status={feature.status} />
              {feature.featureType && (
                <Badge variant="outline" className="capitalize">{feature.featureType}</Badge>
              )}
              {feature.category && (
                <Badge variant="secondary" className="capitalize">{feature.category}</Badge>
              )}
            </div>
          </div>

          {/* Version */}
          {feature.version && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Version</Label>
              <Badge variant="outline" className="font-mono">{feature.version}</Badge>
            </div>
          )}

          <Separator />

          {/* Visibility Controls */}
          <div className="space-y-4">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Visibility</Label>

            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <Store className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-sm font-medium">Menu Store</Label>
                  </div>
                  <p className="text-xs text-muted-foreground">Show in Menu Store</p>
                </div>
                <Switch
                  checked={feature.isPublic}
                  onCheckedChange={onTogglePublic}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    {feature.isEnabled ? (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    )}
                    <Label className="text-sm font-medium">Enabled</Label>
                  </div>
                  <p className="text-xs text-muted-foreground">Feature can be installed</p>
                </div>
                <Switch
                  checked={feature.isEnabled}
                  onCheckedChange={onToggleEnabled}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                    <Label className="text-sm font-medium">Ready</Label>
                  </div>
                  <p className="text-xs text-muted-foreground">Production ready</p>
                </div>
                <Badge variant={feature.isReady ? "default" : "secondary"}>
                  {feature.isReady ? "Yes" : "No"}
                </Badge>
              </div>
            </div>
          </div>

          {/* Tags */}
          {feature.tags && feature.tags.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                  <Tag className="h-3 w-3" />
                  Tags
                </Label>
                <div className="flex flex-wrap gap-1">
                  {feature.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Dates */}
          {(feature.createdAt || feature.expectedRelease) && (
            <>
              <Separator />
              <div className="space-y-3">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Timeline
                </Label>
                {feature.createdAt && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Created</span>
                    <span>{new Date(feature.createdAt).toLocaleDateString()}</span>
                  </div>
                )}
                {feature.updatedAt && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Updated</span>
                    <span>{new Date(feature.updatedAt).toLocaleDateString()}</span>
                  </div>
                )}
                {feature.expectedRelease && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Expected Release</span>
                    <span>{feature.expectedRelease}</span>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </ScrollArea>

      {/* Footer Actions */}
      <div className="flex-shrink-0 px-4 py-3 border-t bg-muted/20">
        <Button variant="outline" className="w-full" onClick={onEdit}>
          <Edit2 className="h-4 w-4 mr-2" />
          Edit Feature
        </Button>
      </div>
    </div>
  )
}

// User Inspector
interface UserData {
  _id: string
  name?: string
  email?: string
  imageUrl?: string
  role?: string
  createdAt?: number
  lastLoginAt?: number
}

interface UserInspectorProps {
  user: UserData
  onClose?: () => void
}

function UserInspector({ user, onClose }: UserInspectorProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="rounded-full bg-primary/10 p-2 flex-shrink-0">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold truncate">{user.name || "Unknown User"}</h3>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
          {onClose && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-4 space-y-4">
          {user.role && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Role</Label>
              <Badge variant="outline" className="capitalize">{user.role}</Badge>
            </div>
          )}
          {user.createdAt && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Joined</Label>
              <p className="text-sm">{new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
          )}
          {user.lastLoginAt && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Last Login</Label>
              <p className="text-sm">{new Date(user.lastLoginAt).toLocaleDateString()}</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

// Bundle Inspector
interface BundleData {
  _id: string
  bundleId: string
  name: string
  description?: string
  icon?: string
  primaryColor?: string
  category?: string
  recommendedFor?: string[]
  tags?: string[]
  featureCount?: number
}

interface BundleInspectorProps {
  bundle: BundleData
  onEdit?: () => void
  onDelete?: () => void
  onClose?: () => void
}

function BundleInspector({ bundle, onEdit, onDelete, onClose }: BundleInspectorProps) {
  const IconComponent = bundle.icon ? getIconComponent(bundle.icon) : Package

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b bg-muted/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div 
              className="rounded-lg p-2 flex-shrink-0"
              style={{ backgroundColor: bundle.primaryColor ? `${bundle.primaryColor}20` : undefined }}
            >
              {IconComponent && (
                <IconComponent 
                  className="h-5 w-5" 
                  style={{ color: bundle.primaryColor }}
                />
              )}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold truncate">{bundle.name}</h3>
              <p className="text-xs text-muted-foreground font-mono truncate">{bundle.bundleId}</p>
            </div>
          </div>
          {onClose && (
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1 min-h-0">
        <div className="p-4 space-y-4">
          {bundle.description && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Description</Label>
              <p className="text-sm">{bundle.description}</p>
            </div>
          )}

          {bundle.category && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Category</Label>
              <Badge variant="secondary" className="capitalize">{bundle.category}</Badge>
            </div>
          )}

          {bundle.featureCount !== undefined && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Features</Label>
              <Badge variant="outline">{bundle.featureCount} features</Badge>
            </div>
          )}

          {bundle.recommendedFor && bundle.recommendedFor.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Recommended For</Label>
              <div className="flex flex-wrap gap-1">
                {bundle.recommendedFor.map((r) => (
                  <Badge key={r} variant="outline" className="text-xs capitalize">{r}</Badge>
                ))}
              </div>
            </div>
          )}

          {bundle.tags && bundle.tags.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">Tags</Label>
              <div className="flex flex-wrap gap-1">
                {bundle.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer Actions */}
      {onEdit && (
        <div className="flex-shrink-0 px-4 py-3 border-t bg-muted/20">
          <Button variant="outline" className="w-full" onClick={onEdit}>
            <Edit2 className="h-4 w-4 mr-2" />
            Edit Bundle
          </Button>
        </div>
      )}
    </div>
  )
}

// Empty State
interface EmptyInspectorProps {
  section: AdminSection
}

function EmptyInspector({ section }: EmptyInspectorProps) {
  const sectionConfig: Record<AdminSection, { icon: React.ElementType; title: string; description: string }> = {
    "system-features": {
      icon: Store,
      title: "Select a Feature",
      description: "Click on a feature in the table to view details",
    },
    "bundle-categories": {
      icon: Package,
      title: "Select a Bundle",
      description: "Click on a bundle to view and edit",
    },
    "workspace-hierarchy": {
      icon: Building2,
      title: "Workspace Details",
      description: "Select a workspace from the tree",
    },
    "custom-features": {
      icon: Blocks,
      title: "Select a Feature",
      description: "Click on a custom feature to view details",
    },
    "workspaces": {
      icon: Building2,
      title: "Select a Workspace",
      description: "Click on a workspace to view details",
    },
    "users": {
      icon: Users,
      title: "Select a User",
      description: "Click on a user to view profile",
    },
    "invitations": {
      icon: Mail,
      title: "Select an Invitation",
      description: "Click on an invitation to view details",
    },
    "analytics": {
      icon: BarChart3,
      title: "Analytics",
      description: "View platform analytics",
    },
    "settings": {
      icon: Settings,
      title: "Settings",
      description: "Configure platform settings",
    },
  }

  const config = sectionConfig[section]
  const Icon = config.icon

  return (
    <div className="flex flex-col h-full items-center justify-center p-6 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-sm font-medium">{config.title}</h3>
      <p className="text-xs text-muted-foreground mt-1">{config.description}</p>
    </div>
  )
}

// Main Inspector Component
export interface AdminInspectorProps {
  section: AdminSection
  selectedItem?: any
  onEdit?: () => void
  onDelete?: () => void
  onTogglePublic?: () => void
  onToggleEnabled?: () => void
  onClose?: () => void
}

export function AdminInspector({
  section,
  selectedItem,
  onEdit,
  onDelete,
  onTogglePublic,
  onToggleEnabled,
  onClose,
}: AdminInspectorProps) {
  if (!selectedItem) {
    return <EmptyInspector section={section} />
  }

  switch (section) {
    case "system-features":
    case "custom-features":
      return (
        <FeatureInspector
          feature={selectedItem}
          onEdit={onEdit}
          onDelete={onDelete}
          onTogglePublic={onTogglePublic}
          onToggleEnabled={onToggleEnabled}
          onClose={onClose}
        />
      )
    case "bundle-categories":
      return (
        <BundleInspector
          bundle={selectedItem}
          onEdit={onEdit}
          onDelete={onDelete}
          onClose={onClose}
        />
      )
    case "users":
      return (
        <UserInspector
          user={selectedItem}
          onClose={onClose}
        />
      )
    default:
      return <EmptyInspector section={section} />
  }
}

export { FeatureInspector, UserInspector, BundleInspector, EmptyInspector, StatusBadge }
