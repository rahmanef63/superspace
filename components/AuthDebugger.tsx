"use client"

import { useUser, useAuth } from "@clerk/nextjs"
import { useConvexAuth } from "convex/react"
import { useState, useEffect } from "react"

export function AuthDebugger() {
  const { isSignedIn, isLoaded, user } = useUser()
  const { userId, sessionId } = useAuth()
  const { isAuthenticated: convexAuth, isLoading: convexLoading } = useConvexAuth()
  const [showDebug, setShowDebug] = useState(false)

  // Auto-hide after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowDebug(false), 10000)
    return () => clearTimeout(timer)
  }, [])

  if (!showDebug && process.env.NODE_ENV === 'production') {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 rounded-lg border border-border bg-background/95 p-4 shadow-lg backdrop-blur text-xs max-w-xs">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">🔐 Auth Debug</h3>
        <button
          onClick={() => setShowDebug(!showDebug)}
          className="text-muted-foreground hover:text-foreground"
        >
          {showDebug ? '−' : '+'}
        </button>
      </div>
      
      {showDebug && (
        <div className="space-y-1 text-muted-foreground">
          <div className="flex justify-between">
            <span>Clerk Loaded:</span>
            <span className={isLoaded ? 'text-green-500' : 'text-yellow-500'}>
              {isLoaded ? '✓' : '○'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Clerk Signed In:</span>
            <span className={isSignedIn ? 'text-green-500' : 'text-red-500'}>
              {isSignedIn ? '✓' : '✗'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>User ID:</span>
            <span className="truncate ml-2 max-w-[120px]" title={userId || 'none'}>
              {userId ? userId.slice(-8) : 'none'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Session ID:</span>
            <span className="truncate ml-2 max-w-[120px]" title={sessionId || 'none'}>
              {sessionId ? sessionId.slice(-8) : 'none'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Convex Auth:</span>
            <span className={convexAuth ? 'text-green-500' : 'text-red-500'}>
              {convexLoading ? '○' : convexAuth ? '✓' : '✗'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Email:</span>
            <span className="truncate ml-2 max-w-[120px]" title={user?.primaryEmailAddress?.emailAddress || 'none'}>
              {user?.primaryEmailAddress?.emailAddress || 'none'}
            </span>
          </div>
          
          {isSignedIn && !convexAuth && !convexLoading && (
            <div className="mt-2 p-2 rounded bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">
              ⚠️ Clerk OK but Convex not authenticated
            </div>
          )}
          
          {!isSignedIn && isLoaded && (
            <div className="mt-2 p-2 rounded bg-red-500/10 text-red-600 dark:text-red-400">
              ⚠️ Not signed in
            </div>
          )}
        </div>
      )}
    </div>
  )
}
