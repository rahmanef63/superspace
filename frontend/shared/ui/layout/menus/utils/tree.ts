import { Id } from "@convex/_generated/dataModel";
import { MenuItemRecord, MenuTreeNode } from "../types";

/**
 * Build a hierarchical tree structure from flat menu items array
 */
export function buildMenuTree(
  items: MenuItemRecord[]
): MenuTreeNode[] {
  const itemMap = new Map<string, MenuTreeNode>();
  const roots: MenuTreeNode[] = [];

  // First pass: create map with empty children arrays
  items.forEach((item) => {
    itemMap.set(String(item._id), { ...item, children: [] });
  });

  // Second pass: build parent-child relationships
  items.forEach((item) => {
    const treeItem = itemMap.get(String(item._id));
    if (!treeItem) return;

    if (item.parentId && itemMap.has(String(item.parentId))) {
      const parent = itemMap.get(String(item.parentId));
      if (parent) {
        parent.children.push(treeItem);
      }
    } else {
      roots.push(treeItem);
    }
  });

  // Recursively sort by order
  const sortRecursive = (nodes: MenuTreeNode[]) => {
    nodes.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    nodes.forEach((node) => {
      if (node.children && node.children.length > 0) {
        sortRecursive(node.children);
      }
    });
  };

  sortRecursive(roots);
  return roots;
}

/**
 * Flatten tree structure back to array
 */
export function flattenMenuTree(tree: MenuTreeNode[]): MenuItemRecord[] {
  const result: MenuItemRecord[] = [];

  const traverse = (nodes: MenuTreeNode[]) => {
    nodes.forEach((node) => {
      const { children, ...item } = node;
      result.push(item);
      if (children && children.length > 0) {
        traverse(children);
      }
    });
  };

  traverse(tree);
  return result;
}

/**
 * Find menu item by ID in tree
 */
export function findMenuItemById(
  tree: MenuTreeNode[],
  id: Id<"menuItems">
): MenuTreeNode | null {
  for (const node of tree) {
    if (String(node._id) === String(id)) {
      return node;
    }
    if (node.children && node.children.length > 0) {
      const found = findMenuItemById(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

/**
 * Get breadcrumb path for a menu item
 */
export function getBreadcrumbPath(
  items: MenuItemRecord[],
  targetId: Id<"menuItems">
): MenuItemRecord[] {
  const itemMap = new Map<string, MenuItemRecord>();
  items.forEach((item) => itemMap.set(String(item._id), item));

  const breadcrumbs: MenuItemRecord[] = [];
  let current = itemMap.get(String(targetId));

  while (current) {
    breadcrumbs.unshift(current);
    if (current.parentId) {
      current = itemMap.get(String(current.parentId));
    } else {
      current = undefined;
    }
  }

  return breadcrumbs;
}

/**
 * Compute next order value for a parent
 */
export function computeNextOrder(
  items: MenuItemRecord[],
  parentId?: Id<"menuItems">
): number {
  if (!items.length) return 0;

  const siblings = items.filter((item) => {
    if (parentId) {
      return String(item.parentId || "") === String(parentId);
    }
    return !item.parentId;
  });

  if (siblings.length === 0) return 0;

  const orders = siblings.map((item) =>
    typeof item.order === "number" ? item.order : 0
  );
  return Math.max(...orders, 0) + 1;
}

/**
 * Check if item is ancestor of another item
 */
export function isAncestor(
  items: MenuItemRecord[],
  ancestorId: Id<"menuItems">,
  descendantId: Id<"menuItems">
): boolean {
  const itemMap = new Map<string, MenuItemRecord>();
  items.forEach((item) => itemMap.set(String(item._id), item));

  let current = itemMap.get(String(descendantId));
  while (current) {
    if (String(current._id) === String(ancestorId)) return true;
    if (current.parentId) {
      current = itemMap.get(String(current.parentId));
    } else {
      current = undefined;
    }
  }

  return false;
}

/**
 * Filter visible menu items based on role
 */
export function filterVisibleItems(
  items: MenuItemRecord[],
  roleId?: Id<"roles">
): MenuItemRecord[] {
  return items.filter((item) => {
    if (!item.isVisible) return false;
    if (item.visibleForRoleIds.length === 0) return true; // Visible to all
    if (!roleId) return false;
    return item.visibleForRoleIds.includes(roleId);
  });
}
