import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbNavigationProps {
  workspaceId: Id<"workspaces">;
  currentMenuItemId?: Id<"menuItems">;
  onNavigate: (menuItemId?: Id<"menuItems">) => void;
}

interface MenuItem {
  _id: Id<"menuItems">;
  name: string;
  parentId?: Id<"menuItems">;
}

export function BreadcrumbNavigation({ 
  workspaceId, 
  currentMenuItemId, 
  onNavigate 
}: BreadcrumbNavigationProps) {
  const menuItems = useQuery((api as any)["features/menus/menuItems"].getWorkspaceMenuItems, { workspaceId });
  const currentMenuItem = useQuery(
    (api as any)["features/menus/menuItems"].getMenuItem, 
    currentMenuItemId ? { menuItemId: currentMenuItemId } : "skip"
  );

  const buildBreadcrumbs = (): MenuItem[] => {
    if (!currentMenuItem || !menuItems) return [];
    
    const breadcrumbs: MenuItem[] = [];
    let current: MenuItem | null = currentMenuItem;
    
    while (current) {
      breadcrumbs.unshift(current);
      if (current.parentId) {
        const parent = (menuItems as MenuItem[]).find((item: MenuItem) => item._id === current!.parentId);
        current = parent ? { _id: parent._id, name: parent.name, parentId: parent.parentId } : null;
      } else {
        current = null;
      }
    }
    
    return breadcrumbs;
  };

  const breadcrumbs = buildBreadcrumbs();

  return (
    <nav className="flex items-center space-x-1 text-sm text-gray-600">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onNavigate()}
        className="flex items-center gap-1 px-2 py-1 h-auto"
      >
        <Home className="w-4 h-4" />
        <span>Home</span>
      </Button>
      
      {breadcrumbs.map((item, index) => (
        <div key={item._id} className="flex items-center">
          <ChevronRight className="w-4 h-4 mx-1" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate(item._id)}
            className={`px-2 py-1 h-auto ${
              index === breadcrumbs.length - 1 
                ? 'text-gray-900 font-medium' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {item.name}
          </Button>
        </div>
      ))}
    </nav>
  );
}