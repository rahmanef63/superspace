/**
 * Universal Toolbar Component
 *
 * Main toolbar component that renders tools from registry.
 * Fully responsive with automatic mobile/tablet/desktop adaptations.
 *
 * @author SuperSpace Team
 * @version 1.0.0
 */

"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
import { toolbarRegistry } from "../lib/toolbar-registry";
import type { ToolbarConfig, ToolConfig, ToolRenderContext } from "../lib/types";

// Import built-in tools to ensure they're registered
import "../lib/built-in-tools";
import "../lib/built-in-tools-part2";

export interface UniversalToolbarProps extends Partial<ToolbarConfig> {
  /** Required: Array of tool configurations */
  tools: ToolConfig[];
  /** Optional: Additional className */
  className?: string;
}

/**
 * Detect current breakpoint based on window width
 */
function useBreakpoint() {
  const isMobile = useIsMobile(); // <640px
  
  // For tablet detection, we'll use a simple check
  // This could be enhanced with a more robust hook
  const isTablet = typeof window !== "undefined" 
    ? window.innerWidth >= 640 && window.innerWidth < 1024
    : false;
  
  const isDesktop = !isMobile && !isTablet;

  return {
    isMobile,
    isTablet,
    isDesktop,
    breakpoint: isMobile ? "mobile" : isTablet ? "tablet" : "desktop",
  } as const;
}

/**
 * Check if tool should be hidden based on responsive config
 */
function shouldHideTool(
  tool: ToolConfig,
  breakpoint: "mobile" | "tablet" | "desktop"
): boolean {
  const responsive = tool.responsive;
  if (!responsive) return false;

  if (breakpoint === "mobile" && responsive.hideMobile) return true;
  if (breakpoint === "tablet" && responsive.hideTablet) return true;
  if (breakpoint === "desktop" && responsive.hideDesktop) return true;

  return false;
}

/**
 * Group tools by position
 */
function groupToolsByPosition(tools: ToolConfig[]) {
  const left: ToolConfig[] = [];
  const center: ToolConfig[] = [];
  const right: ToolConfig[] = [];

  tools.forEach((tool) => {
    const position = tool.position ?? "left";
    if (position === "left") left.push(tool);
    else if (position === "center") center.push(tool);
    else if (position === "right") right.push(tool);
  });

  return { left, center, right };
}

/**
 * Render a single tool using registry
 */
function renderTool(
  tool: ToolConfig,
  context: Omit<ToolRenderContext, "tool">
): React.ReactNode {
  const toolDef = toolbarRegistry.get(tool.type as any);
  
  if (!toolDef) {
    console.warn(`[UniversalToolbar] Tool type not found in registry: ${tool.type}`);
    return null;
  }

  try {
    // Validate params if schema exists
    const validatedParams = tool.params 
      ? toolDef.paramsSchema.parse(tool.params)
      : undefined;

    const toolWithValidatedParams: ToolConfig = {
      ...tool,
      params: validatedParams,
    };

    const ctx: ToolRenderContext = {
      ...context,
      tool: toolWithValidatedParams,
    };

    return toolDef.render(ctx);
  } catch (error) {
    console.error(`[UniversalToolbar] Error rendering tool ${tool.id}:`, error);
    return null;
  }
}

export function UniversalToolbar({
  tools,
  layout = "horizontal",
  position = "top",
  spacing = "normal",
  border = "bottom",
  background = "transparent",
  sticky = false,
  zIndex = 10,
  className,
}: UniversalToolbarProps) {
  const { isMobile, isTablet, isDesktop, breakpoint } = useBreakpoint();

  // Filter out hidden tools based on responsive config
  const visibleTools = useMemo(() => {
    return tools.filter((tool) => !shouldHideTool(tool, breakpoint));
  }, [tools, breakpoint]);

  // Group tools by position
  const { left, center, right } = useMemo(() => {
    return groupToolsByPosition(visibleTools);
  }, [visibleTools]);

  // Render context shared by all tools
  const renderContext = useMemo<Omit<ToolRenderContext, "tool">>(() => ({
    isMobile,
    isTablet,
    isDesktop,
    breakpoint,
  }), [isMobile, isTablet, isDesktop, breakpoint]);

  // Spacing classes
  const spacingClasses = {
    compact: "gap-1 md:gap-1.5",
    normal: "gap-2 md:gap-3",
    relaxed: "gap-3 md:gap-4",
  };

  // Border classes
  const borderClasses = {
    none: "",
    top: "border-t",
    bottom: "border-b",
    both: "border-y",
  };

  // Background classes
  const backgroundClasses = {
    transparent: "bg-transparent",
    muted: "bg-muted/50",
    card: "bg-card",
  };

  // Layout classes
  const layoutClasses = {
    horizontal: "flex-row items-center",
    vertical: "flex-col items-stretch",
    wrap: "flex-row flex-wrap items-center",
  };

  // Position classes
  const positionClasses = {
    top: "",
    bottom: "",
    floating: "rounded-lg shadow-lg",
    sticky: sticky ? "sticky top-0" : "",
  };

  return (
    <div
      className={cn(
        "flex w-full",
        layoutClasses[layout],
        backgroundClasses[background],
        borderClasses[border],
        positionClasses[position],
        sticky && "sticky top-0 z-10",
        "px-3 py-2 md:px-4 md:py-3",
        className
      )}
      style={{ zIndex }}
    >
      {/* Left group */}
      {left.length > 0 && (
        <div className={cn("flex items-center", spacingClasses[spacing])}>
          {left.map((tool) => (
            <div key={tool.id} className="flex-shrink-0">
              {renderTool(tool, renderContext)}
            </div>
          ))}
        </div>
      )}

      {/* Center group */}
      {center.length > 0 && (
        <div className={cn(
          "flex items-center justify-center flex-1",
          spacingClasses[spacing]
        )}>
          {center.map((tool) => (
            <div key={tool.id} className="flex-shrink-0">
              {renderTool(tool, renderContext)}
            </div>
          ))}
        </div>
      )}

      {/* Spacer if no center but has right */}
      {center.length === 0 && right.length > 0 && (
        <div className="flex-1" />
      )}

      {/* Right group */}
      {right.length > 0 && (
        <div className={cn(
          "flex items-center ml-auto",
          spacingClasses[spacing]
        )}>
          {right.map((tool) => (
            <div key={tool.id} className="flex-shrink-0">
              {renderTool(tool, renderContext)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Named exports for convenience
export { toolbarRegistry, toolType, viewMode } from "../lib/toolbar-registry";
export type { ToolConfig, ToolbarConfig, ViewMode } from "../lib/types";
