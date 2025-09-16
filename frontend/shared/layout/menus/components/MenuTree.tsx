import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronDown, Folder, FileText, Hash } from "lucide-react";

interface MenuTreeProps {
  workspaceId: Id<"workspaces">;
  onItemSelect?: (itemId: Id<"menuItems">) => void;
  selectedItemId?: Id<"menuItems">;
  showActions?: boolean;
}

interface MenuItemWithChildren {
  _id: Id<"menuItems">;
  name: string;
  type: string;
  icon?: string;
  parentId?: Id<"menuItems">;
  order: number;
  children: MenuItemWithChildren[];
}

export function MenuTree({ 
  workspaceId, 
  onItemSelect, 
  selectedItemId,
  showActions = false
}: MenuTreeProps) {
  const [expandedItems, setExpandedItems] = useState<Set<Id<"menuItems">>>(new Set());
  
  const menuItems = useQuery(api.menu.menuItems.getWorkspaceMenuItems, { workspaceId });

  const buildTree = (items: any[]): MenuItemWithChildren[] => {
    const itemMap = new Map();
    const rootItems: MenuItemWithChildren[] = [];

    // Initialize all items
    items.forEach(item => {
      itemMap.set(item._id, { ...item, children: [] });
    });

    // Build tree structure
    items.forEach(item => {
      const treeItem = itemMap.get(item._id);
      if (item.parentId && itemMap.has(item.parentId)) {
        itemMap.get(item.parentId).children.push(treeItem);
      } else {
        rootItems.push(treeItem);
      }
    });

    // Sort by order
    const sortByOrder = (items: MenuItemWithChildren[]) => {
      items.sort((a, b) => a.order - b.order);
      items.forEach(item => sortByOrder(item.children));
    };
    
    sortByOrder(rootItems);
    return rootItems;
  };

  const toggleExpanded = (itemId: Id<"menuItems">) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'folder':
        return <Folder className="w-4 h-4" />;
      case 'document':
        return <FileText className="w-4 h-4" />;
      default:
        return <Hash className="w-4 h-4" />;
    }
  };

  const renderTreeItem = (item: MenuItemWithChildren, level: number = 0) => {
    const isExpanded = expandedItems.has(item._id);
    const hasChildren = item.children.length > 0;
    const isSelected = selectedItemId === item._id;

    return (
      <div key={item._id} className="select-none">
        <div
          className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer hover:bg-gray-100 ${
            isSelected ? 'bg-blue-100 text-blue-900' : ''
          }`}
          style={{ paddingLeft: `${level * 20 + 8}px` }}
          onClick={() => onItemSelect?.(item._id)}
        >
          {hasChildren && (
            <Button
              variant="ghost"
              size="sm"
              className="w-4 h-4 p-0"
              onClick={(e) => {
                e.stopPropagation();
                toggleExpanded(item._id);
              }}
            >
              {isExpanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </Button>
          )}
          
          {!hasChildren && <div className="w-4" />}
          
          {getIcon(item.type)}
          <span className="text-sm">{item.name}</span>
        </div>
        
        {hasChildren && isExpanded && (
          <div>
            {item.children.map(child => renderTreeItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (!menuItems) {
    return <div className="p-4 text-center text-gray-500">Loading...</div>;
  }

  const tree = buildTree(menuItems);

  return (
    <div className="space-y-1">
      {tree.map(item => renderTreeItem(item))}
      {tree.length === 0 && (
        <div className="p-4 text-center text-gray-500">
          No menu items found
        </div>
      )}
    </div>
  );
}
