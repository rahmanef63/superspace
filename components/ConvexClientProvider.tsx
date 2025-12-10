"use client"

import type { ReactNode } from "react"
import { ConvexReactClient } from "convex/react"
import { ConvexProviderWithClerk } from "convex/react-clerk"
import { AuthLoading, Authenticated, Unauthenticated } from "convex/react";
import { useAuth } from "@clerk/nextjs"
import { PageLoading } from "@/frontend/shared/ui/components/loading/PageLoading";

if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
  throw new Error("Missing NEXT_PUBLIC_CONVEX_URL in your .env file")
}

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL)

export default function ConvexClientProvider({ children }: { children: ReactNode }) {
  console.log("[v0] ConvexClientProvider initialized with URL:", process.env.NEXT_PUBLIC_CONVEX_URL)

  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      <AuthLoading>
        <PageLoading message="Authenticating..." className="fixed inset-0 z-[100]" />
      </AuthLoading>
      <Authenticated>{children}</Authenticated>
      <Unauthenticated>{children}</Unauthenticated>
    </ConvexProviderWithClerk>
  )
}
