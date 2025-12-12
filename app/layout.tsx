import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "sonner"

import ConvexClientProvider from "@/components/ConvexClientProvider"
import { SafeClerkProvider } from "@/components/SafeClerkProvider"
import { InitFeatureSettingsClient } from "@/frontend/features/InitFeatureSettingsClient"

export const metadata: Metadata = {
  title: "SuperSpace App",
  description: "Super workspace platform",
  generator: "rahmanfakhrul.com",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY

  if (!publishableKey) {
    console.error("[v0] Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY environment variable")
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${GeistSans.variable} ${GeistMono.variable} antialiased overscroll-none`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <SafeClerkProvider publishableKey={publishableKey} afterSignOutUrl="/">
            <ConvexClientProvider>
              <InitFeatureSettingsClient />
              {children}
              <Toaster position="top-right" richColors />
            </ConvexClientProvider>
          </SafeClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
