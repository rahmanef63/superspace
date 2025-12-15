/**
 * Secondary Sidebar With View
 * 
 * Composition component that combines Secondary Sidebar with View System.
 * Provides a ready-to-use pattern for features that need both tree navigation
 * and multiple view modes.
 * 
 * Example: Documents with tree navigation + table/card views
 */

"use client";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { TwoColumnLayout } from "../container/two-column";

export interface SecondarySidebarWithViewProps {
  /**
   * Sidebar content (tree, list, etc)
   */
  sidebar?: ReactNode;
  
  /**
   * Header content
   */
  header?: ReactNode;
  
  /**
   * View content (typically ViewProvider + ViewRenderer)
   */
  viewContent: ReactNode;
  
  /**
   * Optional toolbar above the view
   */
  viewToolbar?: ReactNode;
  
  /**
   * Show toolbar border
   */
  showToolbarBorder?: boolean;
  
  /**
   * Layout classNames
   */
  className?: string;
  sidebarClassName?: string;
  contentClassName?: string;
}

/**
 * SecondarySidebarWithView
 * 
 * Combines sidebar navigation with view system.
 * Perfect for features that need both hierarchical navigation and view switching.
 * 
 * @example
 * ```tsx
 * <SecondarySidebarWithView
 *   sidebar={<DocumentTree />}
 *   header={<SecondarySidebarHeader title="Documents" />}
 *   viewToolbar={
 *     <UniversalToolbar
 *       tools={[
 *         { id: "view", type: toolType.view, params: {...} }
 *       ]}
 *     />
 *   }
 *   viewContent={
 *     <ViewProvider data={documents} config={viewConfig}>
 *       <ViewRenderer />
 *     </ViewProvider>
 *   }
 * />
 * ```
 */
export function SecondarySidebarWithView({
  sidebar,
  header,
  className,
  sidebarClassName,
  contentClassName,
  viewContent,
  viewToolbar,
  showToolbarBorder = true,
}: SecondarySidebarWithViewProps) {
  return (
    <div className={cn("flex h-full min-h-0 flex-col", className)}>
      {header && <div className="shrink-0">{header}</div>}
      
      <div className="flex-1 min-h-0">
        <TwoColumnLayout
          sidebar={
            <div className={cn("h-full overflow-y-auto bg-muted/30", sidebarClassName)}>
              {sidebar}
            </div>
          }
          main={
            <div className={cn("flex h-full flex-col", contentClassName)}>
              {/* View Toolbar */}
              {viewToolbar && (
                <div
                  className={
                    showToolbarBorder
                      ? "shrink-0 border-b border-border"
                      : "shrink-0"
                  }
                >
                  {viewToolbar}
                </div>
              )}

              {/* View Content */}
              <div className="flex-1 min-h-0 overflow-hidden">
                {viewContent}
              </div>
            </div>
          }
          sidebarWidth={320}
          sidebarPosition="left"
          storageKey="secondary-sidebar-with-view"
          persistState={true}
        />
      </div>
    </div>
  );
}
