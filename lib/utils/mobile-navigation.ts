/**
 * Mobile Navigation Utilities
 * 
 * Helpers for managing hierarchical mobile navigation in workspace store
 */

import type { PanelMode } from "./panel-config"

/**
 * Mobile navigation levels
 */
export type MobileLevel = 1 | 2 | 3 | 4

/**
 * Mobile navigation state
 */
export interface MobileNavigationState {
    selectedWorkspaceId: string | null
    centerPanelMode: PanelMode
    previewVisible: boolean
    settingsVisible: boolean
    selectedSettingsSlug: string | null
}

/**
 * Get current mobile navigation level based on state
 * 
 * Level 1: Workspace List (no selection)
 * Level 2: Workspace Details (workspace selected, showing tabs)
 * Level 3: Feature Settings/Details (settings or features visible)
 * Level 4: Preview (preview visible)
 */
export function getMobileLevel(state: MobileNavigationState): MobileLevel {
    // Level 4: Preview is visible
    if (state.previewVisible) {
        return 4
    }

    // Level 3: Settings panel is visible with a selected feature
    if (state.settingsVisible && state.selectedSettingsSlug) {
        return 3
    }

    // Level 2: Workspace is selected
    if (state.selectedWorkspaceId) {
        return 2
    }

    // Level 1: Workspace list (default)
    return 1
}

/**
 * Get back action for current mobile level
 * Returns a function that handles navigation back
 */
export function getBackAction(
    level: MobileLevel,
    actions: {
        clearWorkspaceSelection: () => void
        closeSettings: () => void
        closePreview: () => void
    }
): (() => void) | null {
    switch (level) {
        case 4: // Preview -> Settings/Features
            return actions.closePreview
        case 3: // Settings -> Workspace Details
            return actions.closeSettings
        case 2: // Workspace Details -> Workspace List
            return actions.clearWorkspaceSelection
        case 1: // Workspace List (no back action at root)
            return null
    }
}

/**
 * Get title for mobile header based on level
 */
export function getMobileTitle(
    level: MobileLevel,
    context: {
        workspaceName?: string
        panelMode?: PanelMode
    }
): string {
    switch (level) {
        case 4:
            return "Preview"
        case 3:
            return "Settings"
        case 2:
            return context.workspaceName ?? "Workspace"
        case 1:
        default:
            return "Workspaces"
    }
}

/**
 * Check if Browse panel should be shown in mobile view
 * Browse panel is shown when in Level 1 and centerPanelMode is "available"
 */
export function shouldShowBrowsePanel(state: MobileNavigationState): boolean {
    return state.selectedWorkspaceId === null && state.centerPanelMode === "available"
}
