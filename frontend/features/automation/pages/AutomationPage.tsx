import React, { useEffect, useCallback, useState } from 'react';
import type { Id } from "@convex/_generated/dataModel";
import { SharedCanvasProvider, useSharedCanvas } from '@/frontend/shared/builder';
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from '@/components/ui/resizable';
import { Card, CardTitle, Button, Input, Label } from '@/components/ui';
import { ThreeColumnLayoutAdvanced } from '@/frontend/shared/ui/layout/container';
import {
  Layout,
  Settings,
  Trash2,
  Pin,
  PinOff,
  Play,
  Pause,
  CheckCircle2,
  FileJson2,
  Upload,
  RotateCcw,
  Zap,
} from 'lucide-react';

import { SharedCanvas } from '@/frontend/shared/ui';
import { UnifiedLibrary } from '@/frontend/shared/builder';
import { ExecutionPanel } from '@/frontend/shared/builder/flows';
import { AutomationNode } from '../components/AutomationNode';
import { AutomationInspector } from '../components/AutomationInspector';
import { TemplatesGallery } from '../components/TemplatesGallery';

import { useCrossFeatureRegistry } from '@/frontend/shared/foundation';
import { registerAutomationNodes } from '../nodes/registry';
import { registerAutomationLibraryTabs } from '../registry/automationLibraryTabs';
import { DnDProvider } from '@/frontend/shared/builder';
import { useAutomationExecution } from '../hooks/useAutomationExecution';

const nodeTypes = {
  automationNode: AutomationNode,
};

// ============================================================================
// Left Panel - Library with tabs (matching CMSBuilderPage pattern)
// ============================================================================

interface LeftTabsProps {
  active: 'nodes' | 'templates' | 'settings';
  setActive: (t: 'nodes' | 'templates' | 'settings') => void;
  onAddNode: (compKey: string) => void;
  onImportTemplate: (template: any) => void;
}

const LeftTabs: React.FC<LeftTabsProps> = ({ active, setActive, onAddNode, onImportTemplate }) => {
  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <div className="p-2 border-b flex items-center justify-between">
        <div className="text-sm font-semibold">
          {active === 'nodes' && 'Node Library'}
          {active === 'templates' && 'Templates'}
          {active === 'settings' && 'Settings'}
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant={active === 'nodes' ? 'default' : 'ghost'}
            size="icon"
            className="h-7 w-7"
            onClick={() => setActive('nodes')}
            title="Node Library"
          >
            <Layout size={14} />
          </Button>
          <Button
            variant={active === 'templates' ? 'default' : 'ghost'}
            size="icon"
            className="h-7 w-7"
            onClick={() => setActive('templates')}
            title="Templates"
          >
            <Zap size={14} />
          </Button>
          <Button
            variant={active === 'settings' ? 'default' : 'ghost'}
            size="icon"
            className="h-7 w-7"
            onClick={() => setActive('settings')}
            title="Workflow Settings"
          >
            <Settings size={14} />
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        {active === 'nodes' && (
          <div className="h-full">
            <UnifiedLibrary currentFeature="automation" onAdd={onAddNode} />
          </div>
        )}
        {active === 'templates' && (
          <div className="h-full">
            <TemplatesGallery onImport={onImportTemplate} />
          </div>
        )}
        {active === 'settings' && (
          <div className="h-full p-3 space-y-4 overflow-auto">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Workflow Settings
            </div>
            <div className="space-y-3">
              <div>
                <Label className="text-xs">Workflow Name</Label>
                <Input placeholder="My Automation Workflow" className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Description</Label>
                <Input placeholder="Workflow description..." className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Timeout (ms)</Label>
                <Input type="number" defaultValue={30000} className="mt-1" />
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

// ============================================================================
// Right Panel - Inspector with actions (matching CMSBuilderPage pattern)
// ============================================================================

interface RightPanelProps {
  selectedNodeId: string | null;
  isPinned: (id: string) => boolean;
  pin: (id: string) => void;
  unpin: (id: string) => void;
  removeSelectedNode: () => void;
}

const RightPanel: React.FC<RightPanelProps> = ({
  selectedNodeId,
  isPinned,
  pin,
  unpin,
  removeSelectedNode,
}) => {
  return (
    <Card className="h-full flex flex-col border-0 rounded-none">
      <div className="p-3 border-b flex items-center justify-between">
        <CardTitle className="text-sm">Inspector</CardTitle>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              selectedNodeId &&
              (isPinned(selectedNodeId) ? unpin(selectedNodeId) : pin(selectedNodeId))
            }
            disabled={!selectedNodeId}
            className="h-7 w-7 p-0"
            title={selectedNodeId && isPinned(selectedNodeId) ? 'Unpin' : 'Pin'}
          >
            {selectedNodeId && isPinned(selectedNodeId) ? (
              <PinOff size={14} />
            ) : (
              <Pin size={14} />
            )}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={removeSelectedNode}
            disabled={!selectedNodeId}
            className="h-7 w-7 p-0"
            title="Delete Node"
          >
            <Trash2 size={14} />
          </Button>
        </div>
      </div>
      <AutomationInspector />
    </Card>
  );
};

// ============================================================================
// Top Bar Controls
// ============================================================================

interface TopBarProps {
  status: string;
  onValidate: () => void;
  onRun: () => void;
  onStop: () => void;
  onExport: () => void;
  onImport: () => void;
  onClear: () => void;
}

const TopBar: React.FC<TopBarProps> = ({
  status,
  onValidate,
  onRun,
  onStop,
  onExport,
  onImport,
  onClear,
}) => {
  const isRunning = status === 'running' || status === 'validating';

  return (
    <div className="flex-shrink-0 flex items-center justify-between border-b border-border bg-background/70 px-4 py-2 backdrop-blur z-10">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          <span className="font-semibold">Automation Builder</span>
        </div>
        <span className="text-xs text-muted-foreground">Visual Workflow Editor</span>
      </div>

      <div className="flex items-center gap-2">
        {/* Status */}
        <div className={`text-xs px-2 py-1 rounded ${status === 'success' ? 'bg-green-100 text-green-700' :
          status === 'failed' ? 'bg-red-100 text-red-700' :
            status === 'running' ? 'bg-blue-100 text-blue-700' :
              'bg-muted text-muted-foreground'
          }`}>
          {status === 'idle' ? 'Draft' : status.charAt(0).toUpperCase() + status.slice(1)}
        </div>

        <div className="w-px h-6 bg-border" />

        {/* Actions */}
        <Button variant="outline" size="sm" onClick={onExport} disabled={isRunning} className="h-8">
          <FileJson2 className="w-4 h-4 mr-1" />
          Export
        </Button>
        <Button variant="outline" size="sm" onClick={onImport} disabled={isRunning} className="h-8">
          <Upload className="w-4 h-4 mr-1" />
          Import
        </Button>
        <Button variant="outline" size="sm" onClick={onClear} disabled={isRunning} className="h-8 text-destructive hover:text-destructive">
          <RotateCcw className="w-4 h-4 mr-1" />
          Clear
        </Button>

        <div className="w-px h-6 bg-border" />

        <Button variant="outline" size="sm" onClick={onValidate} disabled={isRunning} className="h-8">
          <CheckCircle2 className="w-4 h-4 mr-1" />
          Validate
        </Button>

        {isRunning ? (
          <Button variant="destructive" size="sm" onClick={onStop} className="h-8">
            <Pause className="w-4 h-4 mr-1" />
            Stop
          </Button>
        ) : (
          <Button size="sm" onClick={onRun} className="h-8 bg-green-600 hover:bg-green-700">
            <Play className="w-4 h-4 mr-1" />
            Run
          </Button>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// Main Layout Inner Component
// ============================================================================

interface AutomationLayoutProps {
  workspaceId: Id<"workspaces">;
}

const AutomationLayoutInner: React.FC<AutomationLayoutProps> = ({ workspaceId }) => {
  void workspaceId;

  const {
    selectedNodeId,
    createNode,
    removeSelectedNode,
    isPinned,
    pin,
    unpin,
    setNodes,
    setEdges,
  } = useSharedCanvas();

  const {
    status,
    result,
    logs,
    steps,
    validate,
    run,
    stop,
    clearLogs,
    exportFlow,
    importFlow,
    clearFlow,
  } = useAutomationExecution();

  const [leftTab, setLeftTab] = useState<'nodes' | 'templates' | 'settings'>('nodes');

  // Handle add node from library
  const handleAddNode = useCallback((compKey: string) => {
    createNode(compKey);
  }, [createNode]);

  // Handle import template
  const handleImportTemplate = useCallback((template: any) => {
    // Clear existing flow first
    clearFlow();

    // Generate unique IDs for nodes
    const idMap: Record<string, string> = {};
    const newNodes = template.nodes.map((templateNode: any) => {
      const newId = `${templateNode.id}-${Date.now()}`;
      idMap[templateNode.id] = newId;

      return {
        id: newId,
        type: 'automationNode', // Use correct node type!
        position: templateNode.position,
        data: {
          type: templateNode.data.type,
          category: templateNode.data.category,
          props: templateNode.data.props || {},
        },
      };
    });

    // Create edges with new IDs
    const newEdges = template.edges.map((templateEdge: any, idx: number) => ({
      id: `e-${Date.now()}-${idx}`,
      source: idMap[templateEdge.source],
      target: idMap[templateEdge.target],
    }));

    // Set nodes and edges directly
    setNodes(newNodes);
    setEdges(newEdges);
    // Keep templates tab open for user to import more if desired
  }, [clearFlow, setNodes, setEdges]);

  // Handle import with prompt
  const handleImport = useCallback(() => {
    const json = prompt('Paste workflow JSON:');
    if (json) {
      importFlow(json);
    }
  }, [importFlow]);

  // Handle clear with confirmation
  const handleClear = useCallback(() => {
    if (confirm('Clear workflow? This cannot be undone.')) {
      clearFlow();
    }
  }, [clearFlow]);

  return (
    <div className="h-full w-full bg-muted flex flex-col">
      {/* Top Bar */}
      <TopBar
        status={status}
        onValidate={validate}
        onRun={run}
        onStop={stop}
        onExport={exportFlow}
        onImport={handleImport}
        onClear={handleClear}
      />

      {/* Main 3-pane layout using ThreeColumnLayoutAdvanced (matching CMSBuilderPage) */}
      <div className="flex-1 overflow-hidden">
        <ThreeColumnLayoutAdvanced
          preset="ide"
          left={
            <LeftTabs
              active={leftTab}
              setActive={setLeftTab}
              onAddNode={handleAddNode}
              onImportTemplate={handleImportTemplate}
            />
          }
          center={
            <Card className="h-full overflow-hidden border-0 rounded-none">
              <ResizablePanelGroup direction="vertical" className="h-full">
                <ResizablePanel defaultSize={65}>
                  <SharedCanvas nodeTypes={nodeTypes} showLayoutControls={true} />
                </ResizablePanel>

                <ResizableHandle withHandle />

                <ResizablePanel defaultSize={35} minSize={15}>
                  <ExecutionPanel
                    result={result}
                    logs={logs}
                    steps={steps}
                    onClearLogs={clearLogs}
                  />
                </ResizablePanel>
              </ResizablePanelGroup>
            </Card>
          }
          right={
            <RightPanel
              selectedNodeId={selectedNodeId}
              isPinned={isPinned}
              pin={pin}
              unpin={unpin}
              removeSelectedNode={removeSelectedNode}
            />
          }
          rightWidth={320}
          persistState={true}
          storageKey="automation-layout"
          leftLabel="Library"
          centerLabel="Canvas"
          rightLabel="Inspector"
        />
      </div>
    </div>
  );
};

// ============================================================================
// Exports
// ============================================================================

export interface AutomationPageProps {
  workspaceId: Id<"workspaces">;
}

export const AutomationPage: React.FC<AutomationPageProps> = ({ workspaceId }) => {
  const { registerComponent, registerFeatureTabs } = useCrossFeatureRegistry();

  useEffect(() => {
    registerAutomationNodes(registerComponent);
    registerAutomationLibraryTabs(registerFeatureTabs);
  }, [registerComponent, registerFeatureTabs]);

  return (
    <SharedCanvasProvider initialMode="automation">
      <DnDProvider>
        <AutomationLayoutInner workspaceId={workspaceId} />
      </DnDProvider>
    </SharedCanvasProvider>
  );
};
