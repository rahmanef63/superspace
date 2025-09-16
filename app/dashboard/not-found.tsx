"use client"

import Link from "next/link"

export default function DashboardNotFound() {
  return (
    <div className="px-4 lg:px-6 space-y-2">
      <h2 className="text-lg font-semibold">Page Not Found</h2>
      <p className="text-sm text-muted-foreground">
        The page you are looking for doesn&apos;t exist or you don&apos;t have access.
      </p>
      <div>
        <Link href="/dashboard" className="text-sm text-primary underline">
          Go back to Dashboard
        </Link>
      </div>
    </div>
  )
}
