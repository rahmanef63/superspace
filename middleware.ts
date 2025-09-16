import { NextResponse } from 'next/server'
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

// Protected app areas
const isProtectedRoute = createRouteMatcher(['/dashboard(.*)'])

// Public auth/landing routes where signed-in users should be redirected away
const isPublicAuthOrLanding = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)'
])

export default clerkMiddleware(async (auth, req) => {
  const url = req.nextUrl

  // Redirect signed-in users away from public landing/auth pages
  const { userId, redirectToSignIn } = await auth()
  if (userId && isPublicAuthOrLanding(req)) {
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // Protect app routes: if not signed in, send to landing (instead of Clerk sign-in)
  if (isProtectedRoute(req)) {
    if (!userId) {
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
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
