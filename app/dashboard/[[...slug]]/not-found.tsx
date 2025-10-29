import { NotFoundState } from "@/frontend/shared/ui/layout/sidebar/components/state-pages"

/**
 * Not Found page for dashboard catch-all routes
 *
 * This page is automatically shown when:
 * - A dynamic route segment doesn't match any valid routes
 * - notFound() is called in a page component
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/not-found
 */
export default function DashboardNotFound() {
  return (
    <NotFoundState
      title="Page Not Found"
      description="The dashboard page you're looking for doesn't exist or you don't have access to it."
      showBackLink
    />
  )
}
