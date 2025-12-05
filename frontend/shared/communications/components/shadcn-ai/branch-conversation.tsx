"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// ============================================================================
// Types
// ============================================================================

export interface BranchMessage {
  id: string
  content: React.ReactNode
  timestamp?: Date
}

export interface BranchConversationProps {
  /**
   * Array of branch messages (regenerated responses)
   */
  branches: BranchMessage[]
  /**
   * Default active branch index
   * @default 0
   */
  defaultBranch?: number
  /**
   * Callback when branch changes
   */
  onBranchChange?: (branchIndex: number, branch: BranchMessage) => void
  /**
   * Callback when regenerate is requested
   */
  onRegenerate?: () => void | Promise<void>
  /**
   * Whether regeneration is in progress
   */
  isRegenerating?: boolean
  /**
   * Show regenerate button
   * @default true
   */
  showRegenerate?: boolean
  /**
   * Custom class for the container
   */
  className?: string
  /**
   * Children to render (optional, for custom rendering)
   */
  children?: React.ReactNode
}

// ============================================================================
// Context
// ============================================================================

interface BranchContextValue {
  currentBranch: number
  totalBranches: number
  goToPrevious: () => void
  goToNext: () => void
  branches: BranchMessage[]
  isRegenerating: boolean
  onRegenerate?: () => void | Promise<void>
}

const BranchContext = React.createContext<BranchContextValue | null>(null)

export function useBranchConversation() {
  const context = React.useContext(BranchContext)
  if (!context) {
    throw new Error("useBranchConversation must be used within BranchConversation")
  }
  return context
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * BranchConversation - Manages branched/regenerated AI responses
 * 
 * Features:
 * - Navigate between different response variations
 * - Show current branch indicator (1 of 3)
 * - Regenerate button to create new branch
 * - Smooth transitions between branches
 * 
 * @example
 * ```tsx
 * const [branches, setBranches] = useState([
 *   { id: '1', content: 'First response...' },
 *   { id: '2', content: 'Regenerated response...' },
 * ])
 * 
 * const handleRegenerate = async () => {
 *   const newResponse = await regenerateMessage()
 *   setBranches(prev => [...prev, { id: newResponse.id, content: newResponse.content }])
 * }
 * 
 * <BranchConversation 
 *   branches={branches}
 *   onRegenerate={handleRegenerate}
 *   onBranchChange={(index, branch) => console.log('Viewing branch:', index)}
 * >
 *   {({ currentBranch, branches }) => (
 *     <div>{branches[currentBranch].content}</div>
 *   )}
 * </BranchConversation>
 * ```
 */
export function BranchConversation({
  branches,
  defaultBranch = 0,
  onBranchChange,
  onRegenerate,
  isRegenerating = false,
  showRegenerate = true,
  className,
  children,
}: BranchConversationProps) {
  const [currentBranch, setCurrentBranch] = React.useState(defaultBranch)
  
  // Ensure currentBranch is within bounds
  React.useEffect(() => {
    if (currentBranch >= branches.length) {
      setCurrentBranch(Math.max(0, branches.length - 1))
    }
  }, [branches.length, currentBranch])
  
  // Auto-navigate to newest branch when regenerating
  React.useEffect(() => {
    if (branches.length > 0) {
      setCurrentBranch(branches.length - 1)
    }
  }, [branches.length])

  const goToPrevious = React.useCallback(() => {
    const newBranch = currentBranch > 0 ? currentBranch - 1 : branches.length - 1
    setCurrentBranch(newBranch)
    onBranchChange?.(newBranch, branches[newBranch])
  }, [currentBranch, branches, onBranchChange])

  const goToNext = React.useCallback(() => {
    const newBranch = currentBranch < branches.length - 1 ? currentBranch + 1 : 0
    setCurrentBranch(newBranch)
    onBranchChange?.(newBranch, branches[newBranch])
  }, [currentBranch, branches, onBranchChange])

  const contextValue: BranchContextValue = {
    currentBranch,
    totalBranches: branches.length,
    goToPrevious,
    goToNext,
    branches,
    isRegenerating,
    onRegenerate,
  }

  return (
    <BranchContext.Provider value={contextValue}>
      <div className={cn("relative", className)}>
        {/* Render children or default content */}
        {typeof children === 'function' 
          ? (children as any)({ currentBranch, branches, goToPrevious, goToNext })
          : children || (
              <BranchContent branches={branches} currentBranch={currentBranch} />
            )
        }
        
        {/* Branch navigation (only if more than 1 branch or regenerate enabled) */}
        {(branches.length > 1 || showRegenerate) && (
          <BranchNavigation showRegenerate={showRegenerate} />
        )}
      </div>
    </BranchContext.Provider>
  )
}

// ============================================================================
// Sub-components
// ============================================================================

interface BranchContentProps {
  branches: BranchMessage[]
  currentBranch: number
}

function BranchContent({ branches, currentBranch }: BranchContentProps) {
  return (
    <div className="relative overflow-hidden">
      {branches.map((branch, index) => (
        <div
          key={branch.id}
          className={cn(
            "transition-opacity duration-200",
            index === currentBranch ? "opacity-100" : "hidden opacity-0"
          )}
        >
          {branch.content}
        </div>
      ))}
    </div>
  )
}

interface BranchNavigationProps {
  showRegenerate?: boolean
  className?: string
}

function BranchNavigation({ showRegenerate = true, className }: BranchNavigationProps) {
  const { 
    currentBranch, 
    totalBranches, 
    goToPrevious, 
    goToNext, 
    isRegenerating,
    onRegenerate,
  } = useBranchConversation()

  const hasMultipleBranches = totalBranches > 1

  return (
    <div 
      className={cn(
        "flex items-center gap-1 mt-2",
        className
      )}
    >
      {/* Previous button */}
      {hasMultipleBranches && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                onClick={goToPrevious}
                aria-label="Previous response"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Previous response</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Page indicator */}
      {hasMultipleBranches && (
        <span className="text-xs text-muted-foreground tabular-nums min-w-[3rem] text-center">
          {currentBranch + 1} of {totalBranches}
        </span>
      )}

      {/* Next button */}
      {hasMultipleBranches && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                onClick={goToNext}
                aria-label="Next response"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Next response</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Regenerate button */}
      {showRegenerate && onRegenerate && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-7 w-7 p-0 text-muted-foreground hover:text-foreground ml-1",
                  isRegenerating && "animate-spin"
                )}
                onClick={onRegenerate}
                disabled={isRegenerating}
                aria-label="Regenerate response"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isRegenerating ? "Regenerating..." : "Regenerate"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  )
}

// Export sub-components for custom composition
BranchConversation.Content = BranchContent
BranchConversation.Navigation = BranchNavigation
