"use client"

import type React from "react"

import { useAuth } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface ProtectedRouteProps {
  children: React.ReactNode
  fallbackUrl?: string
}

export function ProtectedRoute({ children, fallbackUrl = "/" }: ProtectedRouteProps) {
  const { isLoaded, userId } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && !userId) {
      router.push(fallbackUrl)
    }
  }, [isLoaded, userId, router, fallbackUrl])

  if (!isLoaded) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!userId) {
    return null
  }

  return <>{children}</>
}
