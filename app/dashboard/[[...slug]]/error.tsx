"use client"

import { useEffect } from "react"
import { ErrorState } from "@/frontend/shared/ui/layout/sidebar/components/state-pages"
import { Button } from "@/components/ui/button"
import { IconRefresh } from "@tabler/icons-react"

/**
 * Error UI for dashboard catch-all routes
 *
 * This component is automatically shown when:
 * - An error is thrown in a page component or its children
 * - An error boundary catches an error
 *
 * Props:
 * - error: Error object with message and digest
 * - reset: Function to reset the error boundary and retry
 *
 * Best practices:
 * - Must be a Client Component ("use client")
 * - Provide reset functionality for recoverable errors
 * - Log errors for debugging (optional)
 * - Show user-friendly error messages
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/error
 */
export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    if (process.env.NODE_ENV !== "production") {
      console.error("Dashboard error:", error)
    }
    // TODO: Send to error reporting service (e.g., Sentry)
    // logErrorToService(error)
  }, [error])

  return (
    <ErrorState
      title="Something went wrong"
      description={
        process.env.NODE_ENV === "production"
          ? "An unexpected error occurred. Please try again."
          : error.message || "An unexpected error occurred."
      }
      showBackLink
    >
      <div className="flex flex-col items-center gap-3 mt-4">
        <Button
          onClick={reset}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <IconRefresh className="h-4 w-4" />
          Try Again
        </Button>
        {process.env.NODE_ENV !== "production" && error.digest && (
          <p className="text-xs text-muted-foreground">
            Error ID: {error.digest}
          </p>
        )}
      </div>
    </ErrorState>
  )
}
