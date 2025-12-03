/**
 * Layout Container Component
 * 
 * Main recursive renderer for the declarative layout system.
 * Renders layouts from JSON-like configuration with:
 * - Single container (full)
 * - Vertical splits (left-right)
 * - Horizontal splits (top-bottom)
 * - Nested combinations
 * - Responsive layouts
 * - Resizable panels
 */

"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import type { 
  LayoutNode, 
  LayoutContainerProps,
  PanelRenderContext,
  Breakpoint
} from "./types"
import { 
  isSplit, 
  normalizeLayout,
  getCurrentBreakpoint,
  getResponsiveLayout
} from "./utils"
import { ResizeHandle } from "./ResizeHandle"

// ============================================================================
// Hooks
// ============================================================================

/**
 * Hook to get current breakpoint
 */
function useBreakpoint(): Breakpoint {
  const [breakpoint, setBreakpoint] = React.useState<Breakpoint>(() => {
    if (typeof window === "undefined") return "desktop"
    return getCurrentBreakpoint()
  })

  React.useEffect(() => {
    const handleResize = () => {
      setBreakpoint(getCurrentBreakpoint())
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return breakpoint
}

/**
 * Hook to manage panel sizes with resize support
 */
function useResizableSizes(
  layout: LayoutNode,
  containerRef: React.RefObject<HTMLDivElement | null>
) {
  // Store sizes as percentages for flexibility
  const [sizes, setSizes] = React.useState<number[]>([])
  const resizeStateRef = React.useRef<{
    index: number
    startPos: number
    startSizes: number[]
  } | null>(null)

  // Initialize sizes from layout
  React.useEffect(() => {
    if (!isSplit(layout) || !layout.children) return
    
    const initialSizes = layout.children.map((child) => {
      // Handle percentage sizes
      if (typeof child.size === "string" && child.size.endsWith("%")) {
        return parseFloat(child.size)
      }
      // Handle flex/ratio sizes
      if (typeof child.size === "number") {
        return child.size
      }
      // Handle fr units
      if (typeof child.size === "string" && child.size.endsWith("fr")) {
        return parseFloat(child.size)
      }
      // Default: equal distribution
      return 100 / layout.children!.length
    })
    
    setSizes(initialSizes)
  }, [layout])

  const handleResizeStart = React.useCallback((index: number, startPosition: number) => {
    resizeStateRef.current = {
      index,
      startPos: startPosition,
      startSizes: [...sizes]
    }
  }, [sizes])

  const handleResize = React.useCallback((delta: number) => {
    if (!resizeStateRef.current || !containerRef.current) return
    
    const { index, startSizes } = resizeStateRef.current
    const container = containerRef.current
    const isVertical = layout.type === "split_vertical"
    const containerSize = isVertical ? container.offsetWidth : container.offsetHeight
    
    // Calculate delta as percentage
    const deltaPercent = (delta / containerSize) * 100
    
    // Apply delta to adjacent panels
    const newSizes = [...startSizes]
    const minSize = 5 // Minimum 5% for any panel
    
    // Adjust current and next panel
    let newCurrentSize = startSizes[index] + deltaPercent
    let newNextSize = startSizes[index + 1] - deltaPercent
    
    // Enforce minimum sizes
    if (newCurrentSize < minSize) {
      newCurrentSize = minSize
      newNextSize = startSizes[index] + startSizes[index + 1] - minSize
    }
    if (newNextSize < minSize) {
      newNextSize = minSize
      newCurrentSize = startSizes[index] + startSizes[index + 1] - minSize
    }
    
    newSizes[index] = newCurrentSize
    newSizes[index + 1] = newNextSize
    
    setSizes(newSizes)
  }, [layout.type, containerRef])

  const handleResizeEnd = React.useCallback(() => {
    resizeStateRef.current = null
  }, [])

  return {
    sizes,
    handleResizeStart,
    handleResize,
    handleResizeEnd
  }
}

// ============================================================================
// Panel Component
// ============================================================================

interface LayoutPanelProps {
  node: LayoutNode
  renderPanel: (context: PanelRenderContext) => React.ReactNode
  size?: number // Percentage or flex value
  className?: string
  depth: number
  path: string[]
  resizable: boolean
  breakpoint: Breakpoint
}

function LayoutPanel({
  node,
  renderPanel,
  size,
  className,
  depth,
  path,
  resizable,
  breakpoint,
}: LayoutPanelProps) {
  // Apply responsive overrides
  const effectiveNode = getResponsiveLayout(node, breakpoint)
  
  // If this is a split node, render recursively
  if (isSplit(effectiveNode) && effectiveNode.children) {
    return (
      <LayoutSplit
        node={effectiveNode}
        renderPanel={renderPanel}
        className={className}
        depth={depth}
        path={path}
        resizable={resizable}
        breakpoint={breakpoint}
        size={size}
      />
    )
  }

  // Render single panel
  const context: PanelRenderContext = {
    id: effectiveNode.id,
    node: effectiveNode,
    depth,
    path,
  }

  const style: React.CSSProperties = size !== undefined
    ? { flex: `${size} ${size} 0%` }
    : { flex: "1 1 0%" }

  return (
    <div
      id={effectiveNode.id}
      className={cn(
        "overflow-auto",
        className
      )}
      style={style}
      data-panel-id={effectiveNode.id}
      data-panel-depth={depth}
      data-panel-path={path.join("/")}
    >
      {renderPanel(context)}
    </div>
  )
}

// ============================================================================
// Split Container Component
// ============================================================================

interface LayoutSplitProps {
  node: LayoutNode
  renderPanel: (context: PanelRenderContext) => React.ReactNode
  className?: string
  depth: number
  path: string[]
  resizable: boolean
  breakpoint: Breakpoint
  size?: number
}

function LayoutSplit({
  node,
  renderPanel,
  className,
  depth,
  path,
  resizable,
  breakpoint,
  size,
}: LayoutSplitProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  
  const { 
    sizes, 
    handleResizeStart, 
    handleResize, 
    handleResizeEnd 
  } = useResizableSizes(node, containerRef)

  if (!node.children || node.children.length === 0) {
    return null
  }

  const isVertical = node.type === "split_vertical"
  const gap = node.gap ?? 0

  const containerStyle: React.CSSProperties = size !== undefined
    ? { flex: `${size} ${size} 0%` }
    : { flex: "1 1 0%" }

  // Check if resizing is enabled for this split
  const isResizable = resizable && (node.resizable !== false)

  return (
    <div
      ref={containerRef}
      id={node.id}
      className={cn(
        "flex",
        isVertical ? "flex-row" : "flex-col",
        "w-full h-full",
        className
      )}
      style={{
        ...containerStyle,
        gap: isResizable ? 0 : typeof gap === "number" ? `${gap * 4}px` : gap,
      }}
      data-layout-id={node.id}
      data-layout-type={node.type}
      data-layout-depth={depth}
      data-layout-path={path.join("/")}
    >
      {node.children.map((child, index) => {
        const childPath = [...path, String(index)]
        const childSize = sizes[index]

        return (
          <React.Fragment key={child.id || `child-${index}`}>
            <LayoutPanel
              node={child}
              renderPanel={renderPanel}
              size={childSize}
              depth={depth + 1}
              path={childPath}
              resizable={resizable}
              breakpoint={breakpoint}
            />
            
            {/* Add resize handle between panels (not after last) */}
            {isResizable && index < node.children!.length - 1 && (
              <ResizeHandle
                direction={isVertical ? "vertical" : "horizontal"}
                index={index}
                onResizeStart={handleResizeStart}
                onResize={handleResize}
                onResizeEnd={handleResizeEnd}
              />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

// ============================================================================
// Main Container Component
// ============================================================================

export function LayoutContainer({
  layout: rawLayout,
  renderPanel,
  className,
  defaultGap,
  debug,
  slots,
}: LayoutContainerProps) {
  const breakpoint = useBreakpoint()
  
  // Normalize the layout (ensure all nodes have IDs)
  const layout = React.useMemo(() => normalizeLayout(rawLayout), [rawLayout])
  
  // Apply responsive overrides to root
  const effectiveLayout = getResponsiveLayout(layout, breakpoint)
  
  // Determine if resizable (from root node)
  const isResizable = effectiveLayout.resizable !== false

  // If single panel, render directly
  if (effectiveLayout.type === "single") {
    const context: PanelRenderContext = {
      id: effectiveLayout.id,
      node: effectiveLayout,
      depth: 0,
      path: [],
    }

    return (
      <div
        id={effectiveLayout.id}
        className={cn(
          "w-full h-full overflow-auto",
          className,
          debug && "border border-dashed border-red-500"
        )}
        data-layout-id={effectiveLayout.id}
        data-layout-type="single"
      >
        {slots && effectiveLayout.id && slots[effectiveLayout.id] 
          ? slots[effectiveLayout.id] 
          : renderPanel(context)}
      </div>
    )
  }

  // Create a combined render function that checks slots first
  const combinedRenderPanel = React.useCallback((ctx: PanelRenderContext) => {
    if (slots && ctx.id && slots[ctx.id]) {
      return slots[ctx.id]
    }
    return renderPanel(ctx)
  }, [renderPanel, slots])

  // Render split layout
  return (
    <LayoutSplit
      node={effectiveLayout}
      renderPanel={combinedRenderPanel}
      className={cn("w-full h-full", className, debug && "border border-dashed border-blue-500")}
      depth={0}
      path={[]}
      resizable={isResizable}
      breakpoint={breakpoint}
    />
  )
}

// ============================================================================
// Convenience Wrappers
// ============================================================================

interface SingleLayoutProps {
  children: React.ReactNode
  className?: string
  id?: string
}

/**
 * Single full-width panel
 */
export function SingleLayout({ children, className, id }: SingleLayoutProps) {
  return (
    <div 
      id={id}
      className={cn("w-full h-full overflow-auto", className)}
    >
      {children}
    </div>
  )
}

interface SplitLayoutProps {
  children: React.ReactNode[]
  className?: string
  resizable?: boolean
  gap?: number
}

/**
 * Vertical split (left-right panels)
 */
export function SplitVerticalLayout({ 
  children, 
  className, 
  resizable = true,
  gap = 0,
}: SplitLayoutProps) {
  const layout: LayoutNode = {
    id: "split-vertical",
    type: "split_vertical",
    gap,
    resizable,
    children: children.map((_, index) => ({
      id: `panel-${index}`,
      type: "single",
    })),
  }

  return (
    <LayoutContainer
      layout={layout}
      renderPanel={(ctx) => {
        const index = ctx.path.length > 0 ? parseInt(ctx.path[ctx.path.length - 1]) : 0
        return children[index] || null
      }}
      className={className}
    />
  )
}

/**
 * Horizontal split (top-bottom panels)
 */
export function SplitHorizontalLayout({ 
  children, 
  className, 
  resizable = true,
  gap = 0,
}: SplitLayoutProps) {
  const layout: LayoutNode = {
    id: "split-horizontal",
    type: "split_horizontal",
    gap,
    resizable,
    children: children.map((_, index) => ({
      id: `panel-${index}`,
      type: "single",
    })),
  }

  return (
    <LayoutContainer
      layout={layout}
      renderPanel={(ctx) => {
        const index = ctx.path.length > 0 ? parseInt(ctx.path[ctx.path.length - 1]) : 0
        return children[index] || null
      }}
      className={className}
    />
  )
}

// ThreeColumnLayout has been moved to ThreeColumnLayout.tsx with advanced features
// Re-export from there for backward compatibility
export { ThreeColumnLayoutAdvanced as ThreeColumnLayout } from "./ThreeColumnLayout"

interface SidebarLayoutProps {
  sidebar: React.ReactNode
  content: React.ReactNode
  className?: string
  resizable?: boolean
  sidebarWidth?: string
  sidebarPosition?: "left" | "right"
}

/**
 * Sidebar + content layout
 */
export function SidebarLayout({
  sidebar,
  content,
  className,
  resizable = true,
  sidebarWidth = "280px",
  sidebarPosition = "left",
}: SidebarLayoutProps) {
  const sidebarNode: LayoutNode = { 
    id: "sidebar", 
    type: "single", 
    size: sidebarWidth,
    minSize: 200,
    maxSize: 400
  }
  const contentNode: LayoutNode = { 
    id: "content", 
    type: "single" 
  }

  const layout: LayoutNode = {
    id: "sidebar-layout",
    type: "split_vertical",
    mode: "custom",
    resizable,
    children: sidebarPosition === "left" 
      ? [sidebarNode, contentNode]
      : [contentNode, sidebarNode],
  }

  const panels: Record<string, React.ReactNode> = { sidebar, content }

  return (
    <LayoutContainer
      layout={layout}
      renderPanel={(ctx) => ctx.id ? panels[ctx.id] : null}
      className={className}
    />
  )
}
