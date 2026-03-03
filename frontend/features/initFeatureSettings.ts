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

// Universal dashboard
import "@/frontend/features/overview/init"

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
import "@/frontend/features/contacts/init"
import "@/frontend/features/forms/init"
import "@/frontend/features/marketing/init"
import "@/frontend/features/studio/init"
import "@/frontend/features/sales/init"
import "@/frontend/features/bi/init"
import "@/frontend/features/content/init"
import "@/frontend/features/cms-lite/init"
import "@/frontend/features/hr/init"
import "@/frontend/features/accounting/init"
import "@/frontend/features/platform-admin/init"

// Workspace & Admin stores
import "@/frontend/features/workspace-store/init"
import "@/frontend/features/menus/init"

// Admin & system
import "@/frontend/features/user-management/init"
import "@/frontend/features/import-export/init"
import "@/frontend/features/approvals/init"
import "@/frontend/features/integrations/init"
import "@/frontend/features/pos/init"

// System features
import "@/frontend/shared/foundation/utils/notifications/init"
import "@/frontend/features/support/init"

// Admin features
import "@/frontend/features/audit-log/init"

if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
}
