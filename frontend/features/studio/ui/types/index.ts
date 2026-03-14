import type React from 'react';

export interface Position {
  x: number;
  y: number;
}

export interface NodeData {
  comp: string;
  props: Record<string, any>;
}

export interface CMSNode {
  id: string;
  type: string;
  position: Position;
  data: NodeData;
}

export interface CMSEdge {
  id: string;
  source: string;
  target: string;
  data?: {
    order?: number;
  };
  animated?: boolean;
}

export interface SchemaNode {
  type: string;
  props: Record<string, any>;
  children: string[];
}

/**
 * UI JSON Schema
 *
 * v0.4 → v0.5: added optional `metadata` block for name/description/author/tags.
 * All v0.4 documents (without metadata) remain valid — metadata is optional.
 */
export interface Schema {
  /** Schema version. "0.5" adds metadata; "0.4" is still accepted. */
  version: string;
  /** Top-level node IDs (page roots) */
  root: string[];
  /** All nodes keyed by stable ID */
  nodes: Record<string, SchemaNode>;
  /**
   * Optional project metadata.
   * Consistent with StudioProjectMetadata in workflow/schema/studio-unified.types.ts.
   */
  metadata?: {
    id?: string;
    name?: string;
    description?: string;
    author?: string;
    tags?: string[];
    version?: string;
    createdAt?: string;
    updatedAt?: string;
  };
}

export interface Workspace {
  category: string;
  key: string;
}

export interface WidgetConfig {
  label: string;
  category: string;
  description?: string;
  icon?: React.ComponentType<any> | string;
  defaults: Record<string, any>;
  render: (props: Record<string, any>, children?: React.ReactNode, helpers?: any) => React.ReactNode;
  inspector?: {
    fields: InspectorField[];
  };
  autoConnect?: {
    [key: string]: {
      type: string;
      props?: Record<string, any>;
    };
  };
  previewImage?: string;
  tags?: string[];
}

export interface InspectorField {
  key: string;
  label: string;
  type:
    | 'text'
    | 'number'
    | 'select'
    | 'switch'
    | 'textarea'
    | 'custom'
    | 'nodeSelector'
    | 'slider'
    | 'color'
    | 'checkbox'
    | 'button'
    | 'buttonGroup'
    | 'range';
  options?: string[];
  placeholder?: string;
  component?: React.ComponentType<any>;
  min?: number;
  max?: number;
  step?: number;
  buttonLabel?: string;
  buttonVariant?: 'default' | 'outline' | 'ghost' | 'destructive';
  onButtonClick?: () => void;
  buttons?: Array<{ value: string; label: string; icon?: React.ComponentType<any> }>;
  required?: boolean;
}

export interface ChildInfo {
  id: string;
  label: string;
  edgeId: string;
}

export interface LibraryTab {
  id: string;
  label: string;
  categories?: string[];
}
