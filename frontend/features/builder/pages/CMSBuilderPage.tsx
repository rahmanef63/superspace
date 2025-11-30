import React, { useEffect, useMemo, useState } from "react";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
  Card,
  CardTitle,
  Button,
  Input,
  Label,
} from '@/components/ui';
import ReactFlow, { Background, Controls, MiniMap, ReactFlowProvider, type NodeTypes } from 'reactflow';
import 'reactflow/dist/style.css';
import {
  Layout,
  Eye,
  Code,
  Upload,
  Download,
  Trash2,
  Eraser,
  Pin,
  PinOff,
  Save,
  BookOpen,
  Settings,
  Plus,
} from 'lucide-react';

import { SharedCanvasProvider, useSharedCanvas } from "@/frontend/shared/builder";
import { UnifiedLibrary } from '@/frontend/shared/builder';
import { TemplateLibrary, addSelectionAsTemplate } from '@/frontend/shared/builder';
import { cmsTemplateProvider } from '@/frontend/features/builder/state/templateProvider';
import { UnifiedInspector } from '@/frontend/shared/builder';
import { SharedCanvas } from '@/frontend/shared/ui';
import { CMSPreview } from '@/frontend/shared/ui';
import { ShadcnNode } from '../slices/canvas/components/ShadcnNode';
import { Renderer } from '../slices/renderer/components/Renderer';
import { toSchema } from '../shared/hooks/useSchema';
import { CMSInspectorRenderer } from '../components/CMSInspectorRenderer';

import { useCrossFeatureRegistry } from '@/frontend/shared/foundation';
import { registerCMSComponents } from '../registry/cmsRegistry';
import { registerCMSLibraryTabs } from '../registry/cmsLibraryTabs';
import { DnDProvider } from "@/frontend/shared/builder";
import { fromSchema as parseSchema } from '../shared/hooks/useSchemaParser';
import { getDefaultTemplates, getTemplateByKey, isBuiltinKey } from '@/frontend/features/builder/state/templateStore';

const nodeTypes: NodeTypes = { shadcnNode: ShadcnNode };

const TopBarButton = ({ children, onClick, disabled, title }: { children: React.ReactNode, onClick?: () => void, disabled?: boolean, title?: string }) => (
  <Button variant="outline" size="sm" onClick={onClick} disabled={disabled} title={title} className="h-8 w-8 p-0">
    {children}
  </Button>
);

const ViewModeToggle = ({ active, onClick, children, title }: { active: boolean, onClick: () => void, children: React.ReactNode, title: string }) => (
  <Button
    variant={active ? 'default' : 'outline'}
    size="sm"
    onClick={onClick}
    className="h-8 px-3 text-xs"
    title={title}
  >
    {children}
  </Button>
);

const LeftTabs = ({
  active,
  setActive,
  onOpenTemplate,
  onAddWidget
}: {
  active: 'widgets' | 'templates' | 'settings';
  setActive: (t: 'widgets' | 'templates' | 'settings') => void;
  onOpenTemplate: (key: string) => void;
  onAddWidget: (compKey: string) => void;
}) => {
  const { activeWs, setActiveWs, menuOverride, setMenuOverride } = useSharedCanvas();

  return (
    <Card className="h-full flex flex-col overflow-hidden">
      <div className="p-2 border-b flex items-center justify-between">
        <div className="text-sm font-semibold">Library</div>
        <div className="flex items-center gap-1">
          <Button variant={active === 'widgets' ? 'primary' : 'ghost'} size="icon" className="h-7 w-7" onClick={() => setActive('widgets')} title="Widget Library">
            <Layout size={14} />
          </Button>
          <Button variant={active === 'templates' ? 'primary' : 'ghost'} size="icon" className="h-7 w-7" onClick={() => setActive('templates')} title="Asset Template Library">
            <BookOpen size={14} />
          </Button>
          <Button variant={active === 'settings' ? 'primary' : 'ghost'} size="icon" className="h-7 w-7" onClick={() => setActive('settings')} title="CMS Settings">
            <Settings size={14} />
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        {active === 'widgets' && (
          <div className="h-full">
            <UnifiedLibrary currentFeature="cms" onAdd={onAddWidget} />
          </div>
        )}
        {active === 'templates' && (
          <TemplateLibrary onOpen={onOpenTemplate} templateProvider={cmsTemplateProvider} />
        )}
        {active === 'settings' && (
          <div className="h-full p-3 space-y-3 overflow-auto">
            <div className="text-xs font-semibold text-gray-900">Workspace</div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Category</Label>
                <select
                  className="h-10 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm shadow-sm"
                  value={activeWs.category || 'personal'}
                  onChange={(e) => setActiveWs({ ...activeWs, category: e.target.value, key: '' })}
                >
                  <option value="personal">personal</option>
                  <option value="business">business</option>
                  <option value="family">family</option>
                </select>
              </div>
              <div>
                <Label>Key</Label>
                <Input
                  value={activeWs.key || ''}
                  onChange={(event) => setActiveWs({ ...activeWs, key: event.target.value })}
                  placeholder="Zian Inn, Project A, ..."
                />
              </div>
            </div>
            <div>
              <Label>Menu (sidebar)</Label>
              <select
                className="h-10 w-full rounded-xl border border-gray-300 bg-white px-3 text-sm shadow-sm"
                value={menuOverride || ''}
                onChange={(e) => setMenuOverride(e.target.value || null)}
              >
                <option value="">Auto</option>
                {/* Note: menu options available within right-side Renderer as well */}
              </select>
              <div className="text-[10px] text-gray-500 mt-1">Kosongkan untuk Auto</div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

const CMSBuilderPageInner: React.FC = () => {
  const {
    nodes,
    setNodes,
    edges,
    setEdges,
    selectedNodeId,
    setSelectedNodeId,
    selectedNode,
    setNodeProps,
    removeSelectedNode,
    activeWs,
    setActiveWs,
    activeRoute,
    setActiveRoute,
    menuOverride,
    setMenuOverride,
    clearAll,
    loadFromStorage,
    saveToStorage,
    createNode,
    commands,
    isPinned,
    pin,
    unpin,
    pinnedIds,
  } = useSharedCanvas();

  const [layoutTab, setLayoutTab] = useState<"split" | "canvas" | "preview">("split");
  const [contentTab, setContentTab] = useState("preview");
  const [previewMode, setPreviewMode] = useState<"design" | "interactive">("design");
  const [leftTab, setLeftTab] = useState<'widgets' | 'templates' | 'settings'>('widgets');

  // Template canvas tabs
  const [openTemplateKey, setOpenTemplateKey] = useState<string | null>(null);
  const [tplNodes, setTplNodes] = useState<any[]>([]);
  const [tplEdges, setTplEdges] = useState<any[]>([]);

  // Selection context menu
  const [ctxMenu, setCtxMenu] = useState<{x: number; y: number; open: boolean}>({ x: 0, y: 0, open: false });
  const selectedIds = useMemo(() => nodes.filter((n: any) => n.selected).map(n => n.id), [nodes]);

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  useEffect(() => {
    saveToStorage();
  }, [nodes, edges, saveToStorage]);

  const schema = useMemo(() => toSchema(nodes as any, edges as any), [nodes, edges]);

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(schema, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "shadcn-headless-schema.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const importJSON = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const text = await file.text();
      try {
        const parsed = JSON.parse(text);
        const { nodes: ns, edges: es } = parseSchema(parsed);
        setNodes(ns);
        setEdges(es);
        setSelectedNodeId(null);
      } catch (e) {
        alert("Invalid JSON");
      }
    };
    input.click();
  };

  const addFromLibrary = (compKey: string) => {
    const node = createNode(compKey);
    return node;
  };

  const handleOpenTemplate = (key: string) => {
    let fullKey = key;
    if (!key.startsWith('builtin:') && !key.startsWith('asset:')) {
      fullKey = getDefaultTemplates()[key] ? `builtin:${key}` : `asset:${key}`;
    }
    setOpenTemplateKey(fullKey);
    const tpl = getTemplateByKey(fullKey);
    if (tpl) {
      const { nodes: ns, edges: es } = parseSchema(tpl);
      setTplNodes(ns);
      setTplEdges(es);
    }
  };

  const handleExternalDrop = (e: React.DragEvent): boolean => {
    try {
      const payload = e.dataTransfer.getData('cms/template');
      if (payload) {
        const { key, source } = JSON.parse(payload);
        const fullKey = source === 'builtin' ? `builtin:${key}` : `asset:${key}`;
        const makeUnique = window.confirm('Make Unique? (OK)\nUse Instance? (Cancel)');
        if (makeUnique) {
          // insert nodes from schema directly
          const tplSchema = getTemplateByKey(fullKey);
          if (!tplSchema) return true;
          const parsed = parseSchema(tplSchema);
          // Offset position slightly
          const dx = 60 + Math.random() * 40;
          const dy = 60 + Math.random() * 40;
          const ns = parsed.nodes.map((n: any) => ({ ...n, position: { x: n.position.x + dx, y: n.position.y + dy } }));
          setNodes((prev: any) => [...prev, ...ns]);
          setEdges((prev: any) => [...prev, ...parsed.edges]);
        } else {
          // create a templateRef node instance
          const ref = createNode('templateRef' as any);
          setNodeProps(ref.id, { tplKey: fullKey, className: '' });
        }
        return true;
      }
      // JSON file drop
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const f = e.dataTransfer.files[0];
        if (f.type === 'application/json' || f.name.endsWith('.json')) {
          const reader = new FileReader();
          reader.onload = () => {
            try {
              const parsed = JSON.parse(reader.result as string);
              const { nodes: ns, edges: es } = parseSchema(parsed);
              setNodes(ns);
              setEdges(es);
              setSelectedNodeId(null);
            } catch {
              alert('Invalid JSON content');
            }
          };
          reader.readAsText(f);
          return true;
        }
      }
    } catch (err) {
      console.error('Drop parse error', err);
    }
    return false;
  };

  const handleCanvasContextMenu = (e: React.MouseEvent) => {
    const hasSelection = selectedIds.length > 0;
    if (!hasSelection) return;
    setCtxMenu({ x: e.clientX, y: e.clientY, open: true });
  };

  const handleAddSelectionToAssets = () => {
    setCtxMenu((s) => ({ ...s, open: false }));
    const ids = new Set(selectedIds);
    const subNodes = nodes.filter((n: any) => ids.has(n.id));
    const subEdges = edges.filter((e: any) => ids.has(e.source) && ids.has(e.target));
    const selectionSchema = toSchema(subNodes as any, subEdges as any);
    const name = prompt('Asset template name:');
    if (!name) return;
    addSelectionAsTemplate(cmsTemplateProvider, name, selectionSchema);
    alert('Added to Asset Templates');
  };

  const handleOpenSelectionInNewTab = () => {
    setCtxMenu((s) => ({ ...s, open: false }));
    const ids = new Set(selectedIds);
    const subNodes = nodes.filter((n: any) => ids.has(n.id));
    const subEdges = edges.filter((e: any) => ids.has(e.source) && ids.has(e.target));
    const selectionSchema = toSchema(subNodes as any, subEdges as any);
    const key = `asset:${'Selection-' + Date.now()}`;
    addSelectionAsTemplate(cmsTemplateProvider, key.replace('asset:', ''), selectionSchema);
    handleOpenTemplate(key);
  };

  const renderCanvas = () => (
    <SharedCanvas
      nodeTypes={nodeTypes}
      onNodeSelect={setSelectedNodeId}
      showLayoutControls={true}
      onCanvasContextMenu={handleCanvasContextMenu}
      onExternalDrop={handleExternalDrop}
    />
  );

  const renderPreviewFooter = () => {
    if (pinnedIds.length === 0) return null;
    return (
      <div className="p-3">
        <div className="text-xs font-semibold text-gray-900 mb-2 flex items-center justify-between">
          <span>Pinned Previews</span>
          <div className="flex gap-2">
            {pinnedIds.length > 0 && (
              <Button size="sm" variant="outline" onClick={() => pinnedIds.forEach((id) => unpin(id))}>
                Unpin all
              </Button>
            )}
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          {pinnedIds.map((id) => (
            <Card key={id} className="p-2">
              <div className="flex items-center justify-between mb-1">
                <div className="text-[11px] text-gray-600">Node {id.slice(1,5)}</div>
                <Button size="sm" variant="outline" onClick={() => unpin(id)}>Unpin</Button>
              </div>
              <Renderer
                schema={schema}
                activeWs={activeWs}
                onChangeWs={setActiveWs}
                activeRoute={activeRoute}
                onNavigate={(href) => setActiveRoute(href)}
                commands={commands}
                menuOverride={menuOverride}
                setMenuOverride={setMenuOverride}
                onSelectNode={previewMode === "design" ? setSelectedNodeId : () => {}}
                selectedId={selectedNodeId}
                designMode={previewMode === "design"}
                rootId={id}
              />
            </Card>
          ))}
        </div>
      </div>
    );
  };

  const renderPreview = () => {
    if (contentTab === 'json') {
      return <pre className="h-full w-full overflow-auto bg-gray-900 p-4 text-xs text-gray-100">{JSON.stringify(schema, null, 2)}</pre>;
    }

    const rootIdForPreview = pinnedIds.length > 0 ? pinnedIds[0] : null;

    return (
      <CMSPreview
        designMode={previewMode === "design"}
        onToggleMode={setPreviewMode}
        currentMode={previewMode}
        showSidebar={false}
        footer={renderPreviewFooter()}
      >
        <Renderer
          schema={schema}
          activeWs={activeWs}
          onChangeWs={setActiveWs}
          activeRoute={activeRoute}
          onNavigate={(href) => setActiveRoute(href)}
          commands={commands}
          menuOverride={menuOverride}
          setMenuOverride={setMenuOverride}
          onSelectNode={previewMode === "design" ? setSelectedNodeId : () => {}}
          selectedId={selectedNodeId}
          designMode={previewMode === "design"}
          rootId={rootIdForPreview}
        />
      </CMSPreview>
    );
  };

  const renderTemplateCanvas = () => {
    if (!openTemplateKey) return null;
    
    return (
      <div className="h-full w-full bg-gray-100">
        <ReactFlowProvider>
          <ReactFlow
            nodes={tplNodes}
            edges={tplEdges}
            nodeTypes={nodeTypes}
            fitView
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            proOptions={{ hideAttribution: true }}
          >
            <Background />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </ReactFlowProvider>
      </div>
    );
  };

  return (
    <div className="h-full w-full bg-gray-100 text-gray-900 flex flex-col">
      {/* Top Bar */}
      <div className="flex-shrink-0 flex items-center justify-between border-b border-gray-200 bg-white/70 px-4 py-2 backdrop-blur z-10">
        <div className="flex items-center gap-2">
          <div className="text-sm font-semibold">CMS Builder</div>
          <div className="text-[11px] text-gray-500">— Visual Content Management</div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
            <ViewModeToggle active={layoutTab === "split"} onClick={() => setLayoutTab("split")} title="Split View">Split</ViewModeToggle>
            <ViewModeToggle active={layoutTab === "canvas"} onClick={() => setLayoutTab("canvas")} title="Canvas Only">Canvas</ViewModeToggle>
            <ViewModeToggle active={layoutTab === "preview"} onClick={() => setLayoutTab("preview")} title="Preview Only">Preview</ViewModeToggle>
          </div>
          <div className="h-6 w-px bg-gray-200" />
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
            <ViewModeToggle active={contentTab === "preview"} onClick={() => setContentTab("preview")} title="Visual Preview"><Eye size={14} /></ViewModeToggle>
            <ViewModeToggle active={contentTab === "json"} onClick={() => setContentTab("json")} title="JSON Schema"><Code size={14} /></ViewModeToggle>
          </div>
          <div className="h-6 w-px bg-gray-200" />
          <div className="flex items-center gap-2">
            <TopBarButton onClick={importJSON} title="Import JSON"><Upload size={16} /></TopBarButton>
            <TopBarButton onClick={downloadJSON} title="Export JSON"><Download size={16} /></TopBarButton>
            <TopBarButton onClick={removeSelectedNode} disabled={!selectedNodeId} title="Delete Selected"><Trash2 size={16} /></TopBarButton>
            <TopBarButton onClick={clearAll} title="Clear Canvas"><Eraser size={16} /></TopBarButton>
          </div>
        </div>
      </div>

      {/* Context menu for selection */}
      {ctxMenu.open && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setCtxMenu(s => ({ ...s, open: false }))}
        >
          <div
            className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-lg w-56 text-sm"
            style={{ top: ctxMenu.y, left: ctxMenu.x }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2"
              onClick={handleAddSelectionToAssets}
            >
              <Plus size={14} /> Add to Asset Library
            </button>
            <button
              className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2"
              onClick={handleOpenSelectionInNewTab}
            >
              <BookOpen size={14} /> Open in new canvas tab
            </button>
          </div>
        </div>
      )}

      {/* Main 3-pane layout */}
      <div className="flex-1 p-3 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full w-full">
          <ResizablePanel defaultSize={20} minSize={15} maxSize={25}>
            <LeftTabs
              active={leftTab}
              setActive={setLeftTab}
              onOpenTemplate={handleOpenTemplate}
              onAddWidget={addFromLibrary}
            />
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={55} minSize={40}>
            <Card className="h-full overflow-hidden">
              {/* Canvas tabs */}
              <div className="h-10 border-b flex items-center gap-2 px-3">
                <Button variant={!openTemplateKey ? 'primary' : 'ghost'} size="sm" className="h-7" onClick={() => setOpenTemplateKey(null)}>Main Canvas</Button>
                {openTemplateKey && (
                  <Button variant={!!openTemplateKey ? 'primary' : 'ghost'} size="sm" className="h-7">
                    Template: {openTemplateKey.replace(/^.*:/, '')}
                  </Button>
                )}
              </div>

              {layoutTab === "split" && (
                <ResizablePanelGroup direction="vertical">
                  <ResizablePanel defaultSize={55}>
                    {!openTemplateKey ? renderCanvas() : renderTemplateCanvas()}
                  </ResizablePanel>
                  <ResizableHandle withHandle />
                  <ResizablePanel defaultSize={45}>
                    {renderPreview()}
                  </ResizablePanel>
                </ResizablePanelGroup>
              )}
              {layoutTab === "canvas" && (!openTemplateKey ? renderCanvas() : renderTemplateCanvas())}
              {layoutTab === "preview" && renderPreview()}
            </Card>
          </ResizablePanel>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={25} minSize={20} maxSize={35}>
            <Card className="h-full flex flex-col">
              <div className="p-4 border-b flex items-center justify-between">
                <CardTitle>Inspector</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => selectedNodeId && (isPinned(selectedNodeId) ? unpin(selectedNodeId) : pin(selectedNodeId))}
                    disabled={!selectedNodeId}
                    className="h-8 w-8 p-0"
                  >
                    {selectedNodeId && isPinned(selectedNodeId) ? <PinOff size={16} /> : <Pin size={16} />}
                  </Button>
                  <Button variant="destructive" size="sm" onClick={removeSelectedNode} disabled={!selectedNodeId} className="h-8 w-8 p-0">
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
              <UnifiedInspector 
                feature="cms" 
                customRenderers={{
                  navNode: CMSInspectorRenderer,
                  card: CMSInspectorRenderer
                }}
              />
            </Card>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
};

export const CMSBuilderPage: React.FC = () => {
  const { registerComponent, registerFeatureTabs } = useCrossFeatureRegistry();

  useEffect(() => {
    registerCMSComponents(registerComponent);
    registerCMSLibraryTabs(registerFeatureTabs);
  }, [registerComponent, registerFeatureTabs]);

  return (
    <SharedCanvasProvider initialMode="cms">
      <DnDProvider>
        <CMSBuilderPageInner />
      </DnDProvider>
    </SharedCanvasProvider>
  );
};

export default CMSBuilderPage;
