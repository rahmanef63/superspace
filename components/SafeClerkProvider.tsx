'use client'

import { useState, useEffect, type ReactNode } from "react"
import { ClerkProvider } from "@clerk/nextjs"

interface SafeClerkProviderProps {
  children: ReactNode
  publishableKey?: string | null
  afterSignOutUrl?: string
}

export function SafeClerkProvider({ children, publishableKey, afterSignOutUrl = "/" }: SafeClerkProviderProps) {
  const [hasError, setHasError] = useState(false)

  // Suppress known warnings in development
  useEffect(() => {
    const originalWarn = console.warn
    const originalError = console.error
    
    console.warn = (...args: any[]) => {
      const message = args[0]?.toString() || ''
      
      // Suppress Clerk clock skew warnings
      if (message.includes('Clock skew detected') || message.includes('token-iat-in-the-future')) {
        return
      }
      
      // Suppress Radix UI forwardRef warnings (known issue with @radix-ui/react-slot)
      if (message.includes('Function components cannot be given refs') && 
          message.includes('SlotClone')) {
        return
      }
      
      originalWarn.apply(console, args)
    }

    console.error = (...args: any[]) => {
      const message = args[0]?.toString() || ''
      
      // Log but don't crash on Clerk infinite redirect in development
      if (message.includes('infinite redirect loop') && process.env.NODE_ENV === 'development') {
        console.log('[SafeClerkProvider] Clerk redirect loop detected - this is often caused by clock skew')
        return
      }
      
      // Suppress Radix UI forwardRef errors (non-critical)
      if (message.includes('Function components cannot be given refs') && 
          message.includes('SlotClone')) {
        return
      }
      
      originalError.apply(console, args)
    }

    return () => {
      console.warn = originalWarn
      console.error = originalError
    }
  }, [])

  const renderFallback = (message: string) => (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background px-6 text-center">
      <div className="rounded-lg border border-dashed border-muted-foreground/40 bg-muted/20 px-6 py-8 shadow-sm">
        <p className="text-sm text-muted-foreground">{message}</p>
        <button
          className="mt-4 rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground"
          onClick={() => window.location.reload()}
        >
          Retry loading authentication
        </button>
      </div>
    </div>
  )

  if (!publishableKey) {
    console.error("[v0] Clerk publishable key missing; authentication disabled")
    return renderFallback("Authentication configuration is missing. Please set NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY and reload.")
  }

  if (hasError) {
    return renderFallback("Authentication services failed to load. Please check your connection and try again.")
  }

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      afterSignOutUrl={afterSignOutUrl}
    >
      {children}
    </ClerkProvider>
  )
}
