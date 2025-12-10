/**
 * Feature Settings Initialization
 *
 * This file imports all feature init files to register their settings
 * with the global feature settings registry.
 *
 * Import this file once at app initialization (e.g., in layout.tsx or _app.tsx)
 */

// Communication features
import "@/frontend/features/communications/init"
import "@/frontend/features/status/init"

// Productivity features
import "@/frontend/features/tasks/init"
import "@/frontend/features/documents/init"
import "@/frontend/features/projects/init"
import "@/frontend/features/reports/init"

// Data features
import "@/frontend/features/database/init"
import "@/frontend/features/crm/init"
import "@/frontend/features/calendar/init"
import "@/frontend/features/knowledge/init"
import "@/frontend/features/inventory/init"

// AI features
import "@/frontend/features/ai/init"

// Business features
import "@/frontend/features/analytics/init"
import "@/frontend/features/contact/init"
import "@/frontend/features/forms/init"
import "@/frontend/features/marketing/init"
import "@/frontend/features/automation/init"

// System features
import "@/frontend/shared/foundation/utils/notifications/init"
import "@/frontend/features/support/init"

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  console.log("✅ All feature settings initialized")
}
