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

// ─── Tailwind token → CSS value maps ────────────────────────────────────────
// DynamicInspector writes Tailwind shorthand tokens for some fields.
// We convert them to real CSS so inline styles work correctly.
const TW_FONT_SIZE: Record<string, string> = {
  xs: '0.75rem', sm: '0.875rem', base: '1rem', lg: '1.125rem',
  xl: '1.25rem', '2xl': '1.5rem', '3xl': '1.875rem', '4xl': '2.25rem',
};
const TW_BORDER_RADIUS: Record<string, string> = {
  none: '0', sm: '0.125rem', md: '0.375rem', lg: '0.5rem',
  xl: '0.75rem', '2xl': '1rem', full: '9999px',
};
const TW_BOX_SHADOW: Record<string, string> = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0/0.05)',
  md: '0 4px 6px -1px rgb(0 0 0/0.1),0 2px 4px -2px rgb(0 0 0/0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0/0.1),0 4px 6px -4px rgb(0 0 0/0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0/0.1),0 8px 10px -6px rgb(0 0 0/0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0/0.25)',
};

// Sentinel values that should not be emitted as CSS
const SKIP_SENTINELS = new Set(['Default', 'default', 'Regular', 'none', '', undefined, null]);

// Only apply gap as CSS if it has units or is '0'
const isGapCss = (v: any) => v === '0' || (typeof v === 'string' && /\d+(px|rem|em|%|vw|vh)/.test(v));

/**
 * Convert inspector-controlled props to inline CSS style.
 * Applies styles DIRECTLY to the widget's root element (via React.cloneElement),
 * so inline styles correctly override any Tailwind classes on that element.
 *
 * Tailwind shorthand tokens (e.g. fontSize: 'lg', borderRadius: 'md') are
 * mapped to real CSS values before application.
 */
function propsToStyle(p: Record<string, any>): React.CSSProperties {
  const s: React.CSSProperties = {};
  const v = (val: any) => !SKIP_SENTINELS.has(val);

  // Typography (color/font)
  if (v(p.color)) s.color = p.color;
  if (v(p.backgroundColor)) s.backgroundColor = p.backgroundColor;
  if (v(p.fontFamily)) s.fontFamily = p.fontFamily;
  if (v(p.fontSize)) s.fontSize = TW_FONT_SIZE[p.fontSize] ?? p.fontSize;
  if (v(p.fontWeight) && !isNaN(Number(p.fontWeight))) s.fontWeight = p.fontWeight;
  if (v(p.lineHeight)) s.lineHeight = p.lineHeight;
  if (v(p.letterSpacing)) s.letterSpacing = p.letterSpacing;
  if (v(p.textAlign)) s.textAlign = p.textAlign as any;
  if (v(p.textDecoration) && p.textDecoration !== 'none') s.textDecoration = p.textDecoration;

  // Dimensions
  if (v(p.width) && p.width !== 'auto') s.width = p.width;
  if (v(p.height) && p.height !== 'auto') s.height = p.height;
  if (v(p.minWidth)) s.minWidth = p.minWidth;
  if (v(p.minHeight)) s.minHeight = p.minHeight;
  if (v(p.maxWidth) && p.maxWidth !== 'none') s.maxWidth = p.maxWidth;
  if (v(p.maxHeight)) s.maxHeight = p.maxHeight;

  // Display & Flex/Grid layout
  if (v(p.display)) s.display = p.display as any;
  if (v(p.flexDirection)) s.flexDirection = p.flexDirection as any;
  if (v(p.flexWrap)) s.flexWrap = p.flexWrap as any;
  if (v(p.alignItems)) s.alignItems = p.alignItems as any;
  if (v(p.justifyContent)) s.justifyContent = p.justifyContent as any;
  if (isGapCss(p.gap)) s.gap = p.gap;

  // Spacing (individual sides — written by DynamicInspector layout section)
  if (v(p.paddingTop) && p.paddingTop !== '0px') s.paddingTop = p.paddingTop;
  if (v(p.paddingBottom) && p.paddingBottom !== '0px') s.paddingBottom = p.paddingBottom;
  if (v(p.paddingLeft) && p.paddingLeft !== '0px') s.paddingLeft = p.paddingLeft;
  if (v(p.paddingRight) && p.paddingRight !== '0px') s.paddingRight = p.paddingRight;
  if (v(p.marginTop) && p.marginTop !== '0px') s.marginTop = p.marginTop;
  if (v(p.marginBottom) && p.marginBottom !== '0px') s.marginBottom = p.marginBottom;
  if (v(p.marginLeft) && p.marginLeft !== '0px') s.marginLeft = p.marginLeft;
  if (v(p.marginRight) && p.marginRight !== '0px') s.marginRight = p.marginRight;

  // Border
  if (v(p.borderStyle) && p.borderStyle !== 'Default') s.borderStyle = p.borderStyle as any;
  if (v(p.borderColor) && !['Default', 'default'].includes(p.borderColor)) s.borderColor = p.borderColor;
  if (v(p.borderWidth) && p.borderWidth !== '0px') s.borderWidth = p.borderWidth;
  if (v(p.borderRadius) && p.borderRadius !== 'Default') {
    s.borderRadius = TW_BORDER_RADIUS[p.borderRadius] ?? p.borderRadius;
  }

  // Appearance
  if (v(p.boxShadow) && p.boxShadow !== 'Default') {
    s.boxShadow = TW_BOX_SHADOW[p.boxShadow] ?? p.boxShadow;
  }
  if (p.opacity !== undefined && p.opacity !== '' && p.opacity !== '100') {
    s.opacity = Number(p.opacity) / 100;
  }
  if (v(p.overflow)) s.overflow = p.overflow as any;
  if (v(p.overflowX)) s.overflowX = p.overflowX as any;
  if (v(p.overflowY)) s.overflowY = p.overflowY as any;

  // Position
  if (v(p.position) && p.position !== 'static') s.position = p.position as any;
  if (v(p.zIndex)) s.zIndex = Number(p.zIndex);
  if (v(p.top)) s.top = p.top;
  if (v(p.right)) s.right = p.right;
  if (v(p.bottom)) s.bottom = p.bottom;
  if (v(p.left)) s.left = p.left;

  // Misc
  if (v(p.cursor)) s.cursor = p.cursor;
  if (v(p.pointerEvents)) s.pointerEvents = p.pointerEvents as any;
  if (v(p.userSelect)) s.userSelect = p.userSelect as any;
  if (v(p.visibility)) s.visibility = p.visibility as any;
  if (v(p.transition)) s.transition = p.transition;
  if (v(p.transform)) s.transform = p.transform;
  if (v(p.objectFit)) s.objectFit = p.objectFit as any;
  if (v(p.objectPosition)) s.objectPosition = p.objectPosition;
  if (v(p.whiteSpace)) s.whiteSpace = p.whiteSpace as any;
  if (v(p.textOverflow)) s.textOverflow = p.textOverflow as any;
  if (v(p.wordBreak)) s.wordBreak = p.wordBreak as any;
  if (v(p.gridTemplateColumns)) s.gridTemplateColumns = p.gridTemplateColumns;
  if (v(p.gridTemplateRows)) s.gridTemplateRows = p.gridTemplateRows;
  if (v(p.gridColumn)) s.gridColumn = p.gridColumn;
  if (v(p.gridRow)) s.gridRow = p.gridRow;
  return s;
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
      const overrideStyle = propsToStyle(p);
      const hasOverride = Object.keys(overrideStyle).length > 0;

      // Apply inspector-driven inline styles DIRECTLY on the widget's root element
      // so they correctly override any Tailwind utility classes on that element.
      // Falls back to a wrapper div when the body isn't a clonable React element
      // (e.g. null, string, fragment).
      let styledBody: React.ReactNode = body;
      if (hasOverride && React.isValidElement(body)) {
        styledBody = React.cloneElement(body as React.ReactElement<any>, {
          style: { ...((body as any).props?.style ?? {}), ...overrideStyle },
        });
      }

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
            {styledBody}
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
