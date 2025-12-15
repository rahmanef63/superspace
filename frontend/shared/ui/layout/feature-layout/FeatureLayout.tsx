/**
 * Feature Layout
 * 
 * The standard minimum layout for all features. Provides:
 * - 2-column layout with AI assistant panel on the right
 * - Automatic integration with FeatureAIAssistant button in header
 * - Mobile-responsive design (drawer for AI on mobile)
 * 
 * This layout should be used as the base for all feature pages to ensure
 * consistent AI assistant support across the platform.
 * 
 * @example
 * ```tsx
 * // In your feature page.tsx or main component
 * import { FeatureLayout } from "@/frontend/shared/ui/layout/feature-layout";
 * 
 * export default function MyFeaturePage({ workspaceId }) {
 *   return (
 *     <FeatureLayout featureId="my-feature">
 *       <MyFeatureContent workspaceId={workspaceId} />
 *     </FeatureLayout>
 *   );
 * }
 * ```
 * 
 * The FeatureAIAssistant button in the header will automatically detect
 * this layout and toggle the AI panel instead of opening a dialog.
 */

"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { TwoColumnWithAILayout } from "@/frontend/shared/ui/ai-assistant/TwoColumnWithAILayout"
import type { TwoColumnWithAILayoutProps } from "@/frontend/shared/ui/ai-assistant/TwoColumnWithAILayout"

// ============================================================================
// Types
// ============================================================================

export interface FeatureLayoutProps extends Omit<TwoColumnWithAILayoutProps, "children"> {
  /** Feature ID for the AI assistant */
  featureId: string
  /** Main content */
  children: React.ReactNode
  /** Additional className */
  className?: string
  /** Whether to show a max-width container for the content */
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full" | false
  /** Whether to add default padding to content */
  padding?: boolean
  /** Whether to center content horizontally */
  centered?: boolean
}

// ============================================================================
// Max Width Classes
// ============================================================================

const maxWidthClasses = {
  sm: "max-w-screen-sm",
  md: "max-w-screen-md",
  lg: "max-w-screen-lg",
  xl: "max-w-screen-xl",
  "2xl": "max-w-screen-2xl",
  full: "max-w-full",
}

// ============================================================================
// Component
// ============================================================================

export function FeatureLayout({
  featureId,
  children,
  className,
  maxWidth = "full",
  padding = true,
  centered = false,
  ...aiLayoutProps
}: FeatureLayoutProps) {
  // Wrap content with optional max-width and padding
  const wrappedContent = (
    <div
      className={cn(
        "h-full w-full overflow-auto",
        padding && "p-4 sm:p-6",
        centered && "flex flex-col items-center",
        className
      )}
    >
      <div
        className={cn(
          "w-full",
          maxWidth && maxWidth !== "full" && maxWidthClasses[maxWidth],
          maxWidth && maxWidth !== "full" && "mx-auto"
        )}
      >
        {children}
      </div>
    </div>
  )

  return (
    <TwoColumnWithAILayout featureId={featureId} {...aiLayoutProps}>
      {wrappedContent}
    </TwoColumnWithAILayout>
  )
}

// Re-export the lower-level component for custom compositions
export { TwoColumnWithAILayout } from "@/frontend/shared/ui/ai-assistant/TwoColumnWithAILayout"
