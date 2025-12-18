/**
 * Studio Library Tabs - Optimized with Lucide Icons
 * 
 * Consolidated tabs for maximum usability.
 * Uses lucide-react icons for consistent shadcn design.
 */

import type { FeatureTab } from '@/frontend/shared/foundation';
import {
    LayoutGrid,
    Type,
    Component,
    FormInput,
    Boxes,
    Workflow,
    Search,
} from 'lucide-react';

// Export icons for use in UnifiedLibrary
export const STUDIO_TAB_ICONS = {
    structure: LayoutGrid,
    content: Type,
    elements: Component,
    forms: FormInput,
    blocks: Boxes,
    workflow: Workflow,
    all: Search,
} as const;

export function registerStudioLibraryTabs(
    registerFeatureTabs: (feature: string, tabs: FeatureTab[]) => void
): void {
    const studioLibraryTabs: FeatureTab[] = [
        // ========================================
        // STRUCTURE - Page layout building blocks
        // ========================================
        {
            id: 'structure',
            label: 'Structure',
            feature: 'studio',
            categories: ['Layout'],
        },

        // ========================================
        // CONTENT - Text, media, and display elements
        // ========================================
        {
            id: 'content',
            label: 'Content',
            feature: 'studio',
            categories: ['Content', 'Media', 'Navigation'],
        },

        // ========================================
        // ELEMENTS - UI components and actions
        // ========================================
        {
            id: 'elements',
            label: 'Elements',
            feature: 'studio',
            categories: ['UI', 'Components', 'Action', 'Templates'],
        },

        // ========================================
        // FORMS - Input and form components
        // ========================================
        {
            id: 'forms',
            label: 'Forms',
            feature: 'studio',
            categories: ['Form', 'Forms', 'Input'],
        },

        // ========================================
        // BLOCKS - Data-connected smart blocks
        // ========================================
        {
            id: 'blocks',
            label: 'Blocks',
            feature: 'studio',
            categories: ['Blocks'],
        },

        // ========================================
        // WORKFLOW - Automation and logic nodes
        // ========================================
        {
            id: 'workflow',
            label: 'Workflow',
            feature: 'studio',
            categories: ['Trigger', 'HTTP', 'Data', 'Logic', 'Integration', 'AI', 'LLM', 'Error'],
        },

        // ========================================
        // ALL - Discovery mode (search everything)
        // ========================================
        {
            id: 'all',
            label: 'All',
            feature: 'studio',
            categories: [
                // Structure
                'Layout',
                // Content
                'Content', 'Media', 'Navigation',
                // Elements
                'UI', 'Components', 'Action', 'Templates',
                // Forms
                'Form', 'Forms', 'Input',
                // Blocks
                'Blocks',
                // Workflow
                'Trigger', 'HTTP', 'Data', 'Logic', 'Integration', 'AI', 'LLM', 'Error'
            ],
        },
    ];

    registerFeatureTabs('studio', studioLibraryTabs);
}
