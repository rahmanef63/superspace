import React, { useMemo, useCallback } from 'react';
import type { Schema, Workspace } from '@/frontend/features/studio/ui/types';
import { getWidgetConfig } from '@/frontend/features/studio/ui/registry';
import { cn } from '@/lib/utils';
import { getTemplateByKey, isBuiltinKey, instantiateDefaultTemplate } from '@/frontend/features/studio/ui/state/templateStore';

interface RendererProps {
  schema: Schema;
  activeWs: Workspace;
  onChangeWs: (workspace: Workspace) => void;
  activeRoute: string;
  onNavigate: (path: string) => void;
  commands: {
    newWorkspace: () => void;
    newMenu: () => void;
    newPage: () => void;
  };
  menuOverride: string | null;
  setMenuOverride: (id: string | null) => void;
  onSelectNode: (id: string) => void;
  selectedId: string | null;
  designMode?: boolean;

  // New: allow rendering a subtree starting from this node id (no nav aside when set)
  rootId?: string | null;
}

// Internal Error Boundary Component
class WidgetErrorBoundary extends React.Component<{ children: React.ReactNode, id: string }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode, id: string }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error(`Error rendering widget ${this.props.id}:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-2 border border-destructive/50 bg-destructive/10 rounded text-xs text-destructive">
          Error rendering widget
        </div>
      );
    }

    return this.props.children;
  }
}

export const Renderer: React.FC<RendererProps> = ({
  schema,
  activeWs,
  onChangeWs,
  activeRoute,
  onNavigate,
  commands,
  menuOverride,
  setMenuOverride,
  onSelectNode,
  selectedId,
  designMode = true,
  rootId = null,
}) => {
  const byId = schema.nodes;
  const getChildren = (id: string): string[] => (byId[id]?.children || []).slice();
  const nodeType = (id: string): string | undefined => byId[id]?.type;
  const nodeProps = (id: string): Record<string, any> => ({
    ...getWidgetConfig(byId[id]?.type)?.defaults,
    ...(byId[id]?.props || {}),
  });

  const helpers = {
    getText: (id: string) => (id && byId[id] && byId[id].type === "text" ? nodeProps(id).content : null),
    getImage: (id: string) => (id && byId[id] && byId[id].type === "image" ? { src: nodeProps(id).src, alt: nodeProps(id).alt } : null),
  };

  const workspaces = useMemo(() => {
    return Object.keys(byId)
      .filter((id) => byId[id].type === "navNode" && byId[id].props?.kind === "workspace")
      .map((id) => {
        const props = nodeProps(id);
        return {
          id,
          category: typeof props.category === "string" ? props.category : "personal",
          key: typeof props.key === "string" ? props.key : "",
        };
      });
  }, [byId]);

  const activeWsIds = useMemo(() => workspaces
    .filter((w) => (w.category || "personal") === (activeWs.category || "personal") && (w.key || "") === (activeWs.key || ""))
    .map((w) => w.id), [workspaces, activeWs]);

  const navGroupsByPlacement = (placement: string) => Object.keys(byId).filter((id) => byId[id].type === "navGroup" && (byId[id].props?.placement || "sidebar") === placement);

  const menus = useMemo(() => Object.keys(byId).filter((id) => (byId[id].type === "navNode" && byId[id].props?.kind === "menu")), [byId]);

  const pickMenuForPlacement = useCallback((placement: string) => {
    if (placement === "sidebar" && menuOverride) return menuOverride;
    const attached = menus.find((id) => {
      const p = nodeProps(id);
      return p.attachWorkspaceRef && activeWsIds.includes(p.attachWorkspaceRef);
    });
    if (attached) return attached;
    for (const ng of navGroupsByPlacement(placement)) {
      const m = getChildren(ng).find(
        (cid: string) => nodeType(cid) === "navNode" && nodeProps(cid).kind === "menu"
      );
      if (m) return m;
    }
    return menus[0] || null;
  }, [menus, menuOverride, activeWsIds, byId]);

  const menuForSidebar = useMemo(() => pickMenuForPlacement("sidebar"), [pickMenuForPlacement]);

  const matchesVisibility = useCallback((p: any) => {
    if (!p) return true;
    if (p.isStatic) return true;
    const vis = p.visibility || "global";
    if (vis === "global") return true;
    if (vis === "workspace" || vis === "subworkspace") {
      if (p.parentKind === "workspace" && p.parentRef) return activeWsIds.includes(p.parentRef);
      return true;
    }
    return true;
  }, [activeWsIds]);

  const collectMenuItems = useCallback((menuId: string | null) => {
    if (!menuId) return [];
    const topChildren = getChildren(menuId).filter(
      (cid: string) => nodeType(cid) === "navNode" && nodeProps(cid).kind === "item"
    );
    const extraFromWs = Object.keys(byId).filter((id: string) =>
      byId[id].type === "navNode" &&
      byId[id].props?.kind === "item" &&
      byId[id].props?.parentKind === "workspace" &&
      activeWsIds.includes(byId[id].props?.parentRef)
    );
    const initial = [...topChildren, ...extraFromWs];
    const seen = new Set<string>();
    return initial
      .filter((id: string) => {
        const ok = !seen.has(id);
        seen.add(id);
        return ok;
      })
      .filter((id: string) => matchesVisibility(nodeProps(id)));
  }, [byId, activeWsIds, matchesVisibility]);

  // Updated to look for both container and section widgets with path property
  const pageCandidates = useMemo(() => {
    const fromMenu = menuForSidebar ? getChildren(menuForSidebar).filter((cid: string) => {
      const type = nodeType(cid);
      return type === "container" || type === "section" || type === "div";
    }) : [];

    if (fromMenu.length > 0) return fromMenu;

    // Look for any container / section / div widgets with path property
    return Object.keys(byId).filter((id: string) => {
      const type = byId[id].type;
      const props = nodeProps(id);
      return (type === "container" || type === "section" || type === "div") && props.path;
    });
  }, [byId, menuForSidebar]);

  const activePageId = useMemo(() => {
    if (rootId) return rootId; // render subtree
    const normalized = (activeRoute || "").replace(/\/*$/, "");
    const found = pageCandidates.find((id) => (nodeProps(id).path || "/").replace(/\/*$/, "") === normalized);
    return found || pageCandidates[0] || null;
  }, [activeRoute, pageCandidates, byId, rootId]);

  const renderContentNode = (id: string, visited: Set<string> = new Set()): React.ReactNode => {
    if (visited.has(id)) {
      return (
        <div key={id} className="p-2 border border-yellow-500/50 bg-yellow-500/10 rounded text-xs text-yellow-600 mb-2">
          ⚠ Cycle Detected (ID: {id})
        </div>
      );
    }
    const newVisited = new Set(visited).add(id);

    const n = byId[id];
    if (!n) return null;
    const t = n.type;
    const p = nodeProps(id);

    // Support template instance rendering
    if (t === 'templateRef') {
      const tplKey = p.tplKey as string;
      if (!tplKey) return null;
      const isBuiltin = isBuiltinKey(tplKey);
      const tplSchema = isBuiltin ? instantiateDefaultTemplate(tplKey) : getTemplateByKey(tplKey);
      if (!tplSchema) return null;
      const roots = tplSchema.root;
      return (
        <div key={id} className="space-y-2">
          {roots.map((rid: string) => (
            <div key={`${tplKey}-${rid}`}>
              {/* render each root of template schema */}
              {renderTemplateNode(tplSchema, rid, newVisited)}
            </div>
          ))}
        </div>
      );
    }

    const children = (n.children || []).map((cid: string) => renderContentNode(cid, newVisited));
    const config = getWidgetConfig(t);
    const renderer = config?.render;
    if (!renderer) return null;

    try {
      const body = renderer(p, children, { ...helpers });
      const selectable = designMode;
      return (
        <WidgetErrorBoundary key={id} id={id}>
          <div
            className={cn(
              "relative group",
              selectable && selectedId === id
                ? "ring-2 ring-blue-500 ring-offset-2 rounded-xl"
                : undefined
            )}
            onClick={(e) => { if (!selectable) return; e.stopPropagation(); onSelectNode?.(id); }}
          >
            {body}
          </div>
        </WidgetErrorBoundary>
      );
    } catch (err) {
      console.error(`Error rendering widget ${id}:`, err);
      return <div key={id} className="text-red-500 text-xs p-2 border border-red-200 bg-red-50">Widget Error</div>;
    }
  };

  const renderTemplateNode = (templateSchema: Schema, id: string, visited: Set<string> = new Set()): React.ReactNode => {
    if (visited.has(id)) {
      return <div key={id} className="text-xs text-yellow-500">Cycle in template {id}</div>;
    }
    const newVisited = new Set(visited).add(id);

    const n = templateSchema.nodes[id];
    if (!n) return null;
    const cfg = getWidgetConfig(n.type);
    const p = { ...(cfg?.defaults || {}), ...(n.props || {}) };
    const children = (n.children || []).map((cid: string) =>
      renderTemplateNode(templateSchema, cid, newVisited)
    );
    const renderer = cfg?.render;
    if (!renderer) return null;
    return renderer(p, children, helpers);
  };

  if (rootId) {
    // Render only the subtree for rootId, no aside
    return (
      <div className="flex min-h-full h-full">
        <main className="flex-1 bg-muted/30 overflow-y-auto">
          <div className="max-w-6xl mx-auto p-6">
            {activePageId ? (
              renderContentNode(activePageId)
            ) : (
              <div className="text-sm text-muted-foreground">Nothing to render.</div>
            )}
          </div>
        </main>
      </div>
    );
  }

  // Default full renderer with sidebar
  return (
    <div className="flex min-h-full h-full">
      <main className="flex-1 bg-muted/30 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-6">
          {activePageId ? (
            renderContentNode(activePageId)
          ) : (
            <div className="text-sm text-muted-foreground">
              Tambahkan <b>Section</b> dengan properti <b>path</b> dan hubungkan dari <b>Menu</b> untuk melihat preview.
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
