"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import {
  Panel,
  PanelGroup,
  PanelResizeHandle,
} from "react-resizable-panels"
import { GripVertical, GripHorizontal } from "lucide-react"

import { IDELayoutProvider, useIDEContextSafe } from "./context"
import { usePersistedLayoutState, useIDEKeyboardShortcuts } from "./hooks"
import type { IDELayoutProps, IDELayoutState } from "./types"

/**
 * Resize Handle Component
 * Visual handle for resizing panels
 */
function ResizeHandle({
  direction = "vertical",
  className,
}: {
  direction?: "vertical" | "horizontal"
  className?: string
}) {
  return (
    <PanelResizeHandle
      className={cn(
        "group relative flex items-center justify-center",
        "transition-colors duration-200",
        direction === "vertical" ? [
          "w-1 hover:w-1.5 hover:bg-primary/20",
          "cursor-col-resize"
        ] : [
          "h-1 hover:h-1.5 hover:bg-primary/20",
          "cursor-row-resize"
        ],
        className
      )}
    >
      <div
        className={cn(
          "opacity-0 group-hover:opacity-100 transition-opacity",
          "text-muted-foreground/50"
        )}
      >
        {direction === "vertical" ? (
          <GripVertical className="h-4 w-4" />
        ) : (
          <GripHorizontal className="h-4 w-4" />
        )}
      </div>
    </PanelResizeHandle>
  )
}

/**
 * IDE Layout Component
 * 
 * VS Code-style layout with resizable panels.
 * Uses react-resizable-panels for smooth drag resizing.
 */
export function IDELayout({
  config = {},
  initialState,
  onStateChange,
  persistKey,
  activityBar,
  primarySidebar,
  secondarySidebar,
  panel,
  children,
  className,
}: IDELayoutProps) {
  // Use persisted state if persistKey is provided
  const [state, updateState] = usePersistedLayoutState(persistKey, {
    primaryVisible: true,
    secondaryVisible: false,
    panelVisible: false,
    primarySize: config.primarySidebar?.defaultSize ?? 20,
    secondarySize: config.secondarySidebar?.defaultSize ?? 20,
    panelSize: config.panel?.defaultSize ?? 30,
    ...initialState,
  })
  
  // Call onStateChange when state updates
  React.useEffect(() => {
    onStateChange?.(state)
  }, [state, onStateChange])
  
  // Register keyboard shortcuts
  useIDEKeyboardShortcuts({
    togglePrimary: () => updateState({ primaryVisible: !state.primaryVisible }),
    toggleSecondary: () => updateState({ secondaryVisible: !state.secondaryVisible }),
    togglePanel: () => updateState({ panelVisible: !state.panelVisible }),
  })
  
  const showActivityBar = config.activityBar?.visible !== false && activityBar
  const showPrimarySidebar = state.primaryVisible && primarySidebar
  const showSecondarySidebar = state.secondaryVisible && secondarySidebar
  const showPanel = state.panelVisible && panel
  
  return (
    <IDELayoutProvider config={config} state={state} onStateChange={updateState}>
      <div className={cn("flex h-full w-full overflow-hidden", className)}>
        {/* Activity Bar */}
        {showActivityBar && activityBar}
        
        {/* Main resizable area */}
        <PanelGroup direction="horizontal" className="flex-1">
          {/* Primary Sidebar */}
          {showPrimarySidebar && (
            <>
              <Panel
                defaultSize={state.primarySize}
                minSize={config.primarySidebar?.minSize ?? 10}
                maxSize={config.primarySidebar?.maxSize ?? 40}
                onResize={(size) => updateState({ primarySize: size })}
                order={1}
              >
                {primarySidebar}
              </Panel>
              <ResizeHandle direction="vertical" />
            </>
          )}
          
          {/* Editor + Panel area */}
          <Panel order={2} minSize={30}>
            <PanelGroup direction="vertical">
              {/* Editor area */}
              <Panel order={1} minSize={20}>
                <div className="h-full overflow-auto bg-background">
                  {children}
                </div>
              </Panel>
              
              {/* Bottom Panel */}
              {showPanel && (
                <>
                  <ResizeHandle direction="horizontal" />
                  <Panel
                    defaultSize={state.panelSize}
                    minSize={config.panel?.minSize ?? 10}
                    maxSize={config.panel?.maxSize ?? 60}
                    onResize={(size) => updateState({ panelSize: size })}
                    order={2}
                  >
                    {panel}
                  </Panel>
                </>
              )}
            </PanelGroup>
          </Panel>
          
          {/* Secondary Sidebar */}
          {showSecondarySidebar && (
            <>
              <ResizeHandle direction="vertical" />
              <Panel
                defaultSize={state.secondarySize}
                minSize={config.secondarySidebar?.minSize ?? 10}
                maxSize={config.secondarySidebar?.maxSize ?? 40}
                onResize={(size) => updateState({ secondarySize: size })}
                order={3}
              >
                {secondarySidebar}
              </Panel>
            </>
          )}
        </PanelGroup>
      </div>
    </IDELayoutProvider>
  )
}

/**
 * Simple Editor Area placeholder
 * For when no tabs/content is provided
 */
export function IDEEditorArea({
  children,
  className,
}: {
  children?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("h-full flex flex-col bg-background", className)}>
      {children || (
        <div className="flex-1 flex items-center justify-center text-muted-foreground">
          <div className="text-center">
            <p className="text-lg">Welcome</p>
            <p className="text-sm mt-1">Open a file to start editing</p>
          </div>
        </div>
      )}
    </div>
  )
}
