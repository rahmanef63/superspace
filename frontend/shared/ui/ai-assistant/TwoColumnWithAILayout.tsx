/**
 * Two Column Layout with AI Panel
 * 
 * A standardized 2-column layout for features with:
 * - Main content area (left/center)
 * - AI Assistant panel (right) - triggered from header action button
 * 
 * This layout is the minimum standard for all features to support
 * the AI assistant panel from the header action button.
 * 
 * @example
 * ```tsx
 * <TwoColumnWithAILayout featureId="documents">
 *   <MyFeatureContent />
 * </TwoColumnWithAILayout>
 * ```
 */

"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { useIsMobile } from "@/hooks/use-mobile"
import { X, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer"
import { subAgentRegistry } from "@/frontend/features/ai/agents"
import { AIChatPanel } from "./AIChatPanel"
import {
  AIAssistantPanelProvider,
  useAIAssistantPanel,
  useAIAssistantPanelSafe,
} from "./AIAssistantPanelContext"

// ============================================================================
// Types
// ============================================================================

export interface TwoColumnWithAILayoutProps {
  /** Feature ID for the AI assistant */
  featureId: string
  /** Main content */
  children: React.ReactNode
  /** Additional className for the container */
  className?: string
  /** AI panel default width */
  aiPanelWidth?: number
  /** Default AI panel collapsed state */
  defaultAIPanelOpen?: boolean
  /** AI panel placeholder text */
  aiPlaceholder?: string
  /** Additional context for the AI */
  aiContext?: Record<string, any>
  /** Custom welcome message for AI */
  aiWelcomeMessage?: string
  /** Custom suggestions for AI */
  aiSuggestions?: string[]
}

// ============================================================================
// Inner Layout (uses AI context)
// ============================================================================

function TwoColumnWithAILayoutInner({
  featureId,
  children,
  className,
  aiPanelWidth = 380,
  aiPlaceholder,
  aiContext = {},
  aiWelcomeMessage,
  aiSuggestions,
}: TwoColumnWithAILayoutProps) {
  const isMobile = useIsMobile()
  const { isPanelOpen, closePanel, context } = useAIAssistantPanel()

  // Merge contexts
  const mergedContext = React.useMemo(() => ({
    ...aiContext,
    ...context,
  }), [aiContext, context])

  // Get AI agent info
  const agent = React.useMemo(() => {
    const agents = subAgentRegistry.getAllAgents()
    return agents.find((a) => a.featureId === featureId)
  }, [featureId])

  // ========================================================================
  // AI Panel Content
  // ========================================================================
  const aiPanelContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-primary/10">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-sm font-medium truncate">
              {agent?.name || "AI Assistant"}
            </span>
            <span className="text-xs text-muted-foreground truncate">
              {agent?.description || `AI assistant for ${featureId}`}
            </span>
          </div>
          {agent && (
            <Badge variant="secondary" className="text-[10px] h-5">
              {agent.tools.length} tools
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={closePanel}
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
      {/* Chat Panel */}
      <div className="flex-1 min-h-0">
        <AIChatPanel
          featureId={featureId}
          placeholder={aiPlaceholder}
          context={mergedContext}
          className="h-full border-0"
          showDebugPanel={false}
          welcomeMessage={aiWelcomeMessage}
          suggestions={aiSuggestions}
        />
      </div>
    </div>
  )

  // ========================================================================
  // Mobile Layout
  // ========================================================================
  if (isMobile) {
    return (
      <>
        <div className={cn("h-full flex flex-col", className)}>
          {children}
        </div>
        {/* AI Drawer for mobile */}
        <Drawer open={isPanelOpen} onOpenChange={(open) => !open && closePanel()}>
          <DrawerContent className="h-[85vh] flex flex-col p-0 gap-0">
            <DrawerHeader className="sr-only">
              <DrawerTitle>{agent?.name || "AI Assistant"}</DrawerTitle>
              <DrawerDescription>
                {agent?.description || `AI assistant for ${featureId}`}
              </DrawerDescription>
            </DrawerHeader>
            {aiPanelContent}
          </DrawerContent>
        </Drawer>
      </>
    )
  }

  // ========================================================================
  // Desktop Layout
  // ========================================================================
  return (
    <div className={cn("h-full flex w-full overflow-hidden", className)}>
      {/* Main Content */}
      <main className="flex-1 min-w-0 overflow-hidden">
        {children}
      </main>

      {/* AI Panel */}
      <aside
        style={{ width: isPanelOpen ? aiPanelWidth : 0 }}
        className={cn(
          "relative flex flex-col border-l border-border transition-[width] duration-300 ease-in-out overflow-hidden bg-background",
          !isPanelOpen && "border-none"
        )}
      >
        <div className="flex-1 overflow-hidden" style={{ minWidth: aiPanelWidth }}>
          {aiPanelContent}
        </div>
      </aside>
    </div>
  )
}

// ============================================================================
// Main Export with Provider
// ============================================================================

export function TwoColumnWithAILayout(props: TwoColumnWithAILayoutProps) {
  return (
    <AIAssistantPanelProvider 
      featureId={props.featureId} 
      defaultOpen={props.defaultAIPanelOpen}
      initialContext={props.aiContext}
    >
      <TwoColumnWithAILayoutInner {...props} />
    </AIAssistantPanelProvider>
  )
}

// ============================================================================
// Headless variant (when you want to provide your own provider)
// ============================================================================

export { TwoColumnWithAILayoutInner }
