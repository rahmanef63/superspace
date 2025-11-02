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
import { SecondarySidebarLayout } from "../sidebar/secondary";
import type { SecondarySidebarLayoutProps } from "../sidebar/secondary/components/SecondarySidebarLayout";

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
    <SecondarySidebarLayout
      sidebar={sidebar}
      header={header}
      className={className}
      sidebarClassName={sidebarClassName}
      contentClassName={contentClassName}
    >
      <div className="flex h-full flex-col">
        {/* View Toolbar */}
        {viewToolbar && (
          <div
            className={
              showToolbarBorder
                ? "flex-shrink-0 border-b border-border"
                : "flex-shrink-0"
            }
          >
            {viewToolbar}
          </div>
        )}

        {/* View Content */}
        <div className="flex-1 overflow-auto">
          {viewContent}
        </div>
      </div>
    </SecondarySidebarLayout>
  );
}
