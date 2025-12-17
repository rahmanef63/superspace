/**
 * Workspace Store Utilities
 * 
 * Utilities for workspace operations, filtering, and hierarchy management
 */

import type { WorkspaceStoreItem, WorkspaceFilters } from "@/frontend/features/workspace-store/types"
import type { FilterChip } from "@/frontend/shared/ui/layout/header"

/**
 * Create filter chips from workspace filters
 */
export function createFilterChips(
    filters: WorkspaceFilters,
    typeOptions: Array<{ value: string; label: string }>
): FilterChip[] {
    const chips: FilterChip[] = []

    // Type filters
    if (filters.types?.length) {
        filters.types.forEach((t) => {
            const label = typeOptions.find((o) => o.value === t)?.label ?? t
            chips.push({ key: `type-${t}`, label: "Type", value: label })
        })
    }

    // Has children filter
    if (filters.hasChildren !== undefined) {
        chips.push({
            key: "hasChildren",
            label: "Children",
            value: filters.hasChildren ? "Has" : "None"
        })
    }

    return chips
}

/**
 * Remove filter chip and return updated filters
 */
export function removeFilterChip(
    key: string,
    currentFilters: WorkspaceFilters
): Partial<WorkspaceFilters> {
    if (key.startsWith("type-")) {
        const typeValue = key.replace("type-", "")
        return {
            types: currentFilters.types?.filter((t) => t !== typeValue) ?? undefined,
        }
    } else if (key === "hasChildren") {
        return { hasChildren: undefined }
    }
    return {}
}

/**
 * Get all descendant IDs for a workspace
 */
export function getDescendantIds(
    workspaceId: string,
    allWorkspaces: WorkspaceStoreItem[]
): string[] {
    const children = allWorkspaces.filter((w) => w.parentId === workspaceId)
    return [
        workspaceId,
        ...children.flatMap((c) => getDescendantIds(c.id, allWorkspaces))
    ]
}

/**
 * Get available move targets (exclude self and descendants)
 */
export function getMoveTargets(
    workspace: WorkspaceStoreItem | null,
    allWorkspaces: WorkspaceStoreItem[]
): WorkspaceStoreItem[] {
    if (!workspace) return []

    const excludeIds = new Set(getDescendantIds(workspace.id, allWorkspaces))
    return allWorkspaces.filter((w) => !excludeIds.has(w.id))
}

/**
 * Check if workspace has children
 */
export function hasWorkspaceChildren(
    workspace: WorkspaceStoreItem | null,
    allWorkspaces: WorkspaceStoreItem[]
): boolean {
    if (!workspace) return false
    return allWorkspaces.some((w) => w.parentId === workspace.id)
}

/**
 * Workspace template interface
 */
export interface WorkspaceTemplate {
    id: string
    name: string
    description: string
    features: string[]
}

/**
 * Get available workspace templates
 * TODO: Replace with dynamic loading from feature registry
 */
export function getAvailableTemplates(): WorkspaceTemplate[] {
    return [
        {
            id: "consultant",
            name: "Consultant",
            description: "For consulting firms and freelancers",
            features: ["projects", "tasks", "crm", "reports", "documents"]
        },
        {
            id: "developer",
            name: "Developer",
            description: "For software development teams",
            features: ["projects", "tasks", "database", "documents", "ai"]
        },
        {
            id: "marketing",
            name: "Marketing",
            description: "For marketing agencies and teams",
            features: ["crm", "reports", "analytics", "documents", "chat"]
        },
        {
            id: "startup",
            name: "Startup",
            description: "All-in-one for startups",
            features: ["projects", "tasks", "crm", "reports", "analytics", "documents", "chat"]
        },
        {
            id: "enterprise",
            name: "Enterprise",
            description: "Full-featured for large organizations",
            features: ["all"]
        },
    ]
}
