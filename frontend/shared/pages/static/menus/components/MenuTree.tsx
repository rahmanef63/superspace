"use client"

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import {
  createOnDropHandler,
  dragAndDropFeature,
  hotkeysCoreFeature,
  keyboardDragAndDropFeature,
  selectionFeature,
  syncDataLoaderFeature,
} from "@headless-tree/core";
import { AssistiveTreeDescription, useTree } from "@headless-tree/react";
import { FolderIcon, FolderOpenIcon, FileText, Hash } from "lucide-react";

import {
  Tree,
  TreeDragLine,
  TreeItem,
  TreeItemLabel,
} from "@/components/tree";

interface MenuTreeProps {
  workspaceId: Id<"workspaces">;
  onItemSelect?: (itemId: Id<"menuItems">) => void;
  selectedItemId?: Id<"menuItems">;
  showActions?: boolean;
}

interface MenuItemData {
  _id: Id<"menuItems">;
  name: string;
  type: string;
  icon?: string;
  parentId?: Id<"menuItems">;
  order: number;
  children?: Id<"menuItems">[];
}

export function MenuTree({
  workspaceId,
  onItemSelect,
  selectedItemId,
  showActions = false
}: MenuTreeProps) {
  const menuItems = useQuery(api.menu.menuItems.getWorkspaceMenuItems, { workspaceId });

  // Build items map for headless-tree
  const itemsMap: Record<string, MenuItemData> = {};
  const rootItemIds: Id<"menuItems">[] = [];

  if (menuItems) {
    // First pass: create map and identify children
    menuItems.forEach((item: any) => {
      itemsMap[item._id] = {
        ...item,
        children: []
      };
    });

    // Second pass: build parent-child relationships
    menuItems.forEach((item: any) => {
      if (item.parentId && itemsMap[item.parentId]) {
        itemsMap[item.parentId].children!.push(item._id);
      } else {
        rootItemIds.push(item._id);
      }
    });

    // Sort children by order
    Object.values(itemsMap).forEach(item => {
      if (item.children && item.children.length > 0) {
        item.children.sort((a, b) => {
          const orderA = itemsMap[a]?.order ?? 0;
          const orderB = itemsMap[b]?.order ?? 0;
          return orderA - orderB;
        });
      }
    });

    // Sort root items by order
    rootItemIds.sort((a, b) => {
      const orderA = itemsMap[a]?.order ?? 0;
      const orderB = itemsMap[b]?.order ?? 0;
      return orderA - orderB;
    });
  }

  const indent = 20;

  const tree = useTree<MenuItemData>({
    initialState: {
      expandedItems: [],
      selectedItems: selectedItemId ? [selectedItemId] : [],
    },
    indent,
    rootItemId: "root",
    getItemName: (item) => item.getItemData().name,
    isItemFolder: (item) => (item.getItemData()?.children?.length ?? 0) > 0,
    canReorder: showActions,
    onPrimaryAction: (item) => {
      const itemId = item.getId() as Id<"menuItems">;
      if (itemId !== "root") {
        onItemSelect?.(itemId);
      }
    },
    dataLoader: {
      getItem: (itemId) => {
        if (itemId === "root") {
          return {
            _id: "root" as Id<"menuItems">,
            name: "Root",
            type: "folder",
            order: 0,
            children: rootItemIds,
          };
        }
        return itemsMap[itemId];
      },
      getChildren: (itemId) => {
        if (itemId === "root") {
          return rootItemIds;
        }
        return itemsMap[itemId]?.children ?? [];
      },
    },
    features: [
      syncDataLoaderFeature,
      selectionFeature,
      hotkeysCoreFeature,
      ...(showActions ? [dragAndDropFeature, keyboardDragAndDropFeature] : []),
    ],
  });

  const getIcon = (type: string, isFolder: boolean, isExpanded: boolean) => {
    if (isFolder) {
      return isExpanded ? (
        <FolderOpenIcon className="text-muted-foreground size-4" />
      ) : (
        <FolderIcon className="text-muted-foreground size-4" />
      );
    }

    switch (type) {
      case 'document':
        return <FileText className="text-muted-foreground size-4" />;
      default:
        return <Hash className="text-muted-foreground size-4" />;
    }
  };

  if (!menuItems) {
    return <div className="p-4 text-center text-gray-500">Loading...</div>;
  }

  return (
    <div className="flex h-full flex-col">
      <Tree indent={indent} tree={tree}>
        <AssistiveTreeDescription tree={tree} />
        {tree.getItems().map((item) => {
          // Skip rendering the root item itself
          if (item.getId() === "root") {
            return null;
          }

          const itemData = item.getItemData();
          const isFolder = item.isFolder();
          const isExpanded = item.isExpanded();

          return (
            <TreeItem key={item.getId()} item={item}>
              <TreeItemLabel>
                <span className="flex items-center gap-2">
                  {getIcon(itemData.type, isFolder, isExpanded)}
                  {item.getItemName()}
                </span>
              </TreeItemLabel>
            </TreeItem>
          );
        })}
        {showActions && <TreeDragLine />}
      </Tree>

      {Object.keys(itemsMap).length === 0 && (
        <div className="p-4 text-center text-gray-500">
          No menu items found
        </div>
      )}
    </div>
  );
}
