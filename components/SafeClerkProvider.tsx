import type { ReactNode } from "react"
import { ClerkProvider } from "@clerk/nextjs"
import { ClientLogSuppressor } from "./ClientLogSuppressor"

interface SafeClerkProviderProps {
  children: ReactNode
  publishableKey?: string | null
  afterSignOutUrl?: string
}

export function SafeClerkProvider({ children, publishableKey, afterSignOutUrl = "/" }: SafeClerkProviderProps) {
  if (!publishableKey) {
    return <div className="p-4 text-red-500">Clerk Publishable Key is missing. Please check your environment variables.</div>
  }

  return (
    // @ts-ignore Server Component - ClerkProvider is async but valid in Next.js App Router
    <ClerkProvider
      publishableKey={publishableKey}
      afterSignOutUrl={afterSignOutUrl}
    >
      <ClientLogSuppressor />
      {children}
    </ClerkProvider>
  )
}
