/**
 * ⚠️ TECHNICAL DEBT NOTICE ⚠️
 *
 * This file currently has CMS feature coupling that needs to be addressed.
 * Despite being in `frontend/shared/`, it imports from `frontend/features/cms/`.
 *
 * CURRENT COUPLING (lines 13-16):
 * - INITIAL_CMS_SCHEMA from cms/mockdata
 * - getWidgetConfig from cms/shared/registry
 * - CMSNode, CMSEdge, etc. types from cms/shared/types
 *
 * WHY THIS EXISTS:
 * SharedCanvasProvider was designed specifically for CMS use case and later
 * moved to shared folder to enable reuse. However, the core logic is still
 * tightly coupled to CMS data structures and widget registry.
 *
 * MIGRATION PLAN:
 * 1. Extract generic canvas types (Node, Edge, Schema) from CMS types
 * 2. Create CanvasConfigProvider interface for dependency injection
 * 3. Make INITIAL_SCHEMA and widgetConfigGetter optional props
 * 4. Move CMS-specific logic to CMSCanvasProvider wrapper
 *
 * FUTURE USAGE (after migration):
 * ```tsx
 * // Generic canvas
 * <SharedCanvasProvider
 *   initialSchema={mySchema}
 *   widgetConfigGetter={myConfigGetter}
 * >
 *   {children}
 * </SharedCanvasProvider>
 *
 * // CMS canvas (wrapper)
 * <CMSCanvasProvider>
 *   {children}
 * </CMSCanvasProvider>
 * ```
 *
 * ESTIMATED EFFORT: 1-2 days for full decoupling
 * PRIORITY: Medium (works fine for now, but limits reusability)
 *
 * See also:
 * - docs/architecture/shared-system-decoupling.md
 * - GitHub Issue #XXX: Decouple SharedCanvasProvider from CMS
 */

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from 'react';
import { addEdge, useNodesState, useEdgesState } from 'reactflow';
import type { Node, Edge, OnConnect, ReactFlowInstance } from 'reactflow';

// Builder foundation hooks
import {
  useBuilderHistory,
  useBuilderKeyboardShortcuts,
  type HistorySnapshot,
} from '@/frontend/features/builder/shared/hooks/useBuilderHistory';
import {
  useBuilderClipboard,
  useBuilderClipboardShortcuts,
} from '@/frontend/features/builder/shared/hooks/useBuilderClipboard';

// Import from builder feature (restored from archived CMS)
import { uid, clamp } from '@/lib/utils';
import type { CMSNode, CMSEdge, Schema, Workspace } from '@/frontend/features/builder/shared/types';
import { getWidgetConfig } from '@/frontend/features/builder/shared/registry';
import { INITIAL_CMS_SCHEMA } from '@/frontend/features/builder/mockdata';

interface ChildInfo {
  id: string;
  edgeId: string;
  label: string;
}

// Key used for localStorage
const STORAGE_KEY = "shadcn-cms-builder-sidebar-v3";

// Schema parser, kept here to avoid import cycles
const fromSchema = (schema: Schema): { nodes: CMSNode[], edges: CMSEdge[] } => {
  if (!schema || !schema.nodes || typeof schema.nodes !== 'object') {
    return { nodes: [], edges: [] };
  }

  const nodes: CMSNode[] = Object.entries(schema.nodes).map(([id, v], i) => {
    if (!v || typeof v !== 'object' || !v.type) {
      console.warn(`Skipping node with unknown type: ${v?.type}`);
      return null;
    }

    const config = getWidgetConfig(v.type);

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

interface SharedCanvasContextType {
  canvasMode: 'cms' | 'automation' | 'database';
  setCanvasMode: (mode: 'cms' | 'automation' | 'database') => void;
  nodes: Node<any>[];
  setNodes: React.Dispatch<React.SetStateAction<Node<any>[]>>;
  edges: Edge[];
  setEdges: React.Dispatch<React.SetStateAction<Edge[]>>;
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: OnConnect;
  selectedNodeId: string | null;
  setSelectedNodeId: React.Dispatch<React.SetStateAction<string | null>>;
  selectedNode: Node<any> | null;
  addNode: (nodeConfig: Partial<Node<any>>) => void;
  updateNodeData: (nodeId: string, data: any) => void;
  setNodeProps: (nodeId: string, props: Record<string, any>) => void;
  childrenOrdered: ChildInfo[];
  reorderChild: (from: number, to: number) => void;
  removeChildEdge: (edgeId: string) => void;
  removeSelectedNode: () => void;
  clearAll: () => void;
  loadFromStorage: () => void;
  saveToStorage: () => void;
  createNode: (compKey: string) => CMSNode;
  commands: {
    newWorkspace: () => void;
    newMenu: () => void;
    newPage: () => void;
  };
  activeWs: Workspace;
  setActiveWs: React.Dispatch<React.SetStateAction<Workspace>>;
  activeRoute: string;
  setActiveRoute: React.Dispatch<React.SetStateAction<string>>;
  menuOverride: string | null;
  setMenuOverride: React.Dispatch<React.SetStateAction<string | null>>;

  // Pin preview controls
  pin: (id: string) => void;
  unpin: (id: string) => void;
  isPinned: (id: string) => boolean;
  pinnedIds: string[];

  // History (undo/redo)
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;

  // Clipboard (copy/paste)
  copy: () => void;
  cut: () => void;
  paste: () => void;
  canPaste: boolean;
}

export const SharedCanvasContext = createContext<SharedCanvasContextType | undefined>(
  undefined
);

const newNode = (comp: string, pos = { x: 0, y: 0 }): CMSNode => {
  const config = getWidgetConfig(comp);
  return {
    id: uid(),
    type: "shadcnNode",
    position: pos,
    data: {
      comp,
      props: { ...config?.defaults }
    }
  };
};

export const SharedCanvasProvider: React.FC<{
  children: React.ReactNode;
  initialMode?: 'cms' | 'automation' | 'database';
}> = ({ children, initialMode = 'cms' }) => {
  const [canvasMode, setCanvasMode] = useState(initialMode);
  // Use proper generic types for React Flow state
  const [nodes, setNodes, onNodesChange] = useNodesState<any>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<{ order?: number }>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [activeWs, setActiveWs] = useState<Workspace>({ category: "personal", key: "" });
  const [activeRoute, setActiveRoute] = useState("/");
  const [menuOverride, setMenuOverride] = useState<string | null>(null);
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);

  const onConnect: OnConnect = useCallback((params) => {
    const already = edges.find((e) => e.target === params.target);
    if (already && canvasMode === 'cms') return;

    const maxOrder = Math.max(-1, ...edges.filter((e) => e.source === params.source).map((e: any) => e.data?.order ?? 0));
    const newEdge = { ...params, data: { order: maxOrder + 1 } };

    setEdges((eds) => addEdge(newEdge, eds));
  }, [edges, setEdges, canvasMode]);

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId) || null,
    [nodes, selectedNodeId]
  );

  const createNode = useCallback((compKey: string) => {
    const pos = reactFlowInstance.current?.project({ x: 140, y: 120 }) || { x: 140, y: 120 };
    const node = newNode(compKey, pos);
    setNodes((ns) => [...ns, node as Node<any>]);
    return node;
  }, [setNodes]);

  const addNode = useCallback((nodeConfig: Partial<Node<any>>) => {
    const compKey = (nodeConfig.data as any)?.comp || (nodeConfig.data as any)?.type;
    const config = compKey ? getWidgetConfig(String(compKey)) : undefined;
    const defaultProps = config?.defaults || {};

    const newNodeData = {
      comp: compKey,
      ...nodeConfig.data,
      props: { ...defaultProps, ...(nodeConfig.data as any)?.props },
    };

    const newN: Node<any> = {
      id: uid(),
      position: { x: 150, y: 150 },
      ...nodeConfig,
      data: newNodeData,
    };

    setNodes((nds) => [...nds, newN]);
  }, [setNodes]);

  const updateNodeData = useCallback((nodeId: string, data: any) => {
    setNodes((nds) => nds.map((node) => node.id === nodeId ? { ...node, data: { ...node.data, ...data } } : node));
  }, [setNodes]);

  const setNodeProps = (id: string, nextProps: Record<string, any>) => {
    setNodes((ns) => ns.map((n) => n.id === id ? { ...n, data: { ...n.data, props: nextProps } } : n));
  };

  const childrenOrdered = useMemo(() => {
    if (!selectedNode) return [];
    return edges
      .filter((e) => e.source === selectedNode.id)
      .sort((a, b) => (a.data?.order ?? 0) - (b.data?.order ?? 0))
      .map((e: any) => {
        const n = nodes.find((x) => x.id === e.target);
        const config = getWidgetConfig((n as any)?.data?.comp || '');
        return {
          id: e.target,
          edgeId: e.id,
          label: config?.label || (n as any)?.data?.comp || e.target,
        };
      });
  }, [edges, nodes, selectedNode]);

  const reorderChild = (from: number, to: number) => {
    if (!selectedNode) return;
    const list: any[] = edges
      .filter((e) => e.source === selectedNode.id)
      .sort((a, b) => (a.data?.order ?? 0) - (b.data?.order ?? 0));

    const nextTo = clamp(to, 0, list.length - 1);
    if (nextTo === from) return;

    const item = list.splice(from, 1)[0];
    list.splice(nextTo, 0, item);
    list.forEach((e, i) => { e.data = { ...e.data, order: i }; });

    setEdges((eds) => eds.map((e) => list.find((x) => x.id === e.id) || e));
  };

  const removeChildEdge = (edgeId: string) => {
    setEdges((eds) => eds.filter((e) => e.id !== edgeId));
  };

  const removeSelectedNode = () => {
    if (!selectedNode) return;
    const id = selectedNode.id;
    setEdges((eds) => eds.filter((e) => e.source !== id && e.target !== id));
    setNodes((ns) => ns.filter((n) => n.id !== id));
    setSelectedNodeId(null);
    setPinnedIds((ids) => ids.filter((x) => x !== id));
  };

  const clearAll = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setSelectedNodeId(null);
    setPinnedIds([]);
    localStorage.removeItem(STORAGE_KEY);
  }, [setNodes, setEdges]);

  const saveToStorage = useCallback(() => {
    if (!nodes.length && !edges.length) return;
    const dataToSave = { nodes, edges };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
  }, [nodes, edges]);

  const loadFromStorage = useCallback(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed?.nodes) && Array.isArray(parsed?.edges)) {
          setNodes(parsed.nodes);
          setEdges(parsed.edges);
          return;
        }
        if (parsed && parsed.nodes && typeof parsed.nodes === 'object' && !Array.isArray(parsed.nodes)) {
          const { nodes: ns, edges: es } = fromSchema(parsed);
          setNodes(ns as Node<any>[]);
          setEdges(es as Edge<{ order?: number }>[]);
          return;
        }
      } catch (error) {
        console.error('Failed to parse stored schema:', error);
        clearAll();
      }
    }
    const { nodes: ns, edges: es } = fromSchema(INITIAL_CMS_SCHEMA);
    setNodes(ns as Node<any>[]);
    setEdges(es as Edge<{ order?: number }>[]);
  }, [setNodes, setEdges, clearAll]);

  const commands = useMemo(() => ({
    newWorkspace: () => {
      const ws = createNode("navNode");
      setNodeProps(ws.id, { ...ws.data.props, kind: "workspace", category: "family", key: "Smiths" });
    },
    newMenu: () => {
      const menu = createNode("navNode");
      setNodeProps(menu.id, { ...menu.data.props, kind: "menu", title: "Menu " + Math.random().toString(36).slice(2, 5) });
    },
    newPage: () => {
      const path = "/page-" + Math.random().toString(36).slice(2, 6);
      // Use section instead of container
      const section = createNode("section");
      setNodeProps(section.id, { ...section.data.props, path });
      const hero = createNode("hero");
      onConnect({ source: section.id, target: hero.id, sourceHandle: null, targetHandle: null });

      const firstMenu = nodes.find(n => (n as any).data.comp === 'navNode' && (n as any).data.props.kind === 'menu');
      if (firstMenu) {
        onConnect({ source: (firstMenu as any).id, target: section.id, sourceHandle: null, targetHandle: null });
      }
      setActiveRoute(path);
    },
  }), [createNode, setNodeProps, onConnect, nodes, setActiveRoute]);

  const pin = (id: string) => setPinnedIds((ids) => (ids.includes(id) ? ids : [...ids, id]));
  const unpin = (id: string) => setPinnedIds((ids) => ids.filter((x) => x !== id));
  const isPinned = (id: string) => pinnedIds.includes(id);

  // History hook for undo/redo
  const { pushSnapshot, undo: undoHistory, redo: redoHistory, canUndo, canRedo } = useBuilderHistory();

  // Track state changes for history
  const prevStateRef = useRef<{ nodes: Node<any>[]; edges: Edge[] }>({ nodes: [], edges: [] });

  useEffect(() => {
    // Only push snapshot if state has actually changed
    const nodesChanged = JSON.stringify(nodes) !== JSON.stringify(prevStateRef.current.nodes);
    const edgesChanged = JSON.stringify(edges) !== JSON.stringify(prevStateRef.current.edges);

    if (nodesChanged || edgesChanged) {
      pushSnapshot({ nodes: prevStateRef.current.nodes, edges: prevStateRef.current.edges });
      prevStateRef.current = { nodes, edges };
    }
  }, [nodes, edges, pushSnapshot]);

  // Undo: restore previous state
  const undo = useCallback(() => {
    const snapshot = undoHistory();
    if (snapshot) {
      setNodes(snapshot.nodes);
      setEdges(snapshot.edges);
      prevStateRef.current = { nodes: snapshot.nodes, edges: snapshot.edges };
    }
  }, [undoHistory, setNodes, setEdges]);

  // Redo: restore next state
  const redo = useCallback(() => {
    const snapshot = redoHistory();
    if (snapshot) {
      setNodes(snapshot.nodes);
      setEdges(snapshot.edges);
      prevStateRef.current = { nodes: snapshot.nodes, edges: snapshot.edges };
    }
  }, [redoHistory, setNodes, setEdges]);

  // Clipboard hook
  const {
    copy: clipboardCopy,
    cut: clipboardCut,
    paste: clipboardPaste,
    canPaste,
  } = useBuilderClipboard(nodes, edges);

  // Get currently selected node IDs
  const getSelectedNodeIds = useCallback(() => {
    const selected = nodes.filter(n => n.selected).map(n => n.id);
    if (selected.length === 0 && selectedNodeId) {
      return [selectedNodeId];
    }
    return selected;
  }, [nodes, selectedNodeId]);

  // Clipboard operations
  const copy = useCallback(() => {
    clipboardCopy(getSelectedNodeIds());
  }, [clipboardCopy, getSelectedNodeIds]);

  const cut = useCallback(() => {
    const { nodes: nodesToRemove, edges: edgesToRemove } = clipboardCut(getSelectedNodeIds());
    if (nodesToRemove.length > 0) {
      const nodeIds = new Set(nodesToRemove.map(n => n.id));
      setNodes(ns => ns.filter(n => !nodeIds.has(n.id)));
      setEdges(es => es.filter(e => !nodeIds.has(e.source) && !nodeIds.has(e.target)));
      setSelectedNodeId(null);
    }
  }, [clipboardCut, getSelectedNodeIds, setNodes, setEdges, setSelectedNodeId]);

  const paste = useCallback(() => {
    const result = clipboardPaste();
    if (result) {
      setNodes(ns => [...ns.map(n => ({ ...n, selected: false })), ...result.nodes]);
      setEdges(es => [...es, ...result.edges]);
      // Select the first pasted node
      if (result.nodes.length > 0) {
        setSelectedNodeId(result.nodes[0].id);
      }
    }
  }, [clipboardPaste, setNodes, setEdges, setSelectedNodeId]);

  // Keyboard shortcuts
  useBuilderKeyboardShortcuts(undo, redo, true);
  useBuilderClipboardShortcuts(copy, cut, paste, true);

  const value = {
    canvasMode,
    setCanvasMode,
    nodes,
    setNodes,
    edges,
    setEdges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    selectedNodeId,
    setSelectedNodeId,
    selectedNode,
    addNode,
    updateNodeData,
    setNodeProps,
    childrenOrdered,
    reorderChild,
    removeChildEdge,
    removeSelectedNode,
    clearAll,
    loadFromStorage,
    saveToStorage,
    createNode,
    commands,
    activeWs,
    setActiveWs,
    activeRoute,
    setActiveRoute,
    menuOverride,
    setMenuOverride,
    pin,
    unpin,
    isPinned,
    pinnedIds,
    // History
    undo,
    redo,
    canUndo,
    canRedo,
    // Clipboard
    copy,
    cut,
    paste,
    canPaste,
  };

  return (
    <SharedCanvasContext.Provider value={value}>
      {children}
    </SharedCanvasContext.Provider>
  );
};

export const useSharedCanvas = () => {
  const context = useContext(SharedCanvasContext);
  if (!context) {
    throw new Error('useSharedCanvas must be used within a SharedCanvasProvider');
  }
  return context;
};

export const useOptionalSharedCanvas = () => {
  return useContext(SharedCanvasContext);
};

export { fromSchema };
