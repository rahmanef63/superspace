/**
 * Node Manifest Types for Automation Module
 * 
 * Re-exports shared foundation types and adds automation-specific extensions.
 */

import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import type {
    InspectorField as SharedInspectorField,
    ComponentConfig as SharedComponentConfig,
} from '@/frontend/shared/foundation';

// Re-export shared types
export type { SharedInspectorField as InspectorField };
export type { SharedComponentConfig as ComponentConfig };

// ============================================================================
// Node Category Types
// ============================================================================

export type NodeCategory =
    | 'Trigger'
    | 'HTTP'
    | 'Data'
    | 'Logic'
    | 'Integration'
    | 'AI'
    | 'Error';

export const NODE_CATEGORY_COLORS: Record<NodeCategory, string> = {
    Trigger: 'green',
    HTTP: 'blue',
    Data: 'cyan',
    Logic: 'yellow',
    Integration: 'orange',
    AI: 'pink',
    Error: 'red',
};

// ============================================================================
// Inspector Section (grouping fields)
// ============================================================================

export interface InspectorSection {
    title: string;
    fields: SharedInspectorField[];
    collapsed?: boolean;
}

export interface InspectorConfig {
    fields?: SharedInspectorField[];
    sections?: InspectorSection[];
}

// ============================================================================
// Prop Definition (Single Source of Truth for node properties)
// ============================================================================

export type PropType = 'text' | 'number' | 'switch' | 'select' | 'textarea' | 'code' | 'color' | 'slider';

export interface PropDefinition {
    /** Field type for inspector UI */
    type: PropType;
    /** Default value for this prop */
    default: any;
    /** Display label (auto-generated from key if not provided) */
    label?: string;
    /** Help text shown in inspector */
    description?: string;
    /** Placeholder text for input fields */
    placeholder?: string;
    /** Options for 'select' type */
    options?: string[];
    /** Hide from inspector UI */
    hidden?: boolean;
    /** Show in "Advanced" section */
    advanced?: boolean;
    /** Min value for number/slider */
    min?: number;
    /** Max value for number/slider */
    max?: number;
    /** Step for number/slider */
    step?: number;
}

export type PropsConfig = Record<string, PropDefinition>;

// ============================================================================
// Node Manifest
// ============================================================================

export interface NodeManifest {
    // Identity
    key: string;
    label: string;
    category: NodeCategory;
    description: string;
    icon?: LucideIcon;

    // NEW: Single source of truth for props (replaces defaults + inspector)
    props?: PropsConfig;

    // LEGACY: Keep for backward compatibility
    defaults?: Record<string, any>;
    inspector?: InspectorConfig;

    // Optional Rendering
    render?: (props: NodeRenderProps) => ReactNode;

    // Execution (optional - uses shared executor if not provided)
    execute?: NodeExecutor;
    validate?: NodeValidator;
}

export interface NodeRenderProps {
    id: string;
    data: {
        type: string;
        props: Record<string, any>;
        category?: string;
        label?: string;
    };
    selected?: boolean;
}

export type NodeExecutor = (input: NodeExecutorInput) => Promise<NodeExecutorOutput>;

export interface NodeExecutorInput {
    node: { id: string; type: string; data: any };
    context: Record<string, any>;
    previousOutput?: any;
}

export interface NodeExecutorOutput {
    data?: Record<string, any>;
    meta?: Record<string, any>;
    output?: any;
    error?: string;
}

export type NodeValidator = (node: any, flow: any) => ValidationResult;

export interface ValidationResult {
    valid: boolean;
    errors?: string[];
    warnings?: string[];
}

// ============================================================================
// Registry Types
// ============================================================================

export interface NodeRegistry {
    manifests: Record<string, NodeManifest>;
    getManifest: (key: string) => NodeManifest | undefined;
    getByCategory: (category: NodeCategory) => NodeManifest[];
    register: (manifest: NodeManifest) => void;
}
