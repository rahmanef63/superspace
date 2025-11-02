/**
 * Three Column Layout Composition
 * 
 * Generic three-column layout for complex features:
 * Column 1: Sidebar (navigation/list)
 * Column 2: Main content (view system or editor)
 * Column 3: Inspector/details panel
 * 
 * Example: Documents, Database, Design tools
 */

"use client";

import { ReactNode, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PanelLeftClose, PanelLeftOpen, PanelRightClose, PanelRightOpen } from "lucide-react";

export interface ThreeColumnLayoutProps {
  /**
   * Column 1: Sidebar content (tree, list, etc)
   */
  sidebar: ReactNode;
  
  /**
   * Column 2: Main content
   */
  content: ReactNode;
  
  /**
   * Column 3: Inspector/details panel
   */
  inspector?: ReactNode;
  
  /**
   * Column widths (Tailwind classes)
   */
  sidebarWidth?: string;
  inspectorWidth?: string;
  
  /**
   * Collapsible columns
   */
  sidebarCollapsible?: boolean;
  inspectorCollapsible?: boolean;
  
  /**
   * Default collapsed state
   */
  defaultSidebarCollapsed?: boolean;
  defaultInspectorCollapsed?: boolean;
  
  /**
   * Callbacks
   */
  onSidebarCollapsedChange?: (collapsed: boolean) => void;
  onInspectorCollapsedChange?: (collapsed: boolean) => void;
  
  /**
   * Show borders between columns
   */
  showBorders?: boolean;
  
  /**
   * ClassNames
   */
  className?: string;
  sidebarClassName?: string;
  contentClassName?: string;
  inspectorClassName?: string;
}

/**
 * ThreeColumnLayout
 * 
 * Flexible three-column layout with collapsible panels.
 * 
 * @example
 * ```tsx
 * <ThreeColumnLayout
 *   sidebar={<DocumentTree />}
 *   content={
 *     <>
 *       <UniversalToolbar tools={[...]} />
 *       <ViewProvider data={documents}>
 *         <ViewRenderer />
 *       </ViewProvider>
 *     </>
 *   }
 *   inspector={<DocumentInspector />}
 *   sidebarWidth="w-80"
 *   inspectorWidth="w-96"
 *   sidebarCollapsible
 *   inspectorCollapsible
 * />
 * ```
 */
export function ThreeColumnLayout({
  sidebar,
  content,
  inspector,
  sidebarWidth = "w-80",
  inspectorWidth = "w-80",
  sidebarCollapsible = false,
  inspectorCollapsible = false,
  defaultSidebarCollapsed = false,
  defaultInspectorCollapsed = false,
  onSidebarCollapsedChange,
  onInspectorCollapsedChange,
  showBorders = true,
  className,
  sidebarClassName,
  contentClassName,
  inspectorClassName,
}: ThreeColumnLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(defaultSidebarCollapsed);
  const [inspectorCollapsed, setInspectorCollapsed] = useState(defaultInspectorCollapsed);

  const handleSidebarToggle = () => {
    const newState = !sidebarCollapsed;
    setSidebarCollapsed(newState);
    onSidebarCollapsedChange?.(newState);
  };

  const handleInspectorToggle = () => {
    const newState = !inspectorCollapsed;
    setInspectorCollapsed(newState);
    onInspectorCollapsedChange?.(newState);
  };

  return (
    <div className={cn("flex h-full bg-background", className)}>
      {/* COLUMN 1: Sidebar */}
      {!sidebarCollapsed && (
        <div
          className={cn(
            "flex-shrink-0",
            sidebarWidth,
            showBorders && "border-r border-border",
            "overflow-auto",
            sidebarClassName
          )}
        >
          {sidebar}
        </div>
      )}

      {/* Sidebar Collapse Toggle */}
      {sidebarCollapsible && (
        <div className="flex items-start pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSidebarToggle}
            className="h-8 w-8 p-0"
            title={sidebarCollapsed ? "Show Sidebar" : "Hide Sidebar"}
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>
        </div>
      )}

      {/* COLUMN 2: Main Content */}
      <div
        className={cn(
          "flex-1 min-w-0 overflow-auto",
          contentClassName
        )}
      >
        {content}
      </div>

      {/* Inspector Collapse Toggle */}
      {inspectorCollapsible && inspector && (
        <div className="flex items-start pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleInspectorToggle}
            className="h-8 w-8 p-0"
            title={inspectorCollapsed ? "Show Inspector" : "Hide Inspector"}
          >
            {inspectorCollapsed ? (
              <PanelRightOpen className="h-4 w-4" />
            ) : (
              <PanelRightClose className="h-4 w-4" />
            )}
          </Button>
        </div>
      )}

      {/* COLUMN 3: Inspector */}
      {inspector && !inspectorCollapsed && (
        <div
          className={cn(
            "flex-shrink-0",
            inspectorWidth,
            showBorders && "border-l border-border",
            "overflow-auto bg-muted/30",
            inspectorClassName
          )}
        >
          {inspector}
        </div>
      )}
    </div>
  );
}

/**
 * useThreeColumnLayout Hook
 * 
 * Manage three-column layout state
 * 
 * @example
 * ```tsx
 * const layout = useThreeColumnLayout({
 *   sidebarCollapsed: false,
 *   inspectorCollapsed: false,
 * })
 * 
 * <ThreeColumnLayout
 *   {...layout.props}
 *   sidebar={...}
 *   content={...}
 *   inspector={...}
 * />
 * ```
 */
export function useThreeColumnLayout(options?: {
  sidebarCollapsed?: boolean;
  inspectorCollapsed?: boolean;
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    options?.sidebarCollapsed ?? false
  );
  const [inspectorCollapsed, setInspectorCollapsed] = useState(
    options?.inspectorCollapsed ?? false
  );

  return {
    sidebarCollapsed,
    inspectorCollapsed,
    setSidebarCollapsed,
    setInspectorCollapsed,
    toggleSidebar: () => setSidebarCollapsed(!sidebarCollapsed),
    toggleInspector: () => setInspectorCollapsed(!inspectorCollapsed),
    props: {
      sidebarCollapsible: true,
      inspectorCollapsible: true,
      defaultSidebarCollapsed: sidebarCollapsed,
      defaultInspectorCollapsed: inspectorCollapsed,
      onSidebarCollapsedChange: setSidebarCollapsed,
      onInspectorCollapsedChange: setInspectorCollapsed,
    },
  };
}
