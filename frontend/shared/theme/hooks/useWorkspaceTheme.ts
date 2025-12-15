/**
 * useWorkspaceTheme Hook
 * 
 * Applies workspace-specific theme when workspace changes.
 * Handles theme inheritance from parent workspaces.
 */

"use client"

import { useEffect } from "react"
import { useQuery } from "convex/react"
import { api } from "@convex/_generated/api"
import { Id } from "@convex/_generated/dataModel"
import { useThemeConfig } from "@/frontend/shared/theme"

interface UseWorkspaceThemeOptions {
    /** Current workspace ID */
    workspaceId?: Id<"workspaces"> | null
    /** Whether to apply theme automatically */
    autoApply?: boolean
}

/**
 * Hook to manage workspace-specific themes.
 * 
 * - Fetches effective theme for current workspace (with inheritance)
 * - Applies theme when workspace changes
 * - Falls back to user's global preference
 */
export function useWorkspaceTheme({
    workspaceId,
    autoApply = true,
}: UseWorkspaceThemeOptions = {}) {
    const { activeTheme, setActiveTheme } = useThemeConfig()

    // Get effective theme for workspace (with inheritance)
    const effectiveTheme = useQuery(
        api.workspace.storage.getWorkspaceEffectiveTheme,
        workspaceId ? { workspaceId } : "skip"
    )

    // Apply workspace theme when it changes
    useEffect(() => {
        if (!autoApply) return
        if (!effectiveTheme) return

        // Only apply if workspace has a theme set
        if (effectiveTheme.themePreset) {
            // Apply workspace theme (this overrides user preference temporarily)
            setActiveTheme(effectiveTheme.themePreset)
        }
        // If no workspace theme, keep user's global preference
    }, [effectiveTheme, autoApply, setActiveTheme])

    return {
        /** The resolved theme for current workspace */
        workspaceTheme: effectiveTheme?.themePreset ?? null,
        /** Which workspace the theme was inherited from (null = own theme) */
        inheritedFrom: effectiveTheme?.inheritedFrom ?? null,
        /** Whether workspace has its own theme (not inherited) */
        hasOwnTheme: effectiveTheme?.inheritedFrom === null && !!effectiveTheme?.themePreset,
        /** Current active theme (may be user global if workspace has no theme) */
        activeTheme,
    }
}

export default useWorkspaceTheme
