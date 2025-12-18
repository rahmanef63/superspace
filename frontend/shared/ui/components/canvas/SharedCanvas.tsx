import React, { useCallback, useRef } from 'react';
import ReactFlow, {
  Background,
  MiniMap,
  useReactFlow,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useSharedCanvas, useDnD, getLayoutedElements } from '@/frontend/shared/builder';
import { CanvasToolbar } from './CanvasToolbar';

interface SharedCanvasProps {
  nodeTypes: Record<string, React.ComponentType<any>>;
  edgeTypes?: Record<string, React.ComponentType<any>>;
  onNodeSelect?: (nodeId: string | null) => void;
  showLayoutControls?: boolean;
  className?: string;
  onCanvasContextMenu?: (e: React.MouseEvent) => void;
  onExternalDrop?: (e: React.DragEvent) => boolean | void;
}

const SharedCanvasInner: React.FC<SharedCanvasProps> = ({
  nodeTypes,
  edgeTypes,
  onNodeSelect,
  showLayoutControls = true,
  className = "",
  onCanvasContextMenu,
  onExternalDrop,
}) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    setNodes,
    setEdges,
    onConnect,
    setSelectedNodeId,
    addNode
  } = useSharedCanvas();

  const { screenToFlowPosition } = useReactFlow();
  const [type] = useDnD();

  const onNodeClick = useCallback((event: React.MouseEvent, node: any) => {
    setSelectedNodeId(node.id);
    onNodeSelect?.(node.id);
  }, [setSelectedNodeId, onNodeSelect]);

  const onPaneClick = useCallback(() => {
    setSelectedNodeId(null);
    onNodeSelect?.(null);
  }, [setSelectedNodeId, onNodeSelect]);

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();

    if (onExternalDrop) {
      const handled = onExternalDrop(event);
      if (handled) return;
    }

    if (!type) {
      return;
    }

    const position = screenToFlowPosition({
      x: event.clientX,
      y: event.clientY,
    });

    addNode({
      type: nodeTypes[type] ? type : Object.keys(nodeTypes)[0] || 'default',
      position,
      data: {
        comp: type,
        type,
        props: {},
      },
    });
  }, [screenToFlowPosition, type, addNode, nodeTypes, onExternalDrop]);

  const onLayout = useCallback((direction: 'TB' | 'LR' | 'RL' | 'BT') => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      nodes,
      edges,
      direction,
    );

    setNodes([...layoutedNodes]);
    setEdges([...layoutedEdges]);
  }, [nodes, edges, setNodes, setEdges]);

  const handleContextMenu = (e: React.MouseEvent) => {
    if (onCanvasContextMenu) {
      e.preventDefault();
      onCanvasContextMenu(e);
    }
  };

  return (
    <div className={`h-full w-full ${className}`} ref={reactFlowWrapper} onContextMenu={handleContextMenu}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        className="bg-muted/30"
      >
        <Background />
        <MiniMap className="!bg-background/80 !border-border" />
        <CanvasToolbar onLayout={onLayout} showLayoutControls={showLayoutControls} />
      </ReactFlow>
    </div>
  );
};

export const SharedCanvas: React.FC<SharedCanvasProps> = (props) => {
  return (
    <ReactFlowProvider>
      <SharedCanvasInner {...props} />
    </ReactFlowProvider>
  );
};
