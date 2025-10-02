import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Folder, FileText, Hash, ExternalLink } from "lucide-react";

interface MenuDisplayProps {
  workspaceId: Id<"workspaces">;
  menuItemId?: Id<"menuItems">;
}

interface MenuItem {
  _id: Id<"menuItems">;
  name: string;
  type: string;
  order: number;
  parentId?: Id<"menuItems">;
  path?: string;
  metadata?: {
    description?: string;
    badge?: string;
  };
}

export function MenuDisplay({ workspaceId, menuItemId }: MenuDisplayProps) {
  const menuItems = useQuery((api as any)["menu/store/menuItems"].getWorkspaceMenuItems, { workspaceId });
  const currentMenuItem = menuItemId 
    ? useQuery((api as any)["menu/store/menuItems"].getMenuItem, { menuItemId })
    : null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'folder':
        return <Folder className="w-5 h-5" />;
      case 'document':
        return <FileText className="w-5 h-5" />;
      case 'route':
        return <ExternalLink className="w-5 h-5" />;
      default:
        return <Hash className="w-5 h-5" />;
    }
  };

  const getChildItems = (): MenuItem[] => {
    if (!menuItems || !menuItemId) return [] as MenuItem[];
    return (menuItems as MenuItem[])
      .filter((item: MenuItem) => item.parentId === menuItemId)
      .sort((a: MenuItem, b: MenuItem) => a.order - b.order);
  };

  const getRootItems = (): MenuItem[] => {
    if (!menuItems) return [] as MenuItem[];
    return (menuItems as MenuItem[])
      .filter((item: MenuItem) => !item.parentId)
      .sort((a: MenuItem, b: MenuItem) => a.order - b.order);
  };

  const itemsToShow = menuItemId ? getChildItems() : getRootItems();

  if (!menuItems) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading menu items...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {currentMenuItem && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getIcon(currentMenuItem.type)}
              {currentMenuItem.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{currentMenuItem.type}</Badge>
                {currentMenuItem.metadata?.badge && (
                  <Badge variant="outline">{currentMenuItem.metadata.badge}</Badge>
                )}
              </div>
              {currentMenuItem.metadata?.description && (
                <p className="text-sm text-gray-600">
                  {currentMenuItem.metadata.description}
                </p>
              )}
              {currentMenuItem.path && (
                <div className="text-sm">
                  <span className="font-medium">Path:</span> {currentMenuItem.path}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {itemsToShow.map((item: MenuItem) => (
          <Card key={item._id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                {getIcon(item.type)}
                {item.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Badge variant="secondary" className="text-xs">
                  {item.type}
                </Badge>
                {item.metadata?.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {item.metadata.description}
                  </p>
                )}
                {item.path && (
                  <div className="text-xs text-gray-500">
                    {item.path}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {itemsToShow.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">
            {menuItemId ? 'No child items found' : 'No menu items found'}
          </div>
        </div>
      )}
    </div>
  );
}
