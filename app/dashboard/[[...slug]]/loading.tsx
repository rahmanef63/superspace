import { Skeleton } from "@/components/ui/skeleton"

/**
 * Loading UI for dashboard catch-all routes
 *
 * This component is automatically shown when:
 * - A page component is loading (Suspense boundary)
 * - Data fetching is in progress
 *
 * Best practices:
 * - Match the layout of the actual content for smooth transitions
 * - Use Skeleton components for better UX
 * - Keep it simple and consistent
 *
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/loading
 */
export default function DashboardLoading() {
  return (
    <div className="flex flex-col space-y-6 p-4 lg:p-6">
      {/* Header skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Content skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>

      {/* Table/List skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  )
}
