/**
 * DnD Tree Utilities
 * 
 * Helper functions for tree manipulation, order calculation, and validation
 */

import type { BaseTreeItem, TreeNode, DropPosition, MoveOperation } from "./types"

// ============================================================================
// Tree Building
// ============================================================================

/**
 * Build a tree structure from flat items
 */
export function buildTree<T extends BaseTreeItem>(
  items: T[],
  options?: {
    idField?: keyof T
    parentIdField?: keyof T
    orderField?: keyof T
  }
): TreeNode<T>[] {
  const idField = (options?.idField ?? "id") as keyof T
  const parentIdField = (options?.parentIdField ?? "parentId") as keyof T
  const orderField = (options?.orderField ?? "order") as keyof T

  // Create lookup map
  const itemMap = new Map<string, TreeNode<T>>()
  const rootItems: TreeNode<T>[] = []
  const childrenMap = new Map<string | null, TreeNode<T>[]>()

  // First pass: create nodes
  for (const item of items) {
    const id = String(item[idField])
    const node: TreeNode<T> = {
      ...item,
      id,
      name: item.name,
      children: [],
      data: item,
    }
    itemMap.set(id, node)
  }

  // Second pass: build hierarchy
  for (const item of items) {
    const id = String(item[idField])
    const parentId = item[parentIdField] as string | null | undefined
    const node = itemMap.get(id)!

    if (!parentId) {
      rootItems.push(node)
      if (!childrenMap.has(null)) childrenMap.set(null, [])
      childrenMap.get(null)!.push(node)
    } else {
      const parent = itemMap.get(parentId)
      if (parent) {
        parent.children = parent.children ?? []
        parent.children.push(node)
      } else {
        // Orphaned item, add to root
        rootItems.push(node)
      }
      if (!childrenMap.has(parentId)) childrenMap.set(parentId, [])
      childrenMap.get(parentId)!.push(node)
    }
  }

  // Sort children by order
  const sortChildren = (nodes: TreeNode<T>[]) => {
    nodes.sort((a, b) => {
      const orderA = (a.data?.[orderField] as number) ?? 0
      const orderB = (b.data?.[orderField] as number) ?? 0
      return orderA - orderB
    })
    for (const node of nodes) {
      if (node.children?.length) {
        sortChildren(node.children)
      }
    }
  }

  sortChildren(rootItems)
  return rootItems
}

/**
 * Flatten a tree structure to array
 */
export function flattenTree<T extends BaseTreeItem>(
  tree: TreeNode<T>[],
  depth = 0
): Array<TreeNode<T> & { depth: number }> {
  const result: Array<TreeNode<T> & { depth: number }> = []

  for (const node of tree) {
    result.push({ ...node, depth })
    if (node.children?.length) {
      result.push(...flattenTree(node.children, depth + 1))
    }
  }

  return result
}

// ============================================================================
// Order Calculation
// ============================================================================

/**
 * Compute the next order value for a new item under a parent
 */
export function computeNextOrder<T extends BaseTreeItem>(
  items: T[],
  parentId?: string | null,
  options?: { parentIdField?: keyof T; orderField?: keyof T }
): number {
  const parentIdField = (options?.parentIdField ?? "parentId") as keyof T
  const orderField = (options?.orderField ?? "order") as keyof T

  const siblings = items.filter(item => {
    const itemParentId = item[parentIdField] as string | null | undefined
    if (parentId === undefined || parentId === null) {
      return !itemParentId
    }
    return itemParentId === parentId
  })

  if (siblings.length === 0) return 1

  const maxOrder = Math.max(...siblings.map(s => (s[orderField] as number) ?? 0))
  return maxOrder + 1
}

/**
 * Calculate new order for insertion at a specific position
 */
export function calculateInsertOrder<T extends BaseTreeItem>(
  items: T[],
  targetId: string,
  position: DropPosition,
  options?: { 
    idField?: keyof T
    parentIdField?: keyof T
    orderField?: keyof T 
  }
): number {
  const idField = (options?.idField ?? "id") as keyof T
  const parentIdField = (options?.parentIdField ?? "parentId") as keyof T
  const orderField = (options?.orderField ?? "order") as keyof T

  const targetItem = items.find(item => String(item[idField]) === targetId)
  if (!targetItem) return 0

  if (position === "inside") {
    return computeNextOrder(items, targetId, options)
  }

  const targetParentId = targetItem[parentIdField] as string | null | undefined
  const siblings = items
    .filter(item => {
      const itemParentId = item[parentIdField] as string | null | undefined
      return String(itemParentId ?? "") === String(targetParentId ?? "")
    })
    .sort((a, b) => ((a[orderField] as number) ?? 0) - ((b[orderField] as number) ?? 0))

  const targetIndex = siblings.findIndex(s => String(s[idField]) === targetId)
  const targetOrder = (targetItem[orderField] as number) ?? 0

  if (position === "above") {
    const prevSibling = siblings[targetIndex - 1]
    if (!prevSibling) return targetOrder - 1
    return ((prevSibling[orderField] as number) ?? 0) + targetOrder / 2
  } else {
    const nextSibling = siblings[targetIndex + 1]
    if (!nextSibling) return targetOrder + 1
    return (targetOrder + ((nextSibling[orderField] as number) ?? 0)) / 2
  }
}

// ============================================================================
// Validation
// ============================================================================

/**
 * Check if moving an item would create a cycle in the hierarchy
 */
export function wouldCreateCycle<T extends BaseTreeItem>(
  itemId: string,
  newParentId: string | null,
  items: Map<string, T> | T[],
  options?: { parentIdField?: keyof T }
): boolean {
  if (!newParentId) return false
  if (itemId === newParentId) return true

  const parentIdField = (options?.parentIdField ?? "parentId") as keyof T
  const itemMap = items instanceof Map 
    ? items 
    : new Map(items.map(item => [item.id, item]))

  // Walk up the tree from newParentId to check if we encounter itemId
  let currentId: string | null = newParentId
  const visited = new Set<string>()

  while (currentId) {
    if (visited.has(currentId)) return true // Already a cycle
    if (currentId === itemId) return true
    
    visited.add(currentId)
    const current = itemMap.get(currentId)
    currentId = current ? (current[parentIdField] as string | null) : null
  }

  return false
}

/**
 * Get all ancestor IDs of an item
 */
export function getAncestorIds<T extends BaseTreeItem>(
  itemId: string,
  items: Map<string, T> | T[],
  options?: { parentIdField?: keyof T }
): string[] {
  const parentIdField = (options?.parentIdField ?? "parentId") as keyof T
  const itemMap = items instanceof Map 
    ? items 
    : new Map(items.map(item => [item.id, item]))

  const ancestors: string[] = []
  let currentId: string | null = itemId

  while (currentId) {
    const current = itemMap.get(currentId)
    if (!current) break
    
    const parentId = current[parentIdField] as string | null
    if (parentId) {
      ancestors.push(parentId)
    }
    currentId = parentId
  }

  return ancestors
}

/**
 * Get all descendant IDs of an item
 */
export function getDescendantIds<T extends BaseTreeItem>(
  itemId: string,
  items: T[],
  options?: { idField?: keyof T; parentIdField?: keyof T }
): string[] {
  const idField = (options?.idField ?? "id") as keyof T
  const parentIdField = (options?.parentIdField ?? "parentId") as keyof T

  const descendants: string[] = []
  const queue = [itemId]

  while (queue.length > 0) {
    const currentId = queue.shift()!
    const children = items.filter(item => 
      (item[parentIdField] as string | null) === currentId
    )
    
    for (const child of children) {
      const childId = String(child[idField])
      descendants.push(childId)
      queue.push(childId)
    }
  }

  return descendants
}

// ============================================================================
// Drop Position Calculation
// ============================================================================

/**
 * Calculate drop position based on mouse Y position relative to element
 */
export function calculateDropPosition(
  event: { clientY: number },
  element: HTMLElement,
  threshold: number = 0.25
): DropPosition {
  const rect = element.getBoundingClientRect()
  const offset = event.clientY - rect.top
  const relativePosition = offset / rect.height

  if (relativePosition < threshold) {
    return "above"
  } else if (relativePosition > 1 - threshold) {
    return "below"
  }
  return "inside"
}

// ============================================================================
// Move Operation Builder
// ============================================================================

/**
 * Build a move operation from drag and drop data
 */
export function buildMoveOperation<T extends BaseTreeItem>(
  draggedItem: T,
  targetItem: T | null,
  position: DropPosition,
  items: T[],
  options?: { 
    idField?: keyof T
    parentIdField?: keyof T
    orderField?: keyof T 
  }
): MoveOperation<T> {
  const parentIdField = (options?.parentIdField ?? "parentId") as keyof T
  
  const fromParentId = (draggedItem[parentIdField] as string | null) ?? null
  
  let toParentId: string | null
  let newOrder: number

  if (!targetItem) {
    // Dropping to root
    toParentId = null
    newOrder = computeNextOrder(items, null, options)
  } else if (position === "inside") {
    toParentId = targetItem.id
    newOrder = computeNextOrder(items, targetItem.id, options)
  } else {
    toParentId = (targetItem[parentIdField] as string | null) ?? null
    newOrder = calculateInsertOrder(items, targetItem.id, position, options)
  }

  return {
    itemId: draggedItem.id,
    item: draggedItem,
    fromParentId,
    toParentId,
    newOrder,
    position,
  }
}
