"use client";

import { useEffect } from "react";

export function ClientLogSuppressor() {
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

    return null;
}
