/**
 * Builder Foundation Exports
 * 
 * SSOT: Single public API for other features to consume builder functionality
 * 
 * This file provides a clean, stable API for cross-feature integration.
 * Other features should ONLY import from this file, not from internal paths.
 * 
 * @example
 * import { 
 *   useBuilderHistory, 
 *   useBuilderClipboard, 
 *   WidgetConfig,
 *   InspectorField 
 * } from '@/frontend/features/builder/foundation-exports';
 */

// ============================================================
// Types (SSOT for all builder-related types)
// ============================================================
export type {
    Position,
    NodeData,
    CMSNode,
    CMSEdge,
    SchemaNode,
    Schema,
    Workspace,
    WidgetConfig,
    InspectorField,
    LibraryTab,
} from './shared/types';

// ============================================================
// Canvas Hooks (for building canvas-based features)
// ============================================================
export {
    useBuilderHistory,
    useBuilderKeyboardShortcuts,
    type HistorySnapshot,
    type UseBuilderHistoryOptions,
    type UseBuilderHistoryReturn,
} from './shared/hooks/useBuilderHistory';

export {
    useBuilderClipboard,
    useBuilderClipboardShortcuts,
    type ClipboardData,
    type UseBuilderClipboardOptions,
    type UseBuilderClipboardReturn,
} from './shared/hooks/useBuilderClipboard';

// ============================================================
// Widget Utilities (for creating custom widgets)
// ============================================================
export {
    standardizeWidget,
    devValidateRegistry,
} from './shared/utils/widgetValidation';

export {
    createWidgetFactory,
} from './shared/utils/widgetFactory';

export {
    renderIcon,
    getIconComponent,
} from './shared/utils/iconUtils';

// ============================================================
// Inspector Utilities (for building inspectors)
// ============================================================
export {
    standardTextFields,
    standardLayoutFields,
    standardStyleFields,
} from './shared/inspector/standardFields';

// ============================================================
// Registry Access (for widget discovery)
// ============================================================
export {
    cmsWidgetRegistry,
    widgetCategories,
    widgetStats,
} from './widgets/registry';

export {
    getWidgetConfig,
    getWidgetKeys,
} from './shared/registry';

// ============================================================
// Schema Utilities (for schema manipulation)
// ============================================================
export {
    useSchema,
    toSchema,
} from './shared/hooks/useSchema';

export {
    useSchemaParser,
    fromSchema,
} from './shared/hooks/useSchemaParser';

// ============================================================
// Template Management
// ============================================================
export {
    getDefaultTemplates,
    getTemplateByKey,
    getAssetTemplates,
    saveAssetTemplate,
    deleteAssetTemplate,
    isBuiltinKey,
    instantiateDefaultTemplate,
} from './state/templateStore';

// ============================================================
// SSOT Constants
// ============================================================

/** Widget categories for grouping in library */
export const WIDGET_CATEGORIES = [
    'Layout',
    'Content',
    'Media',
    'Action',
    'Navigation',
    'UI',
    'Templates',
] as const;

/** Inspector field types */
export const INSPECTOR_FIELD_TYPES = [
    'text',
    'number',
    'select',
    'switch',
    'textarea',
    'custom',
] as const;

/** Canvas modes */
export const CANVAS_MODES = [
    'cms',
    'automation',
    'database',
] as const;

export type WidgetCategory = typeof WIDGET_CATEGORIES[number];
export type InspectorFieldType = typeof INSPECTOR_FIELD_TYPES[number];
export type CanvasMode = typeof CANVAS_MODES[number];
