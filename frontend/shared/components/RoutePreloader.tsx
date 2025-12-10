/**
 * RoutePreloader
 * 
 * Preloads common routes and assets to improve navigation performance.
 * Uses Next.js prefetch and link preload hints.
 * 
 * Features:
 * - Preloads likely navigation targets on hover/focus
 * - Prefetches assets for visible links
 * - Respects user's connection quality (Network Information API)
 * - Uses requestIdleCallback for non-blocking preloading
 */

"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";

// Common dashboard routes to prefetch
const COMMON_ROUTES = [
  "/dashboard/overview",
  "/dashboard/members",
  "/dashboard/settings",
];

// Routes that should be prefetched based on current location
const ROUTE_PREFETCH_MAP: Record<string, string[]> = {
  "/dashboard/members": ["/dashboard/invitations", "/dashboard/user-management"],
  "/dashboard/settings": ["/dashboard/workspace-store"],
};

interface RoutePreloaderProps {
  /** Additional routes to prefetch */
  additionalRoutes?: string[];
  /** Whether to enable prefetching (can be disabled for slow connections) */
  enabled?: boolean;
  /** Delay before starting prefetch (ms) */
  delay?: number;
}

/**
 * Check if the user has a slow connection
 */
function isSlowConnection(): boolean {
  if (typeof navigator === "undefined") return false;
  
  const connection = (navigator as any).connection;
  if (!connection) return false;
  
  // Slow connections: slow-2g, 2g, or save-data mode
  return (
    connection.saveData === true ||
    connection.effectiveType === "slow-2g" ||
    connection.effectiveType === "2g"
  );
}

/**
 * Schedule work during idle time
 */
function scheduleIdle(callback: () => void): void {
  if (typeof window === "undefined") return;
  
  if ("requestIdleCallback" in window) {
    (window as any).requestIdleCallback(callback, { timeout: 2000 });
  } else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(callback, 100);
  }
}

export function RoutePreloader({
  additionalRoutes = [],
  enabled = true,
  delay = 1000,
}: RoutePreloaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const hasPreloadedRef = React.useRef(false);

  React.useEffect(() => {
    // Skip if disabled, already preloaded, or slow connection
    if (!enabled || hasPreloadedRef.current || isSlowConnection()) {
      return;
    }

    const timer = setTimeout(() => {
      scheduleIdle(() => {
        // Get routes to prefetch based on current location
        const contextualRoutes = ROUTE_PREFETCH_MAP[pathname] ?? [];
        const allRoutes = [...new Set([...COMMON_ROUTES, ...contextualRoutes, ...additionalRoutes])];
        
        // Filter out current route
        const routesToPrefetch = allRoutes.filter((route) => route !== pathname);

        // Prefetch each route
        routesToPrefetch.forEach((route) => {
          try {
            router.prefetch(route);
          } catch {
            // Ignore prefetch errors
          }
        });

        hasPreloadedRef.current = true;
      });
    }, delay);

    return () => clearTimeout(timer);
  }, [router, pathname, additionalRoutes, enabled, delay]);

  // Reset when pathname changes
  React.useEffect(() => {
    hasPreloadedRef.current = false;
  }, [pathname]);

  return null;
}

/**
 * Hook to prefetch a route on hover/focus
 */
export function usePrefetchOnInteraction(route: string) {
  const router = useRouter();
  const hasPrefetchedRef = React.useRef(false);

  const prefetch = React.useCallback(() => {
    if (hasPrefetchedRef.current || isSlowConnection()) return;
    
    try {
      router.prefetch(route);
      hasPrefetchedRef.current = true;
    } catch {
      // Ignore errors
    }
  }, [router, route]);

  return {
    onMouseEnter: prefetch,
    onFocus: prefetch,
  };
}

/**
 * Hook to prefetch multiple routes on component mount
 */
export function usePrefetchRoutes(routes: string[], options?: { delay?: number }) {
  const router = useRouter();
  const { delay = 500 } = options ?? {};

  React.useEffect(() => {
    if (isSlowConnection()) return;

    const timer = setTimeout(() => {
      scheduleIdle(() => {
        routes.forEach((route) => {
          try {
            router.prefetch(route);
          } catch {
            // Ignore errors
          }
        });
      });
    }, delay);

    return () => clearTimeout(timer);
  }, [router, routes, delay]);
}

export default RoutePreloader;
