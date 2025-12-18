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
        originalError('Suppressed Clerk infinite redirect loop')
        return
      }

      originalError.apply(console, args)
    }

    return () => {
      console.warn = originalWarn
      console.error = originalError
    }
  }, [])

  if (!publishableKey) {
    return <div className="p-4 text-red-500">Clerk Publishable Key is missing. Please check your environment variables.</div>
  }

  if (hasError) {
    return <div className="p-4 text-red-500">Authentication services failed to load. Please check your connection and try again.</div>
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
