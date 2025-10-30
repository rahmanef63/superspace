import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getIconComponent } from "@/frontend/shared/ui";
import { cn } from "@/lib/utils";
import type { MenuItemMetadata } from "@/frontend/shared/ui";
import {
  Calendar,
  User,
  Tag,
  Package,
  Info,
  Eye,
  EyeOff,
  Lock,
  Globe,
  Users,
} from "lucide-react";

export interface MenuPreviewProps {
  menuItemId?: Id<"menuItems">;
  workspaceId: Id<"workspaces">;
  className?: string;
}

interface MenuItem {
  _id: Id<"menuItems">;
  name: string;
  slug: string;
  type: string;
  icon?: string;
  path?: string;
  component?: string;
  order: number;
  isVisible: boolean;
  metadata?: MenuItemMetadata;
  parentId?: Id<"menuItems">;
  createdBy?: Id<"users">;
  _creationTime: number;
}

export function MenuPreview({ menuItemId, workspaceId, className }: MenuPreviewProps) {
  const menuItem = useQuery(
    api.menu.store.menuItems.getMenuItem,
    menuItemId ? { menuItemId } : "skip"
  ) as MenuItem | undefined;

  if (!menuItemId) {
    return (
      <div className={cn("flex h-full items-center justify-center", className)}>
        <div className="text-center text-muted-foreground">
          <Info className="mx-auto mb-2 h-12 w-12 opacity-50" />
          <p className="text-sm">Select a menu item to preview</p>
        </div>
      </div>
    );
  }

  if (!menuItem) {
    return (
      <div className={cn("flex h-full items-center justify-center", className)}>
        <div className="animate-pulse text-center text-muted-foreground">
          <p className="text-sm">Loading preview...</p>
        </div>
      </div>
    );
  }

  const IconComponent = menuItem.icon ? getIconComponent(menuItem.icon) : null;
  const featureType = menuItem.metadata?.featureType || "custom";
  const isSystem = featureType === "system";
  const isOptional = featureType === "optional";

  return (
    <div className={cn("h-full overflow-y-auto", className)}>
      <Card className="m-6 border-0 shadow-none">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              {IconComponent && (
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border bg-muted/50"
                  style={
                    menuItem.metadata?.color
                      ? { backgroundColor: `${menuItem.metadata.color}15`, borderColor: menuItem.metadata.color }
                      : undefined
                  }
                >
                  <IconComponent
                    className="h-6 w-6"
                    style={menuItem.metadata?.color ? { color: menuItem.metadata.color } : undefined}
                  />
                </div>
              )}
              <div className="space-y-1">
                <CardTitle className="text-xl">{menuItem.name}</CardTitle>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {menuItem.type}
                  </Badge>
                  <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
                    {menuItem.slug}
                  </code>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {menuItem.isVisible ? (
                <Eye className="h-4 w-4 text-green-600" />
              ) : (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Description */}
          {menuItem.metadata?.description && (
            <div>
              <h3 className="mb-2 text-sm font-semibold text-foreground">Description</h3>
              <p className="text-sm text-muted-foreground">{menuItem.metadata.description}</p>
            </div>
          )}

          <Separator />

          {/* Technical Details */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Technical Details</h3>
            <div className="grid gap-3">
              {menuItem.path && (
                <div className="flex items-start gap-2">
                  <Package className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="flex-1 space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Path</p>
                    <code className="block rounded bg-muted px-2 py-1 text-xs">
                      {menuItem.path}
                    </code>
                  </div>
                </div>
              )}

              {menuItem.component && (
                <div className="flex items-start gap-2">
                  <Package className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="flex-1 space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Component</p>
                    <code className="block rounded bg-muted px-2 py-1 text-xs">
                      {menuItem.component}
                    </code>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-2">
                <Tag className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="flex-1 space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Order</p>
                  <p className="text-sm">{menuItem.order}</p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Visibility & Permissions */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Visibility & Permissions</h3>
            <div className="grid gap-3">
              <div className="flex items-start gap-2">
                {isSystem ? (
                  <Lock className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                ) : (
                  <Globe className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                )}
                <div className="flex-1 space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Feature Type</p>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={isSystem ? "destructive" : isOptional ? "secondary" : "outline"}
                      className="text-xs"
                    >
                      {featureType}
                    </Badge>
                    <p className="text-xs text-muted-foreground">
                      {isSystem
                        ? "Only owners & admin roles"
                        : isOptional
                        ? "Optional feature"
                        : "All workspace members"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2">
                {menuItem.isVisible ? (
                  <Eye className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                ) : (
                  <EyeOff className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                )}
                <div className="flex-1 space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Visibility</p>
                  <p className="text-sm">
                    {menuItem.isVisible ? "Visible" : "Hidden"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Metadata */}
          {(menuItem.metadata?.version || menuItem.metadata?.category || menuItem.metadata?.badge) && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Metadata</h3>
                <div className="grid gap-3">
                  {menuItem.metadata.version && (
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-muted-foreground">Version</p>
                        <p className="text-sm">v{menuItem.metadata.version}</p>
                      </div>
                    </div>
                  )}

                  {menuItem.metadata.category && (
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-muted-foreground">Category</p>
                        <Badge variant="secondary" className="text-xs capitalize">
                          {menuItem.metadata.category}
                        </Badge>
                      </div>
                    </div>
                  )}

                  {menuItem.metadata.badge && (
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-muted-foreground">Badge</p>
                        <Badge variant="default" className="text-xs">
                          {menuItem.metadata.badge}
                        </Badge>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          <Separator />

          {/* Timestamps */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Timestamps</h3>
            <div className="grid gap-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-muted-foreground">Created</p>
                  <p className="text-sm">
                    {new Date(menuItem._creationTime).toLocaleString()}
                  </p>
                </div>
              </div>

              {menuItem.metadata?.lastUpdated && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-muted-foreground">Last Updated</p>
                    <p className="text-sm">
                      {new Date(menuItem.metadata.lastUpdated).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* JSON Preview for metadata */}
          {menuItem.metadata?.jsonPlaceholder && Object.keys(menuItem.metadata.jsonPlaceholder).length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Additional Data</h3>
                <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs">
                  {JSON.stringify(menuItem.metadata.jsonPlaceholder, null, 2)}
                </pre>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
