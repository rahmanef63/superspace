import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Protected app areas
const isProtectedRoute = createRouteMatcher(['/dashboard(.*)'])

// Public auth routes (NOT landing page)
const isPublicAuthRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)'
])

export default clerkMiddleware(async (auth, req) => {
  // Simply protect routes - let Clerk handle everything else
  // Don't do complex logic that might cause race conditions
  
  if (isProtectedRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
