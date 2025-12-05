"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Check } from "lucide-react"

export interface ActionWithFeedbackProps extends React.ComponentProps<typeof Button> {
  /**
   * Tooltip text shown on hover
   */
  tooltip?: string
  /**
   * Accessible label for screen readers
   */
  label?: string
  /**
   * Duration to show feedback state in ms
   * @default 2000
   */
  feedbackDuration?: number
  /**
   * Icon to show during feedback state
   * @default <Check className="h-4 w-4" />
   */
  feedbackIcon?: React.ReactNode
  /**
   * Enable click feedback animation and state
   * @default true
   */
  showFeedback?: boolean
  /**
   * Callback when action is clicked (before feedback)
   */
  onAction?: () => void | Promise<void>
}

/**
 * ActionWithFeedback - Action button with visual click feedback
 * 
 * Features:
 * - Shows checkmark icon after click for visual confirmation
 * - Smooth animation transition between states
 * - Supports async actions
 * - Maintains accessibility with proper ARIA attributes
 * 
 * @example
 * ```tsx
 * <ActionWithFeedback
 *   tooltip="Copy to clipboard"
 *   onAction={async () => {
 *     await navigator.clipboard.writeText(text)
 *   }}
 * >
 *   <Copy className="h-4 w-4" />
 * </ActionWithFeedback>
 * ```
 */
export function ActionWithFeedback({
  tooltip,
  label,
  children,
  className,
  variant = "ghost",
  size = "sm",
  feedbackDuration = 2000,
  feedbackIcon,
  showFeedback = true,
  onAction,
  onClick,
  disabled,
  ...props
}: ActionWithFeedbackProps) {
  const [isLoading, setIsLoading] = React.useState(false)
  const [showSuccess, setShowSuccess] = React.useState(false)
  
  const handleClick = React.useCallback(async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isLoading || showSuccess) return
    
    try {
      setIsLoading(true)
      
      // Call onAction if provided
      if (onAction) {
        await onAction()
      }
      
      // Call original onClick
      onClick?.(e)
      
      // Show feedback if enabled
      if (showFeedback) {
        setShowSuccess(true)
        setTimeout(() => setShowSuccess(false), feedbackDuration)
      }
    } finally {
      setIsLoading(false)
    }
  }, [onAction, onClick, isLoading, showSuccess, showFeedback, feedbackDuration])

  const defaultFeedbackIcon = <Check className="h-4 w-4 text-green-500" />

  const button = (
    <Button
      data-slot="action-with-feedback"
      className={cn(
        "size-9 p-1.5 text-muted-foreground transition-all duration-200",
        "hover:text-foreground hover:bg-muted",
        "active:scale-95",
        showSuccess && "text-green-500 hover:text-green-500",
        isLoading && "opacity-70",
        className
      )}
      size={size}
      type="button"
      variant={variant}
      disabled={disabled || isLoading}
      onClick={handleClick}
      aria-label={label || tooltip}
      {...props}
    >
      <span className="relative flex items-center justify-center">
        {/* Original icon with fade transition */}
        <span 
          className={cn(
            "transition-all duration-200",
            showSuccess ? "opacity-0 scale-75" : "opacity-100 scale-100"
          )}
        >
          {children}
        </span>
        
        {/* Success icon overlay */}
        {showFeedback && (
          <span 
            className={cn(
              "absolute inset-0 flex items-center justify-center transition-all duration-200",
              showSuccess ? "opacity-100 scale-100" : "opacity-0 scale-75"
            )}
          >
            {feedbackIcon || defaultFeedbackIcon}
          </span>
        )}
      </span>
    </Button>
  )

  if (tooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent>
            <p>{showSuccess ? "Done!" : tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return button
}
