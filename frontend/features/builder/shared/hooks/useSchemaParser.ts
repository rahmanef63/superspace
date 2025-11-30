import { useMemo } from 'react';
import type { Schema, CMSNode, CMSEdge } from '../types';
import { uid } from '@/lib/utils';
import { getWidgetConfig } from '@/frontend/features/builder/shared/registry';

export const fromSchema = (schema: Schema): { nodes: CMSNode[], edges: CMSEdge[] } => {
  if (!schema || !schema.nodes || typeof schema.nodes !== 'object') {
    return { nodes: [], edges: [] };
  }
  
  const nodes: CMSNode[] = Object.entries(schema.nodes).map(([id, v], i) => {
    if (!v || typeof v !== 'object' || !v.type) {
      console.warn(`Skipping node with unknown type: ${v.type}`);
      return null;
    }
    
    const config = getWidgetConfig(v.type);
    if (!config) {
      console.warn(`Skipping node with unregistered type: ${v.type}`);
      return null;
    }
    
    return {
      id,
      type: "shadcnNode",
      position: { 
        x: 120 + (i % 6) * 240, 
        y: 120 + Math.floor(i / 6) * 160 
      },
      data: { 
        comp: v.type, 
        props: { 
          ...config?.defaults, 
          ...(v.props || {}) 
        } 
      },
    };
  }).filter(Boolean) as CMSNode[];

  const edges: CMSEdge[] = [];
  Object.entries(schema.nodes).forEach(([id, v]) => {
    if (!v || !Array.isArray(v.children)) return;
    
    v.children.forEach((childId, idx) => {
      if (typeof childId === 'string' && nodes.some(n => n.id === childId)) {
        edges.push({ 
          id: uid(), 
          source: id, 
          target: childId, 
          data: { order: idx }, 
          animated: false 
        });
      }
    });
  });

  return { nodes, edges };
};

export const useSchemaParser = (schema: Schema) => {
  return useMemo(() => fromSchema(schema), [schema]);
};
