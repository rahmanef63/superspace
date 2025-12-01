/**
 * Feature Settings Initialization
 *
 * This file imports all feature init files to register their settings
 * with the global feature settings registry.
 *
 * Import this file once at app initialization (e.g., in layout.tsx or _app.tsx)
 */

// Communication features
import "@/frontend/features/chat/init"
import "@/frontend/features/calls/init"
import "@/frontend/features/status/init"

// Productivity features
import "@/frontend/features/tasks/init"
import "@/frontend/features/documents/init"
import "@/frontend/features/projects/init"
import "@/frontend/features/reports/init"

// AI features
import "@/frontend/features/ai/init"

// System features
import "@/frontend/features/notifications/init"
import "@/frontend/features/support/init"

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  console.log("✅ All feature settings initialized")
}
