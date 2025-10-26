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

export interface Schema {
  version: string;
  root: string[];
  nodes: Record<string, SchemaNode>;
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
  type: 'text' | 'number' | 'select' | 'switch' | 'textarea' | 'custom' | 'nodeSelector';
  options?: string[];
  placeholder?: string;
  component?: React.ComponentType<any>;
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
